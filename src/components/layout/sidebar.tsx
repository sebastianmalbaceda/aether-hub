'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  MessageSquare, 
  Code, 
  Image, 
  Video, 
  Music, 
  Zap,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user-store'

// FASE 3: Navegación principal sin Configuración ni Historial (movidos a otras ubicaciones)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Arena Texto', href: '/arena-texto', icon: MessageSquare },
  { name: 'Arena Código', href: '/arena-codigo', icon: Code },
  { name: 'Imágenes', href: '/arena/imagenes', icon: Image },
  { name: 'Video', href: '/arena/video', icon: Video },
  { name: 'Audio', href: '/arena/audio', icon: Music },
]

// FASE 3: Chats recientes mockeados para la sección de historial
const recentChats = [
  { id: '1', title: 'Generador de código en Python', href: '/arena-texto?session=1' },
  { id: '2', title: 'Resumen de la Divina Comedia', href: '/arena-texto?session=2' },
  { id: '3', title: 'Análisis de datos con Pandas', href: '/arena-texto?session=3' },
  { id: '4', title: 'Ideas para startup tecnológica', href: '/arena-texto?session=4' },
]

// Props adaptadas para asegurar compatibilidad con la responsividad
interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ 
  isOpen = true, 
  onClose,
  isMobile = false,
  collapsed: externalCollapsed,
  onCollapsedChange
}: SidebarProps) {
  const pathname = usePathname()
  
  // User store para el perfil
  const user = useUserStore((state) => state.user)
  
  // Lógica de colapso combinada (interno o externo)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

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

  // Lógica mejorada para detectar la ruta activa
  const isNavItemActive = (href: string) => {
    const basePath = href.split('?')[0]
    if (basePath === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(basePath)
  }

  return (
    <aside
      className={cn(
        // Sidebar relativo para Holy Grail Layout (no fixed)
        'h-full border-r border-border bg-background-secondary transition-[width] duration-300 ease-in-out flex flex-col',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        // Ajuste mínimo para que no se rompa si está dentro de un componente Sheet en móvil
        isMobile && 'w-full relative z-0 border-none'
      )}
    >
      {/* Logo - Hover neón en logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Aether</span>
          </Link>
        )}
        
        {/* Ocultamos el botón de colapsar en vista móvil - Hover neón */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation - Efectos hover neón en items activos */}
      <nav className="flex-shrink-0 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = isNavItemActive(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose} // Cierra el menú en mobile al hacer clic
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-700/20 text-primary-400 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-[0_0_8px_rgba(139,92,246,0.1)]',
                collapsed && !isMobile && 'justify-center'
              )}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* FASE 3: Separador antes de Chats Recientes */}
      {(!collapsed || isMobile) && (
        <div className="mx-2 my-2 border-t border-border" />
      )}

      {/* FASE 3: Sección de Chats Recientes (solo visible si NO está colapsado) */}
      {(!collapsed || isMobile) && (
        <div className="flex-1 overflow-y-auto px-2 min-h-0">
          <div className="mb-2 px-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chats Recientes
            </span>
          </div>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={chat.href}
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 truncate"
                title={chat.title}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FASE 3: Perfil de Usuario movido desde Header al fondo del Sidebar */}
      <div className="flex-shrink-0 border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.avatarUrl || ''} 
                  alt={user?.fullName || 'Usuario'} 
                />
                <AvatarFallback className="bg-primary-700 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">
                      {user?.fullName || 'Usuario Demo'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user?.email || 'usuario@ejemplo.com'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed && !isMobile ? "start" : "end"} className="w-56">
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
    </aside>
  )
}

// Mantenemos el componente para versión móvil por si tu layout lo sigue usando
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  )
}
