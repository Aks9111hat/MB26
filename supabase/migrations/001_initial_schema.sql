-- =============================================================================
-- MindBridge MVP — Supabase Migration
-- File: 001_initial_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ============================================================
-- SECTION 0: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for text search on therapist names

-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_tier          AS ENUM ('free', 'plus', 'corporate');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE checkin_tier       AS ENUM ('thriving', 'managing', 'struggling');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE safety_flag_type   AS ENUM ('self_harm', 'suicidal_ideation', 'harm_to_others');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE coping_style_type  AS ENUM ('active', 'avoidance', 'social', 'none');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE stressor_type      AS ENUM ('work', 'relationship', 'financial', 'health', 'identity', 'unclear');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status     AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_mode_type  AS ENUM ('video', 'audio', 'in_person', 'chat');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- SECTION 2: SHARED TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- SECTION 3: USERS TABLE
-- Note: id = auth.users.id (Supabase Auth UUID)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- Identity (linked to Supabase Auth)
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL UNIQUE,

  -- Profile
  full_name             TEXT,
  display_name          TEXT,
  avatar_url            TEXT,
  preferred_language    TEXT NOT NULL DEFAULT 'en',
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',

  -- Tier & subscription
  tier                  user_tier NOT NULL DEFAULT 'free',

  -- Consent (DPDPA compliance)
  consent_given_at      TIMESTAMPTZ,
  consent_version       TEXT DEFAULT '1.0',
  data_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent     BOOLEAN NOT NULL DEFAULT FALSE,

  -- State
  onboarding_complete   BOOLEAN NOT NULL DEFAULT FALSE,
  primary_concerns      TEXT[] NOT NULL DEFAULT '{}',   -- from onboarding
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  last_checkin_at       TIMESTAMPTZ,

  -- Razorpay (added when first payment made)
  razorpay_customer_id  TEXT,

  -- Safety
  safety_flagged        BOOLEAN NOT NULL DEFAULT FALSE,
  safety_flagged_at     TIMESTAMPTZ,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ   -- soft delete for DPDPA
);

-- Trigger: auto-update updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger: auto-create users row when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 4: THERAPISTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.therapists (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  full_name                 TEXT NOT NULL,
  display_name              TEXT,
  bio                       TEXT,
  profile_photo_url         TEXT,
  tagline                   TEXT,             -- short one-liner shown on card

  -- Credentials
  license_number            TEXT,
  license_body              TEXT,             -- 'RCI', 'IPC', 'MCI'
  qualification             TEXT[] NOT NULL DEFAULT '{}',
  years_experience          INT,
  verification_status       verification_status NOT NULL DEFAULT 'pending',
  verified_at               TIMESTAMPTZ,

  -- Matching fields (used by recommendation engine)
  specialities              TEXT[] NOT NULL DEFAULT '{}',
  therapeutic_approaches    TEXT[] NOT NULL DEFAULT '{}',
  languages                 TEXT[] NOT NULL DEFAULT ARRAY['en'],
  session_modes             TEXT[] NOT NULL DEFAULT ARRAY['video'],

  -- Pricing (all amounts in PAISA — multiply ₹ by 100)
  session_fee_inr           INT NOT NULL DEFAULT 80000,   -- ₹800 default
  intro_session_fee_inr     INT,                          -- optional discounted first session

  -- Availability
  -- Schema: { "mon": ["09:00","10:00","11:00"], "tue": [...], ... }
  availability_slots        JSONB NOT NULL DEFAULT '{}',
  booking_buffer_mins       INT NOT NULL DEFAULT 30,
  advance_booking_days      INT NOT NULL DEFAULT 14,
  session_duration_mins     INT NOT NULL DEFAULT 50,

  -- Platform
  commission_rate           NUMERIC(4,3) NOT NULL DEFAULT 0.12,   -- 12%
  razorpay_contact_id       TEXT,
  razorpay_fund_account_id  TEXT,

  -- Stats
  total_sessions            INT NOT NULL DEFAULT 0,
  average_rating            NUMERIC(3,2),
  review_count              INT NOT NULL DEFAULT 0,

  -- State
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  is_taking_new_clients     BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- SECTION 5: CHECKINS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.checkins (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Timing
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  duration_seconds      INT,

  -- Result tier
  tier                  checkin_tier,
  total_score           SMALLINT CHECK (total_score BETWEEN 0 AND 14),

  -- Domain scores (0 = low, 1 = fair, 2 = good)
  score_energy          SMALLINT CHECK (score_energy    BETWEEN 0 AND 2),
  score_sleep           SMALLINT CHECK (score_sleep     BETWEEN 0 AND 2),
  score_stress          SMALLINT CHECK (score_stress    BETWEEN 0 AND 2),
  score_social          SMALLINT CHECK (score_social    BETWEEN 0 AND 2),
  score_wins            SMALLINT CHECK (score_wins      BETWEEN 0 AND 2),
  score_worry           SMALLINT CHECK (score_worry     BETWEEN 0 AND 2),
  score_coping          SMALLINT CHECK (score_coping    BETWEEN 0 AND 2),
  score_intention       SMALLINT CHECK (score_intention BETWEEN 0 AND 2),

  -- Analysis fields
  primary_stressor      stressor_type,
  coping_style          coping_style_type,
  social_isolation      BOOLEAN NOT NULL DEFAULT FALSE,
  self_efficacy_low     BOOLEAN NOT NULL DEFAULT FALSE,

  -- Safety
  safety_flag           BOOLEAN NOT NULL DEFAULT FALSE,
  safety_type           safety_flag_type,
  safety_acknowledged   BOOLEAN NOT NULL DEFAULT FALSE,
  safety_acknowledged_at TIMESTAMPTZ,
  safety_acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Recommendation tags (drives therapist + resource matching)
  rec_tags              TEXT[] NOT NULL DEFAULT '{}',

  -- AI-generated output
  snapshot_text         TEXT,
  user_intention        TEXT,    -- verbatim from Q8

  -- Flexible metadata (AI reasoning, raw scores before normalization)
  assessment_metadata   JSONB NOT NULL DEFAULT '{}',

  -- State
  is_complete           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: CHECKIN_MESSAGES TABLE
-- One row per message turn in the AI conversation
-- ============================================================

CREATE TABLE IF NOT EXISTS public.checkin_messages (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id              UUID NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Message
  role                    TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  sequence_number         SMALLINT NOT NULL,
  content                 TEXT NOT NULL,   -- plain text in dev; encrypt in production

  -- Safety metadata (not the content itself — for admin dashboard)
  contains_safety_signal  BOOLEAN NOT NULL DEFAULT FALSE,
  safety_signal_type      safety_flag_type,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (checkin_id, sequence_number)
);

-- ============================================================
-- SECTION 7: MOOD_ENTRIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mood_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checkin_id    UUID REFERENCES public.checkins(id) ON DELETE SET NULL,

  -- Core mood
  mood_score    SMALLINT NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  mood_label    TEXT NOT NULL CHECK (mood_label IN ('very_low','low','neutral','good','great')),

  -- Enrichment
  tags          TEXT[] NOT NULL DEFAULT '{}',
  activities    TEXT[] NOT NULL DEFAULT '{}',
  note          TEXT,           -- plain text (short, user-written)
  sleep_hours   NUMERIC(4,1)   CHECK (sleep_hours BETWEEN 0 AND 24),

  -- Time
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_local    DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One mood entry per user per day
  CONSTRAINT one_mood_per_user_per_day UNIQUE (user_id, date_local)
);

-- ============================================================
-- SECTION 8: BOOKINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  therapist_id            UUID NOT NULL REFERENCES public.therapists(id) ON DELETE RESTRICT,
  checkin_id              UUID REFERENCES public.checkins(id) ON DELETE SET NULL,

  -- Scheduling
  scheduled_start         TIMESTAMPTZ NOT NULL,
  scheduled_end           TIMESTAMPTZ NOT NULL,
  session_mode            session_mode_type NOT NULL DEFAULT 'video',
  timezone_user           TEXT NOT NULL DEFAULT 'Asia/Kolkata',

  -- Meeting
  meeting_url             TEXT,
  meeting_id              TEXT,

  -- Status
  status                  booking_status NOT NULL DEFAULT 'pending',
  cancelled_by            TEXT CHECK (cancelled_by IN ('user','therapist','admin','system')),
  cancellation_reason     TEXT,
  cancelled_at            TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,

  -- Notes (therapist-entered; never exposed to user via API)
  notes_for_therapist     TEXT,     -- from user at booking time

  -- Rating
  user_rating             SMALLINT CHECK (user_rating BETWEEN 1 AND 5),
  user_review_text        TEXT,
  reviewed_at             TIMESTAMPTZ,

  -- Pricing snapshot at booking time
  session_fee_inr         INT NOT NULL,
  platform_commission_inr INT,
  therapist_payout_inr    INT,

  -- Razorpay
  razorpay_order_id       TEXT,
  razorpay_payment_id     TEXT,
  payment_status          TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','captured','failed','refunded')),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Basic overlap check: same user can't book same time twice
  CONSTRAINT no_duplicate_user_booking
    UNIQUE (user_id, scheduled_start)
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- SECTION 9: INDEXES (performance)
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email          ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier           ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_safety         ON public.users(safety_flagged) WHERE safety_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_active         ON public.users(is_active) WHERE deleted_at IS NULL;

-- Therapists
CREATE INDEX IF NOT EXISTS idx_therapists_active    ON public.therapists(is_active, is_taking_new_clients);
CREATE INDEX IF NOT EXISTS idx_therapists_spec      ON public.therapists USING gin(specialities);
CREATE INDEX IF NOT EXISTS idx_therapists_langs     ON public.therapists USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_therapists_fee       ON public.therapists(session_fee_inr);
CREATE INDEX IF NOT EXISTS idx_therapists_rating    ON public.therapists(average_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_therapists_verified  ON public.therapists(verification_status);
-- Trigram index for fuzzy name search
CREATE INDEX IF NOT EXISTS idx_therapists_name_trgm ON public.therapists USING gin(full_name gin_trgm_ops);

-- Checkins
CREATE INDEX IF NOT EXISTS idx_checkins_user        ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_time   ON public.checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_tier        ON public.checkins(tier) WHERE is_complete = TRUE;
CREATE INDEX IF NOT EXISTS idx_checkins_safety      ON public.checkins(safety_flag) WHERE safety_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_checkins_unacked     ON public.checkins(safety_acknowledged) WHERE safety_flag = TRUE AND safety_acknowledged = FALSE;
CREATE INDEX IF NOT EXISTS idx_checkins_rec_tags    ON public.checkins USING gin(rec_tags);

-- Checkin messages
CREATE INDEX IF NOT EXISTS idx_messages_checkin     ON public.checkin_messages(checkin_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_messages_user        ON public.checkin_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_safety      ON public.checkin_messages(contains_safety_signal) WHERE contains_safety_signal = TRUE;

-- Mood entries
CREATE INDEX IF NOT EXISTS idx_mood_user_date       ON public.mood_entries(user_id, date_local DESC);
CREATE INDEX IF NOT EXISTS idx_mood_user_month      ON public.mood_entries(user_id, date_trunc('month', date_local));

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user        ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist   ON public.bookings(therapist_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled   ON public.bookings(scheduled_start) WHERE status IN ('pending','confirmed');
CREATE INDEX IF NOT EXISTS idx_bookings_checkin     ON public.bookings(checkin_id) WHERE checkin_id IS NOT NULL;

-- ============================================================
-- SECTION 10: ROW LEVEL SECURITY
-- Enable on every table. Deny by default, grant explicitly.
-- ============================================================

ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings         ENABLE ROW LEVEL SECURITY;

-- ---- USERS ----
-- Users can only read/update their own row
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- The handle_new_user trigger inserts with SECURITY DEFINER so no insert policy needed

-- ---- THERAPISTS ----
-- Any authenticated user can read verified, active therapists
CREATE POLICY "therapists_select_public"
  ON public.therapists FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_active = TRUE
    AND verification_status = 'verified'
  );

-- Service role (admin) can do anything
CREATE POLICY "therapists_service_role_all"
  ON public.therapists FOR ALL
  USING (auth.role() = 'service_role');

-- ---- CHECKINS ----
CREATE POLICY "checkins_owner_all"
  ON public.checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- CHECKIN MESSAGES ----
CREATE POLICY "messages_owner_all"
  ON public.checkin_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- MOOD ENTRIES ----
CREATE POLICY "mood_owner_all"
  ON public.mood_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- BOOKINGS ----
-- Users see their own bookings
CREATE POLICY "bookings_user_select"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "bookings_user_insert"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel) their own bookings
CREATE POLICY "bookings_user_update"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for admin operations)
CREATE POLICY "bookings_service_role_all"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- SECTION 11: HELPER VIEWS
-- ============================================================

-- Latest completed check-in per user
CREATE OR REPLACE VIEW public.latest_checkins AS
  SELECT DISTINCT ON (user_id)
    id, user_id, tier, total_score, rec_tags,
    safety_flag, snapshot_text, user_intention,
    primary_stressor, score_energy, score_sleep,
    score_stress, score_social, score_wins,
    score_worry, score_coping, score_intention,
    created_at
  FROM public.checkins
  WHERE is_complete = TRUE
  ORDER BY user_id, created_at DESC;

-- Public therapist directory (safe fields only — no financial info)
CREATE OR REPLACE VIEW public.therapist_directory AS
  SELECT
    id, full_name, display_name, bio, tagline,
    profile_photo_url, specialities, therapeutic_approaches,
    languages, session_modes, session_fee_inr,
    intro_session_fee_inr, average_rating, review_count,
    years_experience, qualification, is_taking_new_clients,
    availability_slots, session_duration_mins
  FROM public.therapists
  WHERE is_active = TRUE
    AND verification_status = 'verified';

-- 7-day mood trend per user
CREATE OR REPLACE VIEW public.mood_trend_7d AS
  SELECT
    user_id,
    ROUND(AVG(mood_score)::NUMERIC, 2)           AS avg_score,
    MIN(mood_score)                               AS min_score,
    MAX(mood_score)                               AS max_score,
    COUNT(*)::INT                                 AS entry_count,
    ARRAY_AGG(mood_score ORDER BY date_local ASC) AS score_series,
    ARRAY_AGG(date_local ORDER BY date_local ASC) AS date_series
  FROM public.mood_entries
  WHERE date_local >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id;

-- Admin: unacknowledged safety flags
CREATE OR REPLACE VIEW public.unacked_safety_flags AS
  SELECT
    c.id          AS checkin_id,
    c.user_id,
    c.safety_type,
    c.created_at  AS flagged_at,
    u.email       AS user_email,
    u.full_name   AS user_name
  FROM public.checkins c
  JOIN public.users u ON u.id = c.user_id
  WHERE c.safety_flag = TRUE
    AND c.safety_acknowledged = FALSE
  ORDER BY c.created_at ASC;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
