'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { StoresProvider } from '@/components/providers/stores-provider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <StoresProvider>
      {/* FASE 2: Holy Grail Layout - Flexbox horizontal */}
      <div className="flex h-screen w-full overflow-hidden bg-background">
        
        {/* ═══════════════════════════════════════════════════════════════
            1. SIDEBAR IZQUIERDO (Desktop: shrink-0 con transición)
        ═══════════════════════════════════════════════════════════════ */}
        {/* Desktop Sidebar - shrink-0 para que no se comprima */}
        <div className={cn(
          "hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out border-r border-border h-full",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar 
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar (Sheet) - Solo en móvil */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 lg:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
              <SheetDescription>Navega por las diferentes secciones de Aether</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full bg-background-secondary">
              <Sidebar 
                isOpen={true} 
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* ═══════════════════════════════════════════════════════════════
            2. ÁREA PRINCIPAL (Header + Contenido) - flex-1 con overflow hidden
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Header - Ahora ocupa 100% del ancho disponible sin interferencia del panel derecho */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          {/* Main - El contenido de las páginas (incluyendo telemetría si aplica) */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </StoresProvider>
  )
}
