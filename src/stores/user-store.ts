// ============================================
// User Store - Global State for User Data
// ============================================
// Manages user points, daily usage, and preferences
// Syncs with database via API calls

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Subscription, UserSettings, PointsBalanceResponse } from '@/types'

interface UserState {
  // User data
  user: User | null
  subscription: Subscription | null
  settings: UserSettings | null
  
  // Points & Usage
  pointsBalance: number
  dailyUsage: number
  dailyLimit: number
  remainingToday: number
  
  // UI State
  isAuthenticated: boolean
  isLoading: boolean
  isSyncing: boolean
  lastSync: Date | null
  error: string | null
  
  // Actions - User
  setUser: (user: User | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setSettings: (settings: UserSettings | null) => void
  
  // Actions - Points
  setPointsBalance: (balance: number) => void
  setDailyUsage: (usage: number, limit: number) => void
  updatePoints: (delta: number) => void // delta can be negative (spend) or positive (earn)
  deductPoints: (amount: number) => boolean // Returns false if insufficient balance
  
  // Actions - Sync
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
  setError: (error: string | null) => void
  
  // Actions - Auth
  login: (user: User, subscription?: Subscription | null, settings?: UserSettings | null) => void
  logout: () => void
  
  // Actions - API Sync
  fetchPointsBalance: () => Promise<void>
  syncWithDatabase: () => Promise<void>
}

const initialState = {
  user: null,
  subscription: null,
  settings: null,
  pointsBalance: 0,
  dailyUsage: 0,
  dailyLimit: 10000, // Default daily limit
  remainingToday: 10000,
  isAuthenticated: false,
  isLoading: true,
  isSyncing: false,
  lastSync: null,
  error: null,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // User Actions
      // ============================================
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        pointsBalance: user?.pointsBalance ?? 0,
      }),
      
      setSubscription: (subscription) => set({ subscription }),
      
      setSettings: (settings) => set({ settings }),

      // ============================================
      // Points Actions
      // ============================================
      
      setPointsBalance: (balance) => set({ 
        pointsBalance: balance,
        remainingToday: Math.max(0, get().dailyLimit - get().dailyUsage),
      }),
      
      setDailyUsage: (usage, limit) => set({ 
        dailyUsage: usage,
        dailyLimit: limit,
        remainingToday: Math.max(0, limit - usage),
      }),
      
      updatePoints: (delta) => set((state) => ({
        pointsBalance: Math.max(0, state.pointsBalance + delta),
      })),
      
      deductPoints: (amount) => {
        const state = get()
        if (state.pointsBalance < amount) {
          return false
        }
        set({ 
          pointsBalance: state.pointsBalance - amount,
          dailyUsage: state.dailyUsage + amount,
          remainingToday: Math.max(0, state.remainingToday - amount),
        })
        return true
      },

      // ============================================
      // Sync Actions
      // ============================================
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setSyncing: (isSyncing) => set({ isSyncing }),
      
      setError: (error) => set({ error }),

      // ============================================
      // Auth Actions
      // ============================================
      
      login: (user, subscription = null, settings = null) => set({
        user,
        subscription,
        settings,
        isAuthenticated: true,
        isLoading: false,
        pointsBalance: user.pointsBalance ?? 0,
      }),
      
      logout: () => set({
        ...initialState,
        isLoading: false,
      }),

      // ============================================
      // API Sync Actions
      // ============================================
      
      fetchPointsBalance: async () => {
        const state = get()
        if (!state.isAuthenticated) return
        
        try {
          set({ isSyncing: true, error: null })
          
          const response = await fetch('/api/user/points')
          
          if (!response.ok) {
            throw new Error('Failed to fetch points balance')
          }
          
          const data: PointsBalanceResponse = await response.json()
          
          set({
            pointsBalance: data.balance,
            dailyUsage: data.dailyUsage,
            dailyLimit: data.dailyLimit,
            remainingToday: data.remainingToday,
            isSyncing: false,
            lastSync: new Date(),
          })
        } catch (error) {
          set({ 
            isSyncing: false, 
            error: error instanceof Error ? error.message : 'Failed to sync points' 
          })
        }
      },
      
      syncWithDatabase: async () => {
        const state = get()
        if (!state.isAuthenticated) return
        
        try {
          set({ isSyncing: true, error: null })
          
          // Fetch user data from API
          const response = await fetch('/api/user/me')
          
          if (!response.ok) {
            throw new Error('Failed to sync user data')
          }
          
          const { user, subscription, settings, points } = await response.json()
          
          set({
            user,
            subscription: subscription || null,
            settings: settings || null,
            pointsBalance: points?.balance ?? user.pointsBalance ?? 0,
            dailyUsage: points?.dailyUsage ?? 0,
            dailyLimit: points?.dailyLimit ?? 10000,
            remainingToday: points?.remainingToday ?? 10000,
            isSyncing: false,
            lastSync: new Date(),
          })
        } catch (error) {
          set({ 
            isSyncing: false, 
            error: error instanceof Error ? error.message : 'Failed to sync user data' 
          })
        }
      },
    }),
    {
      name: 'aether-user',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pointsBalance: state.pointsBalance,
        dailyUsage: state.dailyUsage,
      }),
    }
  )
)

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const selectUser = (state: UserState) => state.user
export const selectPointsBalance = (state: UserState) => state.pointsBalance
export const selectDailyUsage = (state: UserState) => state.dailyUsage
export const selectDailyLimit = (state: UserState) => state.dailyLimit
export const selectRemainingToday = (state: UserState) => state.remainingToday
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated
export const selectIsLoading = (state: UserState) => state.isLoading

// Derived selectors
export const selectUsagePercentage = (state: UserState) => {
  if (state.dailyLimit === 0) return 0
  return Math.min(100, (state.dailyUsage / state.dailyLimit) * 100)
}

export const selectHasInsufficientPoints = (state: UserState) => {
  return state.pointsBalance <= 0 || state.remainingToday <= 0
}
