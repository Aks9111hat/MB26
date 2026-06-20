'use client';

import { useState, useEffect } from 'react';
import type { DbTherapist } from '@/lib/supabase/types';

const STATUS_COLORS: Record<string, string> = {
    verified: 'bg-emerald-900 text-emerald-400',
    pending: 'bg-amber-900 text-amber-400',
    rejected: 'bg-red-900 text-red-400',
    suspended: 'bg-gray-800 text-gray-500',
};

const DEFAULT_FORM = {
    full_name: '', tagline: '', bio: '',
    session_fee: '', intro_fee: '', years_experience: '',
    session_duration_mins: '50',
    specialities: '', languages: 'English', session_modes: 'video',
    therapeutic_approaches: '', qualification: '',
};

export default function AdminTherapistsPage() {
    const [therapists, setTherapists] = useState<DbTherapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetch('/api/admin/therapists')
            .then((r) => r.json())
            .then((d) => { setTherapists(d.therapists ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleVerify = async (id: string, status: string) => {
        const res = await fetch('/api/admin/therapists', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, verification_status: status }),
        });
        if (res.ok) {
            setTherapists((prev) =>
                prev.map((t) => t.id === id ? { ...t, verification_status: status as DbTherapist['verification_status'] } : t)
            );
        }
    };

    const handleAdd = async () => {
        if (!form.full_name || !form.session_fee) {
            setFormError('Name and session fee are required');
            return;
        }
        setSubmitting(true);
        setFormError('');

        const res = await fetch('/api/admin/therapists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                session_fee: Number(form.session_fee),
                intro_fee: form.intro_fee ? Number(form.intro_fee) : null,
                years_experience: form.years_experience ? Number(form.years_experience) : null,
                session_duration_mins: Number(form.session_duration_mins),
                specialities: form.specialities.split(',').map((s) => s.trim()).filter(Boolean),
                languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
                session_modes: form.session_modes.split(',').map((s) => s.trim()).filter(Boolean),
                therapeutic_approaches: form.therapeutic_approaches.split(',').map((s) => s.trim()).filter(Boolean),
                qualification: form.qualification.split(',').map((s) => s.trim()).filter(Boolean),
            }),
        });

        const data = await res.json();
        if (res.ok) {
            setTherapists((prev) => [data.therapist, ...prev]);
            setShowForm(false);
            setForm(DEFAULT_FORM);
        } else {
            setFormError(data.error ?? 'Failed to add therapist');
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Therapists</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{therapists.length} total</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                    + Add therapist
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                    <p className="text-sm font-semibold text-white">New therapist</p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'full_name', label: 'Full name *', placeholder: 'Dr. Jane Smith' },
                            { key: 'tagline', label: 'Tagline', placeholder: 'Helping you find calm' },
                            { key: 'session_fee', label: 'Session fee (₹) *', placeholder: '800' },
                            { key: 'intro_fee', label: 'Intro fee (₹)', placeholder: '500' },
                            { key: 'years_experience', label: 'Years experience', placeholder: '5' },
                            { key: 'session_duration_mins', label: 'Session duration (min)', placeholder: '50' },
                            { key: 'specialities', label: 'Specialities (comma-sep)', placeholder: 'anxiety, burnout' },
                            { key: 'languages', label: 'Languages (comma-sep)', placeholder: 'English, Hindi' },
                            { key: 'session_modes', label: 'Session modes (comma-sep)', placeholder: 'video, audio' },
                            { key: 'therapeutic_approaches', label: 'Approaches (comma-sep)', placeholder: 'CBT, ACT' },
                            { key: 'qualification', label: 'Qualifications (comma-sep)', placeholder: 'M.Phil, PhD' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className={key === 'bio' ? 'col-span-2' : ''}>
                                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                <input
                                    type="text"
                                    value={form[key as keyof typeof form]}
                                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500 transition-colors"
                                />
                            </div>
                        ))}
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                rows={3}
                                placeholder="Brief professional bio..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-500 transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {formError && <p className="text-xs text-red-400">{formError}</p>}

                    <div className="flex gap-3">
                        <button
                            onClick={handleAdd}
                            disabled={submitting}
                            className="text-sm bg-teal-600 hover:bg-teal-700 disabled:bg-teal-900 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                            {submitting ? 'Adding...' : 'Add therapist'}
                        </button>
                        <button
                            onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); }}
                            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Therapists table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800">
                            {['Name', 'Specialities', 'Fee', 'Status', 'Actions'].map((h) => (
                                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-semibold">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                                    Loading...
                                </td>
                            </tr>
                        ) : therapists.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No therapists yet
                                </td>
                            </tr>
                        ) : (
                            therapists.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{t.full_name}</p>
                                        {t.tagline && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                                                {t.tagline}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-300 text-xs">
                                            {t.specialities.slice(0, 2).join(', ')}
                                            {t.specialities.length > 2 && ` +${t.specialities.length - 2}`}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">
                                        ₹{Math.round(t.session_fee_inr / 100)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[t.verification_status] ?? 'bg-gray-800 text-gray-400'}`}>
                                            {t.verification_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {t.verification_status !== 'verified' && (
                                                <button
                                                    onClick={() => handleVerify(t.id, 'verified')}
                                                    className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-300 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            {t.verification_status !== 'suspended' && (
                                                <button
                                                    onClick={() => handleVerify(t.id, 'suspended')}
                                                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {t.verification_status === 'suspended' && (
                                                <button
                                                    onClick={() => handleVerify(t.id, 'pending')}
                                                    className="text-xs bg-amber-900 hover:bg-amber-800 text-amber-400 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    Reinstate
                                                </button>
                                            )}
                                        </div>
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