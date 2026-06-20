import { createClient } from './client';
import type {
  DbUser,
  DbTherapist,
  DbCheckIn,
  DbCheckInMessage,
  DbMoodEntry,
  DbBooking,
  CheckInTier,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createClient();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<DbUser | null> {
  const { data } = await db().from('users').select('*').eq('id', userId).single();
  return data as DbUser | null;
}

export async function updateUser(
  userId: string,
  updates: {
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    primary_concerns?: string[];
    consent_given_at?: string;
    onboarding_complete?: boolean;
  }
): Promise<DbUser | null> {
  const { data } = await db()
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return data as DbUser | null;
}

export async function completeOnboarding(
  userId: string,
  displayName: string,
  primaryConcerns: string[]
): Promise<DbUser | null> {
  const { data } = await db()
    .from('users')
    .update({
      display_name: displayName,
      primary_concerns: primaryConcerns,
      onboarding_complete: true,
      consent_given_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  return data as DbUser | null;
}

// ─── Therapists ───────────────────────────────────────────────────────────────

export async function getTherapists(options?: {
  specialities?: string[];
  languages?: string[];
  limit?: number;
}): Promise<DbTherapist[]> {
  let query = db()
    .from('therapists')
    .select('*')
    .eq('verification_status', 'verified');

  if (options?.specialities?.length) {
    query = query.overlaps('specialities', options.specialities);
  }
  if (options?.languages?.length) {
    query = query.overlaps('languages', options.languages);
  }

  query = query
    .order('session_fee_inr', { ascending: true })
    .limit(options?.limit ?? 50);

  const { data } = await query;
  return (data as DbTherapist[]) ?? [];
}

export async function getTherapistById(id: string): Promise<DbTherapist | null> {
  const { data } = await db().from('therapists').select('*').eq('id', id).single();
  return data as DbTherapist | null;
}

export async function matchTherapistsForCheckIn(
  recTags: string[],
  _tier: CheckInTier,
  limit = 3
): Promise<DbTherapist[]> {
  const { data } = await db()
    .from('therapists')
    .select('*')
    .eq('verification_status', 'verified')
    .overlaps('specialities', recTags)
    .order('session_fee_inr', { ascending: true })
    .limit(limit);

  if (!data || data.length === 0) {
    const { data: fallback } = await db()
      .from('therapists')
      .select('*')
      .eq('verification_status', 'verified')
      .limit(limit);
    return (fallback as DbTherapist[]) ?? [];
  }
  return data as DbTherapist[];
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export async function getCheckIn(checkinId: string): Promise<DbCheckIn | null> {
  const { data } = await db().from('checkins').select('*').eq('id', checkinId).single();
  return data as DbCheckIn | null;
}

export async function getLatestCheckIn(userId: string): Promise<DbCheckIn | null> {
  const { data } = await db()
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data as DbCheckIn | null;
}

export async function getUserCheckIns(userId: string, limit = 10): Promise<DbCheckIn[]> {
  const { data } = await db()
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as DbCheckIn[]) ?? [];
}

export async function getCheckInMessages(checkinId: string): Promise<DbCheckInMessage[]> {
  const { data } = await db()
    .from('checkin_messages')
    .select('*')
    .eq('checkin_id', checkinId)
    .order('sequence_number', { ascending: true });
  return (data as DbCheckInMessage[]) ?? [];
}

// ─── Mood entries ─────────────────────────────────────────────────────────────

export async function logMoodEntry(entry: {
  user_id: string;
  mood_score: number;
  mood_label: string;
  tags?: string[];
  activities?: string[];
  note?: string | null;
  date_local: string;
}): Promise<DbMoodEntry | null> {
  const { data } = await db()
    .from('mood_entries')
    .insert(entry)
    .select()
    .single();
  return data as DbMoodEntry | null;
}

export async function getMoodEntries(userId: string, days = 30): Promise<DbMoodEntry[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await db()
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date_local', since.toISOString().split('T')[0])
    .order('date_local', { ascending: false });
  return (data as DbMoodEntry[]) ?? [];
}

export async function getTodayMoodEntry(userId: string): Promise<DbMoodEntry | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await db()
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date_local', today)
    .single();
  return data as DbMoodEntry | null;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getUserBookings(userId: string): Promise<DbBooking[]> {
  const { data } = await db()
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_start', { ascending: false });
  return (data as DbBooking[]) ?? [];
}

export async function getUpcomingBooking(userId: string): Promise<DbBooking | null> {
  const { data } = await db()
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(1)
    .single();
  return data as DbBooking | null;
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<DbBooking | null> {
  const { data } = await db()
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'user',
      cancellation_reason: reason ?? null,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('user_id', userId)
    .select()
    .single();
  return data as DbBooking | null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardData(userId: string) {
  const [latestCheckIn, upcomingBooking, moodEntries, todayMood] =
    await Promise.all([
      getLatestCheckIn(userId),
      getUpcomingBooking(userId),
      getMoodEntries(userId, 7),
      getTodayMoodEntry(userId),
    ]);

  return { latestCheckIn, upcomingBooking, moodEntries, todayMood };
}