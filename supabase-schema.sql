-- ============================================================
-- PulseStay — Supabase Schema (Complaint Management)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Hotels (your paying customers)
CREATE TABLE hotels (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  plan                  TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  public_page_enabled   BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('manager','staff')),
  department   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guests (one row per stay) — must come before complaints due to FK reference
CREATE TABLE guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  room_number     TEXT NOT NULL,
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  followup_sent   BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_hotel_checkout ON guests(hotel_id, check_out);

-- Guest complaints
CREATE TABLE complaints (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id           UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  submitted_by       UUID NOT NULL REFERENCES profiles(id),
  guest_id           UUID REFERENCES guests(id) ON DELETE SET NULL,
  department         TEXT NOT NULL,
  room_number        TEXT,
  category           TEXT NOT NULL,
  description        TEXT NOT NULL,
  severity           TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status             TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  assigned_to        UUID REFERENCES profiles(id),
  resolution         TEXT,
  compensation       TEXT,
  guest_satisfaction SMALLINT CHECK (guest_satisfaction BETWEEN 1 AND 5),
  resolved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast dashboard queries
CREATE INDEX idx_complaints_hotel_date     ON complaints(hotel_id, created_at DESC);
CREATE INDEX idx_complaints_dept           ON complaints(hotel_id, department);
CREATE INDEX idx_complaints_status         ON complaints(hotel_id, status);
CREATE INDEX idx_complaints_severity       ON complaints(hotel_id, severity) WHERE severity IN ('high','critical');
CREATE INDEX idx_complaints_guest          ON complaints(guest_id) WHERE guest_id IS NOT NULL;

-- Auto-update hotels.updated_at on any change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────
ALTER TABLE hotels     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests     ENABLE ROW LEVEL SECURITY;

-- Helper: get the hotel_id for the current user
CREATE OR REPLACE FUNCTION my_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Hotels: users can only read/update their own hotel
CREATE POLICY "hotel_select" ON hotels FOR SELECT USING (id = my_hotel_id());
CREATE POLICY "hotel_update" ON hotels FOR UPDATE USING (id = my_hotel_id());
CREATE POLICY "hotel_insert" ON hotels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles
CREATE POLICY "profile_select"      ON profiles FOR SELECT USING (hotel_id = my_hotel_id());
CREATE POLICY "profile_self_update" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profile_insert"      ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Complaints: staff can insert + read + update within their hotel
CREATE POLICY "complaint_select" ON complaints FOR SELECT USING (hotel_id = my_hotel_id());
CREATE POLICY "complaint_insert" ON complaints FOR INSERT WITH CHECK (hotel_id = my_hotel_id());
CREATE POLICY "complaint_update" ON complaints FOR UPDATE USING (hotel_id = my_hotel_id());

-- Guests
CREATE POLICY "guest_select" ON guests FOR SELECT USING (hotel_id = my_hotel_id());
CREATE POLICY "guest_insert" ON guests FOR INSERT WITH CHECK (hotel_id = my_hotel_id());
CREATE POLICY "guest_update" ON guests FOR UPDATE USING (hotel_id = my_hotel_id());

-- ── Stored function for department complaint counts ──────────────────
CREATE OR REPLACE FUNCTION get_department_complaint_counts(p_hotel_id UUID, p_date DATE)
RETURNS TABLE (
  department     TEXT,
  open_count     BIGINT,
  resolved_count BIGINT,
  total_count    BIGINT
) AS $$
  SELECT
    department,
    COUNT(*) FILTER (WHERE status = 'open')     AS open_count,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
    COUNT(*)                                     AS total_count
  FROM complaints
  WHERE
    hotel_id   = p_hotel_id
    AND created_at >= p_date::TIMESTAMPTZ
    AND created_at <  (p_date + INTERVAL '1 day')::TIMESTAMPTZ
  GROUP BY department
  ORDER BY total_count DESC;
$$ LANGUAGE SQL STABLE;
