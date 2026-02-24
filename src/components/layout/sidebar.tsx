'use client'

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
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Arena Texto', href: '/dashboard/arena-texto', icon: MessageSquare },
  { name: 'Arena Código', href: '/dashboard/arena-codigo', icon: Code },
  { name: 'Imágenes', href: '/dashboard/arena-multimedia?tab=image', icon: Image },
  { name: 'Video', href: '/dashboard/arena-multimedia?tab=video', icon: Video },
  { name: 'Audio', href: '/dashboard/arena-multimedia?tab=audio', icon: Music },
  { name: 'Historial', href: '/dashboard/history', icon: History },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background-secondary transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Aether</span>
          </Link>
        )}
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-700/20 text-primary-400'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Points Balance */}
      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-background-tertiary p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary-500" />
              <span>Puntos</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              10,000
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div className="h-1.5 w-3/4 rounded-full bg-primary-600" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              75% usado hoy
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
