'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  // Show inline error banner for URL-level errors (e.g. from callback)
  const urlError = searchParams.get('error')

  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      const msg = error.message.toLowerCase()

      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        toast.error('Incorrect email or password', {
          description: 'Please check your details and try again.',
        })
      } else if (msg.includes('email not confirmed')) {
        toast.error('Please verify your email first', {
          description: 'Check your inbox for the confirmation link we sent when you signed up.',
          duration: 6000,
        })
      } else {
        toast.error('Sign in failed', { description: error.message })
      }
      return
    }

    // Check if onboarding is complete
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single()

      if (profile && !(profile as { onboarding_complete: boolean }).onboarding_complete) {
        router.push('/onboarding')
        return
      }
    }

    toast.success('Welcome back!')
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })
    if (error) {
      toast.error('Google sign-in failed', { description: error.message })
      setGoogleLoading(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
          Welcome back
        </h1>
        <p className="text-stone-500 text-sm">Sign in to continue your wellness journey.</p>
      </div>

      {/* URL-level error banner (e.g. from callback redirect) */}
      {urlError && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4 mb-5">
          <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{decodeURIComponent(urlError)}</p>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full mb-5"
        onClick={handleGoogleLogin}
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
            or sign in with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            autoComplete="current-password"
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
          <div className="mt-1.5 text-right">
            <Link
              href="/auth/reset"
              className="text-xs text-stone-400 hover:text-teal-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-teal-600 font-medium hover:underline">
          Create one free
        </Link>
      </p>
      <p className="mt-6 text-center text-xs text-stone-400">
        In crisis? Call{' '}
        <a href="tel:9152987821" className="font-medium text-stone-500">
          iCall: 9152987821
        </a>{' '}
        (free, confidential)
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