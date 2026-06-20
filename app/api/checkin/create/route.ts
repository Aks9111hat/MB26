import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function POST() {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('checkins')
            .insert({
                user_id: user.id,
                is_complete: false,
                safety_flag: false,
                social_isolation: false,
                self_efficacy_low: false,
                safety_acknowledged: false,
                rec_tags: [],
                assessment_metadata: {},
            })
            .select('id')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ checkin_id: data.id, user_id: user.id });
    } catch (err) {
        console.error('Create checkin error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}