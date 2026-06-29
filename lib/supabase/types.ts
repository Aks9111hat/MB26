export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums matching your actual DB
export type CheckInTier = 'thriving' | 'managing' | 'struggling';
export type UserTier = 'free' | 'plus' | 'corporate';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'modified_pending_user';
export type SessionModeType = 'video' | 'audio' | 'in_person' | 'chat';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type SafetyFlagType = 'self_harm' | 'suicidal_ideation' | 'harm_to_others';
export type StressorType = 'work' | 'relationship' | 'financial' | 'health' | 'identity' | 'unclear';
export type CopingStyleType = 'active' | 'avoidance' | 'social' | 'none';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          tier: UserTier;
          primary_concerns: string[] | null;
          consent_given_at: string | null;
          onboarding_complete: boolean;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: UserTier;
          primary_concerns?: string[] | null;
          consent_given_at?: string | null;
          onboarding_complete?: boolean;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: UserTier;
          primary_concerns?: string[] | null;
          consent_given_at?: string | null;
          onboarding_complete?: boolean;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      therapists: {
        Row: {
          id: string;
          full_name: string;
          display_name: string | null;
          email: string | null;
          password_hash: string | null;
          must_change_password: boolean;
          last_login_at: string | null;
          is_active: boolean;
          bio: string | null;
          profile_photo_url: string | null;
          tagline: string | null;
          license_number: string | null;
          license_body: string | null;
          qualification: string[];
          years_experience: number | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          specialities: string[];
          therapeutic_approaches: string[];
          languages: string[];
          session_modes: string[];
          session_fee_inr: number;
          intro_session_fee_inr: number | null;
          availability_slots: Json;
          booking_buffer_mins: number;
          advance_booking_days: number;
          session_duration_mins: number;
          is_taking_new_clients: boolean;
        };
        Insert: {
          id?: string;
          full_name: string;
          display_name?: string | null;
          bio?: string | null;
          profile_photo_url?: string | null;
          tagline?: string | null;
          license_number?: string | null;
          license_body?: string | null;
          qualification?: string[];
          years_experience?: number | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          specialities?: string[];
          therapeutic_approaches?: string[];
          languages?: string[];
          session_modes?: string[];
          session_fee_inr: number;
          intro_session_fee_inr?: number | null;
          availability_slots?: Json;
          booking_buffer_mins?: number;
          advance_booking_days?: number;
          session_duration_mins?: number;
          email?: string | null;
          password_hash?: string | null;
          must_change_password?: boolean;
          last_login_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          is_taking_new_clients?: boolean;
        };
        Update: {
          full_name?: string;
          display_name?: string | null;
          bio?: string | null;
          profile_photo_url?: string | null;
          tagline?: string | null;
          license_number?: string | null;
          license_body?: string | null;
          qualification?: string[];
          years_experience?: number | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          specialities?: string[];
          therapeutic_approaches?: string[];
          languages?: string[];
          session_modes?: string[];
          session_fee_inr?: number;
          intro_session_fee_inr?: number | null;
          availability_slots?: Json;
          booking_buffer_mins?: number;
          advance_booking_days?: number;
          session_duration_mins?: number;
          email?: string | null;
          password_hash?: string | null;
          must_change_password?: boolean;
          last_login_at?: string | null;
          is_active?: boolean;
          updated_at?: string;
          is_taking_new_clients?: boolean;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          tier: CheckInTier | null;
          total_score: number | null;
          score_energy: number | null;
          score_sleep: number | null;
          score_stress: number | null;
          score_social: number | null;
          score_wins: number | null;
          score_worry: number | null;
          score_coping: number | null;
          score_intention: number | null;
          primary_stressor: StressorType | null;
          coping_style: CopingStyleType | null;
          social_isolation: boolean;
          self_efficacy_low: boolean;
          safety_flag: boolean;
          safety_type: SafetyFlagType | null;
          safety_acknowledged: boolean;
          safety_acknowledged_at: string | null;
          safety_acknowledged_by: string | null;
          rec_tags: string[];
          snapshot_text: string | null;
          user_intention: string | null;
          assessment_metadata: Json;
          is_complete: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          tier?: CheckInTier | null;
          total_score?: number | null;
          score_energy?: number | null;
          score_sleep?: number | null;
          score_stress?: number | null;
          score_social?: number | null;
          score_wins?: number | null;
          score_worry?: number | null;
          score_coping?: number | null;
          score_intention?: number | null;
          primary_stressor?: StressorType | null;
          coping_style?: CopingStyleType | null;
          social_isolation?: boolean;
          self_efficacy_low?: boolean;
          safety_flag?: boolean;
          safety_type?: SafetyFlagType | null;
          safety_acknowledged?: boolean;
          safety_acknowledged_at?: string | null;
          safety_acknowledged_by?: string | null;
          rec_tags?: string[];
          snapshot_text?: string | null;
          user_intention?: string | null;
          assessment_metadata?: Json;
          is_complete?: boolean;
          created_at?: string;
        };
        Update: {
          completed_at?: string | null;
          duration_seconds?: number | null;
          tier?: CheckInTier | null;
          total_score?: number | null;
          score_energy?: number | null;
          score_sleep?: number | null;
          score_stress?: number | null;
          score_social?: number | null;
          score_wins?: number | null;
          score_worry?: number | null;
          score_coping?: number | null;
          score_intention?: number | null;
          primary_stressor?: StressorType | null;
          coping_style?: CopingStyleType | null;
          social_isolation?: boolean;
          self_efficacy_low?: boolean;
          safety_flag?: boolean;
          safety_type?: SafetyFlagType | null;
          safety_acknowledged?: boolean;
          safety_acknowledged_at?: string | null;
          safety_acknowledged_by?: string | null;
          rec_tags?: string[];
          snapshot_text?: string | null;
          user_intention?: string | null;
          assessment_metadata?: Json;
          is_complete?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "checkins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      checkin_messages: {
        Row: {
          id: string;
          checkin_id: string;
          user_id: string;
          role: string;
          sequence_number: number;
          content: string;
          contains_safety_signal: boolean;
          safety_signal_type: SafetyFlagType | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          checkin_id: string;
          user_id: string;
          role: string;
          sequence_number: number;
          content: string;
          contains_safety_signal?: boolean;
          safety_signal_type?: SafetyFlagType | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          contains_safety_signal?: boolean;
          safety_signal_type?: SafetyFlagType | null;
        };
        Relationships: [
          {
            foreignKeyName: "checkin_messages_checkin_id_fkey";
            columns: ["checkin_id"];
            isOneToOne: false;
            referencedRelation: "checkins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkin_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          checkin_id: string | null;
          mood_score: number;
          mood_label: string;
          tags: string[];
          activities: string[];
          note: string | null;
          sleep_hours: number | null;
          logged_at: string;
          date_local: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_id?: string | null;
          mood_score: number;
          mood_label: string;
          tags?: string[];
          activities?: string[];
          note?: string | null;
          sleep_hours?: number | null;
          logged_at?: string;
          date_local: string;
          created_at?: string;
        };
        Update: {
          mood_score?: number;
          mood_label?: string;
          tags?: string[];
          activities?: string[];
          note?: string | null;
          sleep_hours?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mood_entries_checkin_id_fkey";
            columns: ["checkin_id"];
            isOneToOne: false;
            referencedRelation: "checkins";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          therapist_id: string;
          checkin_id: string | null;
          scheduled_start: string;
          scheduled_end: string;
          session_mode: SessionModeType;
          timezone_user: string;
          meeting_url: string | null;
          meeting_id: string | null;
          status: BookingStatus;
          cancelled_by: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          notes_for_therapist: string | null;
          user_rating: number | null;
          user_review_text: string | null;
          reviewed_at: string | null;
          session_fee_inr: number;
          platform_commission_inr: number | null;
          therapist_payout_inr: number | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_status: string;
          created_at: string;
          updated_at: string;
          proposed_start: string | null;
          proposed_end: string | null;
          proposed_by: string | null;
          modification_note: string | null;
          therapist_responded_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          therapist_id: string;
          checkin_id?: string | null;
          scheduled_start: string;
          scheduled_end: string;
          session_mode: SessionModeType;
          timezone_user: string;
          meeting_url?: string | null;
          meeting_id?: string | null;
          status?: BookingStatus;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          notes_for_therapist?: string | null;
          user_rating?: number | null;
          user_review_text?: string | null;
          reviewed_at?: string | null;
          session_fee_inr: number;
          platform_commission_inr?: number | null;
          therapist_payout_inr?: number | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
          proposed_start?: string | null;
          proposed_end?: string | null;
          proposed_by?: string | null;
          modification_note?: string | null;
          therapist_responded_at?: string | null;
        };
        Update: {
          scheduled_start?: string;
          scheduled_end?: string;
          session_mode?: SessionModeType;
          timezone_user?: string;
          meeting_url?: string | null;
          meeting_id?: string | null;
          status?: BookingStatus;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          notes_for_therapist?: string | null;
          user_rating?: number | null;
          user_review_text?: string | null;
          reviewed_at?: string | null;
          platform_commission_inr?: number | null;
          therapist_payout_inr?: number | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_status?: string;
          updated_at?: string;
          proposed_start?: string | null;
          proposed_end?: string | null;
          proposed_by?: string | null;
          modification_note?: string | null;
          therapist_responded_at?: string | null;
        };
        Relationships: [           // ← replace Relationships: [] with this
          {
            foreignKeyName: "bookings_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_checkin_id_fkey";
            columns: ["checkin_id"];
            isOneToOne: false;
            referencedRelation: "checkins";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      checkin_tier: CheckInTier;
      user_tier: UserTier;
      booking_status: BookingStatus;
      session_mode_type: SessionModeType;
      verification_status: VerificationStatus;
      safety_flag_type: SafetyFlagType;
      stressor_type: StressorType;
      coping_style_type: CopingStyleType;
    };
    CompositeTypes: { [_ in never]: never }; 
  };
}

// Convenience row types
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbTherapist = Database['public']['Tables']['therapists']['Row'];
export type DbCheckIn = Database['public']['Tables']['checkins']['Row'];
export type DbCheckInMessage = Database['public']['Tables']['checkin_messages']['Row'];
export type DbMoodEntry = Database['public']['Tables']['mood_entries']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];