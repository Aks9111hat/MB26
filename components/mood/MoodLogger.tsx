'use client';

import { useState } from 'react';
import type { DbMoodEntry } from '@/lib/supabase/types';
import { toast } from 'sonner';

const EMOJIS = ['😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];

const MOOD_TAGS = [
    'anxious', 'tired', 'grateful', 'overwhelmed',
    'productive', 'calm', 'sad', 'hopeful', 'stressed', 'energised',
];

const SCORE_LABELS: Record<number, string> = {
    1: 'Very low', 2: 'Low', 3: 'Pretty low', 4: 'Below okay',
    5: 'Okay', 6: 'Alright', 7: 'Good', 8: 'Pretty good',
    9: 'Great', 10: 'Excellent',
};

interface Props {
    todayMood: DbMoodEntry | null;
    onLogged: (entry: DbMoodEntry) => void;
}

export function MoodLogger({ todayMood, onLogged }: Props) {
    const [score, setScore] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tag: string) =>
        setTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );

    const handleSubmit = async () => {
        if (!score) return;
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood_score: score, tags, note: note || null }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to log mood');
            onLogged(data.entry);
            toast.success('Mood logged for today 🌱');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    // Already logged state
    if (todayMood) {
        const emoji = EMOJIS[(todayMood.mood_score ?? 5) - 1];
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Today's mood</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {SCORE_LABELS[todayMood.mood_score ?? 5]}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Score: {todayMood.mood_score}/10
                                </p>
                            </div>
                        </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                        ✓ Logged
                    </span>
                </div>
                {todayMood.tags && todayMood.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {todayMood.tags.map((t) => (
                            <span key={t} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
                                {t}
                            </span>
                        ))}
                    </div>
                )}
                {todayMood.note && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{todayMood.note}"</p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">How are you feeling?</p>
                {score && (
                    <span className="text-xs text-teal-600 font-medium">
                        {SCORE_LABELS[score]}
                    </span>
                )}
            </div>

            {/* Emoji scale */}
            <div className="flex justify-between">
                {EMOJIS.map((emoji, i) => {
                    const val = i + 1;
                    return (
                        <button
                            key={val}
                            onClick={() => setScore(val)}
                            className={`text-xl transition-transform hover:scale-125 ${score === val ? 'scale-125' : score && score !== val ? 'opacity-40' : ''
                                }`}
                        >
                            {emoji}
                        </button>
                    );
                })}
            </div>

            {/* Score indicator */}
            {score && (
                <>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${(score / 10) * 100}%`,
                                backgroundColor: score <= 3 ? '#f87171' : score <= 6 ? '#fbbf24' : '#34d399',
                            }}
                        />
                    </div>

                    {/* Tag chips */}
                    <div>
                        <p className="text-xs text-gray-400 mb-2">What's contributing? (optional)</p>
                        <div className="flex flex-wrap gap-1.5">
                            {MOOD_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${tags.includes(tag)
                                            ? 'bg-teal-500 text-white border-teal-500'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value.slice(0, 140))}
                            placeholder="Add a note... (optional)"
                            rows={2}
                            className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5 outline-none resize-none border border-gray-100 focus:border-teal-300 transition-colors placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 text-right">{note.length}/140</p>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
                    >
                        {submitting ? 'Saving...' : 'Log my mood'}
                    </button>
                </>
            )}
        </div>
    );
}