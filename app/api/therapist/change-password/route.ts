import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

import { getTherapistSession } from '@/lib/therapist-auth/session';
import { hashPassword } from '@/lib/therapist-auth/password';

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function db(): Promise<any> {
//     return createClient();
// }

export async function POST(req: NextRequest) {
    const session = await getTherapistSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // const supabase = await db();
    const supabase = createAdminClient(); // bypasses RLS — required since therapist has no Supabase Auth session

    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabase
        .from('therapists')
        .update({ password_hash: passwordHash, must_change_password: false })
        .eq('id', session.therapistId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}