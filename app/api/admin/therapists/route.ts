import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/verify-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = await db();
    const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ therapists: data ?? [] });
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = await db();
    const body = await req.json();

    const { data, error } = await supabase
        .from('therapists')
        .insert({
            full_name: body.full_name,
            bio: body.bio ?? null,
            tagline: body.tagline ?? null,
            specialities: body.specialities ?? [],
            therapeutic_approaches: body.therapeutic_approaches ?? [],
            languages: body.languages ?? ['English'],
            session_modes: body.session_modes ?? ['video'],
            session_fee_inr: Math.round((body.session_fee ?? 0) * 100),
            intro_session_fee_inr: body.intro_fee
                ? Math.round(body.intro_fee * 100)
                : null,
            years_experience: body.years_experience ?? null,
            verification_status: 'pending',
            availability_slots: body.availability_slots ?? {},
            booking_buffer_mins: 15,
            advance_booking_days: 30,
            session_duration_mins: body.session_duration_mins ?? 50,
            qualification: body.qualification ?? [],
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ therapist: data });
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = await db();
    const { id, verification_status } = await req.json();

    if (!id || !verification_status) {
        return NextResponse.json({ error: 'id and verification_status required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('therapists')
        .update({
            verification_status,
            ...(verification_status === 'verified'
                ? { verified_at: new Date().toISOString() }
                : {}),
        })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}