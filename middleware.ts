import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/checkin',
  '/results',
  '/therapists',
  '/book',
  '/settings',
]

const ONBOARDING_ROUTE = '/onboarding'
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // --- Unauthenticated: block protected routes ---
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (isProtected && !user) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // --- Unauthenticated: block onboarding ---
  if (pathname.startsWith(ONBOARDING_ROUTE) && !user) {
    return NextResponse.redirect(new URL('/auth/signup', request.url))
  }

  // --- Authenticated: redirect away from auth pages ---
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // --- Admin routes ---
  // const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  // if (isAdminRoute) {
  //   if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  //   const adminIds = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)
  //   if (!adminIds.includes(user.id)) {
  //     return NextResponse.redirect(new URL('/dashboard', request.url))
  //   }
  // }
  // --- Admin routes ---
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  if (isAdminRoute) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
