'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ContextBar } from '@/components/telemetry/context-bar'
import { TelemetryPanel } from '@/components/telemetry/telemetry-panel'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { PanelRight, SlidersHorizontal } from 'lucide-react'
import { useChatStore, selectFormattedContextUsage, selectContextStatus } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import { estimateTokens } from '@/config'
import { cn } from '@/lib/utils'
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
import { Button } from '@/components/ui/button'

export default function ArenaTextoPage() {
  // Chat store
  const messages = useChatStore((state) => state.messages)
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const telemetry = useChatStore((state) => state.telemetry)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const isSending = useChatStore((state) => state.isSending)
  const error = useChatStore((state) => state.error)
  
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateLastMessage = useChatStore((state) => state.updateLastMessage)
  const setStreaming = useChatStore((state) => state.setStreaming)
  const setSending = useChatStore((state) => state.setSending)
  const setError = useChatStore((state) => state.setError)
  const updateTelemetryAfterResponse = useChatStore((state) => state.updateTelemetryAfterResponse)
  const clearSession = useChatStore((state) => state.clearSession)
  
  // Derived values
  const formattedContextUsage = useChatStore(selectFormattedContextUsage)
  const contextStatus = useChatStore(selectContextStatus)
  
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const deductPoints = useUserStore((state) => state.deductPoints)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Estado para mostrar telemetría avanzada
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)
  
  // Estado para modo incógnito
  const [incognitoMode, setIncognitoMode] = useState(false)

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
          model: selectedModelId,
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No se pudo leer la respuesta')
      
      setStreaming(true)
      setSending(false)
      
      let fullContent = ''
      let totalTokens = 0
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              
              if (content) {
                fullContent += content
                updateLastMessage(fullContent)
              }
              
              if (parsed.usage) {
                totalTokens = parsed.usage.total_tokens || 0
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
      
      // Calculate points cost (simplified)
      const pointsCost = Math.ceil(totalTokens * 0.001)
      
      // Update telemetry (promptTokens, completionTokens, pointsCost)
      const promptTokens = estimateTokens(content)
      const completionTokens = totalTokens - promptTokens
      updateTelemetryAfterResponse(promptTokens, completionTokens > 0 ? completionTokens : totalTokens, pointsCost)
      
      // Deduct points
      if (pointsCost > 0) {
        deductPoints(pointsCost)
      }
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      }
    } finally {
      setStreaming(false)
      setSending(false)
    }
  }, [messages, selectedModelId, isStreaming, isSending, addMessage, updateLastMessage, setStreaming, setSending, setError, updateTelemetryAfterResponse, deductPoints])

  // Regenerate last response
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2) return
    
    // Remove last assistant message
    const lastUserMessage = messages.filter(m => m.role === 'USER').pop()
    if (lastUserMessage) {
      // Re-send the last user message
      handleSendMessage(lastUserMessage.content)
    }
  }, [messages, handleSendMessage])

  // Delete chat
  const handleDeleteChat = useCallback(() => {
    clearSession()
    setShowDeleteDialog(false)
  }, [clearSession])

  // New chat
  const handleNewChat = useCallback(() => {
    clearSession()
  }, [clearSession])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* CENTRO: Área del Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 animate-in fade-in duration-500">
        {/* Context Bar - Solo si showAdvancedStats */}
        {showAdvancedStats && (
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-2 border-b border-border/50 bg-background/50 backdrop-blur-sm">
            <ContextBar
              used={telemetry.contextUsed}
              limit={telemetry.contextLimit}
              status={contextStatus}
            />
          </div>
        )}
        
        {/* Toggle Stats Button - Floating */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Button
            variant={showAdvancedStats ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            className={cn(
              "h-8 gap-2 transition-all duration-200 bg-background/80 backdrop-blur-sm",
              showAdvancedStats && "text-primary-400 bg-primary-500/10"
            )}
            title="Mostrar telemetría"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </Button>
          
          {/* Mobile panel toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelOpen(true)}
            className="h-8 xl:hidden bg-background/80 backdrop-blur-sm"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
        
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
                onIncognitoChange={setIncognitoMode}
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
