import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await db();
        const { data, error } = await supabase
            .from('therapists')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ therapist: data });
    } catch (err) {
        console.error('Therapist by ID error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}