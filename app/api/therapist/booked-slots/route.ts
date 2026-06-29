import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getTherapistSession } from '@/lib/therapist-auth/session';

export async function GET() {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('bookings')
        .select('scheduled_start')
        .eq('therapist_id', session.therapistId)
        .in('status', ['pending', 'confirmed', 'modified_pending_user'])
        .gte('scheduled_start', new Date().toISOString());

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookedSlots: (data ?? []).map((b: { scheduled_start: string }) => b.scheduled_start) });
}