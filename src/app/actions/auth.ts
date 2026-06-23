'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Helper to check if real Supabase keys are configured
export async function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('your-supabase') && !key.includes('your-supabase'))
}

// Mock user constant for fallback
const DEFAULT_MOCK_USER = {
  id: '3f042e61-689e-4f59-86ad-cbe0c92bf2f0',
  email: 'enthusiast@garagebook.app',
  full_name: 'Enthusiast User',
  avatar_url: null,
  is_pro: false,
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return profile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        is_pro: false,
      }
    } catch (e) {
      console.error('Supabase Auth error, falling back to mock:', e)
    }
  }

  // Fallback Mock mode
  const sessionCookie = cookieStore.get('garagebook_session')
  if (!sessionCookie) return null

  try {
    const session = JSON.parse(sessionCookie.value)
    // Merge with any updated profile info
    const profileCookie = cookieStore.get('garagebook_profile')
    if (profileCookie) {
      const profile = JSON.parse(profileCookie.value)
      return { ...session, ...profile }
    }
    return session
  } catch {
    return null
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      
      const cookieStore = await cookies()
      cookieStore.set('garagebook_logged_in', 'true', { path: '/' })
      
      redirect('/')
    } catch (e) {
      if (e && typeof e === 'object' && 'digest' in e && typeof (e as { digest: unknown }).digest === 'string' && (e as { digest: string }).digest.includes('NEXT_REDIRECT')) throw e
      return { error: e instanceof Error ? e.message : 'Authentication failed' }
    }
  }

  // Fallback Mock Login
  const cookieStore = await cookies()
  const mockUser = {
    ...DEFAULT_MOCK_USER,
    email: email,
    full_name: email.split('@')[0].toUpperCase(),
  }

  cookieStore.set('garagebook_session', JSON.stringify(mockUser), { path: '/' })
  cookieStore.set('garagebook_logged_in', 'true', { path: '/' })
  
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          }
        }
      })
      if (error) return { error: error.message }
      
      // Auto login
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) return { error: 'Account created, please log in.' }

      const cookieStore = await cookies()
      cookieStore.set('garagebook_logged_in', 'true', { path: '/' })
      
      redirect('/')
    } catch (e) {
      if (e && typeof e === 'object' && 'digest' in e && typeof (e as { digest: unknown }).digest === 'string' && (e as { digest: string }).digest.includes('NEXT_REDIRECT')) throw e
      return { error: e instanceof Error ? e.message : 'Registration failed' }
    }
  }

  // Fallback Mock Signup
  const cookieStore = await cookies()
  const mockUser = {
    ...DEFAULT_MOCK_USER,
    email: email,
    full_name: fullName || email.split('@')[0].toUpperCase(),
  }

  cookieStore.set('garagebook_session', JSON.stringify(mockUser), { path: '/' })
  cookieStore.set('garagebook_logged_in', 'true', { path: '/' })
  
  redirect('/')
}

export async function signOut() {
  const hasRealKeys = await isSupabaseConfigured()
  const cookieStore = await cookies()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out of Supabase:', e)
    }
  }

  cookieStore.delete('garagebook_session')
  cookieStore.delete('garagebook_profile')
  cookieStore.delete('garagebook_logged_in')
  
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const isProStr = formData.get('isPro') as string
  const isPro = isProStr === 'true'

  if (!fullName) {
    return { error: 'Full name is required.' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          is_pro: isPro,
        })
        .eq('id', user.id)

      if (error) return { error: error.message }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to update profile' }
    }
  }

  // Save to local cookie state in both modes (so we are persistent locally)
  const cookieStore = await cookies()
  const profileUpdate = {
    full_name: fullName,
    is_pro: isPro,
  }
  cookieStore.set('garagebook_profile', JSON.stringify(profileUpdate), { path: '/' })

  return { success: true }
}

export async function toggleProStatus() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }

  const newProStatus = !user.is_pro
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      await supabase
        .from('profiles')
        .update({ is_pro: newProStatus })
        .eq('id', user.id)
    } catch (e) {
      console.error('Failed to toggle pro status in Supabase:', e)
    }
  }

  const cookieStore = await cookies()
  const profileUpdate = {
    full_name: user.full_name,
    is_pro: newProStatus,
  }
  cookieStore.set('garagebook_profile', JSON.stringify(profileUpdate), { path: '/' })

  return { success: true, is_pro: newProStatus }
}
