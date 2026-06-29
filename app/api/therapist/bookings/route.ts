import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getTherapistSession } from '@/lib/therapist-auth/session';

export async function GET() {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient(); // bypasses RLS — required since therapist has no Supabase Auth session

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('therapist_id', session.therapistId)
        .order('scheduled_start', { ascending: true });

    if (error) {
        console.error('Therapist bookings fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = await Promise.all(
        (bookings ?? []).map(async (b: { user_id: string;[key: string]: unknown }) => {
            const { data: user } = await supabase
                .from('users')
                .select('display_name, full_name, email')
                .eq('id', b.user_id)
                .single();
            return { ...b, client: user };
        })
    );

    return NextResponse.json({ bookings: enriched });
}