import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/verify-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 403 });

    const supabase = await db();
    const { data, error } = await supabase
        .from('checkins')
        .select('id, created_at, tier, is_complete, user_id, safety_flag')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ checkins: data ?? [] });
}