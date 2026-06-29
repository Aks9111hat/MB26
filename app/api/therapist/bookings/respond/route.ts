import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

import { getTherapistSession } from '@/lib/therapist-auth/session';
import { sendBookingStatusToClient } from '@/lib/email/resend';

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function db(): Promise<any> {
//     return createClient();
// }

export async function POST(req: NextRequest) {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // const supabase = await db();
    const supabase = createAdminClient(); // bypasses RLS — required since therapist has no Supabase Auth session
    
    const body = await req.json();
    const { booking_id, action, proposed_start, proposed_end, note } = body;
    // action: 'accept' | 'reject' | 'propose_new_time'

    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*, therapist:therapists(full_name)')
        .eq('id', booking_id)
        .eq('therapist_id', session.therapistId)
        .single();

    if (fetchError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { data: client } = await supabase
        .from('users')
        .select('email, full_name, display_name')
        .eq('id', booking.user_id)
        .single();

    const clientName = client?.display_name ?? client?.full_name ?? 'there';
    const therapistName = booking.therapist?.full_name ?? 'Your therapist';

    if (action === 'accept') {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                therapist_responded_at: new Date().toISOString(),
            })
            .eq('id', booking_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (client?.email) {
            const start = new Date(booking.scheduled_start);
            await sendBookingStatusToClient({
                to: client.email,
                clientName,
                therapistName,
                status: 'confirmed',
                date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
                time: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            });
        }

        return NextResponse.json({ ok: true, status: 'confirmed' });
    }

    if (action === 'reject') {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancelled_by: 'therapist',
                cancellation_reason: note ?? 'Therapist unable to take this slot',
                cancelled_at: new Date().toISOString(),
                therapist_responded_at: new Date().toISOString(),
            })
            .eq('id', booking_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (client?.email) {
            const start = new Date(booking.scheduled_start);
            await sendBookingStatusToClient({
                to: client.email,
                clientName,
                therapistName,
                status: 'cancelled',
                date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
                time: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            });
        }

        return NextResponse.json({ ok: true, status: 'cancelled' });
    }

    if (action === 'propose_new_time') {
        if (!proposed_start || !proposed_end) {
            return NextResponse.json({ error: 'proposed_start and proposed_end required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'modified_pending_user',
                proposed_start,
                proposed_end,
                proposed_by: 'therapist',
                modification_note: note ?? null,
                therapist_responded_at: new Date().toISOString(),
            })
            .eq('id', booking_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (client?.email) {
            const start = new Date(proposed_start);
            await sendBookingStatusToClient({
                to: client.email,
                clientName,
                therapistName,
                status: 'modified_pending_user',
                date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
                time: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            });
        }

        return NextResponse.json({ ok: true, status: 'modified_pending_user' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}