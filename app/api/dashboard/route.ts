import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const [checkinRes, bookingRes, moodRes, todayMoodRes, profileRes] =
            await Promise.all([
                supabase
                    .from('checkins')
                    .select('id, tier, snapshot_text, created_at, total_score, rec_tags')
                    .eq('user_id', user.id)
                    .eq('is_complete', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single(),

                supabase
                    .from('bookings')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('status', ['pending', 'confirmed'])
                    .gte('scheduled_start', new Date().toISOString())
                    .order('scheduled_start', { ascending: true })
                    .limit(1)
                    .single(),

                supabase
                    .from('mood_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('date_local', sevenDaysAgoStr)
                    .order('date_local', { ascending: true }),

                supabase
                    .from('mood_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('date_local', today)
                    .single(),

                supabase
                    .from('users')
                    .select('display_name, full_name, tier')
                    .eq('id', user.id)
                    .single(),
            ]);

        return NextResponse.json({
            latestCheckin: checkinRes.data ?? null,
            upcomingBooking: bookingRes.data ?? null,
            moodLast7Days: moodRes.data ?? [],
            todayMood: todayMoodRes.data ?? null,
            profile: profileRes.data ?? null,
        });
    } catch (err) {
        console.error('Dashboard API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}