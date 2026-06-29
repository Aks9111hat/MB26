import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function POST(req: NextRequest) {
    const supabase = await db();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, accept } = await req.json();

    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking_id)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (accept) {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                scheduled_start: booking.proposed_start,
                scheduled_end: booking.proposed_end,
                proposed_start: null,
                proposed_end: null,
                proposed_by: null,
            })
            .eq('id', booking_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, status: 'confirmed' });
    } else {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancelled_by: 'user',
                cancellation_reason: 'Declined proposed new time',
                cancelled_at: new Date().toISOString(),
            })
            .eq('id', booking_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, status: 'cancelled' });
    }
}