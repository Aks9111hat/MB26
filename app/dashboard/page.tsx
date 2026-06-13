import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // If onboarding not complete, send there
  if (profile && !(profile as {onboarding_complete:boolean}).onboarding_complete) {
    redirect('/onboarding')
  }

  const displayName = (profile as {display_name:string|null,full_name:string|null}|null)?.display_name || (profile as {display_name:string|null,full_name:string|null}|null)?.full_name || 'there'

  return (
    <main className="min-h-screen bg-gradient-warm p-8">
      <div className="page-container py-8">
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-stone-800">
                Welcome, {displayName} 🌱
              </h1>
              <p className="text-stone-400 text-xs">{user.email}</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm">
            Auth system is working. Dashboard UI is coming in Prompt 9.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/checkin', icon: '🧠', label: 'Start check-in', desc: 'Coming in Prompt 5' },
            { href: '/therapists', icon: '👩‍⚕️', label: 'Find a therapist', desc: 'Coming in Prompt 7' },
            { href: '/settings', icon: '⚙️', label: 'Settings', desc: 'Coming in Prompt 11' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="card-hover flex flex-col items-center text-center p-6 no-underline">
              <span className="text-3xl mb-3">{item.icon}</span>
              <span className="font-medium text-stone-700 text-sm">{item.label}</span>
              <span className="text-xs text-stone-400 mt-1">{item.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
