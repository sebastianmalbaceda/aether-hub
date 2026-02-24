'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ContextBar } from '@/components/telemetry/context-bar'
import { TelemetryPanel } from '@/components/telemetry/telemetry-panel'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import type { Message, SessionTelemetry, ContextStatus } from '@/types'

const models = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextLimit: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', contextLimit: 128000 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', contextLimit: 200000 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', contextLimit: 200000 },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', contextLimit: 1000000 },
]

const skills = [
  { id: 'assistant', name: 'Asistente Estándar', description: 'Para tareas generales' },
  { id: 'creative', name: 'Poeta/Creativo', description: 'Escritura creativa' },
  { id: 'academic', name: 'Redactor Académico', description: 'Escritura formal' },
  { id: 'seo', name: 'Experto SEO', description: 'Contenido optimizado' },
  { id: 'summarizer', name: 'Resumidor Ejecutivo', description: 'Resúmenes concisos' },
]

// Mock data for demo
const mockMessages: Message[] = [
  {
    id: '1',
    sessionId: 'demo',
    role: 'USER',
    content: '¡Hola! ¿Puedes explicarme qué es la inteligencia artificial de forma simple?',
    tokensUsed: 15,
    pointsCost: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    sessionId: 'demo',
    role: 'ASSISTANT',
    content: `¡Hola! Con gusto te explico.

La inteligencia artificial (IA) es como un "cerebro digital" que puede aprender y tomar decisiones, similar a como lo hacemos los humanos.

Imagina que le enseñas a una computadora a reconocer fotos de gatos:
1. Le muestras miles de fotos de gatos
2. La computadora encuentra patrones (orejas puntiagudas, bigotes, etc.)
3. Con práctica, aprende a identificar gatos en fotos nuevas

**Tipos principales:**
- **IA Estrecha**: Hace una tarea específica (como el reconocimiento de voz de tu teléfono)
- **IA General**: Puede hacer cualquier tarea intelectual (todavía en desarrollo)

**Ejemplos cotidianos:**
- Los filtros de fotos que usas
- Las recomendaciones de Netflix
- Los asistentes como Siri o Alexa

¿Te gustaría que profundice en algún aspecto específico?`,
    tokensUsed: 245,
    pointsCost: 3.5,
    modelUsed: 'claude-3-5-sonnet',
    createdAt: new Date(),
  },
]

const mockTelemetry: SessionTelemetry = {
  contextUsed: 45230,
  contextLimit: 200000,
  contextPercentage: 22.6,
  lastRequestCost: 3.5,
  lastRequestTokens: 260,
  totalSessionCost: 45.75,
  totalSessionTokens: 3450,
  currentModel: 'Claude 3.5 Sonnet',
  currentSkill: 'Asistente Estándar',
  contextStatus: 'normal',
}

export default function ArenaTextoPage() {
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet')
  const [selectedSkill, setSelectedSkill] = useState('assistant')
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [isLoading, setIsLoading] = useState(false)

  const currentModel = models.find(m => m.id === selectedModel)
  const currentSkill = skills.find(s => s.id === selectedSkill)

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: 'demo',
      role: 'USER',
      content,
      tokensUsed: Math.ceil(content.length / 4),
      pointsCost: 0,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: 'demo',
        role: 'ASSISTANT',
        content: 'Esta es una respuesta de demostración. En producción, aquí se conectaría con la API del modelo seleccionado.',
        tokensUsed: 150,
        pointsCost: 2.25,
        modelUsed: selectedModel,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleNewChat = () => {
    setMessages([])
  }

  // Calculate context status
  const getContextStatus = (): ContextStatus => {
    const percentage = (mockTelemetry.contextUsed / mockTelemetry.contextLimit) * 100
    if (percentage > 90) return 'critical'
    if (percentage > 75) return 'warning'
    return 'normal'
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar modelo" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Skill Selector */}
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    <div className="flex flex-col">
                      <span>{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Chat
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Context Bar */}
        <ContextBar
          used={mockTelemetry.contextUsed}
          limit={currentModel?.contextLimit || 128000}
          status={getContextStatus()}
          className="mb-4"
        />

        {/* Chat Interface */}
        <Card className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            className="h-full"
          />
        </Card>
      </div>

      {/* Right Sidebar - Telemetry */}
      <div className="w-80 flex-shrink-0">
        <TelemetryPanel
          telemetry={mockTelemetry}
          pointsBalance={10000}
          dailyLimit={10000}
          dailyUsage={7500}
        />
      </div>
    </div>
  )
}
