'use client'

import { Suspense } from 'react'

// Lazy import to allow SSR
import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('./login-form'), {
  ssr: false,
})

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
