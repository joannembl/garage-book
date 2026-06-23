import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Check if Supabase keys are configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasRealKeys = !!(url && key && !url.includes('your-supabase') && !key.includes('your-supabase'))

  let user = null

  if (hasRealKeys) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      user = supabaseUser
    } catch (e) {
      console.error('Supabase middleware auth error:', e)
    }
  }

  // 2. Check fallback mock session if real session doesn't exist
  if (!user) {
    const mockSession = request.cookies.get('garagebook_session')
    if (mockSession) {
      try {
        user = JSON.parse(mockSession.value)
      } catch {
        // Ignore json parse error
      }
    }
  }

  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

  // 3. Redirection logic
  if (!user) {
    // If not authenticated and NOT on an auth page, redirect to /login
    if (!isAuthPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // If authenticated and trying to access an auth page, redirect to / (Garage)
    if (isAuthPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}
