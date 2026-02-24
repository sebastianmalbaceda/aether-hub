'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Zap, Coins, Clock, MessageSquare, TrendingUp } from 'lucide-react'
import type { SessionTelemetry } from '@/types'

interface TelemetryPanelProps {
  telemetry: SessionTelemetry
  pointsBalance: number
  dailyLimit: number
  dailyUsage: number
  className?: string
}

export function TelemetryPanel({ 
  telemetry, 
  pointsBalance, 
  dailyLimit, 
  dailyUsage,
  className 
}: TelemetryPanelProps) {
  const dailyPercentage = Math.min((dailyUsage / dailyLimit) * 100, 100)
  const remainingToday = Math.max(dailyLimit - dailyUsage, 0)

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Sesión Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Points Balance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary-400" />
                Puntos Restantes
              </span>
              <span className="font-medium">{pointsBalance.toLocaleString()}</span>
            </div>
            <Progress value={100} className="h-1.5" />
          </div>

          {/* Daily Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Uso Hoy
              </span>
              <span className="font-medium">
                {dailyUsage.toLocaleString()} / {dailyLimit.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={dailyPercentage} 
              className={cn(
                'h-1.5',
                dailyPercentage > 90 ? '[&>div]:bg-red-500' : 
                dailyPercentage > 75 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-blue-500'
              )} 
            />
            <p className="text-xs text-muted-foreground">
              {remainingToday.toLocaleString()} puntos restantes hoy
            </p>
          </div>

          {/* Last Request */}
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
                <span className="text-muted-foreground">Costo:</span>
                <span className="font-medium">{telemetry.lastRequestCost.toFixed(2)} pts</span>
              </div>
            </div>
          </div>

          {/* Session Total */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Total de Sesión</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Mensajes:</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Gastado:</span>
                <span className="font-medium">{telemetry.totalSessionCost.toFixed(2)} pts</span>
              </div>
            </div>
          </div>

          {/* Current Model Info */}
          {telemetry.currentModel && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Modelo Activo</p>
              <p className="text-sm font-medium">{telemetry.currentModel}</p>
              {telemetry.currentSkill && (
                <p className="text-xs text-muted-foreground">Skill: {telemetry.currentSkill}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
