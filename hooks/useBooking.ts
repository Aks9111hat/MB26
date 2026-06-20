'use client';

import { useState } from 'react';

export type BookingStep = 1 | 2 | 3;

export interface BookingSlot {
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    displayDate: string;
    displayTime: string;
}

export interface BookingFormData {
    slot: BookingSlot | null;
    sessionMode: string;
    notesForTherapist: string;
}

export interface BookingResult {
    bookingId: string;
    scheduledStart: string;
}

const DEFAULT_FORM: BookingFormData = {
    slot: null,
    sessionMode: 'video',
    notesForTherapist: '',
};

export function useBooking() {
    const [step, setStep] = useState<BookingStep>(1);
    const [form, setForm] = useState<BookingFormData>(DEFAULT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<BookingResult | null>(null);
    const [error, setError] = useState<string>('');

    const setSlot = (slot: BookingSlot) =>
        setForm((f) => ({ ...f, slot }));

    const setSessionMode = (sessionMode: string) =>
        setForm((f) => ({ ...f, sessionMode }));

    const setNotes = (notesForTherapist: string) =>
        setForm((f) => ({ ...f, notesForTherapist }));

    const goToStep2 = () => {
        if (!form.slot) return;
        setStep(2);
    };

    const goBack = () => setStep(1);

    const submitBooking = async (therapistId: string) => {
        if (!form.slot) return;
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    therapist_id: therapistId,
                    date: form.slot.date,
                    time: form.slot.time,
                    session_mode: form.sessionMode,
                    notes_for_therapist: form.notesForTherapist || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Booking failed');

            setResult({ bookingId: data.booking_id, scheduledStart: data.scheduled_start });
            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step, form, isSubmitting, result, error,
        setSlot, setSessionMode, setNotes,
        goToStep2, goBack, submitBooking,
    };
}