'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, User, Lock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const signUpSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy to continue',
  }),
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  // After submit: show "check your email" screen instead of redirecting
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { consent: false },
  })

  const onSubmit = async (data: SignUpFormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        // After email verification, callback will create session + redirect to onboarding
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        toast.error('An account with this email already exists.', {
          description: 'Try signing in instead.',
        })
      } else {
        toast.error('Could not create account', { description: error.message })
      }
      return
    }

    // Don't redirect — show "verify your email" screen
    setEmailSentTo(data.email)
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    if (error) {
      toast.error('Google sign-up failed', { description: error.message })
      setGoogleLoading(false)
    }
  }

  // ── "Check your email" screen ─────────────────────────────
  if (emailSentTo) {
    return (
      <div className="animate-fade-up text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-teal-600" size={32} />
        </div>
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-3">
          Check your inbox
        </h1>
        <p className="text-stone-500 text-sm mb-1">
          We sent a confirmation link to
        </p>
        <p className="text-stone-700 font-semibold text-sm mb-4">{emailSentTo}</p>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-left mb-6">
          <p className="text-teal-800 text-sm font-medium mb-2">What happens next:</p>
          <ol className="text-teal-700 text-sm space-y-1.5 list-decimal list-inside">
            <li>Open the email from MindBridge</li>
            <li>Click the confirmation link</li>
            <li>You&apos;ll be taken to set up your profile</li>
          </ol>
        </div>
        <p className="text-stone-400 text-xs mb-6">
          Didn&apos;t receive it? Check your spam folder.{' '}
          <button
            onClick={() => setEmailSentTo(null)}
            className="text-teal-600 hover:underline"
          >
            Try again
          </button>
        </p>
        <Link href="/auth/login">
          <Button variant="secondary" size="md" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  // ── Sign-up form ──────────────────────────────────────────
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
          Create your account
        </h1>
        <p className="text-stone-500 text-sm">Free to start. No credit card required.</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full mb-5"
        onClick={handleGoogleSignUp}
        loading={googleLoading}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-stone-50 px-3 text-stone-400 font-medium">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="Aarav Sharma"
          autoComplete="name"
          leftIcon={<User size={16} />}
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        {/* DPDPA Consent */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-stone-300 accent-teal-500"
                {...register('consent')}
              />
            </div>
            <span className="text-sm text-stone-600 leading-relaxed">
              I agree to MindBridge&apos;s{' '}
              <Link href="/privacy" className="text-teal-600 font-medium hover:underline" target="_blank">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-teal-600 font-medium hover:underline" target="_blank">
                Terms of Service
              </Link>
              . I consent to my data being processed to provide personalised
              wellness support, in accordance with the Digital Personal Data
              Protection Act, 2023.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-2 text-xs text-rose-600 ml-7">{errors.consent.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-stone-400">
        MindBridge is a wellness navigator, not a clinical service.
        <br />
        In crisis? Call{' '}
        <a href="tel:9152987821" className="font-medium">iCall: 9152987821</a>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}