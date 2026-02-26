'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Check, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  Bot,
  Brain,
  Cpu,
  ArrowRight,
  Star,
  Crown,
} from 'lucide-react'
import { AI_MODELS, type AIModelConfig } from '@/config/ai-models'

// Modelos nativos de Aether (simulados)
const aetherModels: AIModelConfig[] = [
  {
    id: 'aether-pro',
    name: 'Aether Pro',
    provider: 'OPENAI' as const,
    providerDisplayName: 'Aether',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: { inputPer1K: 2, outputPer1K: 8 },
    tier: 'flagship',
    isAvailable: true,
    description: 'Más potente para trabajo ambicioso y complejo.',
  },
  {
    id: 'aether-flash',
    name: 'Aether Flash',
    provider: 'OPENAI' as const,
    providerDisplayName: 'Aether',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: { inputPer1K: 0.5, outputPer1K: 2 },
    tier: 'standard',
    isAvailable: true,
    description: 'Más eficiente para tareas cotidianas.',
  },
]

// Modelos de terceros disponibles
const thirdPartyModels = AI_MODELS.filter(m => m.isAvailable).slice(0, 6)

interface ModelSelectorPopupProps {
  selectedModelId: string
  onModelSelect: (modelId: string) => void
  extendedThinking?: boolean
  onExtendedThinkingChange?: (value: boolean) => void
}

export function ModelSelectorPopup({ 
  selectedModelId, 
  onModelSelect,
  extendedThinking = false,
  onExtendedThinkingChange,
}: ModelSelectorPopupProps) {
  const [open, setOpen] = useState(false)

  const selectedModel = [...aetherModels, ...AI_MODELS].find(m => m.id === selectedModelId)
  
  const getModelIcon = (modelId: string) => {
    if (modelId.includes('aether')) return Sparkles
    if (modelId.includes('claude')) return Bot
    if (modelId.includes('gpt')) return Brain
    return Cpu
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'flagship':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30">
            <Crown className="h-2.5 w-2.5" />
            Premium
          </span>
        )
      case 'premium':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
            Pro
          </span>
        )
      case 'standard':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">
            Estándar
          </span>
        )
      case 'free':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            Gratis
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
            "bg-secondary/50 hover:bg-secondary border border-border/50",
            "transition-all duration-200 hover:border-primary-500/30",
            open && "border-primary-500/50 bg-secondary"
          )}
        >
          {selectedModel ? (
            <>
              {(() => {
                const Icon = getModelIcon(selectedModel.id)
                return <Icon className="h-4 w-4 text-primary-400" />
              })()}
              <span className="max-w-[140px] truncate">{selectedModel.name}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span>Seleccionar modelo</span>
            </>
          )}
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="start" 
        className="w-80 p-0 bg-popover/95 backdrop-blur-xl border-border/50 shadow-xl"
      >
        {/* Header */}
        <div className="p-3 border-b border-border/50">
          <h3 className="font-semibold text-sm">Seleccionar Modelo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Elige el modelo para esta conversación</p>
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
          {/* ═══════════════════════════════════════════════════════════════
              Sección 1: Modelos Nativos Aether (Recomendados)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Modelos Aether
              </span>
            </div>
            
            {aetherModels.map((model) => {
              const isSelected = selectedModelId === model.id
              const Icon = getModelIcon(model.id)
              
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all duration-200",
                    isSelected 
                      ? "bg-primary-500/15 border border-primary-500/30" 
                      : "hover:bg-secondary/80 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                    isSelected ? "bg-primary-500/20" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary-400" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      {getTierBadge(model.tier)}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {model.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Separador */}
          <div className="mx-3 border-t border-border/50" />

          {/* ═══════════════════════════════════════════════════════════════
              Sección 2: Modelos de Terceros (El HUB)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Modelos de Terceros
              </span>
            </div>
            
            {thirdPartyModels.map((model) => {
              const isSelected = selectedModelId === model.id
              const Icon = getModelIcon(model.id)
              
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all duration-200",
                    isSelected 
                      ? "bg-primary-500/15 border border-primary-500/30" 
                      : "hover:bg-secondary/80 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                    isSelected ? "bg-primary-500/20" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary-400" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      <span className="text-[10px] text-muted-foreground">{model.providerDisplayName}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {model.description || `${model.contextWindow / 1000}K contexto`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Separador */}
          <div className="mx-3 border-t border-border/50" />

          {/* ═══════════════════════════════════════════════════════════════
              Toggle: Pensamiento Extendido
          ═══════════════════════════════════════════════════════════════ */}
          <div className="p-3">
            <button
              onClick={() => onExtendedThinkingChange?.(!extendedThinking)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                extendedThinking 
                  ? "bg-primary-500/15 border border-primary-500/30" 
                  : "bg-secondary/50 hover:bg-secondary border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  extendedThinking ? "bg-primary-500/20" : "bg-secondary"
                )}>
                  <Brain className={cn(
                    "h-4 w-4",
                    extendedThinking ? "text-primary-400" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm">Pensamiento extendido</span>
                  <p className="text-xs text-muted-foreground">
                    Piensa más tiempo para tareas complejas
                  </p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <div className={cn(
                "relative h-5 w-9 rounded-full transition-colors duration-200",
                extendedThinking ? "bg-primary-500" : "bg-secondary"
              )}>
                <div className={cn(
                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  extendedThinking && "translate-x-4"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Footer - Más modelos */}
        <div className="p-2 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span>Más modelos</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Componente compacto para el input box
export function ModelSelectorCompact({ 
  selectedModelId, 
  onModelSelect,
}: Pick<ModelSelectorPopupProps, 'selectedModelId' | 'onModelSelect'>) {
  const [open, setOpen] = useState(false)
  
  const selectedModel = [...aetherModels, ...AI_MODELS].find(m => m.id === selectedModelId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-200 hover:bg-secondary/50"
          )}
        >
          <span className="max-w-[120px] truncate font-medium">
            {selectedModel?.name || 'Seleccionar'}
          </span>
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-72 p-0 bg-popover/95 backdrop-blur-xl border-border/50 shadow-xl"
      >
        {/* Versión compacta del selector */}
        <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-hide">
          {/* Aether Models */}
          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Aether
          </div>
          {aetherModels.map((model) => {
            const isSelected = selectedModelId === model.id
            return (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model.id)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all duration-200",
                  isSelected 
                    ? "bg-primary-500/15 text-primary-400" 
                    : "hover:bg-secondary/80"
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span>{model.name}</span>
                {isSelected && <Check className="h-4 w-4 ml-auto" />}
              </button>
            )
          })}
          
          <div className="my-2 border-t border-border/50" />
          
          {/* Third Party */}
          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Terceros
          </div>
          {thirdPartyModels.slice(0, 4).map((model) => {
            const isSelected = selectedModelId === model.id
            return (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model.id)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all duration-200",
                  isSelected 
                    ? "bg-primary-500/15 text-primary-400" 
                    : "hover:bg-secondary/80"
                )}
              >
                <Bot className="h-4 w-4" />
                <span>{model.name}</span>
                <span className="text-[10px] text-muted-foreground">{model.providerDisplayName}</span>
                {isSelected && <Check className="h-4 w-4 ml-auto" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { aetherModels }
