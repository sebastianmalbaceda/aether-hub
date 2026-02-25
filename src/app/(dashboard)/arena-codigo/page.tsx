'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Code, 
  Play, 
  Copy, 
  Check, 
  Sparkles,
  Send,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { cn } from '@/lib/utils'

// Simple code editor component (Monaco-like interface)
function CodeEditor({ 
  value, 
  onChange, 
  language 
}: { 
  value: string
  onChange: (value: string) => void
  language: string 
}) {
  return (
    <div className="relative h-full w-full rounded-lg border border-border bg-[#1e1e2e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-secondary">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-primary-400" />
          <span className="text-sm text-muted-foreground">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copiar
          </Button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[calc(100%-44px)] p-4 bg-transparent text-sm font-mono text-gray-100 resize-none focus:outline-none"
        placeholder="// Escribe tu código aquí..."
        spellCheck={false}
      />
    </div>
  )
}

// Chat message component for code arena
function CodeChatMessage({ 
  role, 
  content, 
  code 
}: { 
  role: 'user' | 'assistant'
  content: string
  code?: string 
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
            <pre className="p-3 text-sm font-mono text-gray-100 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArenaCodigoPage() {
  const [code, setCode] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; code?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return
    
    const userMessage = { role: 'user' as const, content: inputValue }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Aquí tienes una implementación basada en tu solicitud:',
        code: `// Ejemplo de código generado
function example() {
  console.log("Hola desde Aether!");
  return true;
}`
      }])
      setIsLoading(false)
    }, 1500)
  }, [inputValue, isLoading])
  
  const handleClear = () => {
    setMessages([])
    setCode('')
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Code Editor Panel */}
      <div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary-400" />
            Editor de Código
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
            <Button size="sm" className="bg-primary-700 hover:bg-primary-600">
              <Play className="h-4 w-4 mr-1" />
              Ejecutar
            </Button>
          </div>
        </div>
        <Card className="flex-1 overflow-hidden">
          <CodeEditor 
            value={code} 
            onChange={setCode} 
            language="javascript"
          />
        </Card>
      </div>
      
      {/* Chat Panel */}
      <div className="w-full lg:w-[400px] flex flex-col min-h-[300px] lg:min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Asistente de Código
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Code className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Pide ayuda con tu código</p>
              <p className="text-xs mt-1">Ej: "Optimiza esta función" o "Añade manejo de errores"</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <CodeChatMessage key={i} {...msg} />
            ))
          )}
          {isLoading && (
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe lo que necesitas..."
            className="flex-1 h-10 px-4 rounded-lg border border-border bg-background-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary-700 hover:bg-primary-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
