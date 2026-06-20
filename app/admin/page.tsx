'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OverviewData {
    totalUsers: number;
    checkinsToday: number;
    bookingsThisWeek: number;
    unacknowledgedFlags: number;
    recentUsers: {
        id: string;
        email: string;
        full_name: string | null;
        display_name: string | null;
        created_at: string;
        tier: string;
    }[];
}

function MetricCard({
    label, value, sub, alert,
}: {
    label: string;
    value: string | number;
    sub?: string;
    alert?: boolean;
}) {
    return (
        <div className={`bg-gray-900 rounded-xl border p-4 ${alert ? 'border-red-500' : 'border-gray-800'}`}>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${alert ? 'text-red-400' : 'text-white'}`}>
                {value}
            </p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function AdminOverviewPage() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/overview')
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <h1 className="text-xl font-bold text-white">Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 h-24 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Overview</h1>
                <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                </p>
            </div>

            {/* Safety alert banner */}
            {(data?.unacknowledgedFlags ?? 0) > 0 && (
                <Link href="/admin/safety">
                    <div className="bg-red-950 border border-red-500 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-red-900 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🚨</span>
                            <div>
                                <p className="text-sm font-semibold text-red-300">
                                    {data?.unacknowledgedFlags} unacknowledged safety flag{data?.unacknowledgedFlags !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-red-400">
                                    Someone flagged is in distress — review immediately
                                </p>
                            </div>
                        </div>
                        <span className="text-red-400 text-sm">→</span>
                    </div>
                </Link>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total users" value={data?.totalUsers ?? 0} />
                <MetricCard label="Check-ins today" value={data?.checkinsToday ?? 0} />
                <MetricCard label="Bookings this week" value={data?.bookingsThisWeek ?? 0} />
                <MetricCard
                    label="Safety flags"
                    value={data?.unacknowledgedFlags ?? 0}
                    sub="unacknowledged"
                    alert={(data?.unacknowledgedFlags ?? 0) > 0}
                />
            </div>

            {/* Revenue placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Revenue this month
                </p>
                <p className="text-3xl font-bold text-white">₹0</p>
                <p className="text-xs text-gray-500 mt-1">
                    Payment integration coming soon (Razorpay)
                </p>
            </div>

            {/* Recent signups */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl">
                <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-white">Recent sign-ups</p>
                </div>
                <div className="divide-y divide-gray-800">
                    {(data?.recentUsers ?? []).length === 0 ? (
                        <p className="text-sm text-gray-500 px-4 py-6 text-center">No users yet</p>
                    ) : (
                        (data?.recentUsers ?? []).map((u) => (
                            <div key={u.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="text-sm text-gray-200 font-medium">
                                        {u.display_name ?? u.full_name ?? 'Unknown'}
                                    </p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                                        {u.tier}
                                    </span>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}