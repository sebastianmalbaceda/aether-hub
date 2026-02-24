'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const RegisterForm = dynamic(() => import('./register-form'), {
  ssr: false,
})

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
