import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/verify-admin';
import { hashPassword, generateTempPassword } from '@/lib/therapist-auth/password';
import { sendTherapistWelcomeEmail } from '@/lib/email/resend';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function adminDb(): Promise<any> {
    return createAdminClient();
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = await db();
    const adminSupabase = await adminDb(); // service_role client — bypasses RLS

    

    const { therapist_id, email } = await req.json();

    console.log('SERVICE KEY LOADED:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
    console.log('THERAPIST ID RECEIVED:', therapist_id);

    if (!therapist_id || !email) {
        return NextResponse.json({ error: 'therapist_id and email required' }, { status: 400 });
    }

    // Fetch therapist name (read is fine with regular client since admin can read)
    const { data: therapist, error: fetchError } = await supabase
        .from('therapists')
        .select('full_name')
        .eq('id', therapist_id)
        .single();

    if (fetchError || !therapist) {
        return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // const tempPassword = generateTempPassword();
    // const passwordHash = await hashPassword(tempPassword);

    // // Use admin client (service_role) to bypass RLS for this write
    // const { data: updated, error: updateError } = await adminSupabase
    //     .from('therapists')
    //     .update({
    //         email,
    //         password_hash: passwordHash,
    //         must_change_password: true,
    //     })
    //     .eq('id', therapist_id)
    //     .select('id, email, must_change_password')
    //     .single();

    // if (updateError) {
    //     console.error('Therapist onboard update error:', updateError);
    //     return NextResponse.json({ error: updateError.message }, { status: 500 });
    // }

    // if (!updated) {
    //     return NextResponse.json({ error: 'Update affected zero rows — check RLS' }, { status: 500 });
    // }

    // DEBUG: verify the row exists when queried via admin client
    const { data: checkRow, error: checkError } = await adminSupabase
        .from('therapists')
        .select('id, full_name')
        .eq('id', therapist_id);

    console.log('ADMIN CLIENT CAN SEE ROW:', checkRow, checkError);

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const { data: updated, error: updateError } = await adminSupabase
        .from('therapists')
        .update({
            email,
            password_hash: passwordHash,
            must_change_password: true,
        })
        .eq('id', therapist_id)
        .select('id, email, must_change_password');  // removed .single() temporarily

    console.log('UPDATE RESULT:', updated, updateError);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated || updated.length === 0) {
        return NextResponse.json({ error: 'Update affected zero rows — check service role key / RLS' }, { status: 500 });
    }

    const emailResult = await sendTherapistWelcomeEmail({
        to: email,
        therapistName: therapist.full_name,
        tempPassword,
    });

    if (!emailResult.ok) {
        console.warn(`Email failed to send to ${email}, temp password: ${tempPassword}`);
    }

    return NextResponse.json({
        ok: true,
        emailSent: emailResult.ok,
        tempPassword: emailResult.ok ? undefined : tempPassword,
    });
}