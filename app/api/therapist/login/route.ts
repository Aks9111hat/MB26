import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/therapist-auth/password';
import { signTherapistToken } from '@/lib/therapist-auth/jwt';
import { setTherapistSessionCookie } from '@/lib/therapist-auth/session';

import type { DbTherapist, Database } from '@/lib/supabase/types';

type Test1 = Database["public"]["Tables"]["therapists"];
type Test2 = Database["public"]["Tables"]["therapists"]["Row"];
type Test3 = DbTherapist;

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email and password required' },
            { status: 400 }
        );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createAdminClient();

    const { data: therapist, error } = await supabase
        .from('therapists')
        .select(`
            id,
            email,
            password_hash,
            full_name,
            must_change_password,
            is_active,
            verification_status
        `)
        .eq('email', normalizedEmail)
        .single();

    console.log(error);
    console.log(therapist);
    console.log(therapist?.password_hash);

    if (error || !therapist || !therapist.password_hash) {
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        );
    }

    const valid = await verifyPassword(
        password,
        therapist.password_hash
    );

    if (!valid) {
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        );
    }

    if (!therapist.is_active) {
        return NextResponse.json(
            { error: 'Account is inactive' },
            { status: 403 }
        );
    }

    if (therapist.verification_status !== 'verified') {
        return NextResponse.json(
            { error: 'Account is not verified' },
            { status: 403 }
        );
    }

    const token = signTherapistToken({
        therapistId: therapist.id,
        email: therapist.email ?? normalizedEmail,
    });

    await setTherapistSessionCookie(token);

    await supabase
        .from('therapists')
        .update({
            last_login_at: new Date().toISOString() as never,
        })
        .eq('id', therapist.id);

    return NextResponse.json({
        ok: true,
        therapistName: therapist.full_name,
        mustChangePassword: therapist.must_change_password,
    });
}