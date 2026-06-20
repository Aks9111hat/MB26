import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '../check/route';

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

    const { data: flagged, error } = await supabase
        .from('checkins')
        .select(`
      id, created_at, safety_flag, safety_type,
      safety_acknowledged, safety_acknowledged_at,
      user_id, snapshot_text
    `)
        .eq('safety_flag', true)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch user emails + first safety message for each
    const enriched = await Promise.all(
        (flagged ?? []).map(async (checkin: {
            id: string;
            created_at: string;
            safety_flag: boolean;
            safety_type: string | null;
            safety_acknowledged: boolean;
            safety_acknowledged_at: string | null;
            user_id: string;
            snapshot_text: string | null;
        }) => {
            const [userRes, msgRes] = await Promise.all([
                supabase
                    .from('users')
                    .select('email, full_name, display_name')
                    .eq('id', checkin.user_id)
                    .single(),
                supabase
                    .from('checkin_messages')
                    .select('content, role')
                    .eq('checkin_id', checkin.id)
                    .eq('contains_safety_signal', true)
                    .order('sequence_number', { ascending: true })
                    .limit(1)
                    .single(),
            ]);

            return {
                ...checkin,
                user: userRes.data,
                firstSafetyMessage: msgRes.data,
            };
        })
    );

    return NextResponse.json({ flags: enriched });
}

export async function POST(req: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = await db();
    const { checkin_id } = await req.json();

    if (!checkin_id) {
        return NextResponse.json({ error: 'checkin_id required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('checkins')
        .update({
            safety_acknowledged: true,
            safety_acknowledged_at: new Date().toISOString(),
            safety_acknowledged_by: auth.userId,
        })
        .eq('id', checkin_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}