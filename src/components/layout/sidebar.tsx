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
  ChevronUp,
  User,
  Settings,
  CreditCard,
  LogOut,
  Search,
  Globe,
  HelpCircle,
  ArrowUp,
  Puzzle,
  Gift,
  Info,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user-store'

// Navegación principal
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Arena Texto', href: '/arena-texto', icon: MessageSquare },
  { name: 'Arena Código', href: '/arena-codigo', icon: Code },
  { name: 'Imágenes', href: '/arena/imagenes', icon: Image },
  { name: 'Video', href: '/arena/video', icon: Video },
  { name: 'Audio', href: '/arena/audio', icon: Music },
]

// Chats recientes mockeados
const recentChats = [
  { id: '1', title: 'Generador de código en Python', href: '/arena-texto?session=1' },
  { id: '2', title: 'Resumen de la Divina Comedia', href: '/arena-texto?session=2' },
  { id: '3', title: 'Análisis de datos con Pandas', href: '/arena-texto?session=3' },
  { id: '4', title: 'Ideas para startup tecnológica', href: '/arena-texto?session=4' },
  { id: '5', title: 'Traducción de documento legal', href: '/arena-texto?session=5' },
  { id: '6', title: 'Explicación de algoritmos ML', href: '/arena-texto?session=6' },
]

// Idiomas disponibles
const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
]

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
  
  // Estado de búsqueda
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  
  // Lógica de colapso combinada
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

  // Filtrar chats por búsqueda
  const filteredChats = recentChats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  // Detectar ruta activa
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
        'h-full border-r border-border/50 bg-background-secondary/50 flex flex-col transition-[width] duration-300 ease-in-out',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        isMobile && 'w-full relative z-0 border-none bg-background-secondary'
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER - Logo + Colapsar
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex h-14 items-center justify-between border-b border-border/50 px-3 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 transition-all duration-200 group-hover:shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Aether</span>
          </Link>
        )}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 transition-all duration-200 hover:bg-secondary hover:text-primary-400",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NAVEGACIÓN PRINCIPAL
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="flex-shrink-0 space-y-0.5 p-2">
        {navigation.map((item) => {
          const isActive = isNavItemActive(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border-l-2 border-primary-500 shadow-[inset_0_0_20px_rgba(157,78,221,0.1)]'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                collapsed && !isMobile && 'justify-center px-2'
              )}
              title={collapsed && !isMobile ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SEPARADOR
      ═══════════════════════════════════════════════════════════════ */}
      {(!collapsed || isMobile) && (
        <div className="mx-3 border-t border-border/50" />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CHATS RECIENTES con Búsqueda
      ═══════════════════════════════════════════════════════════════ */}
      {(!collapsed || isMobile) && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-2 py-2">
          {/* Header con título y botón de búsqueda */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Chats Recientes
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Barra de búsqueda expandible */}
          {showSearch && (
            <div className="mb-2 animate-slide-up">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar en el historial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-sm bg-secondary/50 border-border/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                />
              </div>
            </div>
          )}

          {/* Lista de chats con scroll oculto */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={chat.href}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-200 group"
                  title={chat.title}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground/50 group-hover:text-primary-400 transition-colors" />
                  <span className="truncate">{chat.title}</span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                <p>No se encontraron chats</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER - Menú de Usuario (Estilo Claude)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 border-t border-border/50 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-all duration-200 hover:bg-secondary/80",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage 
                  src={user?.avatarUrl || ''} 
                  alt={user?.fullName || 'Usuario'} 
                />
                <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-800 text-white text-xs font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user?.fullName || 'Usuario Demo'}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {user?.email || 'usuario@ejemplo.com'}
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align={collapsed && !isMobile ? "start" : "end"} 
            side="top"
            className="w-64 bg-popover/95 backdrop-blur-xl border-border/50"
          >
            {/* Header con email */}
            <DropdownMenuLabel className="font-normal">
              <span className="text-xs text-muted-foreground">
                {user?.email || 'usuario@ejemplo.com'}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            
            {/* Opciones principales */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/configuracion" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Ajustes</span>
                <span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  ⇧⌘,
                </span>
              </Link>
            </DropdownMenuItem>
            
            {/* Submenú de idioma */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Globe className="h-4 w-4 mr-2" />
                <span>Idioma</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40 bg-popover/95 backdrop-blur-xl border-border/50">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="cursor-pointer"
                  >
                    {lang.name}
                    {lang.code === 'es' && (
                      <span className="ml-auto text-primary-400">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>Obtener ayuda</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            {/* Opciones Premium */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/pricing" className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-primary-400" />
                <span className="text-primary-400">Mejorar plan</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer">
              <Puzzle className="h-4 w-4 mr-2" />
              <span>Obtener aplicaciones y extensiones</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer">
              <Gift className="h-4 w-4 mr-2" />
              <span>Regalar Aether Premium</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer">
              <Info className="h-4 w-4 mr-2" />
              <span>Más información</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            {/* Cerrar sesión */}
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
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

// Componente para botón de menú móvil
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden transition-all duration-200 hover:bg-secondary hover:text-primary-400"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  )
}
