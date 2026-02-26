'use client'

import Link from 'next/link'
import {
  Bell,
  Zap,
  Sparkles,
  Menu,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUserStore } from '@/stores/user-store'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  
  // Format points with K suffix - null-safe
  const formatPoints = (points: number | null | undefined) => {
    if (points === null || points === undefined || isNaN(points)) return '0'
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return points.toString()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6 transition-all duration-300">
      {/* ═══════════════════════════════════════════════════════════════
          IZQUIERDA: Solo botón hamburguesa (móvil)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 transition-all duration-200 hover:bg-secondary hover:text-primary-400"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CENTRO: CTA "Mejora tu plan" 
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="hidden sm:inline-flex h-8 gap-2 border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/15 hover:border-primary-500/50 text-primary-300 hover:text-primary-200 transition-all duration-200"
        >
          <Link href="/pricing">
            <Crown className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">Plan Gratuito · Actualizar</span>
          </Link>
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DERECHA: Puntos + Notificaciones
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 md:gap-3 justify-end">
        {/* Points indicator - Diseño mejorado */}
        <div className="flex items-center gap-2 rounded-full bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 transition-all duration-200 hover:bg-primary-500/15 hover:border-primary-500/30 cursor-default">
          <Zap className="h-3.5 w-3.5 text-primary-400" />
          <span className="text-sm font-medium text-primary-300">{formatPoints(pointsBalance)} pts</span>
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-9 w-9 transition-all duration-200 hover:bg-secondary hover:text-primary-400"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
                0
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 bg-popover/95 backdrop-blur-xl border-border/50">
            <div className="p-4 border-b border-border/50">
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
    </header>
  )
}
