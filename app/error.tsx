'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/40 to-white flex items-center justify-center px-4">
            <div className="max-w-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                    <span className="text-3xl">😕</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Something went wrong
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        We hit a small snag on our end. It's not you — try again in a moment.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={reset}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl py-3 transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-600 font-medium rounded-xl py-3 transition-colors"
                    >
                        Back to dashboard
                    </Link>
                </div>
                <p className="text-xs text-gray-400">
                    If this keeps happening, contact us at support@mindbridge.app
                </p>
            </div>
        </div>
    );
}