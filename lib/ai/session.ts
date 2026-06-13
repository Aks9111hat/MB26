import { createClient } from '@/lib/supabase/server';
import type { AssessmentOutput } from '@/types';

export async function createCheckIn(user_id: string): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('checkins')
        .insert({
            user_id,
            is_complete: false,
            safety_flag: false,
        })
        .select('id')
        .single();

    if (error) throw new Error(`Failed to create check-in: ${error.message}`);
    return data.id;
}

export async function getCheckInHistory(checkin_id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('checkin_messages')
        .select('*')
        .eq('checkin_id', checkin_id)
        .order('sequence_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch check-in history: ${error.message}`);
    return data ?? [];
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
}) {
    const supabase = await createClient();

    const { error } = await supabase.from('checkin_messages').insert({
        checkin_id,
        user_id,
        role,
        content,
        sequence_number,
    });

    if (error) throw new Error(`Failed to save message: ${error.message}`);
}

export async function completeCheckIn(
    checkin_id: string,
    assessment: AssessmentOutput
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('checkins')
        .update({
            is_complete: true,
            tier: assessment.tier,
            total_score: assessment.total_score,
            sleep_score: assessment.sleep_score,
            energy_score: assessment.energy_score,
            stress_score: assessment.stress_score,
            social_score: assessment.social_score,
            wins_score: assessment.wins_score,
            worry_score: assessment.worry_score,
            coping_score: assessment.coping_score,
            intention_score: assessment.intention_score,
            rec_tags: assessment.rec_tags,
            safety_flag: assessment.safety_flag,
            snapshot_text: assessment.snapshot_text,
            user_intention: assessment.user_intention,
        })
        .eq('id', checkin_id);

    if (error) throw new Error(`Failed to complete check-in: ${error.message}`);
}

export async function getCheckIn(checkin_id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('id', checkin_id)
        .single();

    if (error) throw new Error(`Failed to fetch check-in: ${error.message}`);
    return data;
}