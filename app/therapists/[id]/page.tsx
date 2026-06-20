import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { DbTherapist, DbCheckIn } from '@/lib/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

const MODE_LABELS: Record<string, string> = {
    video: '📹 Video', audio: '🎙 Audio',
    in_person: '🏢 In-person', chat: '💬 Chat',
};

function InfoChip({ label }: { label: string }) {
    return (
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
            {label}
        </span>
    );
}

function MatchSection({
    checkin,
    therapist,
}: {
    checkin: DbCheckIn;
    therapist: DbTherapist;
}) {
    const matchingTags = (checkin.rec_tags ?? []).filter((tag) =>
        therapist.specialities.includes(tag)
    );

    if (matchingTags.length === 0) return null;

    return (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                ✨ Why we matched you
            </p>
            <p className="text-sm text-gray-700 mb-3">
                Based on your check-in, {therapist.full_name.split(' ')[0]} specialises
                in areas that match what you shared with Mia:
            </p>
            <div className="flex flex-wrap gap-2">
                {matchingTags.map((tag) => (
                    <span
                        key={tag}
                        className="text-xs bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-3 py-1 font-medium"
                    >
                        {tag.replace(/_/g, ' ')}
                    </span>
                ))}
            </div>
        </div>
    );
}

function AvailabilityPreview({ slots }: { slots: unknown }) {
    if (!slots || typeof slots !== 'object') return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const slotsObj = slots as Record<string, string[]>;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">
                Typical availability
            </p>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const dayKey = day.toLowerCase();
                    const hasSlots = slotsObj[dayKey] && slotsObj[dayKey].length > 0;
                    return (
                        <div key={day} className="text-center">
                            <p className="text-xs text-gray-400 mb-1.5">{day}</p>
                            <div
                                className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs ${hasSlots
                                        ? 'bg-teal-100 text-teal-700 font-medium'
                                        : 'bg-gray-50 text-gray-300'
                                    }`}
                            >
                                {hasSlots ? slotsObj[dayKey].length : '–'}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
                Numbers show available slots per day
            </p>
        </div>
    );
}

export default async function TherapistProfilePage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { checkin_id?: string };
}) {
    const supabase = await db();

    const { data: therapist, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !therapist) notFound();

    const t = therapist as DbTherapist;
    const fee = Math.round(t.session_fee_inr / 100);
    const introFee = t.intro_session_fee_inr
        ? Math.round(t.intro_session_fee_inr / 100)
        : null;

    const initials = t.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    // Fetch checkin for "why matched" section
    let checkin: DbCheckIn | null = null;
    if (searchParams.checkin_id) {
        const { data } = await supabase
            .from('checkins')
            .select('rec_tags')
            .eq('id', searchParams.checkin_id)
            .single();
        checkin = data as DbCheckIn | null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back nav */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <Link
                        href="/therapists"
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← All therapists
                    </Link>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
                {/* Hero card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-300 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            {t.profile_photo_url ? (
                                <img
                                    src={t.profile_photo_url}
                                    alt={t.full_name}
                                    className="w-20 h-20 rounded-2xl object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-2xl">{initials}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">
                                {t.full_name}
                            </h1>
                            {t.tagline && (
                                <p className="text-sm text-gray-500 mt-1">{t.tagline}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                {t.years_experience && (
                                    <span className="text-xs text-teal-600 font-medium">
                                        {t.years_experience} yrs exp
                                    </span>
                                )}
                                <span className="text-xs text-gray-300">·</span>
                                <span className="text-xs text-gray-500">
                                    {t.verification_status === 'verified' ? '✓ Verified' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-xs text-gray-400">Session fee</p>
                            <p className="font-bold text-gray-900">₹{fee}</p>
                        </div>
                        {introFee && (
                            <>
                                <div className="w-px h-8 bg-gray-100" />
                                <div>
                                    <p className="text-xs text-gray-400">Intro session</p>
                                    <p className="font-bold text-emerald-600">₹{introFee}</p>
                                </div>
                            </>
                        )}
                        <div className="w-px h-8 bg-gray-100" />
                        <div>
                            <p className="text-xs text-gray-400">Duration</p>
                            <p className="font-bold text-gray-900">
                                {t.session_duration_mins} min
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why matched */}
                {checkin && <MatchSection checkin={checkin} therapist={t} />}

                {/* Bio */}
                {t.bio && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-900 mb-2">About</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{t.bio}</p>
                    </div>
                )}

                {/* Specialities + approaches */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                            Specialises in
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {t.specialities.map((s) => (
                                <span
                                    key={s}
                                    className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-3 py-1"
                                >
                                    {s.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>

                    {t.therapeutic_approaches.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                Approaches
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {t.therapeutic_approaches.map((a) => (
                                    <InfoChip key={a} label={a.replace(/_/g, ' ')} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Languages + modes */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                Languages
                            </p>
                            <div className="space-y-1">
                                {t.languages.map((l) => (
                                    <p key={l} className="text-sm text-gray-600">
                                        {l}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                Session modes
                            </p>
                            <div className="space-y-1">
                                {t.session_modes.map((m) => (
                                    <p key={m} className="text-sm text-gray-600">
                                        {MODE_LABELS[m] ?? m}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Availability */}
                <AvailabilityPreview slots={t.availability_slots} />

                {/* CTA */}
                <div className="pb-8">
                    <Link
                        href={`/book/${t.id}`}
                        className="block w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold text-center rounded-2xl py-4 transition-colors shadow-sm"
                    >
                        Book a session with {t.full_name.split(' ')[0]}
                    </Link>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        You won't be charged until the session is confirmed
                    </p>
                </div>
            </div>
        </div>
    );
}