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
  Settings, 
  History,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
// FASE 2: useUserStore y selectUsagePercentage eliminados - puntos ahora solo en Header

// 1. Rutas actualizadas basadas en el nuevo Sidebar
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Arena Texto', href: '/arena-texto', icon: MessageSquare },
  { name: 'Arena Código', href: '/arena-codigo', icon: Code },
  { name: 'Imágenes', href: '/arena/imagenes', icon: Image },
  { name: 'Video', href: '/arena/video', icon: Video },
  { name: 'Audio', href: '/arena/audio', icon: Music },
  { name: 'Historial', href: '/historial', icon: History },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

// 2. Props adaptadas para asegurar compatibilidad con la responsividad del nuevo
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
  
  // Lógica de colapso combinada (interno o externo)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setCollapsed = onCollapsedChange || setInternalCollapsed

  // FASE 2: Variables de puntos eliminadas - ahora solo en Header

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
        // FASE 2: Sidebar relativo para Holy Grail Layout (no fixed)
        'h-full border-r border-border bg-background-secondary transition-[width] duration-300 ease-in-out flex flex-col',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        // Ajuste mínimo para que no se rompa si está dentro de un componente Sheet en móvil
        isMobile && 'w-full relative z-0 border-none'
      )}
    >
      {/* Logo - FASE 4: Hover neón en logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Aether</span>
          </Link>
        )}
        
        {/* Ocultamos el botón de colapsar en vista móvil - FASE 4: Hover neón */}
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

      {/* Navigation - FASE 4: Efectos hover neón en items activos */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
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

      {/* FASE 2: Redundancia eliminada - El saldo de puntos ahora solo vive en el Header */}
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