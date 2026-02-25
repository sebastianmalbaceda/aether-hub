'use client'

import Link from 'next/link'
import {
  Bell,
  Zap,
  ChevronDown,
  LogOut,
  Settings,
  User,
  CreditCard,
  Menu,
  PanelRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user-store'

interface HeaderProps {
  onMenuClick?: () => void
  onPanelClick?: () => void
}

export function Header({ onMenuClick, onPanelClick }: HeaderProps) {
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const user = useUserStore((state) => state.user)
  
  // Format points with K suffix
  const formatPoints = (points: number) => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return points.toString()
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'AU'
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300">
      {/* FASE 1: Estructura limpia sin Logo redundante */}
      
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
          DERECHA: Puntos + Notificaciones + Avatar (justify-end garantiza alineación)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 md:gap-4 justify-end">
        {/* Points indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-primary-700/10 px-3 py-1.5 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
          <Zap className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium">{formatPoints(pointsBalance)} pts</span>
        </div>

        {/* Right panel toggle (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPanelClick}
          className="xl:hidden transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
        >
          <PanelRight className="h-5 w-5" />
        </Button>

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

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.avatarUrl || ''} 
                  alt={user?.fullName || 'Usuario'} 
                />
                <AvatarFallback className="bg-primary-700 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.fullName || 'Usuario Demo'}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || 'usuario@ejemplo.com'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracion" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracion" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/pricing" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Suscripción
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/login'
                } catch (error) {
                  console.error('Logout failed:', error)
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
