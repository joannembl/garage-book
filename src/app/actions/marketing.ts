'use server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from './auth'
import { getUTMDataFromCookie } from './analytics'

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const utmData = await getUTMDataFromCookie()
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('email_subscribers')
        .insert([
          {
            email,
            utm_source: utmData?.utm_source || null,
            utm_medium: utmData?.utm_medium || null,
            utm_campaign: utmData?.utm_campaign || null,
            created_at: new Date().toISOString(),
          }
        ])

      if (error) {
        // Table might not exist yet, log but try fallback
        console.warn('Supabase subscribe error (possibly table missing):', error.message)
        return await fallbackEmailSubscription(email, utmData)
      }

      return { success: true }
    } catch (e) {
      console.error('Newsletter subscribe error:', e)
      return await fallbackEmailSubscription(email, utmData)
    }
  }

  // Fallback Option B: In mock mode or if Supabase fails
  return await fallbackEmailSubscription(email, utmData)
}

async function fallbackEmailSubscription(email: string, utmData: any) {
  // In a real environment, we'd use an email service or send to a business inbox.
  // For now, we log it so it's traceable in server logs if Supabase isn't ready.
  console.log(`[EMAIL CAPTURE] New subscriber: ${email}`)
  console.log(`[UTM DATA] ${JSON.stringify(utmData)}`)
  
  // Return success to the user regardless, to keep the flow smooth
  return { success: true, fallback: true }
}
