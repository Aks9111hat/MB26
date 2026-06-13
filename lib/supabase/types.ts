// =============================================================================
// MindBridge — Supabase Database Types
// Auto-generated style — mirrors 001_initial_schema.sql exactly
//
// Usage:
//   import { Database } from '@/lib/supabase/types'
//   const supabase = createClient<Database>()
//
// When you have a live Supabase project, replace this with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// --- Enum types (match PostgreSQL enums) ---

export type UserTier          = 'free' | 'plus' | 'corporate'
export type CheckinTierEnum   = 'thriving' | 'managing' | 'struggling'
export type SafetyFlagType    = 'self_harm' | 'suicidal_ideation' | 'harm_to_others'
export type CopingStyleType   = 'active' | 'avoidance' | 'social' | 'none'
export type StressorType      = 'work' | 'relationship' | 'financial' | 'health' | 'identity' | 'unclear'
export type BookingStatus     = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type SessionModeType   = 'video' | 'audio' | 'in_person' | 'chat'
export type VerificationStatus= 'pending' | 'verified' | 'rejected' | 'suspended'
export type MoodLabelType     = 'very_low' | 'low' | 'neutral' | 'good' | 'great'
export type MessageRole       = 'user' | 'assistant' | 'system'
export type PaymentStatusType = 'pending' | 'captured' | 'failed' | 'refunded'

// --- Availability slots JSONB shape ---
export interface AvailabilitySlots {
  mon?: string[]
  tue?: string[]
  wed?: string[]
  thu?: string[]
  fri?: string[]
  sat?: string[]
  sun?: string[]
}

// =============================================================================
// DATABASE INTERFACE
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // ------------------------------------------------------------------
      users: {
        Row: {
          id:                     string
          email:                  string
          full_name:              string | null
          display_name:           string | null
          avatar_url:             string | null
          preferred_language:     string
          timezone:               string
          tier:                   UserTier
          consent_given_at:       string | null
          consent_version:        string | null
          data_processing_consent: boolean
          marketing_consent:      boolean
          onboarding_complete:    boolean
          primary_concerns:       string[]
          is_active:              boolean
          last_checkin_at:        string | null
          razorpay_customer_id:   string | null
          safety_flagged:         boolean
          safety_flagged_at:      string | null
          created_at:             string
          updated_at:             string
          deleted_at:             string | null
        }
        Insert: {
          id:                     string          // required: = auth.users.id
          email:                  string
          full_name?:             string | null
          display_name?:          string | null
          avatar_url?:            string | null
          preferred_language?:    string
          timezone?:              string
          tier?:                  UserTier
          consent_given_at?:      string | null
          consent_version?:       string | null
          data_processing_consent?: boolean
          marketing_consent?:     boolean
          onboarding_complete?:   boolean
          primary_concerns?:      string[]
          is_active?:             boolean
          last_checkin_at?:       string | null
          razorpay_customer_id?:  string | null
          safety_flagged?:        boolean
          safety_flagged_at?:     string | null
          created_at?:            string
          updated_at?:            string
          deleted_at?:            string | null
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }

      // ------------------------------------------------------------------
      therapists: {
        Row: {
          id:                       string
          full_name:                string
          display_name:             string | null
          bio:                      string | null
          tagline:                  string | null
          profile_photo_url:        string | null
          license_number:           string | null
          license_body:             string | null
          qualification:            string[]
          years_experience:         number | null
          verification_status:      VerificationStatus
          verified_at:              string | null
          specialities:             string[]
          therapeutic_approaches:   string[]
          languages:                string[]
          session_modes:            string[]
          session_fee_inr:          number
          intro_session_fee_inr:    number | null
          availability_slots:       AvailabilitySlots
          session_duration_mins:    number
          booking_buffer_mins:      number
          advance_booking_days:     number
          commission_rate:          number
          razorpay_contact_id:      string | null
          razorpay_fund_account_id: string | null
          total_sessions:           number
          average_rating:           number | null
          review_count:             number
          is_active:                boolean
          is_taking_new_clients:    boolean
          created_at:               string
          updated_at:               string
        }
        Insert: {
          id?:                      string
          full_name:                string
          display_name?:            string | null
          bio?:                     string | null
          tagline?:                 string | null
          profile_photo_url?:       string | null
          license_number?:          string | null
          license_body?:            string | null
          qualification?:           string[]
          years_experience?:        number | null
          verification_status?:     VerificationStatus
          verified_at?:             string | null
          specialities?:            string[]
          therapeutic_approaches?:  string[]
          languages?:               string[]
          session_modes?:           string[]
          session_fee_inr:          number
          intro_session_fee_inr?:   number | null
          availability_slots?:      AvailabilitySlots
          session_duration_mins?:   number
          booking_buffer_mins?:     number
          advance_booking_days?:    number
          commission_rate?:         number
          total_sessions?:          number
          average_rating?:          number | null
          review_count?:            number
          is_active?:               boolean
          is_taking_new_clients?:   boolean
          created_at?:              string
          updated_at?:              string
        }
        Update: Partial<Database['public']['Tables']['therapists']['Insert']>
      }

      // ------------------------------------------------------------------
      checkins: {
        Row: {
          id:                   string
          user_id:              string
          started_at:           string
          completed_at:         string | null
          duration_seconds:     number | null
          tier:                 CheckinTierEnum | null
          total_score:          number | null
          score_energy:         number | null
          score_sleep:          number | null
          score_stress:         number | null
          score_social:         number | null
          score_wins:           number | null
          score_worry:          number | null
          score_coping:         number | null
          score_intention:      number | null
          primary_stressor:     StressorType | null
          coping_style:         CopingStyleType | null
          social_isolation:     boolean
          self_efficacy_low:    boolean
          safety_flag:          boolean
          safety_type:          SafetyFlagType | null
          safety_acknowledged:  boolean
          safety_acknowledged_at: string | null
          safety_acknowledged_by: string | null
          rec_tags:             string[]
          snapshot_text:        string | null
          user_intention:       string | null
          assessment_metadata:  Json
          is_complete:          boolean
          created_at:           string
        }
        Insert: {
          id?:                  string
          user_id:              string
          started_at?:          string
          completed_at?:        string | null
          duration_seconds?:    number | null
          tier?:                CheckinTierEnum | null
          total_score?:         number | null
          score_energy?:        number | null
          score_sleep?:         number | null
          score_stress?:        number | null
          score_social?:        number | null
          score_wins?:          number | null
          score_worry?:         number | null
          score_coping?:        number | null
          score_intention?:     number | null
          primary_stressor?:    StressorType | null
          coping_style?:        CopingStyleType | null
          social_isolation?:    boolean
          self_efficacy_low?:   boolean
          safety_flag?:         boolean
          safety_type?:         SafetyFlagType | null
          safety_acknowledged?: boolean
          rec_tags?:            string[]
          snapshot_text?:       string | null
          user_intention?:      string | null
          assessment_metadata?: Json
          is_complete?:         boolean
          created_at?:          string
        }
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>
      }

      // ------------------------------------------------------------------
      checkin_messages: {
        Row: {
          id:                     string
          checkin_id:             string
          user_id:                string
          role:                   MessageRole
          sequence_number:        number
          content:                string
          contains_safety_signal: boolean
          safety_signal_type:     SafetyFlagType | null
          created_at:             string
        }
        Insert: {
          id?:                    string
          checkin_id:             string
          user_id:                string
          role:                   MessageRole
          sequence_number:        number
          content:                string
          contains_safety_signal?: boolean
          safety_signal_type?:    SafetyFlagType | null
          created_at?:            string
        }
        Update: Partial<Database['public']['Tables']['checkin_messages']['Insert']>
      }

      // ------------------------------------------------------------------
      mood_entries: {
        Row: {
          id:           string
          user_id:      string
          checkin_id:   string | null
          mood_score:   number
          mood_label:   MoodLabelType
          tags:         string[]
          activities:   string[]
          note:         string | null
          sleep_hours:  number | null
          logged_at:    string
          date_local:   string
          created_at:   string
        }
        Insert: {
          id?:          string
          user_id:      string
          checkin_id?:  string | null
          mood_score:   number
          mood_label:   MoodLabelType
          tags?:        string[]
          activities?:  string[]
          note?:        string | null
          sleep_hours?: number | null
          logged_at?:   string
          date_local?:  string
          created_at?:  string
        }
        Update: Partial<Database['public']['Tables']['mood_entries']['Insert']>
      }

      // ------------------------------------------------------------------
      bookings: {
        Row: {
          id:                     string
          user_id:                string
          therapist_id:           string
          checkin_id:             string | null
          scheduled_start:        string
          scheduled_end:          string
          session_mode:           SessionModeType
          timezone_user:          string
          meeting_url:            string | null
          meeting_id:             string | null
          status:                 BookingStatus
          cancelled_by:           'user' | 'therapist' | 'admin' | 'system' | null
          cancellation_reason:    string | null
          cancelled_at:           string | null
          completed_at:           string | null
          notes_for_therapist:    string | null
          user_rating:            number | null
          user_review_text:       string | null
          reviewed_at:            string | null
          session_fee_inr:        number
          platform_commission_inr: number | null
          therapist_payout_inr:   number | null
          razorpay_order_id:      string | null
          razorpay_payment_id:    string | null
          payment_status:         PaymentStatusType
          created_at:             string
          updated_at:             string
        }
        Insert: {
          id?:                    string
          user_id:                string
          therapist_id:           string
          checkin_id?:            string | null
          scheduled_start:        string
          scheduled_end:          string
          session_mode?:          SessionModeType
          timezone_user?:         string
          meeting_url?:           string | null
          status?:                BookingStatus
          notes_for_therapist?:   string | null
          session_fee_inr:        number
          platform_commission_inr?: number | null
          therapist_payout_inr?:  number | null
          payment_status?:        PaymentStatusType
          created_at?:            string
          updated_at?:            string
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
    }

    // ------------------------------------------------------------------
    Views: {
      latest_checkins: {
        Row: {
          id:              string
          user_id:         string
          tier:            CheckinTierEnum | null
          total_score:     number | null
          rec_tags:        string[]
          safety_flag:     boolean
          snapshot_text:   string | null
          user_intention:  string | null
          primary_stressor: StressorType | null
          score_energy:    number | null
          score_sleep:     number | null
          score_stress:    number | null
          score_social:    number | null
          score_wins:      number | null
          score_worry:     number | null
          score_coping:    number | null
          score_intention: number | null
          created_at:      string
        }
      }
      therapist_directory: {
        Row: Database['public']['Tables']['therapists']['Row']
      }
      mood_trend_7d: {
        Row: {
          user_id:      string
          avg_score:    number
          min_score:    number
          max_score:    number
          entry_count:  number
          score_series: number[]
          date_series:  string[]
        }
      }
      unacked_safety_flags: {
        Row: {
          checkin_id: string
          user_id:    string
          safety_type: SafetyFlagType | null
          flagged_at:  string
          user_email:  string
          user_name:   string | null
        }
      }
    }

    Functions: Record<string, never>
    Enums: {
      user_tier:          UserTier
      checkin_tier:       CheckinTierEnum
      safety_flag_type:   SafetyFlagType
      coping_style_type:  CopingStyleType
      stressor_type:      StressorType
      booking_status:     BookingStatus
      session_mode_type:  SessionModeType
      verification_status: VerificationStatus
    }
  }
}


// =============================================================================
// CONVENIENCE TYPES (Row types aliased for easy import)
// =============================================================================

export type DbUser           = Database['public']['Tables']['users']['Row']
export type DbTherapist      = Database['public']['Tables']['therapists']['Row']
export type DbCheckIn        = Database['public']['Tables']['checkins']['Row']
export type DbCheckInMessage = Database['public']['Tables']['checkin_messages']['Row']
export type DbMoodEntry      = Database['public']['Tables']['mood_entries']['Row']
export type DbBooking        = Database['public']['Tables']['bookings']['Row']

// Insert types
export type InsertUser           = Database['public']['Tables']['users']['Insert']
export type InsertTherapist      = Database['public']['Tables']['therapists']['Insert']
export type InsertCheckIn        = Database['public']['Tables']['checkins']['Insert']
export type InsertCheckInMessage = Database['public']['Tables']['checkin_messages']['Insert']
export type InsertMoodEntry      = Database['public']['Tables']['mood_entries']['Insert']
export type InsertBooking        = Database['public']['Tables']['bookings']['Insert']

// View types
export type LatestCheckIn       = Database['public']['Views']['latest_checkins']['Row']
export type MoodTrend7d         = Database['public']['Views']['mood_trend_7d']['Row']
export type UnackedSafetyFlag   = Database['public']['Views']['unacked_safety_flags']['Row']
