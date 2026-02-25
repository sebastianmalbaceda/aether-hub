'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Plus,
  Zap,
  ChevronDown,
  LogOut,
  Settings,
  User,
  CreditCard,
  Menu,
  PanelRight
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
import { useChatStore } from '@/stores/chat-store'
import { useUserStore } from '@/stores/user-store'

interface HeaderProps {
  onMenuClick?: () => void
  onPanelClick?: () => void
}

export function Header({ onMenuClick, onPanelClick }: HeaderProps) {
  const pathname = usePathname()
  
  // Chat store
  const startNewSession = useChatStore((state) => state.startNewSession)
  
  // User store
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const user = useUserStore((state) => state.user)
  
  // Generate breadcrumb from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return { name, href }
  })

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Left side - Menu button and Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb - Hidden on mobile */}
        <nav className="hidden md:flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          {breadcrumbs.slice(1).map((crumb, index) => (
            <span key={crumb.href} className="flex items-center">
              <span className="mx-2">/</span>
              <Link 
                href={crumb.href}
                className="hover:text-foreground transition-colors"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>

        {/* Mobile page title */}
        <span className="md:hidden text-sm font-medium">
          {breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].name : 'Dashboard'}
        </span>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Actions */}
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hidden sm:inline-flex"
          onClick={startNewSession}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nuevo Chat</span>
        </Button>

        {/* Mobile new chat button */}
        <Button 
          variant="outline" 
          size="icon"
          className="sm:hidden"
          onClick={startNewSession}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Points indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-primary-700/10 px-3 py-1.5">
          <Zap className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium">{formatPoints(pointsBalance)} pts</span>
        </div>

        {/* Right panel toggle (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPanelClick}
          className="lg:hidden"
        >
          <PanelRight className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
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
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                {/* Fixed: Use user avatar URL or empty string to trigger fallback */}
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
