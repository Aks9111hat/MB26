'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, Search, Calendar, ChevronRight, Sparkles,
} from 'lucide-react';
import { MoodLogger } from '@/components/mood/MoodLogger';
import { MoodChart } from '@/components/mood/MoodChart';
import { UpcomingBooking } from '@/components/bookings/UpcomingBooking';
import type { DbMoodEntry, DbBooking, CheckInTier } from '@/lib/supabase/types';

interface CheckInSummary {
  id: string;
  tier: CheckInTier;
  snapshot_text: string | null;
  created_at: string;
  total_score: number | null;
  rec_tags: string[];
}

interface DashboardData {
  latestCheckin: CheckInSummary | null;
  upcomingBooking: DbBooking | null;
  moodLast7Days: DbMoodEntry[];
  todayMood: DbMoodEntry | null;
  profile: { display_name: string | null; full_name: string | null; tier: string } | null;
}

const TIER_CONFIG: Record<CheckInTier, { label: string; emoji: string; badge: string }> = {
  thriving: { label: 'Thriving', emoji: '🌱', badge: 'bg-emerald-100 text-emerald-700' },
  managing: { label: 'Managing', emoji: '🌤️', badge: 'bg-amber-100 text-amber-700' },
  struggling: { label: 'Going through it', emoji: '🌧️', badge: 'bg-rose-100 text-rose-700' },
};

function getGreeting(name: string): string {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${time}, ${name} 👋`;
}

function QuickLinkCard({
  icon, label, href, color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${color} transition-all hover:shadow-sm`}
    >
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (r.status === 401) {
          router.push('/auth/login');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleMoodLogged = (entry: DbMoodEntry) => {
    setData((prev) =>
      prev ? { ...prev, todayMood: entry } : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-100 animate-pulse mx-auto" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const name =
    data?.profile?.display_name ||
    data?.profile?.full_name?.split(' ')[0] ||
    'there';

  const checkin = data?.latestCheckin;
  const tierConfig = checkin?.tier ? TIER_CONFIG[checkin.tier] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{getGreeting(name)}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {name[0]?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Check-in CTA */}
          <button
            onClick={() => router.push('/checkin')}
            className="mt-4 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl p-4 text-left transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">How are you feeling today?</p>
                <p className="text-teal-100 text-xs mt-0.5">
                  Take your 5-minute check-in with Mia
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Mood logger */}
        <MoodLogger
          todayMood={data?.todayMood ?? null}
          onLogged={handleMoodLogged}
        />

        {/* Last check-in summary */}
        {checkin && tierConfig && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Last check-in</p>
              <Link
                href={`/results/${checkin.id}`}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                View results →
              </Link>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tierConfig.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tierConfig.badge}`}>
                    {tierConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(checkin.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>
                {checkin.snapshot_text && (
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {checkin.snapshot_text}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No check-in yet */}
        {!checkin && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <p className="text-sm font-medium text-teal-800">
              You haven't done a check-in yet
            </p>
            <p className="text-xs text-teal-600 mt-1">
              Start your first check-in to get matched with the right support.
            </p>
            <button
              onClick={() => router.push('/checkin')}
              className="mt-3 text-xs bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors"
            >
              Start check-in
            </button>
          </div>
        )}

        {/* Upcoming booking */}
        {data?.upcomingBooking && (
          <UpcomingBooking booking={data.upcomingBooking} />
        )}

        {/* Mood chart */}
        {(data?.moodLast7Days?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Mood this week</p>
              <span className="text-xs text-gray-400">7 days</span>
            </div>
            <MoodChart entries={data?.moodLast7Days ?? []} />
          </div>
        )}

        {/* No mood entries yet */}
        {(data?.moodLast7Days?.length ?? 0) === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-1">Mood this week</p>
            <p className="text-xs text-gray-400">
              Log your mood daily to see your patterns here.
            </p>
          </div>
        )}

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Quick actions</p>
          <div className="grid grid-cols-3 gap-3">
            <QuickLinkCard
              href="/checkin"
              label="Start check-in"
              color="bg-teal-50 border-teal-100"
              icon={<Heart className="w-5 h-5 text-teal-500" />}
            />
            <QuickLinkCard
              href="/therapists"
              label="Find therapist"
              color="bg-blue-50 border-blue-100"
              icon={<Search className="w-5 h-5 text-blue-500" />}
            />
            <QuickLinkCard
              href="/bookings"
              label="My bookings"
              color="bg-purple-50 border-purple-100"
              icon={<Calendar className="w-5 h-5 text-purple-500" />}
            />
          </div>
        </div>

        {/* Bookings page placeholder link */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <Link
            href="/bookings"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">My bookings</p>
              <p className="text-xs text-gray-400 mt-0.5">
                View all your upcoming and past sessions
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}