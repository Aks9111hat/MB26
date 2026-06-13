-- =============================================================================
-- MindBridge — Seed Data
-- File: seed.sql
-- Run AFTER 001_initial_schema.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================
-- NOTE: These therapists are inserted bypassing RLS using the service role.
-- Run this in the SQL Editor (which uses the service role by default).
-- =============================================================================

-- Temporarily allow service role inserts
-- (SQL Editor already runs as service role, so RLS bypass is automatic)

INSERT INTO public.therapists (
  id,
  full_name,
  display_name,
  bio,
  tagline,
  license_number,
  license_body,
  qualification,
  years_experience,
  verification_status,
  verified_at,
  specialities,
  therapeutic_approaches,
  languages,
  session_modes,
  session_fee_inr,
  intro_session_fee_inr,
  availability_slots,
  session_duration_mins,
  booking_buffer_mins,
  advance_booking_days,
  commission_rate,
  total_sessions,
  average_rating,
  review_count,
  is_active,
  is_taking_new_clients
) VALUES

-- ============================================================
-- THERAPIST 1: Priya Mehta — Burnout & Work Stress specialist
-- Matches rec_tags: burnout, work_stress, anxiety
-- ============================================================
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Dr. Priya Mehta',
  'Dr. Priya',
  'I have spent the last 9 years working with professionals who feel like they are running on empty — high achievers who have given everything to their work and woken up one day not recognising themselves. My approach is warm, practical, and grounded. I will not give you a diagnosis or a label. I will help you understand what is actually happening and build something more sustainable. Most of my clients come to me feeling burned out, anxious, or stuck in patterns they cannot seem to break. Many of them had never spoken to a therapist before.',
  'For high-achievers running on empty',
  'RCI/2015/KA/12847',
  'RCI',
  ARRAY['M.Phil Clinical Psychology (NIMHANS)', 'PhD Organisational Psychology (IISc)'],
  9,
  'verified',
  NOW() - INTERVAL '6 months',
  ARRAY['burnout', 'work_stress', 'anxiety', 'career', 'stress_management', 'perfectionism'],
  ARRAY['CBT', 'ACT', 'Mindfulness-Based Cognitive Therapy', 'Strengths-Based Therapy'],
  ARRAY['en', 'hi', 'gu'],
  ARRAY['video', 'audio'],
  80000,   -- ₹800
  50000,   -- ₹500 intro
  '{
    "mon": ["09:00","10:00","11:00","14:00","15:00","16:00"],
    "tue": ["09:00","10:00","11:00","14:00","15:00"],
    "wed": ["09:00","10:00","14:00","15:00","16:00","17:00"],
    "thu": ["09:00","10:00","11:00","14:00","15:00"],
    "fri": ["09:00","10:00","11:00","14:00"],
    "sat": ["10:00","11:00","12:00"]
  }',
  50,
  30,
  14,
  0.12,
  312,
  4.87,
  89,
  TRUE,
  TRUE
),

-- ============================================================
-- THERAPIST 2: Arjun Krishnan — Relationships & Identity
-- Matches rec_tags: relationships, identity, social_isolation
-- ============================================================
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Arjun Krishnan',
  'Arjun',
  'Relationships are hard — with others and with ourselves. I work with individuals navigating relationship conflicts, heartbreak, family pressure, questions of identity and belonging, and the particular loneliness of feeling misunderstood even when surrounded by people. I am a queer-affirmative therapist and a safe space for anyone exploring gender, sexuality, or identity. My style is conversational and collaborative — I am more interested in your actual experience than fitting you into a framework.',
  'Helping you understand yourself and your relationships',
  'RCI/2018/MH/34521',
  'RCI',
  ARRAY['MA Counselling Psychology (Tata Institute of Social Sciences)', 'Certification in Emotion-Focused Therapy'],
  6,
  'verified',
  NOW() - INTERVAL '4 months',
  ARRAY['relationships', 'identity', 'social_isolation', 'grief', 'anxiety', 'self_esteem', 'family'],
  ARRAY['Emotion-Focused Therapy', 'Narrative Therapy', 'IFS (Internal Family Systems)', 'Person-Centred Therapy'],
  ARRAY['en', 'ta', 'kn'],
  ARRAY['video', 'audio', 'chat'],
  70000,   -- ₹700
  45000,   -- ₹450 intro
  '{
    "mon": ["10:00","11:00","12:00","17:00","18:00","19:00"],
    "tue": ["10:00","11:00","17:00","18:00","19:00"],
    "wed": ["10:00","11:00","12:00","17:00","18:00"],
    "thu": ["10:00","11:00","17:00","18:00","19:00"],
    "fri": ["10:00","11:00","12:00","17:00"],
    "sat": ["11:00","12:00","13:00","14:00"]
  }',
  50,
  15,
  14,
  0.12,
  228,
  4.93,
  67,
  TRUE,
  TRUE
),

-- ============================================================
-- THERAPIST 3: Dr. Meenakshi Iyer — Anxiety, Sleep & Trauma
-- Matches rec_tags: anxiety, sleep, trauma, stress_management
-- ============================================================
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Dr. Meenakshi Iyer',
  'Dr. Meenakshi',
  'I am a clinical psychologist with a specialisation in anxiety disorders and trauma. If you live with constant worry, fear that feels outsized to the situation, panic attacks, or the aftermath of difficult experiences, I can help you make sense of what is happening in your mind and body — and work through it at your own pace. I use evidence-based approaches adapted for the Indian context. I understand that many of my clients are navigating mental health concerns alongside family expectations, career pressures, and cultural identity. That context matters to me.',
  'Evidence-based care for anxiety and trauma',
  'RCI/2012/TN/08934',
  'RCI',
  ARRAY['Ph.D Clinical Psychology (University of Madras)', 'EMDR Certified Therapist', 'M.Phil (NIMHANS)'],
  12,
  'verified',
  NOW() - INTERVAL '1 year',
  ARRAY['anxiety', 'trauma', 'sleep', 'panic_attacks', 'stress_management', 'ocd', 'general_wellness'],
  ARRAY['EMDR', 'CBT', 'Somatic Therapy', 'Prolonged Exposure', 'Mindfulness-Based Stress Reduction'],
  ARRAY['en', 'ta'],
  ARRAY['video', 'in_person'],
  120000,  -- ₹1200
  70000,   -- ₹700 intro
  '{
    "tue": ["10:00","11:00","12:00","14:00","15:00"],
    "wed": ["10:00","11:00","14:00","15:00","16:00"],
    "thu": ["10:00","11:00","12:00","14:00","15:00"],
    "fri": ["10:00","11:00","14:00","15:00"],
    "sat": ["09:00","10:00","11:00","12:00"]
  }',
  60,
  30,
  21,
  0.12,
  547,
  4.91,
  142,
  TRUE,
  TRUE
),

-- ============================================================
-- THERAPIST 4: Rahul Sharma — Depression, Self-Esteem, Men's Mental Health
-- Matches rec_tags: depression, self_esteem, burnout, grief
-- ============================================================
(
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  'Rahul Sharma',
  'Rahul',
  'There is still a strange silence around men''s mental health in India — the expectation to be strong, to figure it out, to not need help. I work specifically with men (and anyone who has felt that pressure) who are quietly struggling with low mood, burnout, grief, feeling lost, or not knowing who they are outside of work and family roles. My approach is direct and practical. I will not dance around the difficult things. I will be straight with you, and I will meet you where you are.',
  'Straight talk, no judgment',
  'RCI/2019/DL/45678',
  'RCI',
  ARRAY['MA Psychology (Delhi University)', 'PG Diploma Counselling (IGNOU)', 'Certification in Grief Therapy'],
  5,
  'verified',
  NOW() - INTERVAL '3 months',
  ARRAY['depression', 'self_esteem', 'burnout', 'grief', 'work_stress', 'identity', 'general_wellness'],
  ARRAY['CBT', 'Behavioural Activation', 'Motivational Interviewing', 'Solution-Focused Brief Therapy'],
  ARRAY['en', 'hi'],
  ARRAY['video', 'audio'],
  60000,   -- ₹600
  40000,   -- ₹400 intro
  '{
    "mon": ["07:00","08:00","18:00","19:00","20:00"],
    "tue": ["07:00","08:00","18:00","19:00","20:00"],
    "wed": ["07:00","08:00","18:00","19:00"],
    "thu": ["07:00","08:00","18:00","19:00","20:00"],
    "fri": ["07:00","08:00","18:00","19:00"],
    "sat": ["09:00","10:00","11:00","12:00","13:00"],
    "sun": ["10:00","11:00","12:00"]
  }',
  50,
  15,
  14,
  0.12,
  184,
  4.82,
  53,
  TRUE,
  TRUE
),

-- ============================================================
-- THERAPIST 5: Dr. Kavitha Nair — Family, Parenting & Life Transitions
-- Matches rec_tags: family, relationships, general_wellness, anxiety
-- ============================================================
(
  'e5f6a7b8-c9d0-1234-efab-345678901234',
  'Dr. Kavitha Nair',
  'Dr. Kavitha',
  'Life transitions are some of the hardest things we navigate — becoming a parent, losing a parent, a marriage changing shape, a career that no longer fits, children leaving home, a city you did not choose. I work with individuals and couples at these crossroads. I bring 14 years of experience, a warm and non-judgemental style, and a deep respect for the complexity of Indian family life. I understand the weight of responsibility that comes with being part of a family system, and I help my clients find their own path through it.',
  'Steady support through life''s transitions',
  'RCI/2010/KL/02341',
  'RCI',
  ARRAY['Ph.D Counselling Psychology (Calicut University)', 'Certification in Couples Therapy (Gottman Method)', 'M.Phil Clinical Psychology'],
  14,
  'verified',
  NOW() - INTERVAL '2 years',
  ARRAY['family', 'relationships', 'anxiety', 'grief', 'life_transitions', 'parenting', 'general_wellness'],
  ARRAY['Gottman Method', 'Systemic Family Therapy', 'CBT', 'Attachment-Based Therapy', 'Narrative Therapy'],
  ARRAY['en', 'ml', 'hi'],
  ARRAY['video', 'audio', 'in_person'],
  90000,   -- ₹900
  60000,   -- ₹600 intro
  '{
    "mon": ["09:00","10:00","11:00","14:00","15:00"],
    "wed": ["09:00","10:00","11:00","14:00","15:00","16:00"],
    "fri": ["09:00","10:00","11:00","14:00","15:00"],
    "sat": ["09:00","10:00","11:00","12:00","13:00"]
  }',
  55,
  30,
  21,
  0.12,
  623,
  4.95,
  198,
  TRUE,
  TRUE
);

-- ============================================================
-- Verification: Check seed was successful
-- ============================================================
SELECT
  full_name,
  session_fee_inr / 100 AS fee_rupees,
  average_rating,
  array_length(specialities, 1) AS speciality_count,
  languages,
  verification_status
FROM public.therapists
ORDER BY created_at;
