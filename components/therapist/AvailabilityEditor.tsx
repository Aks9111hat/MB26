'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

type Slots = Record<string, string[]>;

function sortTimes(times: string[]): string[] {
    return [...times].sort();
}

export function AvailabilityEditor() {
    const [slots, setSlots] = useState<Slots>({});
    const [acceptingClients, setAcceptingClients] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTimeByDay, setNewTimeByDay] = useState<Record<string, string>>({});
    const [savedMsg, setSavedMsg] = useState(false);

    useEffect(() => {
        fetch('/api/therapist/availability')
            .then((r) => r.json())
            .then((d) => {
                setSlots(d.availability_slots ?? {});
                setAcceptingClients(d.is_taking_new_clients ?? true);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const addSlot = (day: string) => {
        const time = newTimeByDay[day];
        if (!time) return;
        setSlots((prev) => {
            const existing = prev[day] ?? [];
            if (existing.includes(time)) return prev;
            return { ...prev, [day]: sortTimes([...existing, time]) };
        });
        setNewTimeByDay((prev) => ({ ...prev, [day]: '' }));
    };

    const removeSlot = (day: string, time: string) => {
        setSlots((prev) => ({
            ...prev,
            [day]: (prev[day] ?? []).filter((t) => t !== time),
        }));
    };

    const copyToAllWeekdays = (day: string) => {
        const source = slots[day] ?? [];
        setSlots((prev) => {
            const updated = { ...prev };
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((d) => {
                updated[d] = [...source];
            });
            return updated;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSavedMsg(false);
        try {
            const res = await fetch('/api/therapist/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    availability_slots: slots,
                    is_taking_new_clients: acceptingClients,
                }),
            });
            if (res.ok) {
                setSavedMsg(true);
                setTimeout(() => setSavedMsg(false), 3000);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-gray-900 text-sm">Weekly availability</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Set the times you're available each day
                    </p>
                </div>
                {savedMsg && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>
                )}
            </div>

            {/* Accepting clients toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                    <p className="text-sm text-gray-800 font-medium">Accepting new clients</p>
                    <p className="text-xs text-gray-400">Turn off to pause new bookings temporarily</p>
                </div>
                <button
                    onClick={() => setAcceptingClients(!acceptingClients)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${acceptingClients ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                >
                    <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${acceptingClients ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                    />
                </button>
            </div>

            {/* Days */}
            <div className="space-y-3">
                {DAYS.map(({ key, label }) => {
                    const daySlots = slots[key] ?? [];
                    return (
                        <div key={key} className="border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-800">{label}</p>
                                {daySlots.length > 0 && (
                                    <button
                                        onClick={() => copyToAllWeekdays(key)}
                                        className="text-xs text-teal-600 hover:text-teal-700"
                                    >
                                        Copy to weekdays
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {daySlots.length === 0 ? (
                                    <span className="text-xs text-gray-300">No slots set</span>
                                ) : (
                                    daySlots.map((time) => (
                                        <span
                                            key={time}
                                            className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2.5 py-1"
                                        >
                                            {time}
                                            <button onClick={() => removeSlot(key, time)}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={newTimeByDay[key] ?? ''}
                                    onChange={(e) =>
                                        setNewTimeByDay((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300"
                                />
                                <button
                                    onClick={() => addSlot(key)}
                                    disabled={!newTimeByDay[key]}
                                    className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 rounded-lg px-2.5 py-1.5 transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
            >
                {saving ? 'Saving...' : 'Save availability'}
            </button>
        </div>
    );
}