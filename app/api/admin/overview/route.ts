import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/verify-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.error === 'Unauthorized' ? 401 : 403 });
    }

    const supabase = await db();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [
        usersRes, checkinsToday, bookingsWeek,
        safetyFlags, recentUsers,
    ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),

        supabase.from('checkins')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', today),

        supabase.from('bookings')
            .select('id, session_fee_inr', { count: 'exact' })
            .gte('created_at', weekAgo.toISOString())
            .not('status', 'in', '("cancelled","no_show")'),

        supabase.from('checkins')
            .select('id', { count: 'exact', head: true })
            .eq('safety_flag', true)
            .eq('safety_acknowledged', false),

        supabase.from('users')
            .select('id, email, full_name, display_name, created_at, tier')
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    return NextResponse.json({
        totalUsers: usersRes.count ?? 0,
        checkinsToday: checkinsToday.count ?? 0,
        bookingsThisWeek: bookingsWeek.count ?? 0,
        unacknowledgedFlags: safetyFlags.count ?? 0,
        recentUsers: recentUsers.data ?? [],
    });
}