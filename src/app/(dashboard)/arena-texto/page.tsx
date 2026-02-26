'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ContextBar } from '@/components/telemetry/context-bar'
import { TelemetryPanel } from '@/components/telemetry/telemetry-panel'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Plus, Bot, Zap, Book, Pen, Megaphone, GraduationCap, Code, GitPullRequest, Bug as BugIcon, BarChart, Search, Lightbulb, Layout, School, Languages, PanelRight, EyeOff, SlidersHorizontal, Ghost } from 'lucide-react'
import { useChatStore, selectFormattedContextUsage, selectContextStatus } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import { estimateTokens, AI_MODELS, SKILLS, getCategoryLabel } from '@/config'
import { cn } from '@/lib/utils'
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
  
  // Estado para mostrar telemetría avanzada
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)
  
  // Estado para modo incógnito
  const [incognitoMode, setIncognitoMode] = useState(false)

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
    
    setError(null)
    
    const userMessage = {
      id: `user-${Date.now()}`,
      sessionId: 'current',
      role: 'USER' as const,
      content: content.trim(),
      tokensUsed: estimateTokens(content),
      pointsCost: 0,
      createdAt: new Date(),
    }
    
    addMessage(userMessage)
    setSending(true)
    
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
      abortControllerRef.current = new AbortController()
      
      const apiMessages = [
        ...messages.map(m => ({
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: content.trim() },
      ]
      
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
        return
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [messages, selectedModelId, selectedSkillId, isStreaming, isSending, addMessage, updateLastMessage, setStreaming, setSending, setError, updateTelemetryAfterResponse, deductPoints])

  // Regenerate last response
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2 || isStreaming || isSending) return
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'USER')
    if (!lastUserMessage) return
    
    const newMessages = messages.slice(0, -1)
    useChatStore.setState({ messages: newMessages })
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
    <div className="flex h-full w-full overflow-hidden">
      {/* CENTRO: Área del Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 animate-in fade-in duration-500">
        {/* ═══════════════════════════════════════════════════════════════
            BARRA DE CONTROL DE CONTEXTO - Estilo Claude mejorado
        ═══════════════════════════════════════════════════════════════ */}
        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-3">
            <div className="flex flex-wrap justify-center items-center gap-2">
              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="gap-2 h-8 text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Chat</span>
              </Button>
              
              <div className="w-px h-5 bg-border/50 hidden sm:block" />
              
              {/* Model Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline">Modelo:</span>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-[160px] h-8 text-sm bg-secondary/50 border-border/50 hover:border-primary-500/30 transition-all duration-200">
                    <SelectValue placeholder="Seleccionar modelo" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-[300px]">
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

              {/* Skill Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline">Asistente:</span>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger className="w-[180px] h-8 text-sm bg-secondary/50 border-border/50 hover:border-primary-500/30 transition-all duration-200">
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
                                <span>{skill.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-px h-5 bg-border/50 hidden sm:block" />
              
              {/* Toggle Stats */}
              <Button
                variant={showAdvancedStats ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                className={cn(
                  "h-8 gap-2 transition-all duration-200",
                  showAdvancedStats && "text-primary-400 bg-primary-500/10"
                )}
                title="Mostrar telemetría"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden lg:inline">Stats</span>
              </Button>
              
              {/* Toggle Incógnito */}
              <Button
                variant={incognitoMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIncognitoMode(!incognitoMode)}
                className={cn(
                  "h-8 gap-2 transition-all duration-200",
                  incognitoMode && "text-primary-400 bg-primary-500/10"
                )}
                title={incognitoMode ? "Modo Incógnito activo" : "Activar Incógnito"}
              >
                {incognitoMode ? (
                  <Ghost className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="hidden lg:inline">{incognitoMode ? 'Incógnito' : 'Incógnito'}</span>
              </Button>
              
              {/* Mobile panel toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelOpen(true)}
                className="h-8 xl:hidden"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Context Bar - Solo si showAdvancedStats */}
        {showAdvancedStats && (
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-2">
            <ContextBar
              used={telemetry.contextUsed}
              limit={telemetry.contextLimit}
              status={contextStatus}
            />
          </div>
        )}
        
        {/* Chat Interface */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-4xl h-full">
            <Card className="flex flex-col h-full bg-transparent border-none shadow-none">
              <ChatInterface
                messages={messages}
                isLoading={isStreaming || isSending}
                onSendMessage={handleSendMessage}
                onRegenerate={handleRegenerate}
                onDeleteChat={() => setShowDeleteDialog(true)}
                selectedModelId={selectedModelId}
                onModelSelect={setSelectedModelId}
                incognitoMode={incognitoMode}
              />
            </Card>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-md animate-slide-up">
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-popover/95 backdrop-blur-xl border-border/50">
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

      {/* Panel de Telemetría - Solo si showAdvancedStats */}
      {showAdvancedStats && (
        <div className="hidden xl:flex w-80 shrink-0 border-l border-border/50 bg-background-secondary/30 overflow-y-auto">
          <TelemetryPanel />
        </div>
      )}

      {/* Mobile Right Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-80 p-0 max-w-[85vw] bg-popover/95 backdrop-blur-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Panel de telemetría</SheetTitle>
            <SheetDescription>Información de uso y estadísticas</SheetDescription>
          </SheetHeader>
          <TelemetryPanel />
        </SheetContent>
      </Sheet>
    </div>
  )
}
