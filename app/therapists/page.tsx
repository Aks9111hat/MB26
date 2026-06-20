'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { TherapistCard } from '@/components/therapists/TherapistCard';
import { useTherapistFilters } from '@/hooks/useTherapistFilters';
import type { DbTherapist } from '@/lib/supabase/types';

const ALL_SPECIALITIES = [
    'anxiety', 'burnout', 'work_stress', 'depression', 'relationships',
    'sleep_issues', 'trauma', 'self_esteem', 'grief', 'family_stress',
    'life_transitions', 'anger_management',
];

const ALL_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'];
const ALL_MODES = ['video', 'audio', 'in_person', 'chat'];
const MODE_LABELS: Record<string, string> = {
    video: 'Video', audio: 'Audio', in_person: 'In-person', chat: 'Chat',
};

function FilterPanel({
    filters,
    toggleSpeciality,
    toggleLanguage,
    toggleMode,
    setMaxFee,
    resetFilters,
    activeFilterCount,
    onClose,
}: {
    filters: ReturnType<typeof useTherapistFilters>['filters'];
    toggleSpeciality: (s: string) => void;
    toggleLanguage: (l: string) => void;
    toggleMode: (m: string) => void;
    setMaxFee: (f: number) => void;
    resetFilters: () => void;
    activeFilterCount: number;
    onClose?: () => void;
}) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Filters</p>
                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="text-xs text-teal-600 hover:text-teal-700"
                        >
                            Clear all ({activeFilterCount})
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Max fee */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                    Max fee: ₹{Math.round(filters.maxFee / 100)}
                </p>
                <input
                    type="range"
                    min={50000}
                    max={200000}
                    step={10000}
                    value={filters.maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹500</span>
                    <span>₹2000</span>
                </div>
            </div>

            {/* Session mode */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Session mode</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_MODES.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => toggleMode(mode)}
                            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${filters.sessionModes.includes(mode)
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                }`}
                        >
                            {MODE_LABELS[mode]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Specialities */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Specialities</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_SPECIALITIES.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => toggleSpeciality(spec)}
                            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${filters.specialities.includes(spec)
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                }`}
                        >
                            {spec.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Languages */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Language</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => toggleLanguage(lang)}
                            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${filters.languages.includes(lang)
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TherapistsPage() {
    const [therapists, setTherapists] = useState<DbTherapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const {
        filters, filtered, setSearch, toggleSpeciality,
        toggleLanguage, toggleMode, setMaxFee, resetFilters, activeFilterCount,
    } = useTherapistFilters(therapists);

    useEffect(() => {
        async function load() {
            const res = await fetch('/api/therapists');
            if (res.ok) {
                const data = await res.json();
                setTherapists(data.therapists ?? []);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto">
                    <h1 className="font-bold text-gray-900 text-lg mb-3">Find a therapist</h1>
                    <div className="flex gap-2">
                        {/* Search */}
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-100 transition-all">
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name or speciality..."
                                value={filters.search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                            />
                            {filters.search && (
                                <button onClick={() => setSearch('')}>
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>
                        {/* Filter toggle (mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors lg:hidden ${activeFilterCount > 0
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-white text-gray-600 border-gray-200'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {activeFilterCount > 0 && (
                                <span className="text-xs">{activeFilterCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
                {/* Sidebar filters — desktop */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
                        <FilterPanel
                            filters={filters}
                            toggleSpeciality={toggleSpeciality}
                            toggleLanguage={toggleLanguage}
                            toggleMode={toggleMode}
                            setMaxFee={setMaxFee}
                            resetFilters={resetFilters}
                            activeFilterCount={activeFilterCount}
                        />
                    </div>
                </aside>

                {/* Mobile filter drawer */}
                {showFilters && (
                    <div className="fixed inset-0 z-30 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowFilters(false)}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
                            <FilterPanel
                                filters={filters}
                                toggleSpeciality={toggleSpeciality}
                                toggleLanguage={toggleLanguage}
                                toggleMode={toggleMode}
                                setMaxFee={setMaxFee}
                                resetFilters={resetFilters}
                                activeFilterCount={activeFilterCount}
                                onClose={() => setShowFilters(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Results */}
                <main className="flex-1 min-w-0">
                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {loading
                                ? 'Loading...'
                                : `${filtered.length} therapist${filtered.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 h-48 animate-pulse"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-sm">
                                No therapists match your filters.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-3 text-teal-600 text-sm hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filtered.map((t) => (
                                <TherapistCard key={t.id} therapist={t} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}