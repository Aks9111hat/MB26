'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/provider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// --- Step types ---
type Step = 'name' | 'concerns' | 'age'

const CONCERNS = [
  { id: 'work_stress',      label: 'Work stress',       emoji: '💼' },
  { id: 'anxiety',          label: 'Anxiety',           emoji: '🌀' },
  { id: 'relationships',    label: 'Relationships',     emoji: '🤝' },
  { id: 'sleep',            label: 'Sleep issues',      emoji: '🌙' },
  { id: 'general_wellness', label: 'General wellness',  emoji: '🌱' },
  { id: 'burnout',          label: 'Burnout',           emoji: '🔥' },
  { id: 'grief',            label: 'Grief or loss',     emoji: '🕊️' },
  { id: 'self_esteem',      label: 'Self-esteem',       emoji: '💛' },
]

const STEPS: Step[] = ['name', 'concerns', 'age']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { supabaseUser, refreshUser } = useAuth()

  const [currentStep, setCurrentStep] = useState<Step>('name')
  const [displayName, setDisplayName] = useState('')
  const [nameError, setNameError] = useState('')
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [isAdult, setIsAdult] = useState<boolean | null>(null)
  const [ageError, setAgeError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const stepIndex = STEPS.indexOf(currentStep)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  // --- Navigation ---
  const goNext = () => {
    if (currentStep === 'name') {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setNameError('Please enter your name (at least 2 characters)')
        return
      }
      setNameError('')
      setCurrentStep('concerns')
    } else if (currentStep === 'concerns') {
      setCurrentStep('age')
    } else if (currentStep === 'age') {
      handleComplete()
    }
  }

  const goBack = () => {
    if (currentStep === 'concerns') setCurrentStep('name')
    else if (currentStep === 'age') setCurrentStep('concerns')
  }

  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // --- Final submit ---
  const handleComplete = async () => {
    if (isAdult === null) {
      setAgeError('Please confirm your age to continue')
      return
    }
    if (!isAdult) {
      setAgeError('MindBridge is currently available for users 18 and older.')
      return
    }
    setAgeError('')

    if (!supabaseUser) {
      toast.error('Session expired. Please sign in again.')
      router.push('/auth/login')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: displayName.trim(),
          primary_concerns: selectedConcerns,
          onboarding_complete: true,
          consent_given_at: new Date().toISOString(),
          data_processing_consent: true,
        } as never)
        .eq('id', supabaseUser.id)

      if (error) throw error

      await refreshUser()
      toast.success(`Welcome to MindBridge, ${displayName.trim()}! 🌱`)
      router.push('/dashboard')
    } catch (err) {
      toast.error('Something went wrong', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-stone-400 font-medium">
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-xs text-stone-400">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-soft p-8 animate-fade-up">

          {/* --- STEP 1: Name --- */}
          {currentStep === 'name' && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl mb-4">👋</div>
                <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
                  What should we call you?
                </h1>
                <p className="text-stone-500 text-sm">
                  This is how MindBridge will address you. You can change it anytime.
                </p>
              </div>
              <div>
                <Input
                  label="Your preferred name"
                  placeholder="e.g. Priya, Arjun, Mehta…"
                  autoFocus
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setNameError('') }}
                  onKeyDown={e => e.key === 'Enter' && goNext()}
                  error={nameError}
                />
              </div>
            </div>
          )}

          {/* --- STEP 2: Concerns --- */}
          {currentStep === 'concerns' && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl mb-4">🌿</div>
                <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
                  What brings you here{displayName ? `, ${displayName}` : ''}?
                </h1>
                <p className="text-stone-500 text-sm">
                  Select everything that feels relevant. This helps us personalise your experience.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CONCERNS.map(concern => {
                  const selected = selectedConcerns.includes(concern.id)
                  return (
                    <button
                      key={concern.id}
                      type="button"
                      onClick={() => toggleConcern(concern.id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-150',
                        selected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-200 hover:bg-white'
                      )}
                    >
                      <span className="text-xl">{concern.emoji}</span>
                      <span className="text-sm font-medium leading-tight">{concern.label}</span>
                      {selected && (
                        <Check size={14} className="ml-auto text-teal-500 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedConcerns.length === 0 && (
                <p className="text-xs text-stone-400 text-center">
                  Select at least one, or skip — you can always update this later.
                </p>
              )}
            </div>
          )}

          {/* --- STEP 3: Age --- */}
          {currentStep === 'age' && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl mb-4">🔐</div>
                <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
                  One quick check
                </h1>
                <p className="text-stone-500 text-sm">
                  MindBridge is currently available for adults 18 and older.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: true,  label: 'Yes, I am 18 or older', emoji: '✓' },
                  { value: false, label: 'No, I am under 18',     emoji: '✗' },
                ].map(option => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => { setIsAdult(option.value); setAgeError('') }}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150',
                      isAdult === option.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-stone-100 bg-stone-50 hover:border-stone-200 hover:bg-white'
                    )}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isAdult === option.value ? 'bg-teal-500 text-white' : 'bg-stone-200 text-stone-500'
                    )}>
                      {option.emoji}
                    </span>
                    <span className={cn(
                      'font-medium text-sm',
                      isAdult === option.value ? 'text-teal-700' : 'text-stone-600'
                    )}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {ageError && (
                <div className={cn(
                  'rounded-xl p-4 text-sm',
                  isAdult === false
                    ? 'bg-amber-50 border border-amber-100 text-amber-700'
                    : 'bg-rose-50 border border-rose-100 text-rose-600'
                )}>
                  {ageError}
                  {isAdult === false && (
                    <p className="mt-1 text-xs text-amber-600">
                      If you need urgent support, please call iCall:{' '}
                      <a href="tel:9152987821" className="font-semibold">9152987821</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className={cn(
            'flex gap-3 mt-8',
            stepIndex > 0 ? 'justify-between' : 'justify-end'
          )}>
            {stepIndex > 0 && (
              <Button variant="ghost" size="md" onClick={goBack} type="button">
                <ArrowLeft size={16} />
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={goNext}
              loading={submitting}
              type="button"
              className="ml-auto"
            >
              {currentStep === 'age' ? 'Enter MindBridge' : 'Continue'}
              {currentStep !== 'age' && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Your data is private, encrypted, and never sold.
        </p>
      </div>
    </div>
  )
}
