import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export interface CloudState {
  data: Record<string, unknown>
  updated_at?: string
}

export async function pullCloudState(userId: string): Promise<CloudState | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    if (error.code === '42P01') throw new Error('user_state jadvali yaratilmagan')
    throw error
  }
  return data as CloudState | null
}

export async function pushCloudState(userId: string, data: Record<string, unknown>) {
  if (!supabase) return
  const { error } = await supabase.from('user_state').upsert(
    {
      user_id: userId,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) throw error
}
