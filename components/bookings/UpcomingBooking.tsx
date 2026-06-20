'use client';

import { useRouter } from 'next/navigation';
import type { DbBooking } from '@/lib/supabase/types';

const MODE_ICONS: Record<string, string> = {
    video: '📹', audio: '🎙', in_person: '🏢', chat: '💬',
};

export function UpcomingBooking({ booking }: { booking: DbBooking }) {
    const router = useRouter();
    const start = new Date(booking.scheduled_start);

    const dateStr = start.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short',
    });
    const timeStr = start.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-emerald-100 text-emerald-700',
        completed: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-100 text-red-600',
        no_show: 'bg-gray-100 text-gray-500',
    };

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard')}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Upcoming session</p>
                    <p className="font-semibold text-gray-900 text-sm">{dateStr}</p>
                    <p className="text-sm text-gray-600">{timeStr}</p>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {MODE_ICONS[booking.session_mode]} {booking.session_mode.replace(/_/g, ' ')}
                    </p>
                </div>
            </div>
        </div>
    );
}