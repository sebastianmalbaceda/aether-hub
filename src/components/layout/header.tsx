'use client'

import { useState } from 'react'
import {
  Bell,
  Zap,
  Sparkles,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/user-store'
import { PricingModal } from '@/components/pricing/pricing-modal'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  
  // Pricing modal state
  const [showPricing, setShowPricing] = useState(false)
  
  // Format points with K suffix - null-safe
  const formatPoints = (points: number | null | undefined) => {
    if (points === null || points === undefined || isNaN(points)) return '0'
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return points.toString()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-primary-500/10 bg-background/80 backdrop-blur-xl px-4 lg:px-6 transition-all duration-300">
      {/* ═══════════════════════════════════════════════════════════════
          IZQUIERDA: Logo/Breadcrumbs (minimalista)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 transition-all duration-200 hover:bg-primary-500/5 hover:text-primary-400"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo para móvil (desktop lo tiene en sidebar) */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Aether</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CENTRO: Plan Gratuito · Actualizar
      ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex">
        <button
          onClick={() => setShowPricing(true)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-sm font-medium text-primary-300 hover:from-primary-500/20 hover:to-primary-600/20 hover:border-primary-500/40 transition-all duration-200"
        >
          <Sparkles className="h-4 w-4" />
          <span>Plan Gratuito</span>
          <span className="text-primary-400">·</span>
          <span className="text-primary-200 hover:text-white">Actualizar</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DERECHA: Puntos + Notificaciones
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 md:gap-3 justify-end">
        {/* Points indicator */}
        <button className="flex items-center gap-1.5 rounded-full bg-secondary/50 border border-primary-500/20 px-3 py-1.5 transition-all duration-200 hover:bg-secondary hover:border-primary-500/30 cursor-pointer">
          <Zap className="h-3.5 w-3.5 text-primary-400" />
          <span className="text-sm font-medium text-primary-300">{formatPoints(pointsBalance)} pts</span>
        </button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 transition-all duration-200 hover:bg-primary-500/5 hover:text-primary-400"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
                0
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 bg-popover/95 backdrop-blur-xl border-primary-500/20">
            <div className="p-4 border-b border-primary-500/10">
              <h4 className="font-semibold text-sm">Notificaciones</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Tus actualizaciones y alertas</p>
            </div>
            <div className="py-8 text-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">Todo al día</p>
              <p className="text-xs mt-1">No hay notificaciones nuevas</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Pricing Modal */}
      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
    </header>
  )
}
