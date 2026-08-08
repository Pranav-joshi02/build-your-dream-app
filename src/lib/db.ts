import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export interface InventoryItem {
  id: number;
  drug: string;
  main: number;
  north: number;
  south: number;
  reorder: number;
  status: string;
}

export interface TransferRequest {
  id: number;
  drug: string;
  from_branch: string;
  to_branch: string;
  quantity: number;
  urgency: string;
  reason: string;
  status: string;
  created_at: string;
}

let dbInitialized = false;

async function ensureDbInitialized() {
  if (dbInitialized) return;
  try {
    // Create inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        drug TEXT NOT NULL UNIQUE,
        main INTEGER NOT NULL DEFAULT 0,
        north INTEGER NOT NULL DEFAULT 0,
        south INTEGER NOT NULL DEFAULT 0,
        reorder INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL
      )
    `;

    // Create transfer_requests table
    await sql`
      CREATE TABLE IF NOT EXISTS transfer_requests (
        id SERIAL PRIMARY KEY,
        drug TEXT NOT NULL,
        from_branch TEXT NOT NULL,
        to_branch TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chat_messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Seed inventory table if empty
    const countRes = await sql`SELECT COUNT(*) as count FROM inventory`;
    if (parseInt(countRes[0].count) === 0) {
      await sql`
        INSERT INTO inventory (drug, main, north, south, reorder, status) VALUES
        ('Adrenaline 1mg/mL', 120, 18, 44, 60, 'stable'),
        ('Insulin Glargine', 32, 6, 11, 40, 'warning'),
        ('Meropenem 1g', 9, 2, 0, 25, 'critical'),
        ('Paracetamol IV', 240, 96, 130, 80, 'stable'),
        ('Heparin 5000 IU', 41, 12, 9, 45, 'warning'),
        ('O-neg blood units', 14, 3, 5, 20, 'critical')
        ON CONFLICT (drug) DO NOTHING
      `;
    }

    dbInitialized = true;
    console.log('Neon Database initialized and seeded successfully.');
  } catch (error) {
    console.error('Failed to auto-initialize Neon Database:', error);
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    await ensureDbInitialized();
    const data = await sql`SELECT * FROM inventory ORDER BY drug ASC`;
    return data as InventoryItem[];
  } catch (error) {
    console.error('Error fetching inventory from Neon:', error);
    return []; // Return empty or static fallback
  }
}

export async function getTransferRequests(): Promise<TransferRequest[]> {
  try {
    await ensureDbInitialized();
    const data = await sql`SELECT * FROM transfer_requests ORDER BY created_at DESC LIMIT 10`;
    return data as TransferRequest[];
  } catch (error) {
    console.error('Error fetching transfer requests from Neon:', error);
    return [];
  }
}

export async function createTransferRequest(data: Omit<TransferRequest, 'id' | 'created_at' | 'status'>) {
  try {
    await ensureDbInitialized();
    const result = await sql`
      INSERT INTO transfer_requests (drug, from_branch, to_branch, quantity, urgency, reason)
      VALUES (${data.drug}, ${data.from_branch}, ${data.to_branch}, ${data.quantity}, ${data.urgency}, ${data.reason})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating transfer request in Neon:', error);
    throw error;
  }
}

export async function saveChatMessage(role: string, content: string) {
  try {
    await ensureDbInitialized();
    await sql`INSERT INTO chat_messages (role, content) VALUES (${role}, ${content})`;
  } catch (error) {
    console.error('Error saving chat message to Neon:', error);
  }
}

export async function updateInventoryStock(drug: string, branch: string, quantityChange: number) {
  try {
    await ensureDbInitialized();
    const column = branch.toLowerCase() === 'central' ? 'main' : branch.toLowerCase();
    
    // Safely execute specific column updates to prevent dynamic identifier parsing issues in Neon driver
    if (column === 'main') {
      await sql`UPDATE inventory SET main = main + ${quantityChange} WHERE drug = ${drug}`;
    } else if (column === 'north') {
      await sql`UPDATE inventory SET north = north + ${quantityChange} WHERE drug = ${drug}`;
    } else if (column === 'south') {
      await sql`UPDATE inventory SET south = south + ${quantityChange} WHERE drug = ${drug}`;
    } else {
      console.warn(`Branch '${branch}' is not a local stock branch (Central, North, South). Stock numbers were not changed locally.`);
      return;
    }
    
    // Recalculate and update the overall warning/critical status for the drug
    const row = await sql`SELECT * FROM inventory WHERE drug = ${drug}`;
    if (row.length > 0) {
      const item = row[0];
      const total = item.main + item.north + item.south;
      let newStatus = 'stable';
      if (total < item.reorder) {
        newStatus = 'critical';
      } else if (total < item.reorder * 1.5) {
        newStatus = 'warning';
      }
      await sql`UPDATE inventory SET status = ${newStatus} WHERE drug = ${drug}`;
    }
  } catch (error) {
    console.error('Error updating inventory stock in Neon:', error);
  }
}
