// =============================================
// MindBridge — Core TypeScript Types
// Matches the PostgreSQL schema exactly
// =============================================

// --- Enums ---

export type UserRole = 'consumer' | 'therapist' | 'admin' | 'company_admin'
export type TierType = 'free' | 'plus' | 'corporate'
export type CheckInTier = 'thriving' | 'managing' | 'struggling'
export type SafetyFlagType = 'self_harm' | 'suicidal_ideation' | 'harm_to_others'
export type CopingStyle = 'active' | 'avoidance' | 'social' | 'none'
export type StressorType = 'work' | 'relationship' | 'financial' | 'health' | 'identity' | 'unclear'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type SessionMode = 'video' | 'audio' | 'in_person' | 'chat'
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded'
export type ResourceType = 'therapist' | 'app' | 'article' | 'community' | 'hotline' | 'exercise'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due'
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'
export type MoodLabel = 'very_low' | 'low' | 'neutral' | 'good' | 'great'

// --- Core Entities ---

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  date_of_birth: string | null
  preferred_language: string
  timezone: string
  tier: TierType
  company_id: string | null
  consent_given_at: string | null
  consent_version: string | null
  data_processing_consent: boolean
  marketing_consent: boolean
  is_minor: boolean
  safety_flagged: boolean
  safety_flagged_at: string | null
  is_active: boolean
  last_checkin_at: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Therapist {
  id: string
  user_id: string | null
  full_name: string
  display_name: string | null
  bio: string | null
  profile_photo_url: string | null
  video_intro_url: string | null
  license_number: string | null
  license_body: string | null
  qualification: string[]
  years_experience: number | null
  verification_status: VerificationStatus
  verified_at: string | null
  specialities: string[]
  therapeutic_approaches: string[]
  languages: string[]
  session_modes: SessionMode[]
  session_fee_inr: number // in paisa (₹800 = 80000)
  intro_session_fee_inr: number | null
  availability_slots: AvailabilitySlots
  booking_buffer_mins: number
  advance_booking_days: number
  commission_rate: number
  total_sessions: number
  average_rating: number | null
  review_count: number
  is_active: boolean
  is_taking_new_clients: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilitySlots {
  mon?: string[]
  tue?: string[]
  wed?: string[]
  thu?: string[]
  fri?: string[]
  sat?: string[]
  sun?: string[]
}

export interface DomainScores {
  energy: 0 | 1 | 2
  sleep: 0 | 1 | 2
  stress: 0 | 1 | 2
  social: 0 | 1 | 2
  wins: 0 | 1 | 2
  worry: 0 | 1 | 2
  coping: 0 | 1 | 2
  intention: 0 | 1 | 2
}

export interface CheckIn {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  tier: CheckInTier | null
  total_score: number | null
  // Domain scores
  score_energy: number | null
  score_sleep: number | null
  score_stress: number | null
  score_social: number | null
  score_wins: number | null
  score_worry: number | null
  score_coping: number | null
  score_intention: number | null
  // Analysis
  primary_stressor: StressorType | null
  coping_style: CopingStyle | null
  social_isolation: boolean
  self_efficacy_low: boolean
  // Safety
  safety_flag: boolean
  safety_type: SafetyFlagType | null
  safety_acknowledged: boolean
  // Recommendations
  rec_tags: string[]
  // Output
  snapshot_text: string | null
  user_intention: string | null
  assessment_metadata: Record<string, unknown>
  is_complete: boolean
  created_at: string
}

export interface CheckInMessage {
  id: string
  checkin_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  sequence_number: number
  content: string // plain text in dev; encrypted bytea in production
  contains_safety_signal: boolean
  safety_signal_type: SafetyFlagType | null
  created_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  checkin_id: string | null
  mood_score: number // 1–10
  mood_label: MoodLabel
  tags: string[]
  activities: string[]
  sleep_hours: number | null
  logged_at: string
  date_local: string // YYYY-MM-DD
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  therapist_id: string
  checkin_id: string | null
  scheduled_start: string
  scheduled_end: string
  session_mode: SessionMode
  timezone_user: string
  meeting_url: string | null
  status: BookingStatus
  cancelled_by: 'user' | 'therapist' | 'admin' | 'system' | null
  cancellation_reason: string | null
  cancelled_at: string | null
  completed_at: string | null
  user_rating: number | null
  user_review_text: string | null
  reviewed_at: string | null
  session_fee_inr: number
  platform_commission_inr: number | null
  therapist_payout_inr: number | null
  created_at: string
  updated_at: string
  // Joined fields
  therapist?: Therapist
  user?: User
}

export interface Resource {
  id: string
  title: string
  description: string
  resource_type: ResourceType
  url: string | null
  image_url: string | null
  tags: string[]
  tiers: TierType[]
  is_india_specific: boolean
  language: string
  is_free: boolean
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  domain: string | null
  billing_email: string
  gstin: string | null
  employee_limit: number
  employees_active: number
  is_active: boolean
  onboarded_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string | null
  company_id: string | null
  plan: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_end: string | null
  cancelled_at: string | null
  cancel_at_period_end: boolean
  price_paisa: number
  currency: string
  created_at: string
  updated_at: string
}

// --- AI / Check-in Types ---

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AssessmentOutput {
  session_id: string
  timestamp: string
  tier: CheckInTier
  total_score: number
  domain_scores: DomainScores
  primary_stressor: StressorType
  coping_style: CopingStyle
  social_isolation: boolean
  self_efficacy_low: boolean
  safety_flag: boolean
  safety_type: SafetyFlagType | null
  rec_tags: string[]
  snapshot_text: string
  user_intention: string
}

// --- UI / App Types ---

export interface TherapistFilter {
  specialities: string[]
  priceRange: [number, number]
  languages: string[]
  sessionModes: SessionMode[]
  searchQuery: string
}

export interface DashboardData {
  latestCheckIn: CheckIn | null
  upcomingBooking: (Booking & { therapist: Therapist }) | null
  moodEntries: MoodEntry[]
  todayMood: MoodEntry | null
  streakDays: number
}

export interface BookingSlot {
  date: string // YYYY-MM-DD
  time: string // HH:MM
  available: boolean
}

// --- API Response Types ---

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// --- Form Types ---

export interface SignUpFormData {
  email: string
  password: string
  full_name: string
  consent: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface OnboardingFormData {
  display_name: string
  primary_concerns: string[]
  is_adult: boolean
}

export interface MoodLogFormData {
  mood_score: number
  tags: string[]
  note?: string
}

export interface BookingFormData {
  date: string
  time: string
  session_mode: SessionMode
  notes?: string
}

export interface AssessmentOutput {
  is_complete: boolean;
  tier: 'thriving' | 'managing' | 'struggling';
  total_score: number;
  sleep_score: number;
  energy_score: number;
  stress_score: number;
  social_score: number;
  wins_score: number;
  worry_score: number;
  coping_score: number;
  intention_score: number;
  rec_tags: string[];
  safety_flag: boolean;
  snapshot_text: string;
  user_intention: string;
}