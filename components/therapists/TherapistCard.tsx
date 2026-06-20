'use client';

import { useRouter } from 'next/navigation';
import type { DbTherapist } from '@/lib/supabase/types';

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs font-medium text-gray-700">
                {(count / 100).toFixed(1)}
            </span>
        </div>
    );
}

export function TherapistCard({
    therapist,
    checkinId,
    compact = false,
}: {
    therapist: DbTherapist;
    checkinId?: string;
    compact?: boolean;
}) {
    const router = useRouter();
    const fee = Math.round(therapist.session_fee_inr / 100);
    const initials = therapist.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const handleView = () => {
        const url = checkinId
            ? `/therapists/${therapist.id}?checkin_id=${checkinId}`
            : `/therapists/${therapist.id}`;
        router.push(url);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
            {/* Avatar + name row */}
            <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-300 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {therapist.profile_photo_url ? (
                        <img
                            src={therapist.profile_photo_url}
                            alt={therapist.full_name}
                            className="w-14 h-14 rounded-2xl object-cover"
                        />
                    ) : (
                        <span className="text-white font-bold text-lg">{initials}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {therapist.full_name}
                    </p>
                    {therapist.tagline && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {therapist.tagline}
                        </p>
                    )}
                    {therapist.years_experience && (
                        <p className="text-xs text-teal-600 mt-1">
                            {therapist.years_experience} yrs experience
                        </p>
                    )}
                </div>
            </div>

            {/* Specialities */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {therapist.specialities.slice(0, compact ? 2 : 3).map((s) => (
                    <span
                        key={s}
                        className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2.5 py-0.5"
                    >
                        {s.replace(/_/g, ' ')}
                    </span>
                ))}
                {therapist.specialities.length > (compact ? 2 : 3) && (
                    <span className="text-xs text-gray-400 py-0.5">
                        +{therapist.specialities.length - (compact ? 2 : 3)} more
                    </span>
                )}
            </div>

            {/* Languages + modes */}
            {!compact && (
                <div className="flex items-center gap-3 mt-3">
                    <p className="text-xs text-gray-400">
                        🗣 {therapist.languages.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400">
                        📹 {therapist.session_modes.slice(0, 2).join(', ').replace(/_/g, ' ')}
                    </p>
                </div>
            )}

            {/* Fee + CTA */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div>
                    <p className="text-sm font-bold text-gray-900">
                        ₹{fee}
                        <span className="text-xs font-normal text-gray-400"> / session</span>
                    </p>
                    {therapist.intro_session_fee_inr && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                            Intro: ₹{Math.round(therapist.intro_session_fee_inr / 100)}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleView}
                    className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl px-4 py-2 transition-colors"
                >
                    View profile
                </button>
            </div>
        </div>
    );
}