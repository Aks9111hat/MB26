import { createClient } from '@/lib/supabase/server';
import type { AssessmentOutput } from '@/types';
import type { DbCheckIn, DbCheckInMessage } from '@/lib/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function createCheckIn(user_id: string): Promise<string> {
    const supabase = await db();
    const { data, error } = await supabase
        .from('checkins')
        .insert({
            user_id,
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

    if (error) throw new Error(`Failed to create check-in: ${error.message}`);
    return (data as { id: string }).id;
}

export async function getCheckInHistory(checkin_id: string): Promise<DbCheckInMessage[]> {
    const supabase = await db();
    const { data, error } = await supabase
        .from('checkin_messages')
        .select('*')
        .eq('checkin_id', checkin_id)
        .order('sequence_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch check-in history: ${error.message}`);
    return (data as DbCheckInMessage[]) ?? [];
}

export async function saveMessage({
    checkin_id,
    user_id,
    role,
    content,
    sequence_number,
}: {
    checkin_id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    sequence_number: number;
}): Promise<void> {
    const supabase = await db();
    const { error } = await supabase
        .from('checkin_messages')
        .insert({
            checkin_id,
            user_id,
            role,
            content,
            sequence_number,
            contains_safety_signal: false,
        });

    if (error) throw new Error(`Failed to save message: ${error.message}`);
}

export async function completeCheckIn(
    checkin_id: string,
    assessment: AssessmentOutput
): Promise<void> {
    const supabase = await db();
    const { error } = await supabase
        .from('checkins')
        .update({
            is_complete: true,
            completed_at: new Date().toISOString(),
            tier: assessment.tier,
            total_score: assessment.total_score,
            score_sleep: assessment.sleep_score,
            score_energy: assessment.energy_score,
            score_stress: assessment.stress_score,
            score_social: assessment.social_score,
            score_wins: assessment.wins_score,
            score_worry: assessment.worry_score,
            score_coping: assessment.coping_score,
            score_intention: assessment.intention_score,
            rec_tags: assessment.rec_tags,
            safety_flag: assessment.safety_flag,
            snapshot_text: assessment.snapshot_text,
            user_intention: assessment.user_intention,
        })
        .eq('id', checkin_id);

    if (error) throw new Error(`Failed to complete check-in: ${error.message}`);
}

export async function getCheckIn(checkin_id: string): Promise<DbCheckIn | null> {
    const supabase = await db();
    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('id', checkin_id)
        .single();

    if (error) throw new Error(`Failed to fetch check-in: ${error.message}`);
    return data as DbCheckIn;
}