import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

interface CookieItem {
  name: string
  value: string
  options?: CookieOptions
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/arena-texto'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=No code provided', request.url)
    )
  }

  let response = NextResponse.redirect(new URL(redirect, request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    )
  }

  return response
}
