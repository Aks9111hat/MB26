'use client';

import type { DbCheckIn } from '@/lib/supabase/types';

const TIER_CONFIG = {
    thriving: {
        label: 'Thriving',
        emoji: '🌱',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        bar: 'bg-emerald-400',
        description: "You're in a good place right now. Keep nurturing what's working.",
    },
    managing: {
        label: 'Managing',
        emoji: '🌤️',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        bar: 'bg-amber-400',
        description: "You're holding things together, and that takes real strength.",
    },
    struggling: {
        label: 'Going through it',
        emoji: '🌧️',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-700',
        bar: 'bg-rose-400',
        description: "Things feel heavy right now — and that's okay. Support can help.",
    },
};

const DOMAIN_LABELS: Record<string, string> = {
    score_sleep: 'Sleep',
    score_energy: 'Energy',
    score_stress: 'Stress',
    score_social: 'Connection',
    score_wins: 'Wins',
    score_worry: 'Worry',
    score_coping: 'Coping',
    score_intention: 'Clarity',
};

function DomainBar({
    label,
    score,
    color,
}: {
    label: string;
    score: number | null;
    color: string;
}) {
    const val = score ?? 1;
    const pct = (val / 2) * 100;

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs text-gray-400">
                    {val === 0 ? 'Low' : val === 1 ? 'Okay' : 'Good'}
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function WellnessSnapshot({ checkin }: { checkin: DbCheckIn }) {
    const tier = checkin.tier ?? 'managing';
    const config = TIER_CONFIG[tier];

    const domainKeys = [
        'score_sleep',
        'score_energy',
        'score_stress',
        'score_social',
        'score_wins',
        'score_worry',
        'score_coping',
        'score_intention',
    ] as const;

    return (
        <div className="space-y-4">
            {/* Tier badge */}
            <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
                <div className="flex items-start gap-3">
                    <span className="text-3xl">{config.emoji}</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}>
                                {config.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {config.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Snapshot text */}
            {checkin.snapshot_text && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        What Mia heard
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {checkin.snapshot_text}
                    </p>
                </div>
            )}

            {/* Domain scores */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Your wellness areas
                </p>
                <div className="space-y-3">
                    {domainKeys.map((key) => (
                        <DomainBar
                            key={key}
                            label={DOMAIN_LABELS[key]}
                            score={checkin[key as keyof DbCheckIn] as number | null}
                            color={config.bar}
                        />
                    ))}
                </div>
            </div>

            {/* Intention */}
            {checkin.user_intention && (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">
                        Your intention
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{checkin.user_intention}"
                    </p>
                </div>
            )}
        </div>
    );
}