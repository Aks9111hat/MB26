// =============================================================================
// MindBridge — Supabase Query Helpers
// Typed wrappers around common database operations
// =============================================================================

import { createClient } from './client'
import type {
  DbUser, DbTherapist, DbCheckIn, DbMoodEntry, DbBooking,
  InsertCheckIn, InsertCheckInMessage, InsertMoodEntry, InsertBooking,
  LatestCheckIn, MoodTrend7d, MoodLabelType
} from './types'

// ---- Users ----------------------------------------------------------------

export async function getUserById(userId: string): Promise<DbUser | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return data as DbUser | null
}

export async function updateUser(
  userId: string,
  updates: Partial<DbUser>
): Promise<DbUser | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .update(updates as never)
    .eq('id', userId)
    .select()
    .single()
  return data as DbUser | null
}

export async function completeOnboarding(
  userId: string,
  displayName: string,
  primaryConcerns: string[]
): Promise<DbUser | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .update({
      display_name: displayName,
      primary_concerns: primaryConcerns,
      onboarding_complete: true,
      consent_given_at: new Date().toISOString(),
      data_processing_consent: true,
    } as never)
    .eq('id', userId)
    .select()
    .single()
  return data as DbUser | null
}

// ---- Therapists -----------------------------------------------------------

export async function getTherapists(options?: {
  specialities?: string[]
  languages?: string[]
  maxFeeRupees?: number
  limit?: number
}): Promise<DbTherapist[]> {
  const supabase = createClient()

  let query = supabase
    .from('therapists')
    .select('*')
    .eq('is_active', true)
    .eq('verification_status', 'verified')
    .eq('is_taking_new_clients', true)

  if (options?.maxFeeRupees) {
    query = query.lte('session_fee_inr', options.maxFeeRupees * 100)
  }
  if (options?.specialities?.length) {
    query = query.overlaps('specialities', options.specialities)
  }
  if (options?.languages?.length) {
    query = query.overlaps('languages', options.languages)
  }

  query = query
    .order('average_rating', { ascending: false, nullsFirst: false })
    .limit(options?.limit ?? 50)

  const { data } = await query
  return (data as DbTherapist[]) ?? []
}

export async function getTherapistById(id: string): Promise<DbTherapist | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('therapists')
    .select('*')
    .eq('id', id)
    .single()
  return data as DbTherapist | null
}

export async function matchTherapistsForCheckIn(
  recTags: string[],
  limit = 3
): Promise<DbTherapist[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('therapists')
    .select('*')
    .eq('is_active', true)
    .eq('verification_status', 'verified')
    .eq('is_taking_new_clients', true)
    .overlaps('specialities', recTags)
    .order('average_rating', { ascending: false, nullsFirst: false })
    .limit(limit)
  return (data as DbTherapist[]) ?? []
}

// ---- Check-ins ------------------------------------------------------------

export async function createCheckIn(userId: string): Promise<DbCheckIn | null> {
  const supabase = createClient()
  const insert: InsertCheckIn = {
    user_id: userId,
    started_at: new Date().toISOString(),
    is_complete: false,
    safety_flag: false,
    rec_tags: [],
    social_isolation: false,
    self_efficacy_low: false,
    safety_acknowledged: false,
  }
  const { data } = await supabase
    .from('checkins')
    .insert(insert as never)
    .select()
    .single()
  return data as DbCheckIn | null
}

export async function updateCheckIn(
  checkinId: string,
  updates: Partial<DbCheckIn>
): Promise<DbCheckIn | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('checkins')
    .update(updates as never)
    .eq('id', checkinId)
    .select()
    .single()
  return data as DbCheckIn | null
}

export async function getCheckIn(checkinId: string): Promise<DbCheckIn | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('id', checkinId)
    .single()
  return data as DbCheckIn | null
}

export async function getLatestCheckIn(userId: string): Promise<LatestCheckIn | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('latest_checkins')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as LatestCheckIn | null
}

export async function getUserCheckIns(userId: string, limit = 10): Promise<DbCheckIn[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as DbCheckIn[]) ?? []
}

// ---- Check-in Messages ----------------------------------------------------

export async function saveCheckInMessage(
  checkinId: string,
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  sequenceNumber: number,
  containsSafetySignal = false
): Promise<void> {
  const supabase = createClient()
  const insert: InsertCheckInMessage = {
    checkin_id: checkinId,
    user_id: userId,
    role,
    sequence_number: sequenceNumber,
    content,
    contains_safety_signal: containsSafetySignal,
  }
  await supabase.from('checkin_messages').insert(insert as never)
}

export async function getCheckInMessages(checkinId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('checkin_messages')
    .select('*')
    .eq('checkin_id', checkinId)
    .order('sequence_number', { ascending: true })
  return data ?? []
}

// ---- Mood Entries ---------------------------------------------------------

export async function logMoodEntry(
  userId: string,
  moodScore: number,
  tags: string[] = [],
  note?: string,
  checkinId?: string
): Promise<DbMoodEntry | null> {
  const supabase = createClient()

  const label: MoodLabelType = moodScore <= 2 ? 'very_low'
    : moodScore <= 4 ? 'low'
    : moodScore <= 6 ? 'neutral'
    : moodScore <= 8 ? 'good'
    : 'great'

  const today = new Date().toISOString().split('T')[0]

  const insert: InsertMoodEntry = {
    user_id: userId,
    checkin_id: checkinId ?? null,
    mood_score: moodScore,
    mood_label: label,
    tags,
    note: note ?? null,
    date_local: today,
  }

  const { data } = await supabase
    .from('mood_entries')
    .upsert(insert as never, { onConflict: 'user_id,date_local' })
    .select()
    .single()

  return data as DbMoodEntry | null
}

export async function getMoodEntries(userId: string, days = 30): Promise<DbMoodEntry[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date_local', since.toISOString().split('T')[0])
    .order('date_local', { ascending: false })
  return (data as DbMoodEntry[]) ?? []
}

export async function getTodayMoodEntry(userId: string): Promise<DbMoodEntry | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date_local', today)
    .single()
  return data as DbMoodEntry | null
}

export async function getMoodTrend(userId: string): Promise<MoodTrend7d | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('mood_trend_7d')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as MoodTrend7d | null
}

// ---- Bookings -------------------------------------------------------------

export async function createBooking(booking: InsertBooking): Promise<DbBooking | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookings')
    .insert(booking as never)
    .select()
    .single()
  return data as DbBooking | null
}

export async function getUserBookings(
  userId: string,
  status?: string
): Promise<(DbBooking & { therapist: DbTherapist })[]> {
  const supabase = createClient()
  let query = supabase
    .from('bookings')
    .select('*, therapist:therapists(*)')
    .eq('user_id', userId)
    .order('scheduled_start', { ascending: true })

  if (status) {
    query = query.eq('status', status as never)
  }

  const { data } = await query
  return (data as (DbBooking & { therapist: DbTherapist })[]) ?? []
}

export async function getUpcomingBooking(
  userId: string
): Promise<(DbBooking & { therapist: DbTherapist }) | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookings')
    .select('*, therapist:therapists(*)')
    .eq('user_id', userId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(1)
    .single()
  return data as (DbBooking & { therapist: DbTherapist }) | null
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<DbBooking | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'user',
      cancellation_reason: reason ?? null,
      cancelled_at: new Date().toISOString(),
    } as never)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .select()
    .single()
  return data as DbBooking | null
}
