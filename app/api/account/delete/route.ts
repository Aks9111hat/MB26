import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function POST() {
    const supabase = await db();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log a deletion request (review/process manually as solo founder for now)
    const { error: insertError } = await supabase
        .from('data_deletion_requests')
        .insert({
            user_id: user.id,
            email: user.email,
            requested_at: new Date().toISOString(),
            status: 'pending',
        });

    if (insertError) {
        // Table may not exist yet — log and still acknowledge request
        console.error('Could not log deletion request:', insertError.message);
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗑️  ACCOUNT DELETION REQUESTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: ${user.email} (${user.id})
Requested: ${new Date().toISOString()}
ACTION REQUIRED: Process within 30 days per DPDPA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

    return NextResponse.json({ ok: true });
}