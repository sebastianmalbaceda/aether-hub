'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Zap, Clock, MessageSquare, Bot, Sparkles, Coins, TrendingUp, Activity } from 'lucide-react'
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

  // Format numbers with K/M suffix
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  // Progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500'
    if (percentage > 75) return 'bg-yellow-500'
    return 'bg-primary-500'
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Sesión Actual</h3>
            <p className="text-xs text-muted-foreground">Métricas en tiempo real</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Model & Skill */}
        <div className="flex flex-wrap gap-2">
          {selectedModel && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30">
              <Bot className="w-4 h-4 text-primary-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Modelo</span>
                <span className="text-sm font-medium">{selectedModel.name}</span>
              </div>
            </div>
          )}
          {selectedSkill && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Asistente</span>
                <span className="text-sm font-medium">{selectedSkill.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            MÉTRICAS PRINCIPALES
        ═══════════════════════════════════════════════════════════════ */}
        
        {/* Points Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-muted-foreground">Puntos Restantes</span>
            </div>
            <span className="text-sm font-semibold">{formatNumber(pointsBalance)}</span>
          </div>
          <Progress 
            value={100} 
            className="h-1.5 bg-secondary" 
          />
        </div>

        {/* Daily Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Uso Hoy</span>
            </div>
            <span className="text-sm font-semibold">
              {formatNumber(dailyUsage)} / {formatNumber(dailyLimit)}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-1.5 bg-secondary"
          />
          <p className="text-xs text-muted-foreground">
            {formatNumber(remainingToday)} puntos restantes hoy
          </p>
        </div>

        {/* Context Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Contexto Usado</span>
            </div>
            <span className="text-sm font-semibold">{formattedContextUsage}</span>
          </div>
          <Progress 
            value={telemetry.contextPercentage} 
            className={cn('h-1.5 bg-secondary', `[&>div]:${getProgressColor(telemetry.contextPercentage)}`)}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ESTADÍSTICAS DETALLADAS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalles
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Last Request */}
            <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Última Petición</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tokens</span>
                  <span className="text-xs font-medium">{telemetry.lastRequestTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Coste</span>
                  <span className="text-xs font-medium">{telemetry.lastRequestCost} pts</span>
                </div>
              </div>
            </div>

            {/* Session Totals */}
            <div className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/20">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Sesión</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tokens</span>
                  <span className="text-xs font-medium">{telemetry.totalSessionTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Coste</span>
                  <span className="text-xs font-medium">{telemetry.totalSessionCost} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            INFO ADICIONAL
        ═══════════════════════════════════════════════════════════════ */}
        {selectedModel && (
          <div className="pt-2 border-t border-border/50">
            <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-semibold text-primary-300">Información del Modelo</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Ventana de contexto</span>
                  <span className="font-medium text-foreground">{(selectedModel.contextWindow / 1000)}K tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Output máximo</span>
                  <span className="font-medium text-foreground">{selectedModel.maxOutputTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio entrada</span>
                  <span className="font-medium text-foreground">{selectedModel.pricing.inputPer1K} pts/1K</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio salida</span>
                  <span className="font-medium text-foreground">{selectedModel.pricing.outputPer1K} pts/1K</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
