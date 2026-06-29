'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilityEditor } from '@/components/therapist/AvailabilityEditor';

interface TherapistBooking {
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    session_mode: string;
    status: string;
    session_fee_inr: number;
    notes_for_therapist: string | null;
    proposed_start: string | null;
    proposed_end: string | null;
    client: { display_name: string | null; full_name: string | null; email: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Awaiting your response', color: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
    modified_pending_user: { label: 'Waiting for client', color: 'bg-blue-100 text-blue-700' },
};

function BookingCard({
    booking,
    onRespond,
}: {
    booking: TherapistBooking;
    onRespond: (id: string, action: string, extra?: { proposed_start?: string; proposed_end?: string; note?: string }) => Promise<void>;
}) {
    const [showPropose, setShowPropose] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const start = new Date(booking.scheduled_start);
    const end = new Date(booking.scheduled_end);
    const clientName = booking.client?.display_name ?? booking.client?.full_name ?? 'Client';
    const statusInfo = STATUS_LABELS[booking.status] ?? { label: booking.status, color: 'bg-gray-100 text-gray-500' };
    const isPending = booking.status === 'pending';

    const handlePropose = async () => {
        if (!newDate || !newTime) return;
        setSubmitting(true);
        const proposedStart = new Date(`${newDate}T${newTime}:00+05:30`).toISOString();
        const durationMs = end.getTime() - start.getTime();
        const proposedEnd = new Date(new Date(proposedStart).getTime() + durationMs).toISOString();
        await onRespond(booking.id, 'propose_new_time', {
            proposed_start: proposedStart,
            proposed_end: proposedEnd,
            note,
        });
        setSubmitting(false);
        setShowPropose(false);
    };
    

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-900 text-sm">{clientName}</p>
                    <p className="text-xs text-gray-400">{booking.client?.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                    <p className="text-gray-400">Date</p>
                    <p className="text-gray-800 font-medium">
                        {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400">Time</p>
                    <p className="text-gray-800 font-medium">
                        {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400">Mode</p>
                    <p className="text-gray-800 font-medium capitalize">{booking.session_mode.replace(/_/g, ' ')}</p>
                </div>
            </div>

            {booking.notes_for_therapist && (
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">Client note</p>
                    <p className="text-xs text-gray-600">{booking.notes_for_therapist}</p>
                </div>
            )}

            {isPending && !showPropose && (
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={() => onRespond(booking.id, 'accept')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => setShowPropose(true)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-xl py-2.5 transition-colors"
                    >
                        Propose new time
                    </button>
                    <button
                        onClick={() => onRespond(booking.id, 'reject')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-xl py-2.5 transition-colors"
                    >
                        Decline
                    </button>
                </div>
            )}

            {isPending && showPropose && (
                <div className="space-y-2 pt-1 border-t border-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 outline-none focus:border-teal-300"
                        />
                        <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 outline-none focus:border-teal-300"
                        />
                    </div>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note to client..."
                        className="w-full text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 outline-none focus:border-teal-300"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handlePropose}
                            disabled={!newDate || !newTime || submitting}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg py-2 transition-colors"
                        >
                            {submitting ? 'Sending...' : 'Send proposal'}
                        </button>
                        <button
                            onClick={() => setShowPropose(false)}
                            className="text-xs text-gray-400 px-3"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TherapistDashboardPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<TherapistBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'sessions' | 'availability'>('sessions');

    const load = async () => {
        const res = await fetch('/api/therapist/bookings');
        if (res.status === 401) {
            router.push('/therapist/login');
            return;
        }
        const data = await res.json();
        setBookings(data.bookings ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleRespond = async (
        id: string,
        action: string,
        extra?: { proposed_start?: string; proposed_end?: string; note?: string }
    ) => {
        const res = await fetch('/api/therapist/bookings/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: id, action, ...extra }),
        });
        if (res.ok) load();
    };

    const handleLogout = async () => {
        await fetch('/api/therapist/logout', { method: 'POST' });
        router.push('/therapist/login');
    };

    const pending = bookings.filter((b) => b.status === 'pending');
    const upcoming = bookings.filter((b) =>
        ['confirmed', 'modified_pending_user'].includes(b.status) &&
        new Date(b.scheduled_start) >= new Date()
    );
    const past = bookings.filter((b) =>
        ['completed', 'cancelled'].includes(b.status) ||
        (b.status === 'confirmed' && new Date(b.scheduled_start) < new Date())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-100 px-4 py-4">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div>
                        <p className="font-bold text-gray-900">Therapist dashboard</p>
                        <p className="text-xs text-gray-400">MindBridge</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        Log out
                    </button>
                </div>
                <div className="max-w-lg mx-auto flex gap-1 mt-3">
                    <button
                        onClick={() => setTab('sessions')}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === 'sessions' ? 'bg-teal-50 text-teal-600' : 'text-gray-400'
                            }`}
                    >
                        My sessions
                    </button>
                    <button
                        onClick={() => setTab('availability')}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === 'availability' ? 'bg-teal-50 text-teal-600' : 'text-gray-400'
                            }`}
                    >
                        Availability
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
                {tab === 'availability' ? (
                    <AvailabilityEditor />
                ) : loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : (
                    <>
                        {pending.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
                                    Needs your response ({pending.length})
                                </p>
                                <div className="space-y-3">
                                    {pending.map((b) => (
                                        <BookingCard key={b.id} booking={b} onRespond={handleRespond} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Upcoming ({upcoming.length})
                            </p>
                            {upcoming.length === 0 ? (
                                <p className="text-sm text-gray-400">No upcoming sessions</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming.map((b) => (
                                        <BookingCard key={b.id} booking={b} onRespond={handleRespond} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {past.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                    Past ({past.length})
                                </p>
                                <div className="space-y-3 opacity-60">
                                    {past.map((b) => (
                                        <BookingCard key={b.id} booking={b} onRespond={handleRespond} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}