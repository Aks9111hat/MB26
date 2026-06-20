import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamChat } from '@/lib/ai/groq';
import { CHECKIN_SYSTEM_PROMPT } from '@/lib/ai/prompts/checkin';
import { parseAssessmentJSON, validateAndMergeScores, ruleBasedScore } from '@/lib/ai/scoring';
import { saveMessage, completeCheckIn } from '@/lib/ai/session';
import type { ChatMessage } from '@/lib/ai/groq';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { messages, checkin_id, user_id } = body as {
            messages: ChatMessage[];
            checkin_id: string;
            user_id: string;
        };

        if (!messages || !checkin_id || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: checkin, error: checkinError } = await supabase
            .from('checkins')
            .select('id, user_id, is_complete')
            .eq('id', checkin_id)
            .single();

        if (checkinError || !checkin || checkin.user_id !== user.id) {
            return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
        }

        if (checkin.is_complete) {
            return NextResponse.json({ error: 'Check-in already completed' }, { status: 400 });
        }

        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
        const existingMessages = messages.filter((m) => m.role !== 'system');
        const userMessageIndex = existingMessages.filter((m) => m.role === 'user').length;

        if (lastUserMessage) {
            await saveMessage({
                checkin_id,
                user_id,
                role: 'user',
                content: lastUserMessage.content,
                sequence_number: (userMessageIndex - 1) * 2,
            });
        }

        const fullMessages: ChatMessage[] = [
            { role: 'system', content: CHECKIN_SYSTEM_PROMPT },
            ...messages,
        ];

        const stream = await streamChat(fullMessages);
        let fullResponse = '';

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const delta = chunk.choices[0]?.delta?.content ?? '';
                        if (delta) {
                            fullResponse += delta;
                            controller.enqueue(new TextEncoder().encode(delta));
                        }
                    }

                    const assessment = parseAssessmentJSON(fullResponse);

                    if (assessment?.is_complete) {
                        const conversationText = messages.map((m) => m.content).join(' ');
                        const finalAssessment = validateAndMergeScores(assessment, conversationText);

                        const displayContent = fullResponse
                            .replace(/<assessment>[\s\S]*?<\/assessment>/, '')
                            .trim();

                        await saveMessage({
                            checkin_id,
                            user_id,
                            role: 'assistant',
                            content: displayContent,
                            sequence_number: userMessageIndex * 2 + 1,
                        });

                        await completeCheckIn(checkin_id, finalAssessment);

                        controller.enqueue(
                            new TextEncoder().encode(
                                `\n<CHECKIN_COMPLETE>${checkin_id}</CHECKIN_COMPLETE>`
                            )
                        );
                    } else {
                        await saveMessage({
                            checkin_id,
                            user_id,
                            role: 'assistant',
                            content: fullResponse,
                            sequence_number: userMessageIndex * 2 + 1,
                        });

                        const conversationText = messages.map((m) => m.content).join(' ');
                        const { safety_flag } = ruleBasedScore(conversationText);
                        if (safety_flag) {
                            const supabase2 = await db();
                            await supabase2
                                .from('checkins')
                                .update({ safety_flag: true })
                                .eq('id', checkin_id);
                        }
                    }

                    controller.close();
                } catch (err) {
                    console.error('Streaming error:', err);
                    controller.error(err);
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'X-Checkin-ID': checkin_id,
            },
        });
    } catch (error) {
        console.error('Check-in API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await db();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const checkin_id = searchParams.get('checkin_id');

        if (!checkin_id) {
            return NextResponse.json({ error: 'checkin_id required' }, { status: 400 });
        }

        const { data: checkin, error } = await supabase
            .from('checkins')
            .select('*')
            .eq('id', checkin_id)
            .eq('user_id', user.id)
            .single();

        if (error || !checkin) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const { data: messages } = await supabase
            .from('checkin_messages')
            .select('*')
            .eq('checkin_id', checkin_id)
            .order('sequence_number', { ascending: true });

        return NextResponse.json({ checkin, messages: messages ?? [] });
    } catch (error) {
        console.error('Check-in GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}