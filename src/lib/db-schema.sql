CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  drug TEXT NOT NULL,
  main INTEGER NOT NULL DEFAULT 0,
  north INTEGER NOT NULL DEFAULT 0,
  south INTEGER NOT NULL DEFAULT 0,
  reorder INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL
);

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
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic data if empty
INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'Adrenaline 1mg/mL', 120, 18, 44, 60, 'stable'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'Adrenaline 1mg/mL');

INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'Insulin Glargine', 32, 6, 11, 40, 'warning'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'Insulin Glargine');

INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'Meropenem 1g', 9, 2, 0, 25, 'critical'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'Meropenem 1g');

INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'Paracetamol IV', 240, 96, 130, 80, 'stable'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'Paracetamol IV');

INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'Heparin 5000 IU', 41, 12, 9, 45, 'warning'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'Heparin 5000 IU');

INSERT INTO inventory (drug, main, north, south, reorder, status)
SELECT 'O-neg blood units', 14, 3, 5, 20, 'critical'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE drug = 'O-neg blood units');
