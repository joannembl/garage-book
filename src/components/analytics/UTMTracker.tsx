'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackEvent } from '@/app/actions/analytics'

export function UTMTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only track on the landing page or when UTM parameters are present
    const hasUtm = Array.from(searchParams.keys()).some(key => key.startsWith('utm_'))
    
    if (pathname === '/' || hasUtm) {
      const utm_source = searchParams.get('utm_source')
      const utm_medium = searchParams.get('utm_medium')
      const utm_campaign = searchParams.get('utm_campaign')
      const utm_content = searchParams.get('utm_content')
      const utm_term = searchParams.get('utm_term')
      
      trackEvent({
        event_type: 'page_view',
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        path: pathname
      })
    }
  }, [pathname, searchParams])

  return null
}
