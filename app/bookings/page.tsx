'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DbBooking } from '@/lib/supabase/types';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<DbBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/bookings')
            .then((r) => r.json())
            .then((d) => {
                setBookings(d.bookings ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleProposalResponse = async (bookingId: string, accept: boolean) => {
        const res = await fetch('/api/bookings/respond-to-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId, accept }),
        });
        if (res.ok) {
            const r = await fetch('/api/bookings');
            const d = await r.json();
            setBookings(d.bookings ?? []);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Dashboard
                    </Link>
                    <p className="font-semibold text-gray-900 text-sm">My bookings</p>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-sm">No bookings yet.</p>
                        <Link
                            href="/therapists"
                            className="mt-3 inline-block text-teal-600 text-sm hover:underline"
                        >
                            Find a therapist →
                        </Link>
                    </div>
                ) : (
                    bookings.map((b) => {
                        const start = new Date(b.scheduled_start);
                        return (
                            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {start.toLocaleDateString('en-IN', {
                                                weekday: 'short', day: 'numeric', month: 'short',
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {start.toLocaleTimeString('en-IN', {
                                                hour: '2-digit', minute: '2-digit', hour12: true,
                                            })} · {b.session_mode.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            ₹{Math.round(b.session_fee_inr / 100)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                    </span>
                                    {b.status === 'modified_pending_user' && b.proposed_start && (
                                        <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                                            <p className="text-xs text-blue-600 font-medium">
                                                Therapist proposed a new time:
                                            </p>
                                            <p className="text-sm text-gray-800">
                                                {new Date(b.proposed_start).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                {' at '}
                                                {new Date(b.proposed_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleProposalResponse(b.id, true)}
                                                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg py-2 transition-colors"
                                                >
                                                    Accept new time
                                                </button>
                                                <button
                                                    onClick={() => handleProposalResponse(b.id, false)}
                                                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg py-2 transition-colors"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
