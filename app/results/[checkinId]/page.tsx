import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { matchTherapists } from '@/lib/recommendations/matcher';
import { WellnessSnapshot } from '@/components/results/WellnessSnapshot';
import { Recommendations } from '@/components/results/Recommendations';
import type { DbCheckIn, CheckInTier } from '@/lib/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
    return createClient();
}

export default async function ResultsPage({
    params,
}: {
    params: { checkinId: string };
}) {
    const supabase = await db();

    // Auth check
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/auth/login');
    }

    // Fetch checkin
    const { data: checkin, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('id', params.checkinId)
        .eq('user_id', user.id)
        .single();

    if (error || !checkin) {
        notFound();
    }

    const typedCheckin = checkin as DbCheckIn;

    // If not complete yet, redirect back to check-in
    if (!typedCheckin.is_complete) {
        redirect('/checkin');
    }

    // Match therapists
    const tier = (typedCheckin.tier ?? 'managing') as CheckInTier;
    const therapists = await matchTherapists(
        typedCheckin.rec_tags ?? [],
        tier
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/40 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-gray-900">Your results</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Based on your check-in with Mia
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="text-xs text-teal-600 font-medium hover:text-teal-700"
                    >
                        Dashboard →
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
                {/* Wellness snapshot */}
                <section>
                    <WellnessSnapshot checkin={typedCheckin} />
                </section>

                {/* Recommendations */}
                <section>
                    <Recommendations
                        therapists={therapists}
                        tier={tier}
                        checkinId={params.checkinId}
                    />
                </section>

                {/* Track progress CTA */}
                <section className="pb-8">
                    <div className="bg-teal-500 rounded-2xl p-5 text-center space-y-3">
                        <p className="font-semibold text-white">Track your progress</p>
                        <p className="text-sm text-teal-100">
                            Log your mood daily and do weekly check-ins to see how you're
                            improving over time.
                        </p>
                        <Link
                            href="/dashboard"
                            className="block bg-white text-teal-600 font-semibold text-sm rounded-xl py-2.5 px-6 hover:bg-teal-50 transition-colors"
                        >
                            Go to my dashboard
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}