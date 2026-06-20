import type { DbTherapist, CheckInTier } from '@/lib/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    const { createClient } = await import('@/lib/supabase/server');
    return createClient();
}

export async function matchTherapists(
    rec_tags: string[],
    _tier: CheckInTier,
    limit = 3
): Promise<DbTherapist[]> {
    const supabase = await db();

    // Try overlapping specialities first
    const { data: matched } = await supabase
        .from('therapists')
        .select('*')
        .eq('verification_status', 'verified')
        .overlaps('specialities', rec_tags)
        .order('session_fee_inr', { ascending: true })
        .limit(limit);

    if (matched && matched.length >= 1) {
        return matched as DbTherapist[];
    }

    // Fallback: return any verified therapists
    const { data: fallback } = await supabase
        .from('therapists')
        .select('*')
        .eq('verification_status', 'verified')
        .order('session_fee_inr', { ascending: true })
        .limit(limit);

    return (fallback as DbTherapist[]) ?? [];
}