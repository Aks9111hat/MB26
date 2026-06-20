'use client';

import { useState, useMemo } from 'react';
import type { DbTherapist } from '@/lib/supabase/types';

export interface TherapistFilters {
    search: string;
    specialities: string[];
    languages: string[];
    sessionModes: string[];
    maxFee: number;
}

const DEFAULT_FILTERS: TherapistFilters = {
    search: '',
    specialities: [],
    languages: [],
    sessionModes: [],
    maxFee: 200000, // ₹2000 in paise
};

export function useTherapistFilters(therapists: DbTherapist[]) {
    const [filters, setFilters] = useState<TherapistFilters>(DEFAULT_FILTERS);

    const filtered = useMemo(() => {
        return therapists.filter((t) => {
            // Search by name or speciality
            if (filters.search.trim()) {
                const q = filters.search.toLowerCase();
                const nameMatch = t.full_name.toLowerCase().includes(q);
                const specMatch = t.specialities.some((s) =>
                    s.toLowerCase().includes(q)
                );
                const taglineMatch = t.tagline?.toLowerCase().includes(q) ?? false;
                if (!nameMatch && !specMatch && !taglineMatch) return false;
            }

            // Filter by specialities
            if (filters.specialities.length > 0) {
                const hasSpec = filters.specialities.some((s) =>
                    t.specialities.includes(s)
                );
                if (!hasSpec) return false;
            }

            // Filter by language
            if (filters.languages.length > 0) {
                const hasLang = filters.languages.some((l) =>
                    t.languages.includes(l)
                );
                if (!hasLang) return false;
            }

            // Filter by session mode
            if (filters.sessionModes.length > 0) {
                const hasMode = filters.sessionModes.some((m) =>
                    t.session_modes.includes(m)
                );
                if (!hasMode) return false;
            }

            // Filter by max fee
            if (t.session_fee_inr > filters.maxFee) return false;

            return true;
        });
    }, [therapists, filters]);

    const setSearch = (search: string) =>
        setFilters((f) => ({ ...f, search }));

    const toggleSpeciality = (spec: string) =>
        setFilters((f) => ({
            ...f,
            specialities: f.specialities.includes(spec)
                ? f.specialities.filter((s) => s !== spec)
                : [...f.specialities, spec],
        }));

    const toggleLanguage = (lang: string) =>
        setFilters((f) => ({
            ...f,
            languages: f.languages.includes(lang)
                ? f.languages.filter((l) => l !== lang)
                : [...f.languages, lang],
        }));

    const toggleMode = (mode: string) =>
        setFilters((f) => ({
            ...f,
            sessionModes: f.sessionModes.includes(mode)
                ? f.sessionModes.filter((m) => m !== mode)
                : [...f.sessionModes, mode],
        }));

    const setMaxFee = (maxFee: number) =>
        setFilters((f) => ({ ...f, maxFee }));

    const resetFilters = () => setFilters(DEFAULT_FILTERS);

    const activeFilterCount =
        filters.specialities.length +
        filters.languages.length +
        filters.sessionModes.length +
        (filters.maxFee < DEFAULT_FILTERS.maxFee ? 1 : 0);

    return {
        filters,
        filtered,
        setSearch,
        toggleSpeciality,
        toggleLanguage,
        toggleMode,
        setMaxFee,
        resetFilters,
        activeFilterCount,
    };
}