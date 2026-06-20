'use client';

import type { DbMoodEntry } from '@/lib/supabase/types';

function getBarColor(score: number): string {
    if (score <= 3) return '#f87171'; // red
    if (score <= 6) return '#fbbf24'; // amber
    return '#34d399';                 // green
}

function getLast7Days(): string[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MoodChart({ entries }: { entries: DbMoodEntry[] }) {
    const last7 = getLast7Days();

    const entryMap = Object.fromEntries(
        entries.map((e) => [e.date_local, e])
    );

    const data = last7.map((date) => ({
        date,
        day: DAY_LABELS[new Date(date + 'T00:00:00').getDay()],
        entry: entryMap[date] ?? null,
        score: entryMap[date]?.mood_score ?? null,
    }));

    const WIDTH = 280;
    const HEIGHT = 80;
    const BAR_WIDTH = 28;
    const GAP = (WIDTH - BAR_WIDTH * 7) / 6;

    return (
        <div className="space-y-2">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full"
                style={{ height: HEIGHT }}
            >
                {data.map((d, i) => {
                    const x = i * (BAR_WIDTH + GAP);
                    const score = d.score ?? 0;
                    const barH = score > 0 ? (score / 10) * HEIGHT * 0.85 : 4;
                    const y = HEIGHT - barH;
                    const color = score > 0 ? getBarColor(score) : '#e5e7eb';

                    return (
                        <g key={d.date}>
                            {/* Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={BAR_WIDTH}
                                height={barH}
                                rx={6}
                                fill={color}
                                opacity={score > 0 ? 1 : 0.5}
                            />
                            {/* Score label on bar */}
                            {score > 0 && barH > 18 && (
                                <text
                                    x={x + BAR_WIDTH / 2}
                                    y={y + barH / 2 + 4}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="600"
                                    fill="white"
                                >
                                    {score}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Day labels */}
            <div className="flex justify-between px-0">
                {data.map((d) => (
                    <div
                        key={d.date}
                        className="text-center"
                        style={{ width: BAR_WIDTH }}
                    >
                        <p className={`text-xs ${d.entry ? 'text-gray-600 font-medium' : 'text-gray-300'}`}>
                            {d.day}
                        </p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-1">
                {[
                    { color: '#f87171', label: 'Low' },
                    { color: '#fbbf24', label: 'Okay' },
                    { color: '#34d399', label: 'Good' },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-400">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}