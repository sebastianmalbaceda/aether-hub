'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Zap, Coins, Clock, MessageSquare, TrendingUp, Bot, Sparkles } from 'lucide-react'
import { useChatStore, selectFormattedContextUsage } from '@/stores/chat-store'
import { useUserStore, selectUsagePercentage } from '@/stores/user-store'

export function TelemetryPanel() {
  // Chat store
  const telemetry = useChatStore((state) => state.telemetry)
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const selectedSkillId = useChatStore((state) => state.selectedSkillId)
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

  // Format numbers with K/M suffix
  const formatNumber = (num: number) => {
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
    <div className="p-4 space-y-4">
      {/* Session Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-medium">Sesión Actual</h3>
      </div>

      {/* Active Model & Skill */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
          <Bot className="w-4 h-4 text-primary-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Modelo Activo</p>
            <p className="text-sm font-medium truncate">
              {selectedModel?.name || 'Sin seleccionar'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Asistente</p>
            <p className="text-sm font-medium truncate">
              {selectedSkill?.name || 'Sin seleccionar'}
            </p>
          </div>
        </div>
      </div>

      {/* Points Balance */}
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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

      {/* Last Request Stats */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Última Petición</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-medium">{telemetry.lastRequestTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Coste:</span>
            <span className="font-medium">{telemetry.lastRequestCost} pts</span>
          </div>
        </div>
      </div>

      {/* Session Totals */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Total Sesión</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Tokens:</span>
            <span className="font-medium">{telemetry.totalSessionTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Coste:</span>
            <span className="font-medium">{telemetry.totalSessionCost} pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
