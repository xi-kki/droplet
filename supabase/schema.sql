-- ============================================================
-- Droplet — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Resolution table: maps email/phone/.sui → Sui address
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,          -- email, phone, or .sui name
  identifier_type TEXT NOT NULL,     -- 'email', 'phone', or 'sui'
  sui_address TEXT NOT NULL,         -- 0x... address
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, identifier_type)
);

-- Index for fast lookups
CREATE INDEX idx_resolutions_identifier ON resolutions(identifier, identifier_type);
CREATE INDEX idx_resolutions_address ON resolutions(sui_address);

-- Pending claims: tracks sent but unclaimed droplets
CREATE TABLE IF NOT EXISTS pending_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_token TEXT UNIQUE NOT NULL,  -- unique token for claim link
  sender_address TEXT NOT NULL,      -- who sent
  recipient_identifier TEXT NOT NULL, -- email/phone/.sui
  recipient_type TEXT NOT NULL,      -- 'email', 'phone', 'sui'
  resolved_address TEXT,             -- resolved Sui address (may be null if new user)
  amount_mist TEXT NOT NULL,         -- amount in MIST (u64 as string)
  coin_type TEXT NOT NULL DEFAULT '0x2::sui::SUI',
  tx_digest TEXT,                    -- on-chain tx hash
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'claimed', 'expired', 'refunded'
  note TEXT,                         -- optional note from sender
  expires_at TIMESTAMPTZ NOT NULL,   -- claim deadline
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  claimed_by_address TEXT            -- who actually claimed
);

-- Indexes for pending claims
CREATE INDEX idx_claims_token ON pending_claims(claim_token);
CREATE INDEX idx_claims_recipient ON pending_claims(recipient_identifier, recipient_type);
CREATE INDEX idx_claims_sender ON pending_claims(sender_address);
CREATE INDEX idx_claims_status ON pending_claims(status);

-- Notifications: tracks sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES pending_claims(id),
  channel TEXT NOT NULL,             -- 'email' or 'sms'
  recipient TEXT NOT NULL,           -- email address or phone number
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (Row Level Security)
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for resolution lookups
CREATE POLICY "Allow public resolution lookups" ON resolutions
  FOR SELECT USING (true);

-- Allow authenticated users to insert resolutions
CREATE POLICY "Allow authenticated inserts" ON resolutions
  FOR INSERT WITH CHECK (true);

-- Allow public reads for claim lookups (needed for claim page)
CREATE POLICY "Allow public claim lookups" ON pending_claims
  FOR SELECT USING (true);

-- Allow authenticated inserts for claims
CREATE POLICY "Allow authenticated inserts" ON pending_claims
  FOR INSERT WITH CHECK (true);

-- Allow authenticated updates for claims (claiming, expiring)
CREATE POLICY "Allow authenticated updates" ON pending_claims
  FOR UPDATE USING (true);

-- Functions

-- Auto-update updated_at on resolution changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resolutions_updated_at
  BEFORE UPDATE ON resolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to check if a claim is valid
CREATE OR REPLACE FUNCTION is_claim_valid(claim_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pending_claims
    WHERE pending_claims.claim_token = $1
      AND status = 'pending'
      AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to mark a claim as claimed
CREATE OR REPLACE FUNCTION claim_droplet(
  p_claim_token TEXT,
  p_claimer_address TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_claims
  SET status = 'claimed',
      claimed_at = NOW(),
      claimed_by_address = p_claimer_address
  WHERE claim_token = p_claim_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
