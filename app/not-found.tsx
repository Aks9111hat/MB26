import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/40 to-white flex items-center justify-center px-4">
            <div className="max-w-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto">
                    <span className="text-3xl">🧭</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Page not found</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        We couldn't find what you're looking for. It may have moved or
                        never existed.
                    </p>
                </div>
                <Link
                    href="/dashboard"
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
                >
                    Back to dashboard
                </Link>
            </div>
        </div>
    );
}