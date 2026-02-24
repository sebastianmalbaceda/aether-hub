import { create } from 'zustand'
import type { ChatSession, Message, SessionTelemetry, AIModel, Skill } from '@/types'

interface ChatState {
  // Current session
  currentSession: ChatSession | null
  messages: Message[]
  
  // Selected options
  selectedModel: AIModel | null
  selectedSkill: Skill | null
  
  // Telemetry
  telemetry: SessionTelemetry
  
  // UI State
  isStreaming: boolean
  isSending: boolean
  error: string | null
  
  // Actions
  setCurrentSession: (session: ChatSession | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedModel: (model: AIModel | null) => void
  setSelectedSkill: (skill: Skill | null) => void
  setTelemetry: (telemetry: Partial<SessionTelemetry>) => void
  setStreaming: (isStreaming: boolean) => void
  setSending: (isSending: boolean) => void
  setError: (error: string | null) => void
  clearSession: () => void
}

const initialTelemetry: SessionTelemetry = {
  contextUsed: 0,
  contextLimit: 128000,
  contextPercentage: 0,
  lastRequestCost: 0,
  lastRequestTokens: 0,
  totalSessionCost: 0,
  totalSessionTokens: 0,
  currentModel: '',
  currentSkill: '',
  contextStatus: 'normal',
}

export const useChatStore = create<ChatState>((set) => ({
  currentSession: null,
  messages: [],
  selectedModel: null,
  selectedSkill: null,
  telemetry: initialTelemetry,
  isStreaming: false,
  isSending: false,
  error: null,

  setCurrentSession: (session) => set({ currentSession: session }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  setSelectedSkill: (skill) => set({ selectedSkill: skill }),
  
  setTelemetry: (telemetry) => set((state) => ({
    telemetry: { ...state.telemetry, ...telemetry }
  })),
  
  setStreaming: (isStreaming) => set({ isStreaming }),
  
  setSending: (isSending) => set({ isSending }),
  
  setError: (error) => set({ error }),
  
  clearSession: () => set({
    currentSession: null,
    messages: [],
    telemetry: initialTelemetry,
    error: null,
  }),
}))
