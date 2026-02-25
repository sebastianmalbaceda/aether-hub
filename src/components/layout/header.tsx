'use client'

import Link from 'next/link'
import {
  Bell,
  Zap,
  Sparkles,
  Menu
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300">
      {/* FASE 4: Estructura limpia - Usuario y Logo movidos al Sidebar */}
      
      {/* ═══════════════════════════════════════════════════════════════
          IZQUIERDA: Solo botón hamburguesa (móvil)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center">
        {/* Mobile menu button - Solo visible en móvil */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CENTRO: CTA "Mejora tu plan" (flex-1 para centrar)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="hidden sm:inline-flex border-primary-500/50 hover:bg-primary-500/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-200 gap-2"
        >
          <Link href="/pricing">
            <Sparkles className="h-4 w-4" />
            <span>Mejora tu plan</span>
          </Link>
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DERECHA: Puntos + Notificaciones (justify-end garantiza alineación)
          FASE 4: Eliminado PanelRight (telemetría) y menú de usuario (movido a Sidebar)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 md:gap-4 justify-end">
        {/* Points indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-primary-700/10 px-3 py-1.5 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
          <Zap className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium">{formatPoints(pointsBalance)} pts</span>
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-600 text-[10px] font-bold text-white flex items-center justify-center">
                0
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Notificaciones</h4>
              <div className="py-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notificaciones nuevas</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
