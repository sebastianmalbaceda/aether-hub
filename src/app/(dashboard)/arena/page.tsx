'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Code, 
  Play, 
  Copy, 
  Check, 
  Sparkles,
  Send,
  Loader2,
  Trash2,
  RefreshCw,
  FileCode,
  FolderTree,
  X,
  PanelRightClose,
  PanelRightOpen,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import { estimateTokens } from '@/config'
import { cn } from '@/lib/utils'
import { ChatInterface } from '@/components/chat/chat-interface'
import type { Message } from '@/types'

// ============================================
// Types
// ============================================
type ArenaMode = 'texto' | 'codigo'

interface FolderStructure {
  name: string
  type: 'folder' | 'file'
  children?: FolderStructure[]
  language?: string
}

// Constants for retry logic
const MAX_RETRIES = 3
const RETRY_DELAYS = [3000, 6000, 10000]

// ============================================
// Code Editor Component
// ============================================
function CodeEditor({ 
  value, 
  onChange, 
  language,
  readOnly = false
}: { 
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="relative h-full w-full rounded-lg border border-border bg-[#1e1e2e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-secondary/80">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary-400" />
          <span className="text-sm text-muted-foreground">{language}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <textarea
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        className={cn(
          "w-full h-[calc(100%-44px)] p-4 bg-transparent text-sm font-mono text-gray-100 resize-none focus:outline-none",
          readOnly && "cursor-default"
        )}
        placeholder="// El código generado aparecerá aquí..."
        spellCheck={false}
        readOnly={readOnly}
      />
    </div>
  )
}

// ============================================
// Folder Structure Panel
// ============================================
function FolderStructurePanel({ 
  structure,
  selectedFile,
  onSelectFile,
  onClose 
}: { 
  structure: FolderStructure[]
  selectedFile: string | null
  onSelectFile: (fileName: string) => void
  onClose: () => void
}) {
  const renderTree = (items: FolderStructure[], depth = 0) => {
    return items.map((item, index) => (
      <div key={`${item.name}-${index}`}>
        <button
          onClick={() => item.type === 'file' && onSelectFile(item.name)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-primary-500/10 rounded transition-colors text-left",
            selectedFile === item.name && "bg-primary-500/20 text-primary-400",
            depth > 0 && `pl-${depth * 4 + 2}`
          )}
        >
          {item.type === 'folder' ? (
            <FolderTree className="h-4 w-4 text-yellow-500" />
          ) : (
            <FileCode className="h-4 w-4 text-blue-400" />
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {item.type === 'folder' && item.children && (
          <div className="ml-4">
            {renderTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }
  
  return (
    <div className="h-full flex flex-col bg-background-secondary/50 border-r border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-primary-400" />
          <span className="text-sm font-medium">Archivos</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {structure.length > 0 ? (
          renderTree(structure)
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Sin archivos</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Preview Panel
// ============================================
function PreviewPanel({ 
  htmlContent,
  onClose 
}: { 
  htmlContent: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background-secondary/50">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">Vista previa</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 bg-white rounded-lg m-2 overflow-hidden">
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}

// ============================================
// Chat Message Component for Code Mode
// ============================================
function CodeChatMessage({ 
  role, 
  content, 
  code,
  onApplyCode
}: { 
  role: 'user' | 'assistant'
  content: string
  code?: string
  onApplyCode?: (code: string) => void
}) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      role === 'user' ? "bg-primary-700/10" : "bg-secondary"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        role === 'user' ? "bg-primary-700" : "bg-gradient-to-br from-violet-600 to-purple-700"
      )}>
        {role === 'user' ? (
          <span className="text-sm font-medium text-white">U</span>
        ) : (
          <Sparkles className="h-4 w-4 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
        {code && (
          <div className="relative rounded-lg border border-border bg-[#1e1e2e] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background-secondary">
              <span className="text-xs text-muted-foreground">Código generado</span>
              <div className="flex items-center gap-1">
                {onApplyCode && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => onApplyCode(code)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Aplicar
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <pre className="p-3 text-sm font-mono text-gray-100 overflow-x-auto max-h-60">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Subtle Mode Switch Component
// ============================================
function SubtleModeSwitch({ 
  mode, 
  onModeChange 
}: { 
  mode: ArenaMode
  onModeChange: (mode: ArenaMode) => void 
}) {
  return (
    <button
      onClick={() => onModeChange(mode === 'texto' ? 'codigo' : 'texto')}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all"
      title={mode === 'texto' ? 'Cambiar a modo código' : 'Cambiar a modo texto'}
    >
      {mode === 'texto' ? (
        <>
          <ToggleRight className="h-4 w-4 text-primary-400" />
          <Code className="h-3.5 w-3.5" />
        </>
      ) : (
        <>
          <ToggleLeft className="h-4 w-4 text-primary-400" />
          <span className="text-[11px]">Chat</span>
        </>
      )}
    </button>
  )
}

// ============================================
// Main Arena Page
// ============================================
export default function ArenaPage() {
  const [mode, setMode] = useState<ArenaMode>('texto')
  
  // Chat store - for text mode
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
  
  // Text mode state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [incognitoMode, setIncognitoMode] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef<number>(0)
  const currentContentRef = useRef<string>('')
  const messagesRef = useRef<Message[]>([])
  
  // Code mode state
  const [code, setCode] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [codeMessages, setCodeMessages] = useState<Array<{ 
    role: 'user' | 'assistant'
    content: string
    code?: string 
  }>>([])
  const [isCodeLoading, setIsCodeLoading] = useState(false)
  
  // Panels state
  const [showFolderStructure, setShowFolderStructure] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  // Folder structure (example - would be dynamic in real implementation)
  const [folderStructure] = useState<FolderStructure[]>([
    { name: 'src', type: 'folder', children: [
      { name: 'index.html', type: 'file', language: 'html' },
      { name: 'styles.css', type: 'file', language: 'css' },
      { name: 'app.js', type: 'file', language: 'javascript' }
    ]},
    { name: 'package.json', type: 'file', language: 'json' }
  ])
  
  // Sync messagesRef with Zustand state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  
  // ============================================
  // Text Mode - API Call Logic
  // ============================================
  const executeMessageRequest = useCallback(async (content: string) => {
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
    useChatStore.getState().setSending(true)
    
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
      
      const messagesToSend = messagesRef.current
        .filter(m => m.role === 'USER' || m.role === 'ASSISTANT')
        .map(m => ({
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content
        }))
      
      messagesToSend.push({
        role: 'user' as const,
        content: content.trim()
      })
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          modelId: selectedModelId,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      useChatStore.getState().setSending(false)
      useChatStore.getState().setStreaming(true)
      currentContentRef.current = ''
      
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('0:"')) {
            try {
              const jsonStr = line.slice(2)
              const text = JSON.parse(jsonStr)
              currentContentRef.current += text
              updateLastMessage(currentContentRef.current)
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
      
      useChatStore.getState().setStreaming(false)
      retryCountRef.current = 0
      
      // Update telemetry
      const inputTokens = estimateTokens(content)
      const outputTokens = estimateTokens(currentContentRef.current)
      updateTelemetryAfterResponse(inputTokens, outputTokens, 1)
      
      // Deduct points
      deductPoints(1)
      
    } catch (error) {
      useChatStore.getState().setStreaming(false)
      useChatStore.getState().setSending(false)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        const delay = RETRY_DELAYS[retryCountRef.current - 1]
        
        setTimeout(() => {
          if (currentContentRef.current) {
            executeMessageRequest(currentContentRef.current)
          }
        }, delay)
      } else {
        removeLastMessage()
        setError(`Error: ${errorMessage}. Por favor, intenta de nuevo.`)
        retryCountRef.current = 0
      }
    }
  }, [selectedModelId, addMessage, updateLastMessage, removeLastMessage, setStreaming, setSending, setError, updateTelemetryAfterResponse, deductPoints])
  
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || isStreaming || isSending) return
    
    retryCountRef.current = 0
    currentContentRef.current = content
    executeMessageRequest(content)
  }, [isStreaming, isSending, executeMessageRequest])
  
  const handleRegenerate = useCallback(() => {
    if (messages.length < 2) return
    
    const lastUserMessage = messages.filter(m => m.role === 'USER').pop()
    if (lastUserMessage) {
      retryCountRef.current = 0
      currentContentRef.current = lastUserMessage.content
      executeMessageRequest(lastUserMessage.content)
    }
  }, [messages, executeMessageRequest])
  
  const handleDeleteChat = useCallback(() => {
    clearSession()
    setShowDeleteDialog(false)
  }, [clearSession])
  
  // ============================================
  // Code Mode - Handlers
  // ============================================
  const handleCodeSend = useCallback(async () => {
    if (!inputValue.trim() || isCodeLoading) return
    
    const userMessage = { role: 'user' as const, content: inputValue }
    setCodeMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsCodeLoading(true)
    
    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      setCodeMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Aquí tienes una implementación basada en tu solicitud:',
        code: `// Ejemplo de código generado
function example() {
  console.log("Hola desde Aether!");
  return true;
}`
      }])
      setIsCodeLoading(false)
    }, 1500)
  }, [inputValue, isCodeLoading])
  
  const handleApplyCode = useCallback((newCode: string) => {
    setCode(newCode)
    setShowPreview(true)
  }, [])
  
  const handleClearCode = () => {
    setCodeMessages([])
    setCode('')
  }
  
  const handleRunCode = () => {
    setShowPreview(true)
  }
  
  return (
    <div className="flex h-full w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 animate-in fade-in duration-500">
        {/* Content based on mode */}
        {mode === 'texto' ? (
          /* Text Mode - Full Chat Interface */
          <>
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
              headerRightContent={<SubtleModeSwitch mode={mode} onModeChange={setMode} />}
            />
            
            {/* Error Display */}
            {error && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-md animate-slide-up">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            )}
          </>
        ) : (
          /* Code Mode - Split View */
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 md:p-6 min-h-0">
            {/* Left Panel - Chat */}
            <div className="w-full lg:w-[400px] flex flex-col min-h-[300px] lg:min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  Asistente de Código
                </h2>
                <div className="flex items-center gap-2">
                  <SubtleModeSwitch mode={mode} onModeChange={setMode} />
                  <Button variant="ghost" size="sm" onClick={handleClearCode}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-3">
                {codeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Code className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">Pide ayuda con tu código</p>
                    <p className="text-xs mt-1">Ej: "Crea un componente React" o "Optimiza esta función"</p>
                  </div>
                ) : (
                  codeMessages.map((msg, i) => (
                    <CodeChatMessage 
                      key={i} 
                      {...msg} 
                      onApplyCode={msg.role === 'assistant' ? handleApplyCode : undefined}
                    />
                  ))
                )}
                {isCodeLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generando código...</span>
                  </div>
                )}
              </Card>
              
              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCodeSend()}
                  placeholder="Describe lo que necesitas..."
                  className="flex-1 h-10 px-4 rounded-lg border border-border bg-background-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button 
                  onClick={handleCodeSend} 
                  disabled={!inputValue.trim() || isCodeLoading}
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Right Panel - Editor + Preview */}
            <div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary-400" />
                  Editor de Código
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFolderStructure(!showFolderStructure)}
                    className={cn(showFolderStructure && "text-primary-400")}
                  >
                    {showFolderStructure ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearCode}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary-700 hover:bg-primary-600"
                    onClick={handleRunCode}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Ejecutar
                  </Button>
                </div>
              </div>
              
              {/* Editor with optional panels */}
              <Card className="flex-1 overflow-hidden flex">
                {/* Folder Structure Panel */}
                {showFolderStructure && (
                  <div className="w-48 shrink-0">
                    <FolderStructurePanel
                      structure={folderStructure}
                      selectedFile={selectedFile}
                      onSelectFile={setSelectedFile}
                      onClose={() => setShowFolderStructure(false)}
                    />
                  </div>
                )}
                
                {/* Code Editor */}
                <div className="flex-1 min-w-0">
                  <CodeEditor 
                    value={code} 
                    onChange={setCode} 
                    language="javascript"
                  />
                </div>
                
                {/* Preview Panel */}
                {showPreview && (
                  <div className="w-80 shrink-0 border-l border-border">
                    <PreviewPanel
                      htmlContent={code}
                      onClose={() => setShowPreview(false)}
                    />
                  </div>
                )}
              </Card>
            </div>
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
