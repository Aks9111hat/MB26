-- =============================================================================
-- MindBridge — Seed Data: 5 Indian Therapists
-- Run AFTER 001_initial_schema.sql
-- File: supabase/seed/002_seed_therapists.sql
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses ON CONFLICT DO NOTHING)
-- =============================================================================

INSERT INTO public.therapists (
  id,
  full_name,
  display_name,
  bio,
  tagline,
  profile_photo_url,
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
  commission_rate,
  average_rating,
  review_count,
  total_sessions,
  is_active,
  is_taking_new_clients
)
VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- Therapist 1: Priya Mehta — Burnout & Work Stress specialist, Mumbai
-- Strong match for: burnout, work_stress, anxiety, stress_management
-- ─────────────────────────────────────────────────────────────────────────────
(
  'a1b2c3d4-0001-0000-0000-000000000001',
  'Dr. Priya Mehta',
  'Dr. Priya',
  'I''ve spent over a decade working with professionals navigating the relentless pressure of modern work — burnout, anxiety, the feeling that you''re running on empty but can''t slow down. My approach is direct but warm: I help you understand what''s actually happening beneath the surface, and then we work on practical tools to help you reclaim your energy and perspective. I trained at TISS Mumbai and completed a fellowship in occupational mental health in Bangalore. I believe therapy doesn''t have to be mysterious — it should feel like a conversation that actually helps.',
  'Helping high-achievers find their balance again',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=b6e3f4',
  ARRAY['M.Phil Clinical Psychology (TISS Mumbai)', 'Certified in CBT (Beck Institute)', 'Fellowship in Occupational Mental Health'],
  11,
  'verified',
  NOW() - INTERVAL '6 months',
  ARRAY['burnout', 'work_stress', 'anxiety', 'stress_management', 'career', 'perfectionism', 'work_life_balance'],
  ARRAY['CBT', 'ACT', 'Mindfulness-Based Stress Reduction', 'Solution-Focused Therapy'],
  ARRAY['en', 'hi', 'mr'],
  ARRAY['video', 'audio'],
  80000,          -- ₹800
  50000,          -- ₹500 intro session
  '{
    "mon": ["09:00","10:00","11:00","14:00","15:00","16:00"],
    "tue": ["09:00","10:00","11:00","14:00","15:00"],
    "wed": ["09:00","10:00","14:00","15:00","16:00"],
    "thu": ["10:00","11:00","14:00","15:00","16:00"],
    "fri": ["09:00","10:00","11:00","14:00"],
    "sat": ["10:00","11:00","12:00"]
  }'::jsonb,
  50,
  30,
  0.12,
  4.87,
  143,
  312,
  TRUE,
  TRUE
),

-- ─────────────────────────────────────────────────────────────────────────────
-- Therapist 2: Arjun Krishnamurthy — Anxiety & Relationships, Bangalore
-- Strong match for: anxiety, relationships, social_isolation, worry
-- ─────────────────────────────────────────────────────────────────────────────
(
  'a1b2c3d4-0002-0000-0000-000000000002',
  'Arjun Krishnamurthy',
  'Arjun K.',
  'Anxiety has a way of making everything feel urgent and hopeless at the same time. I know because I''ve sat with hundreds of people in that exact place. My work focuses on helping people understand their anxiety patterns — not to fight them, but to change your relationship with them. I also work extensively with relationship challenges: the invisible distance that grows between people, the conflict that keeps circling, the loneliness you feel even around people you love. I completed my training at NIMHANS Bangalore and I bring a grounded, science-backed perspective to every session.',
  'Anxiety doesn''t have to run your life',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=c0aede',
  ARRAY['M.Phil Clinical Psychology (NIMHANS Bangalore)', 'Certified DBT Therapist', 'Gottman Level 2 (Couples)'],
  8,
  'verified',
  NOW() - INTERVAL '4 months',
  ARRAY['anxiety', 'relationships', 'social_isolation', 'worry', 'panic', 'couples', 'communication', 'self_esteem'],
  ARRAY['DBT', 'CBT', 'Gottman Method', 'Exposure Therapy', 'Psychodynamic'],
  ARRAY['en', 'kn', 'ta'],
  ARRAY['video', 'audio', 'in_person'],
  100000,         -- ₹1000
  65000,          -- ₹650 intro session
  '{
    "mon": ["18:00","19:00","20:00"],
    "tue": ["18:00","19:00","20:00"],
    "wed": ["18:00","19:00"],
    "thu": ["18:00","19:00","20:00"],
    "fri": ["18:00","19:00"],
    "sat": ["10:00","11:00","12:00","14:00","15:00"],
    "sun": ["10:00","11:00","12:00"]
  }'::jsonb,
  50,
  30,
  0.12,
  4.92,
  89,
  201,
  TRUE,
  TRUE
),

-- ─────────────────────────────────────────────────────────────────────────────
-- Therapist 3: Sunita Bose — Depression & Grief, Delhi
-- Strong match for: depression, grief, self_efficacy_low, struggling tier
-- ─────────────────────────────────────────────────────────────────────────────
(
  'a1b2c3d4-0003-0000-0000-000000000003',
  'Dr. Sunita Bose',
  'Dr. Sunita',
  'Some things in life break us open — loss, depression, the sense that you''re not quite yourself anymore. I work with people who are in the hardest chapters of their lives, and my job is to sit with them in that, not rush past it. I specialise in grief work and depression, and I use an integrative approach that draws from both evidence-based methods and a more humanistic understanding of what it means to be human. I trained at Delhi University and have been in practice for 14 years. My sessions are a safe space — judgement-free, culturally sensitive, and genuinely human.',
  'Present with you in the hardest chapters',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sunita&backgroundColor=d1d4f9',
  ARRAY['PhD Psychology (Delhi University)', 'Certified Grief Counsellor', 'Trauma-Focused CBT Trained'],
  14,
  'verified',
  NOW() - INTERVAL '8 months',
  ARRAY['depression', 'grief', 'trauma', 'self_esteem', 'identity', 'loneliness', 'self_harm_history', 'life_transitions'],
  ARRAY['Integrative Therapy', 'Grief Therapy', 'TF-CBT', 'Person-Centred', 'Narrative Therapy'],
  ARRAY['en', 'hi', 'bn'],
  ARRAY['video', 'audio'],
  120000,         -- ₹1200
  NULL,           -- no intro discount
  '{
    "mon": ["10:00","11:00","12:00","15:00","16:00"],
    "wed": ["10:00","11:00","12:00","15:00","16:00"],
    "fri": ["10:00","11:00","15:00","16:00"],
    "sat": ["11:00","12:00","13:00"]
  }'::jsonb,
  60,
  30,
  0.12,
  4.95,
  211,
  428,
  TRUE,
  TRUE
),

-- ─────────────────────────────────────────────────────────────────────────────
-- Therapist 4: Rahul Nair — Sleep & Wellness, Chennai — affordable tier
-- Strong match for: sleep, general_wellness, stress_management, managing tier
-- ─────────────────────────────────────────────────────────────────────────────
(
  'a1b2c3d4-0004-0000-0000-000000000004',
  'Rahul Nair',
  'Rahul N.',
  'Sleep problems are almost never just about sleep. In my work, I''ve found that chronic poor sleep is almost always tangled up with stress, racing thoughts, work pressure, and a nervous system that hasn''t been given permission to slow down. I use CBT-I (the gold standard for insomnia), mindfulness, and stress management techniques to help people finally get the rest they deserve. I also work with general wellness — helping people who aren''t in crisis but feel like they''re not quite thriving either. Affordable, accessible, practical.',
  'Rest is not a luxury — let''s get yours back',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul&backgroundColor=b6e3f4',
  ARRAY['M.Sc. Applied Psychology (University of Madras)', 'Certified in CBT-I (Insomnia)', 'Mindfulness-Based Cognitive Therapy Trained'],
  6,
  'verified',
  NOW() - INTERVAL '3 months',
  ARRAY['sleep', 'stress_management', 'general_wellness', 'work_stress', 'mindfulness', 'burnout'],
  ARRAY['CBT-I', 'Mindfulness-Based Cognitive Therapy', 'Relaxation Training', 'ACT'],
  ARRAY['en', 'ta', 'ml'],
  ARRAY['video', 'audio', 'chat'],
  60000,          -- ₹600 — accessible price point
  40000,          -- ₹400 intro session
  '{
    "mon": ["07:00","08:00","19:00","20:00","21:00"],
    "tue": ["07:00","08:00","19:00","20:00","21:00"],
    "wed": ["07:00","08:00","19:00","20:00"],
    "thu": ["07:00","08:00","19:00","20:00","21:00"],
    "fri": ["07:00","08:00","19:00","20:00"],
    "sat": ["08:00","09:00","10:00","11:00"],
    "sun": ["09:00","10:00","11:00"]
  }'::jsonb,
  50,
  15,
  0.12,
  4.78,
  67,
  134,
  TRUE,
  TRUE
),

-- ─────────────────────────────────────────────────────────────────────────────
-- Therapist 5: Meera Iyer — Identity, Life Transitions & Young Adults, Hyderabad
-- Strong match for: identity, career, self_efficacy_low, social_isolation
-- ─────────────────────────────────────────────────────────────────────────────
(
  'a1b2c3d4-0005-0000-0000-000000000005',
  'Meera Iyer',
  'Meera I.',
  'The twenties and thirties are often described as the best years of your life — but for a lot of people, they''re actually some of the most confusing and difficult. Who am I? What do I actually want? Why do I feel so disconnected even when everything looks fine from the outside? These are the questions I love working with. I specialise in identity, life transitions, career stress, and the particular kind of loneliness that comes from feeling like you''re performing your life rather than living it. I bring warmth, curiosity, and a genuinely non-judgmental space to every session.',
  'Helping you figure out who you actually are',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=meera&backgroundColor=ffd5dc',
  ARRAY['MA Counselling Psychology (Hyderabad University)', 'Certified in Existential Therapy', 'Positive Psychology Practitioner'],
  5,
  'verified',
  NOW() - INTERVAL '2 months',
  ARRAY['identity', 'career', 'life_transitions', 'social_isolation', 'self_esteem', 'young_adults', 'self_efficacy', 'relationships'],
  ARRAY['Existential Therapy', 'ACT', 'Person-Centred', 'Positive Psychology', 'Narrative Therapy'],
  ARRAY['en', 'hi', 'te'],
  ARRAY['video', 'audio'],
  75000,          -- ₹750
  50000,          -- ₹500 intro session
  '{
    "tue": ["11:00","12:00","13:00","17:00","18:00","19:00"],
    "wed": ["11:00","12:00","17:00","18:00","19:00"],
    "thu": ["11:00","12:00","13:00","17:00","18:00"],
    "fri": ["11:00","12:00","17:00","18:00","19:00"],
    "sat": ["11:00","12:00","13:00","14:00","15:00"],
    "sun": ["11:00","12:00","13:00"]
  }'::jsonb,
  50,
  30,
  0.12,
  4.83,
  52,
  98,
  TRUE,
  TRUE
)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY: Run this SELECT after the insert to confirm all 5 are in
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT id, full_name, specialities, session_fee_inr, average_rating
-- FROM therapists
-- ORDER BY session_fee_inr ASC;
