'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Clock, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCheckIn } from '@/hooks/useCheckIn';
import { ConversationUI } from '@/components/checkin/ConversationUI';

type Screen = 'loading' | 'start' | 'chat' | 'error';

export default function CheckInPage() {
    const router = useRouter();
    const [screen, setScreen] = useState<Screen>('loading');
    const [checkinId, setCheckinId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function init() {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.push('/auth/login?redirectTo=/checkin');
                return;
            }

            setUserId(user.id);

            const { data: profile } = await supabase
                .from('users')
                .select('display_name, full_name')
                .eq('id', user.id)
                .single();

            const p = profile as { display_name?: string; full_name?: string } | null;
            setUserName(
                p?.display_name || p?.full_name?.split(' ')[0] || 'there'
            );

            setScreen('start');
        }

        init();
    }, [router]);

    const handleStart = async () => {
        setScreen('loading');
        try {
            const res = await fetch('/api/checkin/create', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create check-in');
            const data = await res.json();
            setCheckinId(data.checkin_id);
            setUserId(data.user_id);
            setScreen('chat');
        } catch (err) {
            console.error(err);
            setError('Something went wrong starting your check-in. Please try again.');
            setScreen('error');
        }
    };

    const { messages, isStreaming, isComplete, questionNumber, sendMessage } =
        useCheckIn(checkinId, userId);

    // Send opening message when chat starts
    useEffect(() => {
        if (screen === 'chat' && checkinId && userId && messages.length === 0) {
            sendMessage("Hi Mia, I'm ready to check in.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen, checkinId, userId]);

    if (screen === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto animate-pulse">
                        <Heart className="w-6 h-6 text-teal-500" />
                    </div>
                    <p className="text-gray-500 text-sm">Getting ready...</p>
                </div>
            </div>
        );
    }

    if (screen === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
                <div className="text-center space-y-4 max-w-sm">
                    <p className="text-gray-600">{error}</p>
                    <button onClick={() => setScreen('start')} className="btn-primary">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (screen === 'start') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-white flex items-center justify-center px-4">
                <div className="max-w-sm w-full space-y-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto shadow-lg">
                            <span className="text-white text-2xl font-bold">M</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Hey {userName} 👋
                            </h1>
                            <p className="text-gray-500 mt-1">
                                I'm Mia, your MindBridge companion.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">5 minutes</p>
                                <p className="text-xs text-gray-500">8 gentle questions about how you're doing</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-teal-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Personalised for you</p>
                                <p className="text-xs text-gray-500">Get matched to the right support based on your answers</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Private & safe</p>
                                <p className="text-xs text-gray-500">Your responses are encrypted and never shared</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleStart}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl py-3.5 px-6 transition-colors shadow-sm"
                        >
                            Start my check-in
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-400 leading-relaxed">
                        Mia is an AI companion, not a therapist. If you're in crisis,
                        please call iCall: 9152987821
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-teal-50/30 to-white">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">M</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">Mia</p>
                    <p className="text-xs text-teal-500">
                        {isStreaming ? 'Typing...' : 'MindBridge companion'}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ConversationUI
                    messages={messages}
                    isStreaming={isStreaming}
                    isComplete={isComplete}
                    questionNumber={questionNumber}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
}