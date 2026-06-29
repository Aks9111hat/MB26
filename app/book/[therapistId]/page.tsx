'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBooking } from '@/hooks/useBooking';
import type { DbTherapist } from '@/lib/supabase/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const MODE_LABELS: Record<string, string> = {
    video: '📹 Video call',
    audio: '🎙 Audio call',
    in_person: '🏢 In-person',
    chat: '💬 Chat',
};

// ─── Calendar component ───────────────────────────────────────────────────────

function SimpleCalendar({
    selectedDate,
    onSelectDate,
    availableDates,
}: {
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
    availableDates: Set<string>;
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <p className="font-semibold text-gray-900 text-sm">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </p>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;

                    const dateStr = formatDate(viewYear, viewMonth, day);
                    const isPast = dateStr < todayStr;
                    const isAvailable = availableDates.has(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;

                    return (
                        <button
                            key={dateStr}
                            disabled={isPast || !isAvailable}
                            onClick={() => onSelectDate(dateStr)}
                            className={`
                aspect-square rounded-xl text-xs font-medium transition-all
                ${isSelected ? 'bg-teal-500 text-white shadow-sm' : ''}
                ${isToday && !isSelected ? 'border border-teal-300 text-teal-600' : ''}
                ${isAvailable && !isSelected && !isPast ? 'hover:bg-teal-50 text-gray-700' : ''}
                ${isPast || !isAvailable ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── ICS file generator ───────────────────────────────────────────────────────

function generateICS(
    therapistName: string,
    start: string,
    end: string,
    mode: string
): string {
    const fmt = (d: Date) =>
        d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MindBridge//EN',
        'BEGIN:VEVENT',
        `DTSTART:${fmt(new Date(start))}`,
        `DTEND:${fmt(new Date(end))}`,
        `SUMMARY:Therapy session with ${therapistName}`,
        `DESCRIPTION:MindBridge therapy session - ${mode.replace(/_/g, ' ')}`,
        `STATUS:TENTATIVE`,
        'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const therapistId = params.therapistId as string;

    const [therapist, setTherapist] = useState<DbTherapist | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const {
        step, form, isSubmitting, result, error,
        setSlot, setSessionMode, setNotes,
        goToStep2, goBack, submitBooking,
    } = useBooking();

    // Load therapist + user
    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const [{ data: { user } }, therapistRes, bookedRes] = await Promise.all([
                supabase.auth.getUser(),
                fetch(`/api/therapists/${therapistId}`),
                fetch(`/api/therapists/${therapistId}/booked-slots`),
            ]);

            if (bookedRes.ok) {
                const bookedData = await bookedRes.json();
                setBookedTimes(new Set(bookedData.bookedSlots as string[]));
            }

            if (user) {
                setUserEmail(user.email ?? '');
                const { data: profile } = await supabase
                    .from('users')
                    .select('display_name, full_name')
                    .eq('id', user.id)
                    .single();
                const p = profile as { display_name?: string; full_name?: string } | null;
                setUserName(p?.display_name ?? p?.full_name ?? '');
            }

            if (therapistRes.ok) {
                const data = await therapistRes.json();
                setTherapist(data.therapist);
                console.log('availability_slots:', JSON.stringify(data.therapist?.availability_slots, null, 2)); // TBD
            }


            setLoading(false);
        }
        load();
    }, [therapistId]);

    // Parse availability slots from JSONB
    const availabilitySlots = (therapist?.availability_slots ?? {}) as Record<string, string[]>;

    // // Build a set of available dates (next 30 days)
    // const availableDates = new Set<string>();
    // const today = new Date();
    // for (let i = 0; i < 30; i++) {
    //     const d = new Date(today);
    //     d.setDate(today.getDate() + i);
    //     const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    //     const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
    //     if (availabilitySlots[dayName]?.length > 0) {
    //         availableDates.add(dateStr);
    //     }
    // }

    const availableDates = new Set<string>();
    const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayFull = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();   // monday
        const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // mon
        const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
        if (
            (availabilitySlots[dayFull] && availabilitySlots[dayFull].length > 0) ||
            (availabilitySlots[dayShort] && availabilitySlots[dayShort].length > 0)
        ) {
            availableDates.add(dateStr);
        }
    }

      
    // Get time slots for selected date, filtering out already-booked times
    const timeSlotsForDate: string[] = (() => {
        if (!selectedDate) return [];
        const d = new Date(selectedDate + 'T00:00:00');
        const dayFull = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        const allSlots: string[] = availabilitySlots[dayFull] ?? availabilitySlots[dayShort] ?? [];

        return allSlots.filter((time) => {
            const slotISO = new Date(`${selectedDate}T${time}:00+05:30`).toISOString();
            return !bookedTimes.has(slotISO);
        });
    })();

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        if (selectedDate) {
            const d = new Date(selectedDate);
            const displayDate = d.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
            });
            const [h, m] = time.split(':');
            const t = new Date();
            t.setHours(Number(h), Number(m));
            const displayTime = t.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', hour12: true,
            });
            setSlot({ date: selectedDate, time, displayDate, displayTime });
        }
    };

    const handleDownloadICS = () => {
        if (!result || !therapist) return;
        const end = new Date(
            new Date(result.scheduledStart).getTime() +
            therapist.session_duration_mins * 60 * 1000
        ).toISOString();
        const ics = generateICS(therapist.full_name, result.scheduledStart, end, form.sessionMode);
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindbridge-session.ics';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-teal-100 animate-pulse" />
            </div>
        );
    }

    if (!therapist) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Therapist not found.</p>
            </div>
        );
    }

    const fee = Math.round(therapist.session_fee_inr / 100);
    const initials = therapist.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    {step === 1 ? (
                        <Link href={`/therapists/${therapistId}`} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                    ) : step === 2 ? (
                        <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back
                        </button>
                    ) : null}
                    <p className="font-semibold text-gray-900 text-sm">
                        {step === 1 ? 'Choose a time' : step === 2 ? 'Confirm booking' : 'Booking confirmed'}
                    </p>
                </div>
            </div>

            {/* Step indicators */}
            {step < 3 && (
                <div className="bg-white border-b border-gray-100 px-4 py-2">
                    <div className="max-w-lg mx-auto flex items-center gap-2">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step > s ? <Check className="w-3 h-3" /> : s}
                                </div>
                                <span className={`text-xs ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {s === 1 ? 'Select time' : 'Confirm'}
                                </span>
                                {s < 2 && <div className="w-8 h-px bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
                {/* Therapist mini-header */}
                {step < 3 && (
                    <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-300 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">{initials}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{therapist.full_name}</p>
                            <p className="text-xs text-gray-500">₹{fee} · {therapist.session_duration_mins} min</p>
                        </div>
                    </div>
                )}

                {/* ── STEP 1: Date + Time ── */}
                {step === 1 && (
                    <div className="space-y-5">
                        {/* Session mode */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-3">Session mode</p>
                            <div className="grid grid-cols-2 gap-2">
                                {therapist.session_modes.map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setSessionMode(mode)}
                                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors text-left ${form.sessionMode === mode
                                            ? 'bg-teal-500 text-white border-teal-500'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        {MODE_LABELS[mode] ?? mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calendar */}
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-3 px-1">Select a date</p>
                            <SimpleCalendar
                                selectedDate={selectedDate}
                                onSelectDate={handleDateSelect}
                                availableDates={availableDates}
                            />
                        </div>

                        {/* Time slots */}
                        {selectedDate && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <p className="text-sm font-semibold text-gray-900 mb-3">
                                    Available times
                                </p>
                                {timeSlotsForDate.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        No slots available for this date
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlotsForDate.map((time) => {
                                            const [h, m] = time.split(':');
                                            const t = new Date();
                                            t.setHours(Number(h), Number(m));
                                            const display = t.toLocaleTimeString('en-IN', {
                                                hour: '2-digit', minute: '2-digit', hour12: true,
                                            });
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => handleTimeSelect(time)}
                                                    className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${selectedTime === time
                                                        ? 'bg-teal-500 text-white border-teal-500'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                                                        }`}
                                                >
                                                    {display}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Next CTA */}
                        <button
                            onClick={goToStep2}
                            disabled={!form.slot}
                            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl py-4 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* ── STEP 2: Confirm ── */}
                {step === 2 && form.slot && (
                    <div className="space-y-5">
                        {/* Booking summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Session details</p>
                            {[
                                { label: 'Date', value: form.slot.displayDate },
                                { label: 'Time', value: form.slot.displayTime },
                                { label: 'Mode', value: MODE_LABELS[form.sessionMode] ?? form.sessionMode },
                                { label: 'Duration', value: `${therapist.session_duration_mins} minutes` },
                                { label: 'Fee', value: `₹${fee}` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-medium text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* User details */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                            <p className="text-sm font-semibold text-gray-900">Your details</p>
                            <div className="space-y-2">
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-400">Name</p>
                                    <p className="text-sm text-gray-800 font-medium">{userName || 'Not set'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-sm text-gray-800 font-medium">{userEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                Notes for {therapist.full_name.split(' ')[0]}
                                <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                            </p>
                            <textarea
                                value={form.notesForTherapist}
                                onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                                placeholder="Anything you'd like them to know before the session..."
                                rows={3}
                                className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 outline-none resize-none border border-gray-100 focus:border-teal-300 transition-colors placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-400 text-right mt-1">
                                {form.notesForTherapist.length}/200
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={() => submitBooking(therapistId)}
                            disabled={isSubmitting}
                            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-2xl py-4 transition-colors"
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm booking'}
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                            Payment will be collected after the therapist confirms your session
                        </p>
                    </div>
                )}

                {/* ── STEP 3: Confirmed ── */}
                {step === 3 && result && (
                    <div className="space-y-5 text-center">
                        {/* Success icon */}
                        <div className="pt-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Booking confirmed!</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                We've notified {therapist.full_name.split(' ')[0]} about your session.
                            </p>
                        </div>

                        {/* Session card */}
                        {form.slot && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-left space-y-3">
                                {[
                                    { label: 'Therapist', value: therapist.full_name },
                                    { label: 'Date', value: form.slot.displayDate },
                                    { label: 'Time', value: form.slot.displayTime },
                                    { label: 'Mode', value: MODE_LABELS[form.sessionMode] },
                                    { label: 'Status', value: '⏳ Pending confirmation' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-sm text-gray-500">{label}</span>
                                        <span className="text-sm font-medium text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3 pb-8">
                            <button
                                onClick={handleDownloadICS}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-medium rounded-2xl py-3.5 transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                Add to calendar
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl py-3.5 transition-colors"
                            >
                                Back to dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}