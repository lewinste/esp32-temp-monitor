-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → your project → SQL Editor)

-- 1. Create the readings table
CREATE TABLE readings (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  temperature REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast date-range queries
CREATE INDEX idx_readings_timestamp ON readings (timestamp);

-- 3. Enable Row Level Security (required by Supabase)
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- 4. Policy: allow ESP32 to INSERT readings using the anon key
CREATE POLICY "Allow anonymous inserts"
  ON readings FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Policy: allow the web app to SELECT readings using the anon key
CREATE POLICY "Allow anonymous reads"
  ON readings FOR SELECT
  TO anon
  USING (true);

-- 6. Optional: auto-delete readings older than 30 days (run daily via pg_cron or manually)
-- DELETE FROM readings WHERE timestamp < NOW() - INTERVAL '30 days';
