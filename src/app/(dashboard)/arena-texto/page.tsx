'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ChatInterface } from '@/components/chat/chat-interface'
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
import { useChatStore } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import { estimateTokens } from '@/config'
import type { Message } from '@/types'

// Constants for retry logic
const MAX_RETRIES = 3
const RETRY_DELAYS = [3000, 6000, 10000] // 3s, 6s, 10s
const COOLDOWN_MS = 5000 // 5 segundos - necesario para Groq TPM limits

export default function ArenaTextoPage() {
  // Chat store
  const messages = useChatStore((state) => state.messages)
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const isSending = useChatStore((state) => state.isSending)
  const error = useChatStore((state) => state.error)
  
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId)
  const addMessage = useChatStore((state) => state.addMessage)
  const updateLastMessage = useChatStore((state) => state.updateLastMessage)
  const removeLastMessage = useChatStore((state) => state.removeLastMessage)
  const setStreaming = useChatStore((state) => state.setStreaming)
  const setSending = useChatStore((state) => state.setSending)
  const setError = useChatStore((state) => state.setError)
  const updateTelemetryAfterResponse = useChatStore((state) => state.updateTelemetryAfterResponse)
  const clearSession = useChatStore((state) => state.clearSession)
  
  // User store
  const deductPoints = useUserStore((state) => state.deductPoints)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastMessageTimeRef = useRef<number>(0)
  const retryCountRef = useRef<number>(0)
  const currentContentRef = useRef<string>('')
  
  // Ref para mantener el historial de mensajes sincronizado (evita race conditions con closures)
  const messagesRef = useRef<Message[]>([])
  
  // Sincronizar messagesRef con el estado de Zustand
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  
  // Estado para modo incógnito
  const [incognitoMode, setIncognitoMode] = useState(false)

  // Internal function to execute the API call
  const executeMessageRequest = useCallback(async (content: string) => {
    // Verificar que hay un modelo seleccionado
    if (!selectedModelId) {
      setError('Por favor, selecciona un modelo antes de enviar un mensaje.')
      return
    }
    
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
      
      // Construir mensajes para la API usando messagesRef (evita race conditions con closures)
      const currentMessages = messagesRef.current
      console.log('[arena-texto] 🔍 DEBUG: Estado de messages antes de construir:')
      console.log('[arena-texto] 🔍 messagesRef.current.length:', currentMessages.length)
      currentMessages.forEach((m, i) => {
        console.log(`[arena-texto] 🔍 messages[${i}]: role="${m.role}", content length=${m.content?.length || 0}`)
      })
      
      const apiMessages = [
        ...currentMessages
          .filter(m => m.content.trim().length > 0)
          .map(m => ({
            role: m.role.toLowerCase() as 'user' | 'assistant',
            content: m.content,
          })),
        { role: 'user' as const, content: content.trim() },
      ]
      
      console.log('[arena-texto] Mensajes a enviar:', apiMessages.length)
      console.log('[arena-texto] Enviando petición con modelId:', selectedModelId)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          modelId: selectedModelId,
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[arena-texto] Error en respuesta:', response.status, errorData)
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No se pudo leer la respuesta')
      
      setStreaming(true)
      setSending(false)
      
      let fullContent = ''
      let totalTokens = 0
      let streamError: string | null = null
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const jsonStr = line.slice(2)
              const content = JSON.parse(jsonStr)
              if (content) {
                fullContent += content
                updateLastMessage(fullContent)
              }
            } catch {
              const content = line.slice(2).replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"')
              if (content) {
                fullContent += content
                updateLastMessage(fullContent)
              }
            }
          } else if (line.startsWith('d:')) {
            try {
              const data = JSON.parse(line.slice(2))
              totalTokens = data.totalTokens || 0
            } catch {}
          } else if (line.startsWith('e:')) {
            try {
              const errorData = JSON.parse(line.slice(2))
              streamError = errorData.message || 'Error en el stream'
              console.error('[arena-texto] Stream error:', streamError)
              setError(streamError)
            } catch {}
          } else if (line.startsWith('data: ')) {
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
            } catch {}
          }
        }
      }
      
      // Si hubo error en el stream y no hay contenido, intentar reintento automático
      if (streamError && fullContent.length === 0) {
        console.log('[arena-texto] Stream con error y sin contenido')
        
        // Eliminar AMBOS mensajes (user y assistant) antes del reintento
        // para evitar duplicación en el siguiente intento
        removeLastMessage() // assistant vacío
        removeLastMessage() // user
        
        // Reintentar automáticamente con backoff exponencial
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCountRef.current]
          console.log(`[arena-texto] Reintentando en ${delay/1000}s (intento ${retryCountRef.current + 1}/${MAX_RETRIES})`)
          setError(`⏳ Reintentando automáticamente en ${delay/1000} segundos... (${retryCountRef.current + 1}/${MAX_RETRIES})`)
          
          // Incrementar contador de reintentos
          retryCountRef.current++
          
          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // Reintentar con el mismo contenido (se añadirán nuevos mensajes)
          executeMessageRequest(content)
          return
        } else {
          // Agotados los reintentos - los mensajes ya fueron eliminados arriba
          setError('❌ El servidor está ocupado. Por favor, espera unos segundos e intenta de nuevo manualmente.')
          retryCountRef.current = 0
        }
        return
      }
      
      // Éxito - resetear contador de reintentos
      retryCountRef.current = 0
      
      // Calculate points cost
      const pointsCost = Math.ceil(totalTokens * 0.001)
      const promptTokens = estimateTokens(content)
      const completionTokens = totalTokens - promptTokens
      updateTelemetryAfterResponse(promptTokens, completionTokens > 0 ? completionTokens : totalTokens, pointsCost)
      
      if (pointsCost > 0) {
        deductPoints(pointsCost)
      }
      
    } catch (err) {
      // Eliminar ambos mensajes cuando hay error
      removeLastMessage()
      removeLastMessage()
      
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('[arena-texto] Error:', err)
        
        // Intentar reintento automático para errores de red
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCountRef.current]
          console.log(`[arena-texto] Error de red, reintentando en ${delay/1000}s`)
          setError(`⏳ Error de conexión. Reintentando en ${delay/1000} segundos...`)
          
          retryCountRef.current++
          
          await new Promise(resolve => setTimeout(resolve, delay))
          executeMessageRequest(content)
          return
        }
        
        setError(err instanceof Error ? err.message : 'Error desconocido')
        retryCountRef.current = 0
      }
    } finally {
      setStreaming(false)
      setSending(false)
    }
  }, [selectedModelId, isStreaming, isSending, addMessage, updateLastMessage, removeLastMessage, setStreaming, setSending, setError, updateTelemetryAfterResponse, deductPoints])

  // Main function to send message (compatible with ChatInterface)
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || isStreaming || isSending) return
    
    // Cooldown de 5 segundos entre mensajes para evitar rate limiting de Groq
    const now = Date.now()
    const timeSinceLastMessage = now - lastMessageTimeRef.current
    if (timeSinceLastMessage < COOLDOWN_MS) {
      const waitTime = Math.ceil((COOLDOWN_MS - timeSinceLastMessage) / 1000)
      setError(`⏳ Por favor espera ${waitTime} segundo(s) antes de enviar otro mensaje. Los modelos gratuitos tienen límites de velocidad.`)
      return
    }
    lastMessageTimeRef.current = now
    
    // Reset retry counter for new message
    retryCountRef.current = 0
    currentContentRef.current = content
    
    // Execute the request
    executeMessageRequest(content)
  }, [isStreaming, isSending, setError, executeMessageRequest])

  // Regenerate last response
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2) return
    
    const lastUserMessage = messages.filter(m => m.role === 'USER').pop()
    if (lastUserMessage) {
      // Reset retry counter
      retryCountRef.current = 0
      currentContentRef.current = lastUserMessage.content
      executeMessageRequest(lastUserMessage.content)
    }
  }, [messages, executeMessageRequest])

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
    </div>
  )
}
