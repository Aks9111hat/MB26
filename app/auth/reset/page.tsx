'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) })

  const onSubmit = async (data: ResetFormData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      toast.error('Could not send reset link', { description: error.message })
      return
    }

    setSentTo(data.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-sage-600" size={32} />
        </div>
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-3">
          Check your inbox
        </h1>
        <p className="text-stone-500 text-sm mb-2">
          We sent a password reset link to
        </p>
        <p className="text-stone-700 font-medium text-sm mb-6">{sentTo}</p>
        <p className="text-stone-400 text-xs mb-8">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <button
            onClick={() => setSent(false)}
            className="text-teal-600 hover:underline"
          >
            try again
          </button>
          .
        </p>
        <Link href="/auth/login">
          <Button variant="secondary" size="md" className="w-full">
            <ArrowLeft size={16} />
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-teal-600 transition-colors mb-6 no-underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
          Reset your password
        </h1>
        <p className="text-stone-500 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
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
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Send reset link
        </Button>
      </form>
    </div>
  )
}
