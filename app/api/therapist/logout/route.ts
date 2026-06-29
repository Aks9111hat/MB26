import { NextResponse } from 'next/server';
import { clearTherapistSessionCookie } from '@/lib/therapist-auth/session';

export async function POST() {
    await clearTherapistSessionCookie();
    return NextResponse.json({ ok: true });
}