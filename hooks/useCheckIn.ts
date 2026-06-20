'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    isStreaming?: boolean;
    isSafety?: boolean;
}

interface UseCheckInReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    isComplete: boolean;
    questionNumber: number;
    sendMessage: (text: string) => Promise<void>;
    checkinId: string | null;
}

export function useCheckIn(
    checkinId: string | null,
    userId: string | null
): UseCheckInReturn {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!checkinId || !userId || isStreaming) return;

            const userMsg: ChatMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                content: text,
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsStreaming(true);

            // Build API messages array (all previous + new user message)
            const apiMessages = [
                ...messages.map((m) => ({ role: m.role, content: m.content })),
                { role: 'user' as const, content: text },
            ];

            // Placeholder for streaming AI response
            const aiMsgId = `ai-${Date.now()}`;
            setMessages((prev) => [
                ...prev,
                { id: aiMsgId, role: 'assistant', content: '', isStreaming: true },
            ]);

            try {
                abortRef.current = new AbortController();

                const response = await fetch('/api/checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: apiMessages,
                        checkin_id: checkinId,
                        user_id: userId,
                    }),
                    signal: abortRef.current.signal,
                });

                if (!response.ok || !response.body) {
                    throw new Error('API error');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // Check for completion signal
                    if (chunk.includes('<CHECKIN_COMPLETE>')) {
                        const match = chunk.match(/<CHECKIN_COMPLETE>(.*?)<\/CHECKIN_COMPLETE>/);
                        const cleanChunk = chunk
                            .replace(/<CHECKIN_COMPLETE>.*?<\/CHECKIN_COMPLETE>/, '')
                            .trim();

                        if (cleanChunk) {
                            fullText += cleanChunk;
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === aiMsgId
                                        ? { ...m, content: fullText, isStreaming: false }
                                        : m
                                )
                            );
                        }

                        setIsComplete(true);

                        // Redirect to results after short delay
                        setTimeout(() => {
                            router.push(`/results/${match?.[1] ?? checkinId}`);
                        }, 2000);
                        break;
                    }

                    // Strip assessment JSON tags from display
                    const displayChunk = chunk
                        .replace(/<assessment>[\s\S]*?<\/assessment>/, '')
                        .replace(/<assessment>[\s\S]*$/, ''); // partial tag

                    fullText += displayChunk;

                    // Check if safety message
                    const isSafety =
                        fullText.includes('iCall') || fullText.includes('9152987821');

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === aiMsgId
                                ? { ...m, content: fullText, isStreaming: true, isSafety }
                                : m
                        )
                    );
                }

                // Finalize message
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === aiMsgId
                            ? { ...m, isStreaming: false }
                            : m
                    )
                );

                // Increment question counter (max 8)
                setQuestionNumber((prev) => Math.min(prev + 1, 8));
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') return;
                console.error('sendMessage error:', err);

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === aiMsgId
                            ? {
                                ...m,
                                content:
                                    "I'm sorry, something went wrong. Please try sending your message again.",
                                isStreaming: false,
                            }
                            : m
                    )
                );
            } finally {
                setIsStreaming(false);
            }
        },
        [checkinId, userId, isStreaming, messages, router]
    );

    return { messages, isStreaming, isComplete, questionNumber, sendMessage, checkinId };
}