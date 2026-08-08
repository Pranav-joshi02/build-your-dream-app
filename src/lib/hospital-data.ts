export type Status = "critical" | "warning" | "stable" | "info";

export const hospital = {
  name: "Meridian General Hospital",
  branch: "Central Campus",
  beds: { total: 420, occupied: 351, icu: 48, icuOccupied: 41 },
};

export const kpis = [
  { label: "Active Patients", value: "351", delta: "+12 today", tone: "info" as Status },
  { label: "Appointments Today", value: "186", delta: "42 waiting", tone: "stable" as Status },
  { label: "ICU Occupancy", value: "85%", delta: "41 / 48 beds", tone: "warning" as Status },
  { label: "Open Emergencies", value: "4", delta: "2 inbound", tone: "critical" as Status },
];

export const admissionsTrend = [
  { day: "Mon", admissions: 42, discharges: 31 },
  { day: "Tue", admissions: 51, discharges: 38 },
  { day: "Wed", admissions: 47, discharges: 44 },
  { day: "Thu", admissions: 63, discharges: 41 },
  { day: "Fri", admissions: 58, discharges: 52 },
  { day: "Sat", admissions: 39, discharges: 47 },
  { day: "Sun", admissions: 34, discharges: 36 },
];

export const departmentLoad = [
  { name: "Emergency", load: 92 },
  { name: "Cardiology", load: 78 },
  { name: "Orthopedics", load: 61 },
  { name: "Pediatrics", load: 54 },
  { name: "Neurology", load: 47 },
  { name: "Oncology", load: 38 },
];

export const patients = [
  { id: "PT-10241", name: "Deena Cooley", age: 65, sex: "F", ward: "Cardiology · 4B", doctor: "Dr. Vicki Walsh", condition: "Post-MI observation", status: "warning" as Status, admitted: "Aug 4" },
  { id: "PT-10243", name: "Jerry Wilcox", age: 73, sex: "M", ward: "ICU · 2", doctor: "Dr. April Gallegos", condition: "Sepsis, on pressors", status: "critical" as Status, admitted: "Aug 6" },
  { id: "PT-10250", name: "Eduardo Kramer", age: 44, sex: "M", ward: "Neurology · 3A", doctor: "Dr. Basil Frost", condition: "Migraine workup", status: "stable" as Status, admitted: "Aug 7" },
  { id: "PT-10256", name: "Jason Compton", age: 56, sex: "M", ward: "Urology · 5C", doctor: "Dr. Nannie Guerrero", condition: "Prostate biopsy recovery", status: "stable" as Status, admitted: "Aug 7" },
  { id: "PT-10261", name: "Emmitt Bryan", age: 49, sex: "M", ward: "Pulmonology · 3B", doctor: "Dr. Daren Andrade", condition: "Severe asthma", status: "warning" as Status, admitted: "Aug 8" },
  { id: "PT-10262", name: "Rita Alvarez", age: 31, sex: "F", ward: "Maternity · 6A", doctor: "Dr. Sheryl Glass", condition: "Pre-eclampsia watch", status: "warning" as Status, admitted: "Aug 8" },
  { id: "PT-10265", name: "Owen Nakamura", age: 12, sex: "M", ward: "Pediatrics · 1C", doctor: "Dr. Lilly Chavez", condition: "Fracture, left radius", status: "stable" as Status, admitted: "Aug 8" },
];

export const vitals = [
  { time: "06:00", hr: 88, spo2: 96, temp: 37.4 },
  { time: "08:00", hr: 94, spo2: 95, temp: 37.8 },
  { time: "10:00", hr: 101, spo2: 93, temp: 38.2 },
  { time: "12:00", hr: 97, spo2: 94, temp: 38.0 },
  { time: "14:00", hr: 91, spo2: 96, temp: 37.6 },
  { time: "16:00", hr: 86, spo2: 97, temp: 37.2 },
];

export const appointments = [
  { id: "AP-8801", time: "09:00", patient: "Deena Cooley", doctor: "Dr. Vicki Walsh", dept: "Cardiology", type: "Follow-up", status: "Checked in" },
  { id: "AP-8802", time: "09:30", patient: "Marta Iqbal", doctor: "Dr. April Gallegos", dept: "Gynecology", type: "Consultation", status: "Waiting" },
  { id: "AP-8803", time: "10:00", patient: "Eduardo Kramer", doctor: "Dr. Basil Frost", dept: "Neurology", type: "MRI review", status: "In progress" },
  { id: "AP-8804", time: "10:15", patient: "Jason Compton", doctor: "Dr. Nannie Guerrero", dept: "Urology", type: "Post-op", status: "Scheduled" },
  { id: "AP-8805", time: "10:30", patient: "Emmitt Bryan", doctor: "Dr. Daren Andrade", dept: "Pulmonology", type: "Spirometry", status: "Scheduled" },
  { id: "AP-8806", time: "11:00", patient: "Owen Nakamura", doctor: "Dr. Lilly Chavez", dept: "Pediatrics", type: "Cast check", status: "Scheduled" },
  { id: "AP-8807", time: "11:30", patient: "Rita Alvarez", doctor: "Dr. Sheryl Glass", dept: "Maternity", type: "Growth scan", status: "Cancelled" },
];

export const doctors = [
  { name: "Dr. Vicki Walsh", dept: "Cardiology", availability: "Available", patients: 14, next: "09:00", rating: 4.9 },
  { name: "Dr. April Gallegos", dept: "Gynecology", availability: "In surgery", patients: 9, next: "13:00", rating: 4.7 },
  { name: "Dr. Basil Frost", dept: "Neurology", availability: "Available", patients: 11, next: "10:00", rating: 4.8 },
  { name: "Dr. Nannie Guerrero", dept: "Urology", availability: "Off shift", patients: 0, next: "Tomorrow", rating: 4.6 },
  { name: "Dr. Daren Andrade", dept: "Pulmonology", availability: "Available", patients: 8, next: "10:30", rating: 4.8 },
  { name: "Dr. Lilly Chavez", dept: "Pediatrics", availability: "Available", patients: 16, next: "11:00", rating: 5.0 },
];

export const inventory = [
  { drug: "Adrenaline 1mg/mL", main: 120, north: 18, south: 44, reorder: 60, status: "stable" as Status },
  { drug: "Insulin Glargine", main: 32, north: 6, south: 11, reorder: 40, status: "warning" as Status },
  { drug: "Meropenem 1g", main: 9, north: 2, south: 0, reorder: 25, status: "critical" as Status },
  { drug: "Paracetamol IV", main: 240, north: 96, south: 130, reorder: 80, status: "stable" as Status },
  { drug: "Heparin 5000 IU", main: 41, north: 12, south: 9, reorder: 45, status: "warning" as Status },
  { drug: "O-neg blood units", main: 14, north: 3, south: 5, reorder: 20, status: "critical" as Status },
];

export const ambulances = [
  { unit: "AMB-01", crew: "Team Alpha", state: "En route to site", eta: "6 min", destination: "Kingsway & 3rd", severity: "critical" as Status },
  { unit: "AMB-04", crew: "Team Delta", state: "Transporting", eta: "11 min", destination: "ER Bay 2", severity: "critical" as Status },
  { unit: "AMB-07", crew: "Team Echo", state: "Available", eta: "—", destination: "Central Depot", severity: "stable" as Status },
  { unit: "AMB-09", crew: "Team Foxtrot", state: "Cleaning", eta: "20 min", destination: "North Branch", severity: "info" as Status },
];

export const emergencies = [
  { code: "EM-3391", type: "Multi-vehicle collision", patients: 3, unit: "AMB-01", bay: "Trauma 1", severity: "critical" as Status, since: "12 min" },
  { code: "EM-3392", type: "Cardiac arrest, 68M", patients: 1, unit: "AMB-04", bay: "Resus 2", severity: "critical" as Status, since: "4 min" },
  { code: "EM-3393", type: "Anaphylaxis, 22F", patients: 1, unit: "Walk-in", bay: "ER Bay 5", severity: "warning" as Status, since: "31 min" },
  { code: "EM-3394", type: "Chemical burn, 40M", patients: 1, unit: "AMB-07", bay: "Awaiting bay", severity: "warning" as Status, since: "2 min" },
];

export const reports = [
  { id: "RP-5521", patient: "Jerry Wilcox", type: "Blood culture", ordered: "Aug 7", status: "Ready", flag: "critical" as Status },
  { id: "RP-5522", patient: "Deena Cooley", type: "Echocardiogram", ordered: "Aug 7", status: "Ready", flag: "warning" as Status },
  { id: "RP-5523", patient: "Eduardo Kramer", type: "Brain MRI", ordered: "Aug 8", status: "In lab", flag: "info" as Status },
  { id: "RP-5524", patient: "Owen Nakamura", type: "X-ray, left radius", ordered: "Aug 8", status: "Ready", flag: "stable" as Status },
  { id: "RP-5525", patient: "Rita Alvarez", type: "Obstetric ultrasound", ordered: "Aug 8", status: "Awaiting sign-off", flag: "info" as Status },
];

export const handoffs = [
  {
    patient: "Jerry Wilcox · PT-10243",
    from: "Dr. April Gallegos",
    to: "Dr. Basil Frost",
    summary:
      "73M day 2 of septic shock, source likely urinary. Norepinephrine 0.08 mcg/kg/min, weaning. Lactate down 4.8 → 2.1. Meropenem day 2 — pharmacy flagged low stock. Watch urine output overnight; escalate if MAP < 65.",
  },
  {
    patient: "Rita Alvarez · PT-10262",
    from: "Dr. Sheryl Glass",
    to: "Night obstetrics",
    summary:
      "31F 34+2 weeks, pre-eclampsia without severe features. BP 148/94, magnesium not started. Repeat labs at 22:00; steroid course complete. Escalate for headache, visual changes or BP > 160/110.",
  },
];

export const aiInsights = [
  { title: "Meropenem will stock out in ~18h", body: "South branch is at zero and 2 ICU patients are on active courses. Suggested transfer of 15 vials from Central.", tone: "critical" as Status },
  { title: "Cardiology clinic is running 24 min behind", body: "Three follow-ups can be moved to Dr. Frost's 14:00 block without breaching wait targets.", tone: "warning" as Status },
  { title: "12 discharge summaries drafted", body: "Awaiting clinician review before automatic patient email and SMS goes out.", tone: "info" as Status },
];
