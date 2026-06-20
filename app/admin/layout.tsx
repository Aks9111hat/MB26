import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/safety', label: 'Safety Flags', icon: '🚨' },
    { href: '/admin/therapists', label: 'Therapists', icon: '👥' },
    { href: '/admin/checkins', label: 'Check-ins', icon: '💬' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await db();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('users')
        .select('role, display_name, full_name, email')
        .eq('id', user.id)
        .single();

    console.log('ADMIN CHECK:', { userId: user.id, profile });

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-gray-800">
                    <p className="font-bold text-teal-400 text-sm">MindBridge</p>
                    <p className="text-xs text-gray-500 mt-0.5">Admin console</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-xs text-gray-300 font-medium truncate mt-0.5">
                        {profile.display_name ?? profile.full_name ?? profile.email}
                    </p>
                    <Link
                        href="/dashboard"
                        className="text-xs text-teal-500 hover:text-teal-400 mt-2 block"
                    >
                        ← Back to app
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-56 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
}