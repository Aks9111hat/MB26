'use client';

import { useState, useEffect } from 'react';

interface SafetyFlag {
    id: string;
    created_at: string;
    safety_type: string | null;
    safety_acknowledged: boolean;
    safety_acknowledged_at: string | null;
    user_id: string;
    snapshot_text: string | null;
    user: { email: string; full_name: string | null; display_name: string | null } | null;
    firstSafetyMessage: { content: string; role: string } | null;
}

export default function AdminSafetyPage() {
    const [flags, setFlags] = useState<SafetyFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/safety')
            .then((r) => r.json())
            .then((d) => { setFlags(d.flags ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const acknowledge = async (checkinId: string) => {
        setAcknowledging(checkinId);
        try {
            const res = await fetch('/api/admin/safety', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkin_id: checkinId }),
            });
            if (res.ok) {
                setFlags((prev) =>
                    prev.map((f) =>
                        f.id === checkinId
                            ? { ...f, safety_acknowledged: true, safety_acknowledged_at: new Date().toISOString() }
                            : f
                    )
                );
            }
        } finally {
            setAcknowledging(null);
        }
    };

    const unacked = flags.filter((f) => !f.safety_acknowledged);
    const acked = flags.filter((f) => f.safety_acknowledged);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Safety Flags</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Users who indicated distress during check-in. Review and acknowledge each one.
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 h-32 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Unacknowledged */}
                    {unacked.length > 0 && (
                        <div>
                            <p className="text-xs text-red-400 uppercase tracking-wide font-semibold mb-3">
                                🚨 Needs review ({unacked.length})
                            </p>
                            <div className="space-y-3">
                                {unacked.map((flag) => (
                                    <FlagCard
                                        key={flag.id}
                                        flag={flag}
                                        onAcknowledge={acknowledge}
                                        acknowledging={acknowledging === flag.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {unacked.length === 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-8 text-center">
                            <p className="text-2xl mb-2">✅</p>
                            <p className="text-sm text-gray-400">All flags acknowledged</p>
                        </div>
                    )}

                    {/* Acknowledged */}
                    {acked.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                                Acknowledged ({acked.length})
                            </p>
                            <div className="space-y-3">
                                {acked.map((flag) => (
                                    <FlagCard
                                        key={flag.id}
                                        flag={flag}
                                        onAcknowledge={acknowledge}
                                        acknowledging={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function FlagCard({
    flag, onAcknowledge, acknowledging,
}: {
    flag: SafetyFlag;
    onAcknowledge: (id: string) => void;
    acknowledging: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`bg-gray-900 rounded-xl border p-4 space-y-3 ${flag.safety_acknowledged ? 'border-gray-800' : 'border-red-800'
            }`}>
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        {!flag.safety_acknowledged && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-white">
                            {flag.user?.display_name ?? flag.user?.full_name ?? 'Unknown user'}
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{flag.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                            {new Date(flag.created_at).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short',
                                hour: '2-digit', minute: '2-digit', hour12: true,
                            })}
                        </span>
                        {flag.safety_type && (
                            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">
                                {flag.safety_type.replace(/_/g, ' ')}
                            </span>
                        )}
                    </div>
                </div>

                {flag.safety_acknowledged ? (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full flex-shrink-0">
                        ✓ Acknowledged
                    </span>
                ) : (
                    <button
                        onClick={() => onAcknowledge(flag.id)}
                        disabled={acknowledging}
                        className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    >
                        {acknowledging ? 'Saving...' : 'Acknowledge'}
                    </button>
                )}
            </div>

            {/* Safety message */}
            {flag.firstSafetyMessage && (
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">User message:</p>
                    <p className="text-xs text-gray-200 leading-relaxed">
                        {expanded
                            ? flag.firstSafetyMessage.content
                            : flag.firstSafetyMessage.content.slice(0, 120) +
                            (flag.firstSafetyMessage.content.length > 120 ? '...' : '')}
                    </p>
                    {flag.firstSafetyMessage.content.length > 120 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-teal-500 mt-1 hover:text-teal-400"
                        >
                            {expanded ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>
            )}

            {/* Acknowledged timestamp */}
            {flag.safety_acknowledged && flag.safety_acknowledged_at && (
                <p className="text-xs text-gray-600">
                    Acknowledged{' '}
                    {new Date(flag.safety_acknowledged_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                    })}
                </p>
            )}
        </div>
    );
}