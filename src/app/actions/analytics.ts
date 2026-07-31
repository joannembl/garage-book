'use server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from './auth'
import { cookies } from 'next/headers'

export type AnalyticsEvent = {
  event_type: 'page_view' | 'signup'
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  referrer?: string | null
  path?: string | null
  user_id?: string | null
}

export async function trackEvent(event: AnalyticsEvent) {
  const hasRealKeys = await isSupabaseConfigured()
  
  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('analytics_events')
        .insert([
          {
            ...event,
            created_at: new Date().toISOString(),
          }
        ])
      
      if (error) {
        // Table might not exist yet, log but don't crash
        console.warn('Analytics track error (possibly table missing):', error.message)
      }
    } catch (e) {
      console.error('Analytics track error:', e)
    }
  }

  // Also store in cookies as fallback/persistence for signup linking
  if (event.event_type === 'page_view') {
    const cookieStore = await cookies()
    const utmData = {
      utm_source: event.utm_source,
      utm_medium: event.utm_medium,
      utm_campaign: event.utm_campaign,
      utm_content: event.utm_content,
      utm_term: event.utm_term,
      referrer: event.referrer,
    }
    cookieStore.set('garagebook_utm', JSON.stringify(utmData), { 
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
  }
}

export async function getUTMDataFromCookie() {
  const cookieStore = await cookies()
  const utmCookie = cookieStore.get('garagebook_utm')
  if (!utmCookie) return null
  
  try {
    return JSON.parse(utmCookie.value)
  } catch {
    return null
  }
}

export async function getAnalyticsSummary() {
  const hasRealKeys = await isSupabaseConfigured()
  
  if (!hasRealKeys) {
    return {
      totalSignups: 0,
      recentSignups: [],
      campaignBreakdown: [],
      signupTrend: [],
      topReferrers: [],
      isMock: true
    }
  }

  try {
    const supabase = await createClient()
    
    // Total signups this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: signups } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'signup')
      .gte('created_at', oneWeekAgo.toISOString())

    const { data: allSignups } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'signup')

    // Top referrers
    const { data: referrers } = await supabase
      .from('analytics_events')
      .select('referrer, event_type')
      .eq('event_type', 'page_view')

    // Campaign breakdown
    const campaignBreakdown = (allSignups || []).reduce((acc: Record<string, number>, curr: { utm_campaign: string | null }) => {
      const campaign = curr.utm_campaign || 'direct'
      acc[campaign] = (acc[campaign] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Signup trend (last 7 days)
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = (allSignups || []).filter((s: { created_at: string }) => s.created_at.startsWith(dateStr)).length
      return { date: dateStr, count }
    }).reverse()

    return {
      totalSignups: (signups || []).length,
      allTimeSignups: (allSignups || []).length,
      campaignBreakdown: Object.entries(campaignBreakdown).map(([name, count]) => ({ name, count })),
      signupTrend: trend,
      isMock: false
    }
  } catch (e) {
    console.error('Failed to fetch analytics:', e)
    return { error: 'Failed to fetch analytics' }
  }
}
