'use client';

// import { useState, useEffect } from 'next/client';

import { useState, useEffect } from 'react';

export default function AdminCheckInsPage() {
    const [checkins, setCheckins] = useState<{
        id: string; created_at: string; tier: string | null;
        is_complete: boolean; user_id: string;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/checkins')
            .then((r) => r.json())
            .then((d) => { setCheckins(d.checkins ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white">Check-ins</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800">
                            {['ID', 'Date', 'Tier', 'Complete'].map((h) => (
                                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : checkins.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No check-ins yet</td></tr>
                        ) : (
                            checkins.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-800/50">
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-3 text-gray-300">
                                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{c.tier ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_complete ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                                            {c.is_complete ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}