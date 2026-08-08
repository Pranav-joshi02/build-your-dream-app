import { createServerFn } from '@tanstack/react-start';
import { getInventory, createTransferRequest, saveChatMessage, getTransferRequests, updateInventoryStock } from './db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { hospital, patients, appointments, inventory, ambulances, emergencies } from './hospital-data';

// --- Database Operations ---

export const fetchInventoryFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await getInventory();
});

export const fetchTransferRequestsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return await getTransferRequests();
});

export const submitTransferRequestFn = createServerFn({ method: 'POST' })
  .validator((data: { drug: string; from_branch: string; to_branch: string; quantity: number; urgency: string; reason: string }) => data)
  .handler(async ({ data }) => {
    const request = await createTransferRequest(data);
    
    // Deduct stock from the source branch
    await updateInventoryStock(data.drug, data.from_branch, -data.quantity);
    
    // Add stock to the destination branch
    await updateInventoryStock(data.drug, data.to_branch, data.quantity);
    
    return request;
  });


// --- Gemini Operations ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generatePatientSummaryFn = createServerFn({ method: 'POST' })
  .validator((patientData: any) => patientData)
  .handler(async ({ data }) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a clinical AI assistant. Please generate a brief, professional summary of this patient's current status and next steps based on the following data:
      Name: ${data.name} (${data.age}${data.sex})
      Condition: ${data.condition}
      Ward: ${data.ward}
      Admitted: ${data.admitted}
      Keep it to 2-3 short sentences.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini error:', error);
      return "Unable to generate summary at this time. Please try again later.";
    }
  });


async function buildHospitalContext() {
  let dbInventory: any[] = [];
  let dbTransfers: any[] = [];
  try {
    dbInventory = await getInventory();
    dbTransfers = await getTransferRequests();
  } catch (e) {
    console.error('Failed to get database inventory/transfers:', e);
  }

  return `
Live Hospital Operational Context:
- Bed Capacity: Total beds = ${hospital.beds.total}, Occupied beds = ${hospital.beds.occupied}, ICU beds = ${hospital.beds.icu}, ICU occupied = ${hospital.beds.icuOccupied}.
- Admitted Patients: ${JSON.stringify(patients.map(p => ({ id: p.id, name: p.name, age: p.age, sex: p.sex, ward: p.ward, condition: p.condition, status: p.status })))}
- Today's Appointments: ${JSON.stringify(appointments.map(a => ({ time: a.time, patient: a.patient, doctor: a.doctor, dept: a.dept, type: a.type, status: a.status })))}
- Medicine Inventory: ${JSON.stringify(dbInventory.length > 0 ? dbInventory : inventory)}
- Recent Transfers: ${JSON.stringify(dbTransfers.slice(0, 5))}
- Ambulance Fleet: ${JSON.stringify(ambulances.map(a => ({ unit: a.unit, state: a.state, destination: a.destination, crew: a.crew })))}
- Active Emergencies: ${JSON.stringify(emergencies.map(e => ({ type: e.type, bay: e.bay, unit: e.unit, severity: e.severity })))}
`;
}

export const chatWithGeminiFn = createServerFn({ method: 'POST' })
  .validator((message: string) => message)
  .handler(async ({ data }) => {
    try {
      const context = await buildHospitalContext();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a clinical and operations AI assistant in the HospitalOS dashboard. 
Here is the live hospital operational data:
${context}

User question: ${data}
Answer the user's question concisely based on the live data provided above. If they ask about patients, beds, ambulances, or medicine levels, use the exact facts from the data. Keep the response to 1-2 sentences.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Save to Neon DB
      await saveChatMessage('user', data);
      await saveChatMessage('assistant', text);
      
      return text;
    } catch (error) {
      console.error('Gemini chat error:', error);
      return "Sorry, I encountered an error connecting to Gemini.";
    }
  });

// --- Ollama Operations ---

export const chatWithOllamaFn = createServerFn({ method: 'POST' })
  .validator((message: string) => message)
  .handler(async ({ data }) => {
    try {
      const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      const context = await buildHospitalContext();
      
      // We route this through the server to avoid CORS issues in the browser
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // or default model
          prompt: `You are an AI assistant in a hospital operations system. Answer concisely based on this live context:
${context}

Question: ${data}`,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ollama responded with status: ${response.status}`);
      }
      
      const json = await response.json();
      const text = json.response;
      
      // Save to Neon DB
      await saveChatMessage('user', data);
      await saveChatMessage('assistant', text);
      
      return text;
    } catch (error) {
      console.error('Ollama server proxy error:', error);
      throw error; // Let the client handle the fallback to Gemini
    }
  });

// --- Brevo Email & SMS Operations ---

interface DischargeEmailData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  diagnosis: string;
  prescription: string;
  followUpNotes: string;
  doctorName: string;
}

export const sendDischargeEmailFn = createServerFn({ method: 'POST' })
  .validator((data: DischargeEmailData) => data)
  .handler(async ({ data }) => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: white; padding: 32px; border-radius: 16px 16px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏥 HospitalOS</h1>
          <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Discharge Summary</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="margin: 0 0 16px; color: #334155;">Dear <strong>${data.patientName}</strong>,</p>
          <p style="margin: 0 0 24px; color: #475569; line-height: 1.6;">
            You have been officially discharged from Meridian General Hospital. Below is your discharge summary with prescription and follow-up instructions.
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 8px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Final Diagnosis</h3>
            <p style="margin: 0; color: #334155; font-size: 16px;">${data.diagnosis}</p>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 8px; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💊 Prescription</h3>
            <p style="margin: 0; color: #334155; white-space: pre-line;">${data.prescription}</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 8px; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Follow-Up Notes</h3>
            <p style="margin: 0; color: #334155; white-space: pre-line;">${data.followUpNotes}</p>
          </div>
          
          <p style="margin: 0 0 8px; color: #475569; font-size: 13px;">Treating Physician: <strong>${data.doctorName}</strong></p>
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">This is an automated message from HospitalOS. Please contact the hospital for any queries.</p>
        </div>
      </div>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'HospitalOS', email: '24070579@ycce.in' },
          to: [{ email: data.patientEmail, name: data.patientName }],
          subject: `Discharge Summary — ${data.patientName} | HospitalOS`,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Brevo email error response:', errorBody);
        throw new Error(`Brevo email failed: ${response.status} - ${errorBody}`);
      }

      return { success: true, type: 'email' };
    } catch (error) {
      console.error('Brevo email error:', error);
      throw error;
    }
  });

export const sendDischargeSMSFn = createServerFn({ method: 'POST' })
  .validator((data: { patientName: string; patientPhone: string; diagnosis: string }) => data)
  .handler(async ({ data }) => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    // Normalize phone number (especially for Indian numbers)
    let phone = data.patientPhone.replace(/[^0-9+]/g, ''); // Remove everything except digits and +
    
    // Handle leading 0 (e.g. 09876543210 -> 9876543210)
    if (phone.startsWith('0')) {
      phone = phone.substring(1);
    }
    
    // Ensure correct country code prefix for Indian numbers (+91)
    if (!phone.startsWith('+')) {
      if (phone.length === 10) {
        phone = '+91' + phone; // Prepend +91 if 10 digits
      } else if (phone.length === 12 && phone.startsWith('91')) {
        phone = '+' + phone;   // Prepend + if 12 digits starting with 91
      } else {
        phone = '+' + phone;   // Fallback: prepend + to make it international format
      }
    }

    const smsContent = `HospitalOS: Dear ${data.patientName}, you have been discharged. Diagnosis: ${data.diagnosis}. Your prescription and report have been emailed to you. For queries, contact the hospital. - Meridian General Hospital`;

    try {
      const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'HOSPOS',
          recipient: phone,
          content: smsContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Brevo SMS error response:', errorBody);
        throw new Error(`Brevo SMS failed: ${response.status} - ${errorBody}`);
      }

      return { success: true, type: 'sms' };
    } catch (error) {
      console.error('Brevo SMS error:', error);
      throw error;
    }
  });
