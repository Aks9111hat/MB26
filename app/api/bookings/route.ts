import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendBookingNotificationToTherapist } from '@/lib/email/resend';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { therapist_id, date, time, session_mode, notes_for_therapist } = body;

        if (!therapist_id || !date || !time || !session_mode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch therapist to get session duration and fee
        const { data: therapist, error: tError } = await supabase
            .from('therapists')
            .select('session_fee_inr, session_duration_mins, full_name')
            .eq('id', therapist_id)
            .single();

        if (tError || !therapist) {
            return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
        }

        // Build scheduled_start and scheduled_end
        const scheduledStart = new Date(`${date}T${time}:00+05:30`).toISOString();
        const scheduledEnd = new Date(
            new Date(scheduledStart).getTime() +
            therapist.session_duration_mins * 60 * 1000
        ).toISOString();

        // Check for double booking
        const { data: conflict } = await supabase
            .from('bookings')
            .select('id')
            .eq('therapist_id', therapist_id)
            .eq('scheduled_start', scheduledStart)
            .not('status', 'in', '("cancelled","no_show")')
            .single();

        if (conflict) {
            return NextResponse.json(
                { error: 'This slot is no longer available. Please choose another time.' },
                { status: 409 }
            );
        }

        // Create booking
        const { data: booking, error: bError } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                therapist_id,
                scheduled_start: scheduledStart,
                scheduled_end: scheduledEnd,
                session_mode,
                timezone_user: 'Asia/Kolkata',
                status: 'pending',
                session_fee_inr: therapist.session_fee_inr,
                payment_status: 'pending',
                notes_for_therapist: notes_for_therapist ?? null,
            })
            .select('id, scheduled_start')
            .single();

        if (bError || !booking) {
            return NextResponse.json({ error: bError?.message ?? 'Failed to create booking' }, { status: 500 });
        }

        // Dev: log confirmation (replace with Resend later)
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 NEW BOOKING CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID : ${booking.id}
User       : ${user.email}
Therapist  : ${therapist.full_name}
Date/Time  : ${new Date(scheduledStart).toLocaleString('en-IN')}
Mode       : ${session_mode}
Fee        : ₹${Math.round(therapist.session_fee_inr / 100)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
        // Notify therapist by email
        const { data: therapistFull } = await supabase
            .from('therapists')
            .select('email, full_name')
            .eq('id', therapist_id)
            .single();

        if (therapistFull?.email) {
            await sendBookingNotificationToTherapist({
                to: therapistFull.email,
                therapistName: therapistFull.full_name,
                clientName: user.email ?? 'A client',
                date: new Date(scheduledStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
                time: new Date(scheduledStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                mode: session_mode,
            });
        }

        return NextResponse.json({
            booking_id: booking.id,
            scheduled_start: booking.scheduled_start,
        });
    } catch (err) {
        console.error('Bookings API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('scheduled_start', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ bookings: bookings ?? [] });
    } catch (err) {
        console.error('GET bookings error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}