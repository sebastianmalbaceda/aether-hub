// ============================================
// Chat Store - Global State for Chat Sessions
// ============================================
// Manages chat sessions, model/skill selection, and telemetry

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatSession, Message, SessionTelemetry, ContextStatus } from '@/types'
import { 
  AIModelConfig, 
  SkillConfig, 
  getDefaultModel, 
  getDefaultSkill,
  getModelById,
  getSkillById,
  calculatePointsCost,
  estimateTokens,
  getContextStatus
} from '@/config'

interface ChatState {
  // Current session
  currentSessionId: string | null
  messages: Message[]
  
  // Selected options (using IDs for persistence)
  selectedModelId: string
  selectedSkillId: string
  
  // Telemetry
  telemetry: SessionTelemetry
  
  // Input state
  inputValue: string
  estimatedInputTokens: number
  
  // UI State
  isStreaming: boolean
  isSending: boolean
  error: string | null
  
  // Actions - Session
  setCurrentSessionId: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  
  // Actions - Selection
  setSelectedModelId: (modelId: string) => void
  setSelectedSkillId: (skillId: string) => void
  getSelectedModel: () => AIModelConfig | undefined
  getSelectedSkill: () => SkillConfig | undefined
  
  // Actions - Telemetry
  setTelemetry: (telemetry: Partial<SessionTelemetry>) => void
  updateTelemetryAfterResponse: (
    promptTokens: number, 
    completionTokens: number,
    pointsCost: number
  ) => void
  recalculateContextUsage: () => void
  
  // Actions - Input
  setInputValue: (value: string) => void
  updateEstimatedTokens: () => void
  
  // Actions - UI
  setStreaming: (isStreaming: boolean) => void
  setSending: (isSending: boolean) => void
  setError: (error: string | null) => void
  
  // Actions - Reset
  clearSession: () => void
  startNewSession: () => void
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

const defaultModel = getDefaultModel()
const defaultSkill = getDefaultSkill()

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // ============================================
      // Initial State
      // ============================================
      
      currentSessionId: null,
      messages: [],
      selectedModelId: defaultModel.id,
      selectedSkillId: defaultSkill.id,
      telemetry: {
        ...initialTelemetry,
        currentModel: defaultModel.name,
        currentSkill: defaultSkill.name,
        contextLimit: defaultModel.contextWindow,
      },
      inputValue: '',
      estimatedInputTokens: 0,
      isStreaming: false,
      isSending: false,
      error: null,

      // ============================================
      // Session Actions
      // ============================================
      
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      
      setMessages: (messages) => {
        set({ messages })
        get().recalculateContextUsage()
      },
      
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }))
        get().recalculateContextUsage()
      },
      
      updateLastMessage: (content) => {
        set((state) => {
          const messages = [...state.messages]
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            }
          }
          return { messages }
        })
      },
      
      clearMessages: () => set({ 
        messages: [],
        telemetry: {
          ...initialTelemetry,
          currentModel: get().getSelectedModel()?.name || '',
          currentSkill: get().getSelectedSkill()?.name || '',
          contextLimit: get().getSelectedModel()?.contextWindow || 128000,
        }
      }),

      // ============================================
      // Selection Actions
      // ============================================
      
      setSelectedModelId: (modelId) => {
        const model = getModelById(modelId)
        set({ 
          selectedModelId: modelId,
          telemetry: {
            ...get().telemetry,
            currentModel: model?.name || modelId,
            contextLimit: model?.contextWindow || 128000,
          }
        })
        get().recalculateContextUsage()
      },
      
      setSelectedSkillId: (skillId) => {
        const skill = getSkillById(skillId)
        set({ 
          selectedSkillId: skillId,
          telemetry: {
            ...get().telemetry,
            currentSkill: skill?.name || skillId,
          }
        })
      },
      
      getSelectedModel: () => {
        return getModelById(get().selectedModelId)
      },
      
      getSelectedSkill: () => {
        return getSkillById(get().selectedSkillId)
      },

      // ============================================
      // Telemetry Actions
      // ============================================
      
      setTelemetry: (telemetry) => set((state) => ({
        telemetry: { ...state.telemetry, ...telemetry }
      })),
      
      updateTelemetryAfterResponse: (promptTokens, completionTokens, pointsCost) => {
        set((state) => {
          const totalTokens = promptTokens + completionTokens
          const newTotalSessionTokens = state.telemetry.totalSessionTokens + totalTokens
          const newTotalSessionCost = state.telemetry.totalSessionCost + pointsCost
          const contextPercentage = (newTotalSessionTokens / state.telemetry.contextLimit) * 100
          
          return {
            telemetry: {
              ...state.telemetry,
              lastRequestCost: pointsCost,
              lastRequestTokens: totalTokens,
              totalSessionCost: newTotalSessionCost,
              totalSessionTokens: newTotalSessionTokens,
              contextUsed: newTotalSessionTokens,
              contextPercentage: Math.min(100, contextPercentage),
              contextStatus: getContextStatus(contextPercentage),
            }
          }
        })
      },
      
      recalculateContextUsage: () => {
        const state = get()
        const model = state.getSelectedModel()
        
        // Estimate tokens from all messages
        let totalTokens = 0
        state.messages.forEach(msg => {
          totalTokens += msg.tokensUsed || estimateTokens(msg.content)
        })
        
        // Add estimated tokens for system prompt
        const skill = state.getSelectedSkill()
        if (skill) {
          totalTokens += estimateTokens(skill.systemPrompt)
        }
        
        const contextLimit = model?.contextWindow || 128000
        const contextPercentage = (totalTokens / contextLimit) * 100
        
        set({
          telemetry: {
            ...state.telemetry,
            contextUsed: totalTokens,
            contextLimit,
            contextPercentage: Math.min(100, contextPercentage),
            contextStatus: getContextStatus(contextPercentage),
          }
        })
      },

      // ============================================
      // Input Actions
      // ============================================
      
      setInputValue: (value) => {
        set({ inputValue: value })
        get().updateEstimatedTokens()
      },
      
      updateEstimatedTokens: () => {
        const state = get()
        const tokens = estimateTokens(state.inputValue)
        set({ estimatedInputTokens: tokens })
      },

      // ============================================
      // UI Actions
      // ============================================
      
      setStreaming: (isStreaming) => set({ isStreaming }),
      
      setSending: (isSending) => set({ isSending }),
      
      setError: (error) => set({ error }),

      // ============================================
      // Reset Actions
      // ============================================
      
      clearSession: () => set({
        currentSessionId: null,
        messages: [],
        telemetry: {
          ...initialTelemetry,
          currentModel: get().getSelectedModel()?.name || '',
          currentSkill: get().getSelectedSkill()?.name || '',
          contextLimit: get().getSelectedModel()?.contextWindow || 128000,
        },
        inputValue: '',
        estimatedInputTokens: 0,
        error: null,
      }),
      
      startNewSession: () => {
        get().clearSession()
      },
    }),
    {
      name: 'aether-chat',
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
        selectedSkillId: state.selectedSkillId,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
)

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const selectMessages = (state: ChatState) => state.messages
export const selectSelectedModelId = (state: ChatState) => state.selectedModelId
export const selectSelectedSkillId = (state: ChatState) => state.selectedSkillId
export const selectTelemetry = (state: ChatState) => state.telemetry
export const selectIsStreaming = (state: ChatState) => state.isStreaming
export const selectInputValue = (state: ChatState) => state.inputValue
export const selectEstimatedInputTokens = (state: ChatState) => state.estimatedInputTokens

// Derived selectors
export const selectContextPercentage = (state: ChatState) => state.telemetry.contextPercentage
export const selectContextStatus = (state: ChatState) => state.telemetry.contextStatus
export const selectTotalSessionCost = (state: ChatState) => state.telemetry.totalSessionCost
export const selectHasMessages = (state: ChatState) => state.messages.length > 0

// Context bar formatting
export const selectFormattedContextUsage = (state: ChatState) => {
  const used = state.telemetry.contextUsed
  const limit = state.telemetry.contextLimit
  const usedK = (used / 1000).toFixed(1)
  const limitK = (limit / 1000).toFixed(0)
  return `${usedK}K / ${limitK} tokens`
}
