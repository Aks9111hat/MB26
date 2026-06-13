'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { DbUser } from '@/lib/supabase/types'

interface AuthContextType {
  supabaseUser: SupabaseUser | null
  user: DbUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
  refreshUser: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<DbUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchUserProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single()
    if (data) setUser(data as DbUser)
  }, [supabase])

  const refreshUser = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser()
    if (sbUser) await fetchUserProfile(sbUser.id)
  }, [supabase, fetchUserProfile])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setSupabaseUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ supabaseUser, user, session, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
