import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    const supabase = await db();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile, checkins, moods, bookings] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('checkins').select('*').eq('user_id', user.id),
        supabase.from('mood_entries').select('*').eq('user_id', user.id),
        supabase.from('bookings').select('*').eq('user_id', user.id),
    ]);

    const exportData = {
        exported_at: new Date().toISOString(),
        profile: profile.data,
        checkins: checkins.data ?? [],
        mood_entries: moods.data ?? [],
        bookings: bookings.data ?? [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="mindbridge-my-data.json"',
        },
    });
}