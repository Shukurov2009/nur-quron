import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) return 'Email yoki parol noto‘g‘ri.'
  if (lower.includes('email not confirmed')) return 'Email hali tasdiqlanmagan. Pochtangizdagi tasdiqlash havolasini bosing.'
  if (lower.includes('user already registered')) return 'Bu email allaqachon ro‘yxatdan o‘tgan. Kirish bo‘limidan foydalaning.'
  if (lower.includes('password should be at least')) return 'Parol kamida 6 belgidan iborat bo‘lishi kerak.'
  if (lower.includes('unable to validate email')) return 'Email manzil noto‘g‘ri kiritilgan.'
  if (lower.includes('rate limit')) return 'Juda ko‘p urinish. Birozdan so‘ng qayta harakat qiling.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let alive = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return
        setSession(data.session)
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase sozlanmagan.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? friendlyAuthError(error.message) : null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase sozlanmagan.', needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({ email, password })
    return {
      error: error ? friendlyAuthError(error.message) : null,
      needsConfirmation: !error && !data.session,
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return value
}
