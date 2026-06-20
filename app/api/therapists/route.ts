import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    try {
        const supabase = await db();
        const { data, error } = await supabase
            .from('therapists')
            .select('*')
            .eq('verification_status', 'verified')
            .order('session_fee_inr', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ therapists: data ?? [] });
    } catch (err) {
        console.error('Therapists API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}