import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getTherapistSession } from '@/lib/therapist-auth/session';

const DAY_ALIASES: Record<string, string> = {
    mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday',
    fri: 'friday', sat: 'saturday', sun: 'sunday',
    monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday',
    thursday: 'thursday', friday: 'friday', saturday: 'saturday', sunday: 'sunday',
};

export async function GET() {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('therapists')
        .select('availability_slots, is_taking_new_clients, session_duration_mins, booking_buffer_mins')
        .eq('id', session.therapistId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize legacy abbreviated keys to full day names before returning
    const raw = (data.availability_slots ?? {}) as Record<string, string[]>;
    const normalized: Record<string, string[]> = {};
    for (const [day, slots] of Object.entries(raw)) {
        const fullDay = DAY_ALIASES[day.toLowerCase()];
        if (!fullDay) continue; // skip unrecognized keys
        const merged = new Set([...(normalized[fullDay] ?? []), ...slots]);
        normalized[fullDay] = Array.from(merged).sort();
    }

    return NextResponse.json({ ...data, availability_slots: normalized });
}

export async function PUT(req: NextRequest) {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { availability_slots, is_taking_new_clients } = body;

    if (!availability_slots || typeof availability_slots !== 'object') {
        return NextResponse.json({ error: 'availability_slots required' }, { status: 400 });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    const normalized: Record<string, string[]> = {};

    for (const [day, slots] of Object.entries(availability_slots)) {
        const fullDay = DAY_ALIASES[day.toLowerCase()];
        if (!fullDay) {
            return NextResponse.json({ error: `Invalid day: ${day}` }, { status: 400 });
        }
        if (!Array.isArray(slots) || !slots.every((s) => typeof s === 'string' && timePattern.test(s))) {
            return NextResponse.json({ error: `Invalid time slots for ${day}` }, { status: 400 });
        }
        // Merge in case both abbreviated and full keys were present
        const merged = new Set([...(normalized[fullDay] ?? []), ...(slots as string[])]);
        normalized[fullDay] = Array.from(merged).sort();
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('therapists')
        .update(
            typeof is_taking_new_clients === 'boolean'
                ? { availability_slots: normalized, is_taking_new_clients }
                : { availability_slots: normalized }
        )
        .eq('id', session.therapistId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, availability_slots: normalized });
}