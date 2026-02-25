'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { ContextStatus } from '@/types'

interface ContextBarProps {
  used: number
  limit: number
  status: ContextStatus
  className?: string
}

export function ContextBar({ used, limit, status, className }: ContextBarProps) {
  const percentage = Math.min((used / limit) * 100, 100)
  
  const statusConfig = {
    normal: {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      icon: CheckCircle,
      message: 'Contexto óptimo'
    },
    warning: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      icon: AlertTriangle,
      message: 'Atención: Riesgo de pérdida de contexto'
    },
    critical: {
      color: 'bg-red-500',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      icon: AlertTriangle,
      message: '¡Crítico! Considere limpiar memoria o iniciar nuevo chat'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  return (
    <div className={cn('rounded-lg bg-background-secondary/50 backdrop-blur-sm p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.textColor)} />
          <span className="text-sm font-medium">Contexto</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatTokens(used)} / {formatTokens(limit)} tokens
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={cn('h-2', status === 'critical' ? '[&>div]:bg-red-500' : status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500')}
      />
      
      <div className={cn(
        'flex items-center gap-2 mt-2 px-2 py-1 rounded text-xs',
        config.bgColor
      )}>
        <Icon className={cn('w-3 h-3', config.textColor)} />
        <span className={config.textColor}>{config.message}</span>
      </div>

      {status !== 'normal' && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>
            {percentage.toFixed(1)}% del contexto utilizado. 
            {status === 'critical' && ' Las respuestas pueden ser menos precisas.'}
          </p>
        </div>
      )}
    </div>
  )
}
