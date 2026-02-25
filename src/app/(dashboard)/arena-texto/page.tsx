'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ContextBar } from '@/components/telemetry/context-bar'
import { TelemetryPanel } from '@/components/telemetry/telemetry-panel'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Plus, Trash2, Bot, Zap, Book, Pen, Megaphone, GraduationCap, Code, GitPullRequest, Bug as BugIcon, BarChart, Search, Lightbulb, Layout, School, Languages, PanelRight } from 'lucide-react'
import { useChatStore, selectFormattedContextUsage, selectContextStatus } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import { estimateTokens, AI_MODELS, SKILLS, getCategoryLabel } from '@/config'
import type { SkillConfig } from '@/config'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Map skill icons
const skillIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot,
  Zap,
  BookOpen: Book,
  Pen,
  Megaphone,
  GraduationCap,
  Code,
  GitPullRequest,
  Bug: BugIcon,
  BarChart,
  Search,
  Lightbulb,
  Book,
  Layout,
  School,
  Languages,
}

export default function ArenaTextoPage() {
  // Chat store
  const messages = useChatStore((state) => state.messages)
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const selectedSkillId = useChatStore((state) => state.selectedSkillId)
  const telemetry = useChatStore((state) => state.telemetry)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const isSending = useChatStore((state) => state.isSending)
  const error = useChatStore((state) => state.error)
  
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId)
  const setSelectedSkillId = useChatStore((state) => state.setSelectedSkillId)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateLastMessage = useChatStore((state) => state.updateLastMessage)
  const setStreaming = useChatStore((state) => state.setStreaming)
  const setSending = useChatStore((state) => state.setSending)
  const setError = useChatStore((state) => state.setError)
  const updateTelemetryAfterResponse = useChatStore((state) => state.updateTelemetryAfterResponse)
  const clearSession = useChatStore((state) => state.clearSession)
  const startNewSession = useChatStore((state) => state.startNewSession)
  const getSelectedModel = useChatStore((state) => state.getSelectedModel)
  const getSelectedSkill = useChatStore((state) => state.getSelectedSkill)
  
  // Derived values
  const formattedContextUsage = useChatStore(selectFormattedContextUsage)
  const contextStatus = useChatStore(selectContextStatus)
  
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const dailyUsage = useUserStore((state) => state.dailyUsage)
  const dailyLimit = useUserStore((state) => state.dailyLimit)
  const deductPoints = useUserStore((state) => state.deductPoints)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Group skills by category
  const skillsByCategory = SKILLS.reduce((acc, skill) => {
    const category = skill.category
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {} as Record<string, SkillConfig[]>)

  // Send message to API
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming || isSending) return
    
    // Clear previous errors
    setError(null)
    
    // Create user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sessionId: 'current',
      role: 'USER' as const,
      content: content.trim(),
      tokensUsed: estimateTokens(content),
      pointsCost: 0,
      createdAt: new Date(),
    }
    
    // Add user message to store
    addMessage(userMessage)
    setSending(true)
    
    // Create placeholder for assistant message
    const assistantMessageId = `assistant-${Date.now()}`
    addMessage({
      id: assistantMessageId,
      sessionId: 'current',
      role: 'ASSISTANT' as const,
      content: '',
      tokensUsed: 0,
      pointsCost: 0,
      createdAt: new Date(),
    })
    
    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()
      
      // Build messages array for API
      const apiMessages = [
        ...messages.map(m => ({
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: content.trim() },
      ]
      
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          modelId: selectedModelId,
          skillId: selectedSkillId,
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
      
      setSending(false)
      setStreaming(true)
      
      // Process streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let telemetryData: Record<string, unknown> | null = null
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('0:"')) {
              // Text chunk
              try {
                const text = line.slice(3, -1)
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, '\\')
                fullContent += text
                updateLastMessage(fullContent)
              } catch {
                // Ignore parse errors
              }
            } else if (line.startsWith('e:')) {
              // Telemetry data
              try {
                telemetryData = JSON.parse(line.slice(2))
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
      
      setStreaming(false)
      
      // Update telemetry if available
      if (telemetryData) {
        const { promptTokens, completionTokens, totalCost } = telemetryData as {
          promptTokens: number
          completionTokens: number
          totalCost: number
        }
        updateTelemetryAfterResponse(promptTokens, completionTokens, totalCost)
        deductPoints(totalCost)
      }
      
    } catch (err) {
      setStreaming(false)
      setSending(false)
      
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [messages, selectedModelId, selectedSkillId, isStreaming, isSending, addMessage, updateLastMessage, setStreaming, setSending, setError, updateTelemetryAfterResponse, deductPoints])

  // Regenerate last response
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2 || isStreaming || isSending) return
    
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'USER')
    if (!lastUserMessage) return
    
    // Remove the last assistant message
    const newMessages = messages.slice(0, -1)
    
    // Re-send the last user message
    // First update the store to remove the last message
    useChatStore.setState({ messages: newMessages })
    
    // Then send the message again
    handleSendMessage(lastUserMessage.content)
  }, [messages, isStreaming, isSending, handleSendMessage])

  // Delete chat with confirmation
  const handleDeleteChat = useCallback(() => {
    clearSession()
    setShowDeleteDialog(false)
  }, [clearSession])

  // Start new chat
  const handleNewChat = useCallback(() => {
    startNewSession()
  }, [startNewSession])

  return (
    /* FASE 3: Layout con telemetría integrada dentro de la página */
    <div className="flex h-full w-full">
      {/* CENTRO: Área del Chat */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0 p-4 md:p-6 animate-in fade-in duration-500">
        {/* FASE 2: Botón "Nuevo Chat" movido desde Header global + Selectores responsivos */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mb-4">
          {/* New Chat Button - FASE 2: Ubicado estratégicamente cerca de selectores */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="gap-2 border-primary-500/50 hover:bg-primary-500/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Chat</span>
          </Button>
          {/* Model Selector - FASE 3: z-index adecuado para dropdowns */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Modelo:</span>
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger className="w-[180px] h-9 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                <SelectValue placeholder="Seleccionar modelo" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {AI_MODELS.filter(m => m.isAvailable).map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.providerDisplayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skill Selector - FASE 3: z-index adecuado para dropdowns */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Asistente:</span>
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger className="w-[200px] h-9 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                <SelectValue placeholder="Seleccionar asistente" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] z-50">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {getCategoryLabel(category as SkillConfig['category'])}
                    </div>
                    {skills.map((skill) => {
                      const IconComponent = skillIcons[skill.icon] || Bot
                      return (
                        <SelectItem key={skill.id} value={skill.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{skill.name}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {skill.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Mobile panel toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPanelOpen(true)}
            className="xl:hidden transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
          >
            <PanelRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Context Bar */}
        <div className="mb-4">
          <ContextBar
            used={telemetry.contextUsed}
            limit={telemetry.contextLimit}
            status={contextStatus}
          />
        </div>
        
        {/* Chat Interface */}
        <Card className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            isLoading={isStreaming || isSending}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            onDeleteChat={() => setShowDeleteDialog(true)}
          />
        </Card>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todos los mensajes de la conversación actual.
                No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChat}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* DERECHA: Panel de Telemetría (Desktop) - FASE 3: Integrado en la página */}
      <div className="hidden xl:flex w-80 shrink-0 border-l border-border bg-background-secondary/30 overflow-y-auto">
        <TelemetryPanel />
      </div>

      {/* Mobile Right Panel (Sheet) - FASE 3: Telemetría en móvil */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-80 p-0 max-w-[85vw]">
          <SheetHeader className="sr-only">
            <SheetTitle>Panel de telemetría</SheetTitle>
            <SheetDescription>Información de uso y estadísticas de la sesión actual</SheetDescription>
          </SheetHeader>
          <TelemetryPanel />
        </SheetContent>
      </Sheet>
    </div>
  )
}
