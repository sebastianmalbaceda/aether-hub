'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user-store'

interface StoresProviderProps {
  children: React.ReactNode
}

export function StoresProvider({ children }: StoresProviderProps) {
  const [initialized, setInitialized] = useState(false)
  const { setUser, setPointsBalance, setDailyUsage, setLoading } = useUserStore()

  useEffect(() => {
    const initializeStores = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const response = await fetch('/api/user/me')
        
        if (response.ok) {
          const data = await response.json()
          
          // Update user store
          setUser({
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.fullName,
            avatarUrl: data.user.avatarUrl,
            role: data.user.role,
            pointsBalance: data.user.pointsBalance,
            isActive: data.user.isActive,
            createdAt: new Date(data.user.createdAt),
            updatedAt: new Date(),
          })
          
          // Update points
          setPointsBalance(data.points.balance)
          setDailyUsage(data.points.dailyUsage, data.points.dailyLimit)
        }
      } catch (error) {
        console.error('Error initializing stores:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeStores()
  }, [setUser, setPointsBalance, setDailyUsage, setLoading])

  // Show nothing while initializing to prevent flash
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
