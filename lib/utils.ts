import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency from paisa to ₹
export function formatINR(paisa: number): string {
  const rupees = paisa / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

// Format date to Indian readable format
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Mood score to label
export function moodScoreToLabel(score: number): string {
  if (score <= 2) return 'Very Low'
  if (score <= 4) return 'Low'
  if (score <= 6) return 'Neutral'
  if (score <= 8) return 'Good'
  return 'Great'
}

// Mood score to emoji
export function moodScoreToEmoji(score: number): string {
  if (score <= 2) return '😔'
  if (score <= 4) return '😕'
  if (score <= 6) return '😐'
  if (score <= 8) return '🙂'
  return '😄'
}

// Domain score (0-2) to label
export function domainScoreToLabel(score: number): 'Low' | 'Fair' | 'Good' {
  if (score === 0) return 'Low'
  if (score === 1) return 'Fair'
  return 'Good'
}

// CheckIn tier to display config
export function getTierConfig(tier: string) {
  switch (tier) {
    case 'thriving':
      return {
        label: 'Thriving',
        color: 'text-sage-700',
        bg: 'bg-sage-50',
        border: 'border-sage-200',
        badge: 'bg-sage-100 text-sage-700',
        emoji: '🌱',
        description: "You're doing well. Keep building on your strengths.",
      }
    case 'managing':
      return {
        label: 'Managing',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        emoji: '☁️',
        description: "You're getting through it. Some extra support could help.",
      }
    case 'struggling':
      return {
        label: 'Finding It Hard',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-700',
        emoji: '🌧️',
        description: "Things feel heavy right now. You don't have to figure this out alone.",
      }
    default:
      return {
        label: 'Check-in Complete',
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        badge: 'bg-teal-100 text-teal-700',
        emoji: '✓',
        description: 'Your check-in has been saved.',
      }
  }
}

// Truncate text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Speciality to readable label
export function formatSpeciality(slug: string): string {
  const map: Record<string, string> = {
    burnout: 'Burnout',
    anxiety: 'Anxiety',
    depression: 'Depression',
    relationships: 'Relationships',
    work_stress: 'Work Stress',
    grief: 'Grief & Loss',
    trauma: 'Trauma',
    sleep: 'Sleep Issues',
    self_esteem: 'Self-Esteem',
    career: 'Career Stress',
    family: 'Family Issues',
    identity: 'Identity',
    general_wellness: 'General Wellness',
  }
  return map[slug] || slug.replace(/_/g, ' ')
}

// Parse assessment JSON from AI response
export function extractAssessmentJSON(text: string): Record<string, unknown> | null {
  try {
    const match = text.match(/<assessment>([\s\S]*?)<\/assessment>/)
    if (match) return JSON.parse(match[1])

    // Fallback: find JSON block
    const jsonMatch = text.match(/\{[\s\S]*"tier"[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])

    return null
  } catch {
    return null
  }
}

// Sleep for async delays
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
