'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Zap, Clock, MessageSquare, Bot, Sparkles, Coins } from 'lucide-react'
import { useChatStore, selectFormattedContextUsage } from '@/stores/chat-store'
import { useUserStore, selectUsagePercentage } from '@/stores/user-store'

export function TelemetryPanel() {
  // Chat store
  const telemetry = useChatStore((state) => state.telemetry)
  const getSelectedModel = useChatStore((state) => state.getSelectedModel)
  const getSelectedSkill = useChatStore((state) => state.getSelectedSkill)
  const formattedContextUsage = useChatStore(selectFormattedContextUsage)
  
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const dailyLimit = useUserStore((state) => state.dailyLimit)
  const dailyUsage = useUserStore((state) => state.dailyUsage)
  const usagePercentage = useUserStore(selectUsagePercentage)
  
  const selectedModel = getSelectedModel()
  const selectedSkill = getSelectedSkill()
  
  const remainingToday = Math.max(dailyLimit - dailyUsage, 0)

  // Format numbers with K/M suffix - null-safe
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0'
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  // Determine progress bar color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return '[&>div]:bg-red-500'
    if (percentage > 75) return '[&>div]:bg-yellow-500'
    return '[&>div]:bg-blue-500'
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500">
      {/* Session Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-medium">Sesión Actual</h3>
      </div>

      {/* FASE 3: Active Model & Skill compactados como badges sin borders */}
      <div className="flex flex-wrap gap-2">
        {selectedModel && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background-secondary/50 backdrop-blur-sm text-xs">
            <Bot className="w-3 h-3 text-primary-400" />
            <span className="text-muted-foreground">Modelo:</span>
            <span className="font-medium truncate max-w-[100px]">{selectedModel.name}</span>
          </div>
        )}
        {selectedSkill && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background-secondary/50 backdrop-blur-sm text-xs">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-muted-foreground">Asistente:</span>
            <span className="font-medium truncate max-w-[100px]">{selectedSkill.name}</span>
          </div>
        )}
      </div>

      {/* FASE 3: Espaciado mejorado con fondos translúcidos */}
      {/* Points Balance */}
      <div className="space-y-2 p-3 rounded-lg bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary-400" />
            Puntos Restantes
          </span>
          <span className="font-medium">{formatNumber(pointsBalance)}</span>
        </div>
        <Progress 
          value={100} 
          className="h-1.5 [&>div]:bg-primary-500" 
        />
      </div>

      {/* Daily Usage */}
      <div className="space-y-2 p-3 rounded-lg bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Uso Hoy
          </span>
          <span className="font-medium">
            {formatNumber(dailyUsage)} / {formatNumber(dailyLimit)}
          </span>
        </div>
        <Progress 
          value={usagePercentage} 
          className={cn('h-1.5', getProgressColor(usagePercentage))}
        />
        <p className="text-xs text-muted-foreground">
          {formatNumber(remainingToday)} puntos restantes hoy
        </p>
      </div>

      {/* Context Usage */}
      <div className="space-y-2 p-3 rounded-lg bg-background-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-green-400" />
            Contexto Usado
          </span>
          <span className="font-medium">{formattedContextUsage}</span>
        </div>
        <Progress 
          value={telemetry.contextPercentage} 
          className={cn('h-1.5', getProgressColor(telemetry.contextPercentage))}
        />
      </div>

      {/* FASE 3: Última Petición y Total Sesión unificados en grid compacto sin border */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Last Request Stats */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Última Petición</p>
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-medium">{telemetry.lastRequestTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Coste:</span>
            <span className="font-medium">{telemetry.lastRequestCost} pts</span>
          </div>
        </div>

        {/* Session Totals */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Total Sesión</p>
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-medium">{telemetry.totalSessionTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Coste:</span>
            <span className="font-medium">{telemetry.totalSessionCost} pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
