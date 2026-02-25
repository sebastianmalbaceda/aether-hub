'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
  className?: string
}

// Feedback state type
type FeedbackState = 'none' | 'positive' | 'negative'

// Message feedback tracking
const messageFeedback: Record<string, FeedbackState> = {}

// Markdown components with custom styling
const markdownComponents = {
  // Code blocks
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
  // Pre blocks (for code blocks with language)
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-secondary/80 p-3 rounded-lg overflow-x-auto my-2">
      {children}
    </pre>
  ),
  // Paragraphs
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  // Lists
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-2">{children}</li>
  ),
  // Headings
  h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-xl font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-lg font-bold mb-2">{children}</h2>
  ),
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-bold mb-2">{children}</h3>
  ),
  // Links
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
  // Blockquotes
  blockquote: ({ children }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary-500 pl-4 italic my-2">
      {children}
    </blockquote>
  ),
  // Strong and emphasis
  strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold">{children}</strong>
  ),
  em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic">{children}</em>
  ),
  // Horizontal rule
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
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          message.role === 'USER'
            ? 'bg-primary-700 text-white'
            : 'bg-secondary text-foreground'
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

        {/* Action buttons for assistant messages */}
        {message.role === 'ASSISTANT' && message.content && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
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
  className 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [, setFeedbackVersion] = useState(0) // For re-rendering on feedback change
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    } catch (err) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido.',
        variant: 'destructive',
      })
    }
  }, [toast])

  const handleFeedback = useCallback((messageId: string, feedback: FeedbackState) => {
    // Trigger re-render to update button states
    setFeedbackVersion(v => v + 1)
    
    // Optionally send feedback to backend
    if (feedback !== 'none') {
      console.log(`Feedback for message ${messageId}: ${feedback}`)
      // Here you could send the feedback to your analytics/telemetry
    }
  }, [])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary-700/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">¡Bienvenido al Arena de Texto!</h3>
            <p className="text-muted-foreground max-w-md">
              Selecciona un modelo y skill en el header, luego escribe tu mensaje para comenzar.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={copyToClipboard}
              onRegenerate={onRegenerate}
              onFeedback={handleFeedback}
            />
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                <span className="text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Responsive with safe area for mobile */}
      <div className="border-t border-border p-3 md:p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 text-base"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
          {onDeleteChat && messages.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onDeleteChat}
              title="Eliminar chat"
              className="flex-shrink-0 hidden sm:inline-flex"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </form>
        <p className="text-xs text-muted-foreground mt-2 hidden md:block">
          Presiona Enter para enviar. El modelo seleccionado procesará tu mensaje.
        </p>
      </div>
    </div>
  )
}
