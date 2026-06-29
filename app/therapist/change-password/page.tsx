'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/therapist/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to update password');
            router.push('/therapist/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
            <div className="max-w-sm w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900">Set your password</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        For security, please set a new password before continuing.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">New password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-300 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Confirm password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-300 transition-colors"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
                    >
                        {loading ? 'Saving...' : 'Set password & continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}