'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const updateSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type UpdatePasswordFormData = z.infer<typeof updateSchema>

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({ resolver: zodResolver(updateSchema) })

  const onSubmit = async (data: UpdatePasswordFormData) => {
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error('Could not update password', { description: error.message })
      return
    }

    toast.success('Password updated successfully!')
    router.push('/dashboard')
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">
          Set a new password
        </h1>
        <p className="text-stone-500 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="text-stone-400 hover:text-stone-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Update password
        </Button>
      </form>
    </div>
  )
}
