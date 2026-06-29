import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function verifyAdmin(): Promise<{
    ok: boolean;
    userId?: string;
    error?: string;
}> {
    const supabase = await db();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { ok: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return { ok: false, error: 'Forbidden' };
    }

    return { ok: true, userId: user.id };
}