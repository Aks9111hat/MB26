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
            .from('bookings')
            .select('scheduled_start')
            .eq('therapist_id', params.id)
            .in('status', ['pending', 'confirmed', 'modified_pending_user'])
            .gte('scheduled_start', new Date().toISOString());

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            bookedSlots: (data ?? []).map((b: { scheduled_start: string }) => b.scheduled_start),
        });
    } catch (err) {
        console.error('Booked slots error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}