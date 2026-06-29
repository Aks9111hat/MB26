'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, User, Calendar, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    email: string;
    display_name: string | null;
    full_name: string | null;
}

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();

        async function load() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('display_name, full_name')
                    .eq('id', authUser.id)
                    .single();
                setUser({
                    id: authUser.id,
                    email: authUser.email ?? '',
                    display_name: (profile as { display_name?: string } | null)?.display_name ?? null,
                    full_name: (profile as { full_name?: string } | null)?.full_name ?? null,
                });
            }
            setLoading(false);
        }
        load();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) setUser(null);
            else load();
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Don't show navbar on admin routes (they have their own layout) or checkin chat
    if (pathname?.startsWith('/admin') || pathname === '/checkin') {
        return null;
    }

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        router.push('/');
    };

    const displayName = user?.display_name || user?.full_name?.split(' ')[0] || 'Account';
    const initials = displayName[0]?.toUpperCase() ?? 'U';

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/checkin', label: 'Check-in' },
        { href: '/therapists', label: 'Find Therapist' },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-bold text-gray-900">MindBridge</span>
                    </Link>

                    {/* Desktop nav */}
                    {!loading && user && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                            ? 'text-teal-600 bg-teal-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                        ) : user ? (
                            <>
                                {/* Profile dropdown — desktop */}
                                <div ref={profileRef} className="relative hidden md:block">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{initials}</span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-gray-100 shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-50">
                                                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/bookings"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Calendar className="w-4 h-4" /> My bookings
                                            </Link>
                                            <Link
                                                href="/settings"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" /> Settings
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMobileOpen(true)}
                                    className="md:hidden p-2 text-gray-600"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-colors"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && user && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{initials}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 px-3 py-4 space-y-1">
                            {[...navLinks, { href: '/bookings', label: 'My Bookings' }].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href
                                            ? 'bg-teal-50 text-teal-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/settings"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="w-4 h-4" /> Settings
                            </Link>
                        </nav>

                        <div className="p-3 border-t border-gray-100">
                            <button
                                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}