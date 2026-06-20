'use client';

import { useRouter } from 'next/navigation';
import type { DbTherapist, CheckInTier } from '@/lib/supabase/types';

interface Resource {
    title: string;
    description: string;
    url: string;
    tag: string;
}

const SELF_HELP_RESOURCES: { [key in CheckInTier]: Resource[] } = {
    thriving: [
        {
            title: 'Mindfulness for maintenance',
            description: 'Short daily practices to keep you grounded when things are good.',
            url: 'https://www.headspace.com',
            tag: 'Mindfulness',
        },
        {
            title: 'iCall community',
            description: 'Free peer support groups run by TISS for ongoing wellbeing.',
            url: 'https://icallhelpline.org',
            tag: 'Community',
        },
    ],
    managing: [
        {
            title: 'iCall counselling',
            description: 'Free, trained counsellors available Mon–Sat 8am–10pm.',
            url: 'https://icallhelpline.org',
            tag: 'Free support',
        },
        {
            title: 'Wysa — AI mental health app',
            description: 'Evidence-based CBT exercises and mood tracking in your pocket.',
            url: 'https://www.wysa.io',
            tag: 'Self-help app',
        },
    ],
    struggling: [
        {
            title: 'iCall — free counselling',
            description: 'Call 9152987821 · Mon–Sat · 8am–10pm · Trained counsellors.',
            url: 'https://icallhelpline.org',
            tag: 'Free · Immediate',
        },
        {
            title: 'Vandrevala Foundation',
            description: '24/7 crisis helpline: 1860-2662-345. Free and confidential.',
            url: 'https://www.vandrevalafoundation.com',
            tag: '24/7 Crisis',
        },
    ],
};

function TherapistCard({
    therapist,
    checkinId,
}: {
    therapist: DbTherapist;
    checkinId: string;
}) {
    const router = useRouter();
    const fee = Math.round(therapist.session_fee_inr / 100);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                        {therapist.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                        {therapist.full_name}
                    </p>
                    {therapist.tagline && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {therapist.tagline}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {therapist.specialities.slice(0, 3).map((s) => (
                            <span
                                key={s}
                                className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2 py-0.5"
                            >
                                {s.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        ₹{fee}
                        <span className="text-xs font-normal text-gray-400"> / session</span>
                    </p>
                    {therapist.languages.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            {therapist.languages.slice(0, 2).join(', ')}
                        </p>
                    )}
                </div>
                <button
                    onClick={() =>
                        router.push(`/therapists/${therapist.id}?checkin_id=${checkinId}`)
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl px-4 py-2 transition-colors"
                >
                    Book a session
                </button>
            </div>
        </div>
    );
}

function ResourceCard({ resource }: { resource: Resource }) {
    return (
    <a
        href ={resource.url}
        target="_blank"
    rel = "noopener noreferrer"
    className = "block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-800 text-sm">{resource.title}</p>
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 flex-shrink-0">
          {resource.tag}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
        {resource.description}
      </p>
    </a>
  );
}

export function Recommendations({
    therapists,
    tier,
    checkinId,
}: {
    therapists: DbTherapist[];
    tier: CheckInTier;
    checkinId: string;
}) {
    const resources = SELF_HELP_RESOURCES[tier];

    return (
        <div className="space-y-6">
            {therapists.length > 0 && (
                <div>
                    <div className="mb-3">
                        <p className="font-semibold text-gray-900">Therapists for you</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Matched based on what you shared with Mia
                        </p>
                    </div>
                    <div className="space-y-3">
                        {therapists.map((t) => (
                            <TherapistCard key={t.id} therapist={t} checkinId={checkinId} />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <div className="mb-3">
                    <p className="font-semibold text-gray-900">Other support</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Free resources and tools that can help right now
                    </p>
                </div>
                <div className="space-y-3">
                    {resources.map((r) => (
                        <ResourceCard key={r.title} resource={r} />
                    ))}
                </div>
            </div>
        </div>
    );
}