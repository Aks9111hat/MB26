'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'];

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [language, setLanguage] = useState('English');
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifReminders, setNotifReminders] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/auth/login'); return; }

            setEmail(user.email ?? '');

            const { data: profile } = await supabase
                .from('users')
                .select('display_name, full_name, preferred_language')
                .eq('id', user.id)
                .single();

            const p = profile as { display_name?: string; full_name?: string; preferred_language?: string } | null;
            setDisplayName(p?.display_name ?? p?.full_name ?? '');
            setLanguage(p?.preferred_language ?? 'English');
            setLoading(false);
        }
        load();
    }, [router]);

    const handleSaveProfile = async () => {
        setSaving(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createClient() as any;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('users')
            .update({ display_name: displayName })
            .eq('id', user.id);

        if (error) {
            toast.error('Failed to save changes');
        } else {
            toast.success('Profile updated');
        }
        setSaving(false);
    };

    const handleDownloadData = async () => {
        toast.loading('Preparing your data...', { id: 'export' });
        try {
            const res = await fetch('/api/account/export');
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mindbridge-my-data.json';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data downloaded', { id: 'export' });
        } catch {
            toast.error('Failed to export data', { id: 'export' });
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch('/api/account/delete', { method: 'POST' });
            if (!res.ok) throw new Error();
            toast.success('Deletion request received');
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/');
        } catch {
            toast.error('Failed to submit deletion request');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-teal-100 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-100 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    <h1 className="font-bold text-gray-900 text-lg">Settings</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
                {/* Profile */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <p className="text-sm font-semibold text-gray-900">Profile</p>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Display name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-300 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                        <input
                            type="text"
                            value={email}
                            disabled
                            className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Preferred language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-teal-300 transition-colors"
                        >
                            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">Email notifications</p>
                            <p className="text-xs text-gray-400">Booking confirmations, weekly summaries</p>
                        </div>
                        <button
                            onClick={() => setNotifEmail(!notifEmail)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${notifEmail ? 'bg-teal-500' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifEmail ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">Check-in reminders</p>
                            <p className="text-xs text-gray-400">Gentle nudges to check in weekly</p>
                        </div>
                        <button
                            onClick={() => setNotifReminders(!notifReminders)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${notifReminders ? 'bg-teal-500' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifReminders ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Your data</p>
                    <p className="text-xs text-gray-500">
                        Under India's DPDP Act, you have the right to access and delete your data.
                    </p>
                    <button
                        onClick={handleDownloadData}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors text-left"
                    >
                        📥 Download my data
                    </button>
                </div>

                {/* Danger zone */}
                <div className="bg-red-50 rounded-2xl border border-red-100 p-5 space-y-3">
                    <p className="text-sm font-semibold text-red-700">Delete account</p>
                    <p className="text-xs text-red-500">
                        This permanently deletes your account and all data within 30 days. This cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Delete my account
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-red-600 font-medium">
                                Are you sure? Type your decision below to confirm.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors"
                                >
                                    {deleting ? 'Processing...' : 'Yes, delete my account'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg px-4 py-2 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pb-8" />
            </div>
        </div>
    );
}