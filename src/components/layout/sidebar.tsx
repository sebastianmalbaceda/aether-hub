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
  HelpCircle,
  ArrowUp,
  Sparkles,
  X,
  Pencil,
  Trash2,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user-store'
import { SettingsModal } from '@/components/settings/settings-modal'
import { PricingModal } from '@/components/pricing/pricing-modal'
import { SupportCenter } from '@/components/support/support-center'

// Navegación principal
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Arena', href: '/arena', icon: MessageSquare },
  { name: 'Imágenes', href: '/arena/imagenes', icon: Image },
  { name: 'Video', href: '/arena/video', icon: Video },
  { name: 'Audio', href: '/arena/audio', icon: Music },
]

// Tipos de arena para el historial
type ArenaType = 'texto' | 'codigo' | 'imagenes' | 'video' | 'audio'

// Chat histórico con tipo de arena
interface ChatHistoryItem {
  id: string
  title: string
  href: string
  arenaType: ArenaType
  createdAt: Date
}

// Historial mixto mockeado con identificación de arena
const mockChatHistory: ChatHistoryItem[] = [
  { id: '1', title: 'Generador de código en Python', href: '/arena-texto?session=1', arenaType: 'codigo', createdAt: new Date() },
  { id: '2', title: 'Resumen de la Divina Comedia', href: '/arena-texto?session=2', arenaType: 'texto', createdAt: new Date() },
  { id: '3', title: 'Análisis de datos con Pandas', href: '/arena-codigo?session=3', arenaType: 'codigo', createdAt: new Date() },
  { id: '4', title: 'Generar imagen de paisaje futurista', href: '/arena/imagenes?session=4', arenaType: 'imagenes', createdAt: new Date() },
  { id: '5', title: 'Traducción de documento legal', href: '/arena-texto?session=5', arenaType: 'texto', createdAt: new Date() },
  { id: '6', title: 'Explicación de algoritmos ML', href: '/arena-texto?session=6', arenaType: 'texto', createdAt: new Date() },
  { id: '7', title: 'Script de automatización', href: '/arena-codigo?session=7', arenaType: 'codigo', createdAt: new Date() },
  { id: '8', title: 'Video promocional para startup', href: '/arena/video?session=8', arenaType: 'video', createdAt: new Date() },
]

// Icono según tipo de arena
const getArenaIcon = (type: ArenaType) => {
  switch (type) {
    case 'texto': return MessageSquare
    case 'codigo': return Code
    case 'imagenes': return Image
    case 'video': return Video
    case 'audio': return Music
    default: return MessageSquare
  }
}

// Color según tipo de arena
const getArenaColor = (type: ArenaType) => {
  switch (type) {
    case 'texto': return 'text-blue-400'
    case 'codigo': return 'text-green-400'
    case 'imagenes': return 'text-pink-400'
    case 'video': return 'text-orange-400'
    case 'audio': return 'text-cyan-400'
    default: return 'text-muted-foreground'
  }
}

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
  
  // Estado del historial
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(mockChatHistory)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null)
  
  // Estado de los modales
  const [showSettings, setShowSettings] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  
  // Lógica de colapso combinada
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

  // Filtrar chats por búsqueda
  const filteredChats = chatHistory.filter(chat => 
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

  // Handlers para acciones del historial
  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      setChatHistory(prev => prev.map(chat => 
        chat.id === editingChatId ? { ...chat, title: editTitle.trim() } : chat
      ))
    }
    setEditingChatId(null)
    setEditTitle('')
  }

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    setDeleteChatId(null)
  }

  return (
    <aside
      className={cn(
        'h-full border-r border-primary-500/10 bg-background-secondary/50 flex flex-col transition-[width] duration-300 ease-in-out relative',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        isMobile && 'w-full relative z-0 border-none bg-background-secondary'
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER - Logo + Colapsar
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex h-14 items-center justify-between border-b border-primary-500/10 px-3 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 transition-all duration-200 group-hover:shadow-glow-sm">
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
              "h-8 w-8 transition-all duration-200 hover:bg-primary-500/10 hover:text-primary-400",
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
                  : 'text-muted-foreground hover:bg-primary-500/5 hover:text-foreground',
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
        <div className="mx-3 border-t border-primary-500/10" />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          HISTORIAL DE CHATS MULTI-ARENA
      ═══════════════════════════════════════════════════════════════ */}
      {(!collapsed || isMobile) && (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-2 py-2">
          {/* Header con título y botón de búsqueda */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Historial
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
                  className="h-8 pl-8 pr-3 text-sm bg-secondary/50 border-primary-500/20 focus:border-primary-500/50 focus:ring-primary-500/20"
                />
              </div>
            </div>
          )}

          {/* Lista de chats con scroll oculto */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 pb-16">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const ArenaIcon = getArenaIcon(chat.arenaType)
                const arenaColor = getArenaColor(chat.arenaType)
                const isEditing = editingChatId === chat.id
                
                return (
                  <div
                    key={chat.id}
                    className="group relative"
                  >
                    {isEditing ? (
                      /* Modo edición */
                      <div className="flex items-center gap-1 px-2 py-1.5">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm bg-secondary/50 border-primary-500/30"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') setEditingChatId(null)
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-green-400 hover:text-green-300"
                          onClick={handleSaveEdit}
                        >
                          <Zap className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingChatId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      /* Modo normal */
                      <Link
                        href={chat.href}
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary-500/5 hover:text-foreground transition-all duration-200 group"
                        title={chat.title}
                      >
                        {/* Icono del tipo de arena */}
                        <ArenaIcon className={cn("h-4 w-4 flex-shrink-0", arenaColor)} />
                        
                        {/* Título truncado */}
                        <span className="truncate flex-1">{chat.title}</span>
                        
                        {/* Acciones hover */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEditChat(chat.id, chat.title)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-red-400"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setDeleteChatId(chat.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Link>
                    )}
                  </div>
                )
              })
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
          FOOTER - Menú de Usuario (ANCLADO AL FONDO)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-primary-500/10 bg-background-secondary/95 backdrop-blur-sm p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-all duration-200 hover:bg-primary-500/5",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage 
                  src={user?.avatarUrl || ''} 
                  alt={user?.fullName || 'Usuario'} 
                />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-medium">
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
            className="w-64 bg-popover/95 backdrop-blur-xl border-primary-500/20"
          >
            {/* Header con email */}
            <DropdownMenuLabel className="font-normal">
              <span className="text-xs text-muted-foreground">
                {user?.email || 'usuario@ejemplo.com'}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary-500/10" />
            
            {/* Opciones principales */}
            <DropdownMenuItem
              className="cursor-pointer hover:bg-primary-500/5"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Ajustes</span>
              <span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                ⇧⌘,
              </span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="cursor-pointer hover:bg-primary-500/5"
              onClick={() => setShowSupport(true)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>Ayuda</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-primary-500/10" />
            
            {/* Mejorar plan */}
            <DropdownMenuItem
              className="cursor-pointer hover:bg-primary-500/5"
              onClick={() => setShowPricing(true)}
            >
              <ArrowUp className="h-4 w-4 mr-2 text-primary-400" />
              <span className="text-primary-400">Mejorar plan</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-primary-500/10" />
            
            {/* Cerrar sesión */}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10"
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

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGO DE CONFIRMACIÓN PARA ELIMINAR
      ═══════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deleteChatId} onOpenChange={() => setDeleteChatId(null)}>
        <AlertDialogContent className="bg-popover/95 backdrop-blur-xl border-primary-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El chat será eliminado permanentemente de tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="hover:bg-secondary"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChatId && handleDeleteChat(deleteChatId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modales */}
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
      <SupportCenter open={showSupport} onOpenChange={setShowSupport} />
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
      className="lg:hidden transition-all duration-200 hover:bg-primary-500/5 hover:text-primary-400"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  )
}
