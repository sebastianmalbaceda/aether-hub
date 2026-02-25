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
import { useUserStore, selectUsagePercentage } from '@/stores/user-store'

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

  // Integración de Zustand (Store)
  const pointsBalance = useUserStore((state) => state.pointsBalance)
  const usagePercentage = useUserStore(selectUsagePercentage)

  // Función formateadora original del nuevo
  const formatPoints = (points: number) => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return points.toString()
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
        // Clases y estructura visual del antiguo conservadas.
        // Solo se añade flex-col para manejar bien el layout interno.
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background-secondary transition-all duration-300 flex flex-col',
        collapsed && !isMobile ? 'w-16' : 'w-64',
        // Ajuste mínimo para que no se rompa si está dentro de un componente Sheet en móvil
        isMobile && 'w-full relative z-0 border-none'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 flex-shrink-0">
        {(!collapsed || isMobile) && (
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Aether</span>
          </Link>
        )}
        
        {/* Ocultamos el botón de colapsar en vista móvil */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = isNavItemActive(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose} // Cierra el menú en mobile al hacer clic
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-700/20 text-primary-400'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
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

      {/* Points Balance - Funcional con store pero con diseño antiguo */}
      {(!collapsed || isMobile) && (
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="rounded-lg bg-background-tertiary p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary-500" />
              <span>Puntos</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {formatPoints(pointsBalance)}
            </div>
            {/* Se mantiene tu HTML de barra de progreso antiguo, enlazando el % dinámicamente al style */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div 
                className="h-1.5 rounded-full bg-primary-600 transition-all duration-500" 
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {usagePercentage.toFixed(0)}% usado hoy
            </p>
          </div>
        </div>
      )}
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