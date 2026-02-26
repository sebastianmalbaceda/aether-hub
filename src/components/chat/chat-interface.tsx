'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Send, 
  Copy, 
  Check,
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown,
  User,
  Bot,
  Sparkles,
  Loader2,
  Mic,
  Paperclip,
  Ghost,
  Code,
  GraduationCap,
  Pen,
  Coffee,
  Lightbulb,
  ArrowUp,
  X,
  Image as ImageIcon,
  FileText,
  Square,
  ChevronDown,
  Check as CheckIcon,
  Lock,
  Crown,
  Brain,
  Cpu,
  BarChart3,
  Coins,
  Clock,
  Zap,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useChatStore } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'
import type { Message } from '@/types'

// Dynamic import for react-markdown to avoid SSR issues
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Modelos gratuitos (Groq)
const freeModels = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq', description: 'Potente y rápido', tier: 'free' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', description: 'Versátil y eficiente', tier: 'free' },
  { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', provider: 'Groq', description: 'Excelente en código', tier: 'free' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'Groq', description: 'Ligero y rápido', tier: 'free' },
]

// Modelos premium (bloqueados)
const premiumModels = [
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'El más inteligente', tier: 'premium' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Multimodal avanzado', tier: 'premium' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Contexto ampliado', tier: 'premium' },
  { id: 'o1-preview', name: 'o1 Preview', provider: 'OpenAI', description: 'Razonamiento profundo', tier: 'premium' },
]

// Asistentes disponibles
const assistants = [
  { id: 'standard', name: 'Asistente Estándar', icon: Bot, description: 'Para tareas generales' },
  { id: 'code', name: 'Asistente de Código', icon: Code, description: 'Especializado en programación' },
  { id: 'creative', name: 'Asistente Creativo', icon: Sparkles, description: 'Para escritura y creatividad' },
]

interface ChatInterfaceProps {
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (content: string, attachments?: File[]) => void
  onRegenerate?: () => void
  onDeleteChat?: () => void
  selectedModelId?: string
  onModelSelect?: (modelId: string) => void
  incognitoMode?: boolean
  onIncognitoChange?: (mode: boolean) => void
  className?: string
}

// Feedback state type
type FeedbackState = 'none' | 'positive' | 'negative'

// Message feedback tracking
const messageFeedback: Record<string, FeedbackState> = {}

// Quick actions configuration
const quickActions = [
  { id: 'code', label: 'Código', icon: Code },
  { id: 'learn', label: 'Aprender', icon: GraduationCap },
  { id: 'write', label: 'Escribir', icon: Pen },
  { id: 'personal', label: 'Asuntos personales', icon: Coffee },
  { id: 'ideas', label: 'Ideas de la IA', icon: Lightbulb },
]

// Markdown components with custom styling
const markdownComponents = {
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code 
          className="bg-primary-700/20 text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code 
        className="block bg-secondary/80 p-3 rounded-lg text-sm font-mono overflow-x-auto my-2"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-secondary/80 p-3 rounded-lg overflow-x-auto my-2">
      {children}
    </pre>
  ),
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-2">{children}</li>
  ),
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-xl font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-lg font-bold mb-2">{children}</h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-bold mb-2">{children}</h3>
  ),
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary-400 hover:text-primary-300 underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary-500 pl-4 italic my-2">
      {children}
    </blockquote>
  ),
  strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold">{children}</strong>
  ),
  em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic">{children}</em>
  ),
  hr: () => <hr className="my-4 border-border" />,
}

// Message bubble component with actions
function MessageBubble({ 
  message, 
  onCopy, 
  onRegenerate,
  onFeedback 
}: { 
  message: Message
  onCopy: (content: string) => void
  onRegenerate?: () => void
  onFeedback: (messageId: string, feedback: FeedbackState) => void
}) {
  const [copied, setCopied] = useState(false)
  const feedback = messageFeedback[message.id] || 'none'
  
  const handleCopy = async () => {
    await onCopy(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    const newFeedback = feedback === type ? 'none' : type
    messageFeedback[message.id] = newFeedback
    onFeedback(message.id, newFeedback)
  }
  
  return (
    <div
      className={cn(
        'flex gap-3',
        message.role === 'USER' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'ASSISTANT' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          message.role === 'USER'
            ? 'bg-primary-700 text-white'
            : 'bg-secondary/80 text-foreground'
        )}
      >
        {message.role === 'ASSISTANT' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content || '...'}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}
        
        {/* Message metadata */}
        <div className={cn(
          'flex items-center gap-3 mt-2 text-xs',
          message.role === 'USER' ? 'text-primary-200' : 'text-muted-foreground'
        )}>
          {message.tokensUsed > 0 && (
            <span>{message.tokensUsed} tokens</span>
          )}
          {message.pointsCost > 0 && (
            <span>{message.pointsCost.toFixed(2)} pts</span>
          )}
        </div>

        {/* Action buttons */}
        {message.role === 'ASSISTANT' && message.content && (
          <div className="flex items-center gap-1 mt-2 pt-2 bg-muted/20 rounded-md p-1 -mx-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleCopy}
              title="Copiar"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={onRegenerate}
              title="Regenerar"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-7 w-7",
                feedback === 'positive' && "text-green-400 bg-green-400/10"
              )}
              onClick={() => handleFeedback('positive')}
              title="Útil"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-7 w-7",
                feedback === 'negative' && "text-red-400 bg-red-400/10"
              )}
              onClick={() => handleFeedback('negative')}
              title="No útil"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {message.role === 'USER' && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// Attachment preview component
function AttachmentPreview({ 
  file, 
  onRemove 
}: { 
  file: File
  onRemove: () => void 
}) {
  const isImage = file.type.startsWith('image/')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [file, isImage])

  return (
    <div className="relative group">
      {isImage && imagePreview ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary-500/20">
          <img 
            src={imagePreview} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-primary-500/20">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground max-w-[120px] truncate">{file.name}</span>
          <button
            type="button"
            onClick={onRemove}
            className="w-5 h-5 rounded-full hover:bg-secondary flex items-center justify-center"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ChatInterface({ 
  messages, 
  isLoading = false, 
  onSendMessage,
  onRegenerate,
  onDeleteChat,
  incognitoMode = false,
  onIncognitoChange,
  className 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [, setFeedbackVersion] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Chat store
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId)
  const telemetry = useChatStore((state) => state.telemetry)
  
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  
  // UI State
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [assistantSelectorOpen, setAssistantSelectorOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState('standard')
  
  // Attachments state
  const [attachments, setAttachments] = useState<File[]>([])
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'es-ES'
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setInput(prev => prev + ' ' + transcript)
          setIsRecording(false)
        }
        
        recognitionInstance.onerror = () => {
          setIsRecording(false)
          toast({
            title: 'Error de grabación',
            description: 'No se pudo capturar el audio. Inténtalo de nuevo.',
            variant: 'destructive',
          })
        }
        
        recognitionInstance.onend = () => {
          setIsRecording(false)
        }
        
        setRecognition(recognitionInstance)
      }
    }
  }, [toast])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input.trim(), attachments)
      setInput('')
      setAttachments([])
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }, 10)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: 'Copiado al portapapeles',
        description: 'El contenido ha sido copiado correctamente.',
      })
    } catch {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido.',
        variant: 'destructive',
      })
    }
  }, [toast])

  const handleFeedback = useCallback((messageId: string, feedback: FeedbackState) => {
    setFeedbackVersion(v => v + 1)
    if (feedback !== 'none') {
      console.log(`Feedback for message ${messageId}: ${feedback}`)
    }
  }, [])

  const handleQuickAction = (actionId: string) => {
    const prompts: Record<string, string> = {
      code: 'Ayúdame a escribir código para: ',
      learn: 'Explícame detalladamente sobre: ',
      write: 'Ayúdame a escribir: ',
      personal: 'Necesito ayuda con: ',
      ideas: 'Dame ideas creativas sobre: ',
    }
    setInput(prompts[actionId] || '')
    textareaRef.current?.focus()
  }

  // File attachment handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Voice recording handlers
  const toggleRecording = () => {
    if (!recognition) {
      toast({
        title: 'No disponible',
        description: 'Tu navegador no soporta reconocimiento de voz.',
        variant: 'destructive',
      })
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  // Get selected model info
  const getSelectedModelInfo = () => {
    const allModels = [...freeModels, ...premiumModels]
    return allModels.find(m => m.id === selectedModelId) || freeModels[0]
  }

  // Get model icon
  const getModelIcon = (modelId: string) => {
    if (modelId.includes('claude')) return Bot
    if (modelId.includes('gpt') || modelId.includes('o1')) return Brain
    if (modelId.includes('gemini')) return Sparkles
    return Cpu
  }

  // Get selected assistant info
  const getSelectedAssistantInfo = () => {
    return assistants.find(a => a.id === selectedAssistant) || assistants[0]
  }

  // Format points
  const formatPoints = (points: number | null | undefined) => {
    if (points === null || points === undefined || isNaN(points)) return '0'
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return points.toString()
  }

  // Format context
  const formatContext = (used: number, limit: number) => {
    const usedK = (used / 1000).toFixed(1)
    const limitK = (limit / 1000).toFixed(0)
    return `${usedK}K/${limitK}K`
  }

  const selectedModel = getSelectedModelInfo()
  const SelectedModelIcon = getModelIcon(selectedModel.id)
  const selectedAssistantInfo = getSelectedAssistantInfo()
  const AssistantIcon = selectedAssistantInfo.icon

  const hasContent = input.trim() || attachments.length > 0

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          /* WELCOME STATE */
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            {/* Incógnito Banner */}
            {incognitoMode && (
              <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary-500/20">
                <Ghost className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium">Estás de incógnito</span>
              </div>
            )}
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-glow-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-foreground">
              {incognitoMode ? 'Modo Incógnito' : '¿En qué creamos hoy?'}
            </h1>
            
            {/* Subtitle */}
            <p className="text-muted-foreground max-w-md mb-8">
              {incognitoMode 
                ? 'Las conversaciones de incógnito no se guardan en el historial.'
                : 'El modelo está listo. Comienza a crear.'
              }
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground bg-transparent border border-primary-500/20 hover:bg-primary-500/5 hover:text-foreground hover:border-primary-500/40 transition-all duration-200"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGES LIST */
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={copyToClipboard}
                onRegenerate={onRegenerate}
                onFeedback={handleFeedback}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-secondary/80 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-muted-foreground text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OMNI-BARRA DE CHAT (Command Center Unificado)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="p-3 md:p-4 bg-background/80 backdrop-blur-xl">
        {/* Incógnito notice */}
        {incognitoMode && messages.length > 0 && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground justify-center">
            <Ghost className="h-3 w-3" />
            <span>Las conversaciones de incógnito no se guardan en el historial.</span>
          </div>
        )}
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((file, index) => (
              <AttachmentPreview 
                key={index} 
                file={file} 
                onRemove={() => handleRemoveAttachment(index)} 
              />
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* ═══════════════════════════════════════════════════════════════
              Contenedor Principal - Estilo Pastilla Expandible
          ═══════════════════════════════════════════════════════════════ */}
          <div className="relative bg-[#161618] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200 focus-within:border-primary-500/50 focus-within:shadow-[0_0_20px_rgba(157,78,221,0.15)]">
            
            {/* ═══════════════════════════════════════════════════════════════
                ÁREA SUPERIOR: Input & Attachments
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-start gap-2 p-3 pb-2">
              {/* Attach button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.csv,.md,.json"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="Adjuntar archivo"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              
              {/* Textarea transparente */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="¿Cómo puedo ayudarte hoy?"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-base resize-none outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 min-h-[24px] max-h-[200px]"
                style={{ height: 'auto' }}
              />
            </div>
            
            {/* ═══════════════════════════════════════════════════════════════
                ÁREA INFERIOR: Barra de Herramientas Integrada
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              {/* LADO IZQUIERDO: Controles de Contexto */}
              <div className="flex items-center gap-1">
                {/* Selector de Modelo */}
                <Popover open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                    >
                      <SelectedModelIcon className="h-3.5 w-3.5 text-primary-400" />
                      <span className="max-w-[100px] truncate">{selectedModel.name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  
                  <PopoverContent 
                    align="start" 
                    className="w-72 p-0 bg-popover/95 backdrop-blur-xl border-primary-500/20 shadow-xl"
                  >
                    {/* Header */}
                    <div className="p-3 border-b border-primary-500/10">
                      <h3 className="font-semibold text-sm">Seleccionar Modelo</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Elige el modelo para esta conversación</p>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                      {/* Sección: Plan Gratuito */}
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <Zap className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Plan Gratuito
                          </span>
                        </div>
                        
                        {freeModels.map((model) => {
                          const isSelected = selectedModelId === model.id
                          const Icon = getModelIcon(model.id)
                          
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModelId(model.id)
                                setModelSelectorOpen(false)
                              }}
                              className={cn(
                                "w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all duration-200",
                                isSelected 
                                  ? "bg-primary-500/15 border border-primary-500/30" 
                                  : "hover:bg-secondary/80 border border-transparent"
                              )}
                            >
                              <div className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                                isSelected ? "bg-primary-500/20" : "bg-secondary"
                              )}>
                                <Icon className={cn(
                                  "h-4 w-4",
                                  isSelected ? "text-primary-400" : "text-muted-foreground"
                                )} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-medium text-xs",
                                    isSelected ? "text-primary-300" : "text-foreground"
                                  )}>
                                    {model.name}
                                  </span>
                                  {isSelected && (
                                    <CheckIcon className="h-3 w-3 text-primary-400" />
                                  )}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {model.provider} • {model.description}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Separador */}
                      <div className="mx-3 border-t border-primary-500/10" />

                      {/* Sección: Modelos Premium */}
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <Crown className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Modelos Premium
                          </span>
                        </div>
                        
                        {premiumModels.map((model) => {
                          const Icon = getModelIcon(model.id)
                          
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setModelSelectorOpen(false)
                                setShowUpgradeModal(true)
                              }}
                              className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all duration-200 hover:bg-secondary/50 border border-transparent opacity-60 hover:opacity-80"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 bg-secondary">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-xs text-muted-foreground">
                                    {model.name}
                                  </span>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {model.provider} • {model.description}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                        
                        {/* CTA Upgrade */}
                        <div className="mt-1 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModelSelectorOpen(false)
                              setShowUpgradeModal(true)
                            }}
                            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-primary-300 text-xs font-medium hover:from-primary-500/30 hover:to-primary-600/30 transition-all duration-200"
                          >
                            <Crown className="h-3.5 w-3.5" />
                            Desbloquear todos los modelos
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Selector de Asistente */}
                <Popover open={assistantSelectorOpen} onOpenChange={setAssistantSelectorOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                    >
                      <AssistantIcon className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="max-w-[100px] truncate">{selectedAssistantInfo.name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  
                  <PopoverContent 
                    align="start" 
                    className="w-56 p-2 bg-popover/95 backdrop-blur-xl border-primary-500/20 shadow-xl"
                  >
                    {assistants.map((assistant) => {
                      const isSelected = selectedAssistant === assistant.id
                      
                      return (
                        <button
                          key={assistant.id}
                          type="button"
                          onClick={() => {
                            setSelectedAssistant(assistant.id)
                            setAssistantSelectorOpen(false)
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200",
                            isSelected 
                              ? "bg-primary-500/15 border border-primary-500/30" 
                              : "hover:bg-secondary/80 border border-transparent"
                          )}
                        >
                          <assistant.icon className={cn(
                            "h-4 w-4",
                            isSelected ? "text-primary-400" : "text-muted-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-xs",
                              isSelected ? "text-primary-300" : "text-foreground"
                            )}>
                              {assistant.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {assistant.description}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckIcon className="h-3 w-3 text-primary-400" />
                          )}
                        </button>
                      )
                    })}
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* LADO DERECHO: Acciones y Utilidades */}
              <div className="flex items-center gap-0.5">
                {/* Toggle Incógnito */}
                <button
                  type="button"
                  onClick={() => onIncognitoChange?.(!incognitoMode)}
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
                    incognitoMode 
                      ? "bg-primary-500/20 text-primary-400" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  title={incognitoMode ? "Desactivar incógnito" : "Activar incógnito"}
                >
                  <Ghost className="h-3.5 w-3.5" />
                </button>

                {/* Stats Tooltip */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                      title="Estadísticas"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  
                  <PopoverContent align="end" className="w-56 p-0 bg-popover/95 backdrop-blur-xl border-primary-500/20">
                    <div className="p-3 border-b border-primary-500/10">
                      <h4 className="font-semibold text-xs flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5 text-primary-400" />
                        Estadísticas de Sesión
                      </h4>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      {/* Puntos Restantes */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-primary-400" />
                          <span className="text-xs text-muted-foreground">Puntos</span>
                        </div>
                        <span className="text-xs font-semibold text-primary-300">{formatPoints(pointsBalance)}</span>
                      </div>
                      
                      {/* Contexto */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-xs text-muted-foreground">Contexto</span>
                        </div>
                        <span className="text-xs font-semibold text-cyan-300">{formatContext(telemetry.contextUsed, telemetry.contextLimit)}</span>
                      </div>
                      
                      {/* Última Petición */}
                      <div className="flex items-center justify-between pt-2 border-t border-primary-500/10">
                        <span className="text-xs text-muted-foreground">Última petición</span>
                        <div className="text-right">
                          <div className="text-xs font-semibold">{telemetry.lastRequestTokens.toLocaleString()} tokens</div>
                          <div className="text-[10px] text-primary-300">{telemetry.lastRequestCost.toFixed(2)} pts</div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Botón de Voz */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
                    isRecording 
                      ? "bg-red-500/20 text-red-400 animate-pulse" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  title={isRecording ? "Detener grabación" : "Entrada por voz"}
                >
                  {isRecording ? (
                    <Square className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>
                
                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={!hasContent || isLoading}
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
                    hasContent && !isLoading
                      ? "bg-primary-600 text-white hover:bg-primary-500 shadow-glow-sm"
                      : "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
        
        {/* Helper text */}
        <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Enter</kbd>
          {' '}para enviar ·{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Shift+Enter</kbd>
          {' '}para nueva línea
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAL DE UPGRADE (con accesibilidad corregida)
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-popover/95 backdrop-blur-xl border-primary-500/20 max-w-md">
          <VisuallyHidden>
            <DialogTitle>Desbloquea Aether Premium</DialogTitle>
          </VisuallyHidden>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-primary-500/20 border border-amber-500/30">
                <Crown className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Desbloquea Aether Premium</h2>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Accede a los modelos más potentes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Con Aether Premium tendrás acceso a:
            </p>
            
            <ul className="space-y-2">
              {[
                'Claude 3.5 Sonnet y GPT-4o',
                'Contexto ampliado hasta 200K tokens',
                'Prioridad en tiempos de respuesta',
                'Funciones avanzadas de análisis',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-400" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 hover:bg-secondary"
              >
                Quizás después
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
              >
                <Link href="/pricing">
                  Ver planes
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
