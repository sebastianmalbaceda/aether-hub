'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  Trash2,
  Plus,
  Mic,
  Paperclip,
  Ghost,
  Code,
  GraduationCap,
  Pen,
  Coffee,
  Lightbulb,
  ArrowUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ModelSelectorCompact } from './model-selector-popup'
import type { Message } from '@/types'

// Dynamic import for react-markdown to avoid SSR issues
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatInterfaceProps {
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (content: string) => void
  onRegenerate?: () => void
  onDeleteChat?: () => void
  selectedModelId?: string
  onModelSelect?: (modelId: string) => void
  incognitoMode?: boolean
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
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

export function ChatInterface({ 
  messages, 
  isLoading = false, 
  onSendMessage,
  onRegenerate,
  onDeleteChat,
  selectedModelId = 'aether-flash',
  onModelSelect,
  incognitoMode = false,
  className 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [, setFeedbackVersion] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

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
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
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

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* ═══════════════════════════════════════════════════════════════
          MESSAGES AREA
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          /* ═══════════════════════════════════════════════════════════════
              WELCOME STATE - Estilo Claude con fuente Serif
          ═══════════════════════════════════════════════════════════════ */
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            {/* Incógnito Banner */}
            {incognitoMode && (
              <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50">
                <Ghost className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium">Estás de incógnito</span>
              </div>
            )}
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mb-6 shadow-glow-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            {/* Title - Fuente Serif elegante */}
            <h1 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-foreground">
              {incognitoMode ? 'Modo Incógnito' : '¿En qué creamos hoy?'}
            </h1>
            
            {/* Subtitle */}
            <p className="text-muted-foreground max-w-md mb-8">
              {incognitoMode 
                ? 'Las conversaciones de incógnito no se guardan en el historial.'
                : 'Selecciona un modelo y comienza a crear.'
              }
            </p>

            {/* Quick Actions - Píldoras */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground bg-transparent border border-border/50 hover:bg-secondary hover:text-foreground hover:border-primary-500/30 transition-all duration-200"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
              MESSAGES LIST
          ═══════════════════════════════════════════════════════════════ */
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
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
          INPUT BOX - Estilo Claude integrado
      ═══════════════════════════════════════════════════════════════ */}
      <div className="p-3 md:p-4 bg-background/80 backdrop-blur-xl">
        {/* Incógnito notice */}
        {incognitoMode && messages.length > 0 && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground justify-center">
            <Ghost className="h-3 w-3" />
            <span>Las conversaciones de incógnito no se guardan en el historial.</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Input container - Rounded pill style */}
          <div className="relative bg-secondary/50 border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 focus-within:border-primary-500/30 focus-within:shadow-glow-sm">
            {/* Top row: Textarea */}
            <div className="flex items-start gap-2 p-3">
              {/* Attach button */}
              <button
                type="button"
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Adjuntar archivo"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={incognitoMode ? "¿Qué necesitas? (no se guardará)" : "¿Cómo puedo ayudarte hoy?"}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-base resize-none focus:outline-none placeholder:text-muted-foreground/60 disabled:opacity-50 min-h-[24px] max-h-[200px]"
                style={{ height: 'auto' }}
              />
            </div>
            
            {/* Bottom row: Model selector + Actions */}
            <div className="flex items-center justify-between px-3 pb-3 pt-0">
              {/* Left: Model selector */}
              <div className="flex items-center gap-2">
                {onModelSelect && (
                  <ModelSelectorCompact 
                    selectedModelId={selectedModelId}
                    onModelSelect={onModelSelect}
                  />
                )}
              </div>
              
              {/* Right: Mic + Send */}
              <div className="flex items-center gap-1">
                {/* Mic button */}
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Entrada por voz"
                >
                  <Mic className="h-4 w-4" />
                </button>
                
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    input.trim() && !isLoading
                      ? "bg-primary-600 text-white hover:bg-primary-500 shadow-glow-sm"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
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
    </div>
  )
}
