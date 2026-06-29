'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TherapistLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/therapist/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Login failed');

            if (data.mustChangePassword) {
                router.push('/therapist/change-password');
            } else {
                router.push('/therapist/dashboard');
            }
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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Therapist login</h1>
                    <p className="text-sm text-gray-500 mt-1">Access your MindBridge dashboard</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-300 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-300 transition-colors"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                    First time? Use the temporary password from your welcome email.
                </p>
            </div>
        </div>
    );
}