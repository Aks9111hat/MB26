import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

function scoreToLabel(score: number): string {
    if (score <= 2) return 'very_low';
    if (score <= 4) return 'low';
    if (score <= 6) return 'neutral';
    if (score <= 8) return 'good';
    return 'great';
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { mood_score, tags = [], note = null } = body;

        if (!mood_score || mood_score < 1 || mood_score > 10) {
            return NextResponse.json({ error: 'mood_score must be 1–10' }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if already logged today
        const { data: existing } = await supabase
            .from('mood_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('date_local', today)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Already logged today', existing_id: existing.id },
                { status: 409 }
            );
        }

        const { data, error } = await supabase
            .from('mood_entries')
            .insert({
                user_id: user.id,
                mood_score,
                mood_label: scoreToLabel(mood_score),
                tags,
                note,
                date_local: today,
                logged_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ entry: data });
    } catch (err) {
        console.error('Mood POST error:', err);
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

        const since = new Date();
        since.setDate(since.getDate() - 30);

        const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', user.id)
            .gte('date_local', since.toISOString().split('T')[0])
            .order('date_local', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ entries: data ?? [] });
    } catch (err) {
        console.error('Mood GET error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}