import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase sometimes sends errors back via URL params
  if (error) {
    console.error('[auth/callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? error)}`
    )
  }

  if (!code) {
    console.error('[auth/callback] No code in URL')
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange the one-time code for a real session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  // Session is now created. Check if user needs onboarding.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
  }

  // Look up the user's profile to check onboarding status
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist yet (trigger delay), create it
  if (!profile) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    } as never)
    // New user always goes to onboarding
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Existing user — respect the `next` param unless they need onboarding
  if (!profile.onboarding_complete) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}