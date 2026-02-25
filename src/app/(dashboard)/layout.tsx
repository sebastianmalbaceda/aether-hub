'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { StoresProvider } from '@/components/providers/stores-provider'
import { TelemetryPanel } from '@/components/telemetry/telemetry-panel'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <StoresProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar - Fixed left, always visible on lg+ */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Mobile Sidebar (Sheet) - Only renders on mobile via Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 lg:hidden">
            {/* Accessibility: Required SheetHeader with SheetTitle */}
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
              <SheetDescription>Navega por las diferentes secciones de Aether</SheetDescription>
            </SheetHeader>
            {/* Mobile Sidebar Content - Reuse Sidebar component */}
            <div className="flex flex-col h-full bg-background-secondary">
              <Sidebar 
                isOpen={true} 
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area - Dynamic padding based on sidebar collapsed state */}
        <div className={cn(
          "flex flex-col flex-1 min-h-screen transition-all duration-300",
          // Desktop: dynamic left padding based on sidebar width
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
          // Desktop: right padding for telemetry panel on xl+
          "xl:pr-80"
        )}>
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onPanelClick={() => setPanelOpen(true)}
          />
          
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>

        {/* Desktop Right Panel - Fixed right, visible on xl+ */}
        <div className="hidden xl:flex xl:flex-col xl:fixed xl:right-0 xl:top-16 xl:bottom-0 xl:w-80 xl:border-l xl:border-border xl:bg-background-secondary xl:overflow-y-auto">
          <TelemetryPanel />
        </div>

        {/* Mobile Right Panel (Sheet) - Accessible via button in header */}
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-80 p-0 max-w-[85vw]">
            {/* Accessibility: Required SheetHeader with SheetTitle */}
            <SheetHeader className="sr-only">
              <SheetTitle>Panel de telemetría</SheetTitle>
              <SheetDescription>Información de uso y estadísticas de la sesión actual</SheetDescription>
            </SheetHeader>
            <TelemetryPanel />
          </SheetContent>
        </Sheet>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </StoresProvider>
  )
}
