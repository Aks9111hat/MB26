import { Suspense } from 'react'
import LoginPageContent from './LoginContent'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-stone-200 rounded-xl w-3/4" /><div className="h-12 bg-stone-200 rounded-xl" /><div className="h-12 bg-stone-200 rounded-xl" /><div className="h-12 bg-teal-200 rounded-xl" /></div>}>
      <LoginPageContent />
    </Suspense>
  )
}
