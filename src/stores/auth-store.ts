import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Subscription, UserSettings } from '@/types'

interface AuthState {
  user: User | null
  subscription: Subscription | null
  settings: UserSettings | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setSettings: (settings: UserSettings | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updatePointsBalance: (balance: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      settings: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setSubscription: (subscription) => set({ subscription }),
      
      setSettings: (settings) => set({ settings }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        subscription: null, 
        settings: null,
        isAuthenticated: false 
      }),
      
      updatePointsBalance: (balance) => set((state) => ({
        user: state.user ? { ...state.user, pointsBalance: balance } : null
      })),
    }),
    {
      name: 'aether-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
