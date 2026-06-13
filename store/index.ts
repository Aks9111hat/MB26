import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CheckIn, MoodEntry } from '@/types'

// --- Auth Store ---
interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// --- Check-in Store ---
interface CheckInMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface CheckInStore {
  // Active check-in session
  sessionId: string | null
  messages: CheckInMessage[]
  isStreaming: boolean
  isComplete: boolean
  questionCount: number

  // Actions
  startSession: (sessionId: string) => void
  addMessage: (message: CheckInMessage) => void
  setStreaming: (streaming: boolean) => void
  updateLastMessage: (content: string) => void
  completeSession: () => void
  resetSession: () => void
  incrementQuestion: () => void
}

export const useCheckInStore = create<CheckInStore>((set) => ({
  sessionId: null,
  messages: [],
  isStreaming: false,
  isComplete: false,
  questionCount: 0,

  startSession: (sessionId) =>
    set({ sessionId, messages: [], isStreaming: false, isComplete: false, questionCount: 0 }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        messages[messages.length - 1] = { ...messages[messages.length - 1], content }
      }
      return { messages }
    }),

  completeSession: () => set({ isComplete: true, isStreaming: false }),

  resetSession: () =>
    set({ sessionId: null, messages: [], isStreaming: false, isComplete: false, questionCount: 0 }),

  incrementQuestion: () =>
    set((state) => ({ questionCount: state.questionCount + 1 })),
}))

// --- Dashboard Store ---
interface DashboardStore {
  todayMoodLogged: boolean
  latestCheckIn: CheckIn | null
  setTodayMoodLogged: (logged: boolean) => void
  setLatestCheckIn: (checkin: CheckIn | null) => void
}

export const useDashboardStore = create(
  persist<DashboardStore>(
    (set) => ({
      todayMoodLogged: false,
      latestCheckIn: null,
      setTodayMoodLogged: (todayMoodLogged) => set({ todayMoodLogged }),
      setLatestCheckIn: (latestCheckIn) => set({ latestCheckIn }),
    }),
    {
      name: 'mindbridge-dashboard',
    }
  )
)

// --- Therapist Filter Store ---
interface TherapistFilterStore {
  searchQuery: string
  selectedSpecialities: string[]
  selectedLanguages: string[]
  priceMax: number
  setSearch: (query: string) => void
  toggleSpeciality: (s: string) => void
  toggleLanguage: (l: string) => void
  setPriceMax: (max: number) => void
  clearFilters: () => void
}

export const useTherapistFilterStore = create<TherapistFilterStore>((set) => ({
  searchQuery: '',
  selectedSpecialities: [],
  selectedLanguages: [],
  priceMax: 500000, // ₹5000 in paisa

  setSearch: (searchQuery) => set({ searchQuery }),

  toggleSpeciality: (s) =>
    set((state) => ({
      selectedSpecialities: state.selectedSpecialities.includes(s)
        ? state.selectedSpecialities.filter((x) => x !== s)
        : [...state.selectedSpecialities, s],
    })),

  toggleLanguage: (l) =>
    set((state) => ({
      selectedLanguages: state.selectedLanguages.includes(l)
        ? state.selectedLanguages.filter((x) => x !== l)
        : [...state.selectedLanguages, l],
    })),

  setPriceMax: (priceMax) => set({ priceMax }),

  clearFilters: () =>
    set({ searchQuery: '', selectedSpecialities: [], selectedLanguages: [], priceMax: 500000 }),
}))
