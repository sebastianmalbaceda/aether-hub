'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Download,
  Monitor,
  Smartphone,
  Puzzle,
  Chrome,
  ExternalLink,
  Check,
  Star,
  Users,
  ArrowRight,
  X,
  Sparkles,
  MonitorSmartphone,
} from 'lucide-react'

// Custom icons for platforms
const WindowsIcon = Monitor
const AppleIcon = MonitorSmartphone

// Apps and extensions data
const apps = [
  {
    id: 'desktop',
    name: 'Aether Desktop',
    description: 'Aplicación nativa para Windows, macOS y Linux',
    icon: Monitor,
    platforms: [
      { name: 'Windows', icon: WindowsIcon, available: true, size: '85 MB' },
      { name: 'macOS', icon: AppleIcon, available: true, size: '92 MB' },
      { name: 'Linux', icon: Monitor, available: true, size: '78 MB' },
    ],
    features: [
      'Acceso rápido desde la bandeja del sistema',
      'Atajos de teclado globales',
      'Notificaciones nativas',
      'Modo offline para conversaciones guardadas',
    ],
    rating: 4.8,
    downloads: '50K+',
    featured: true,
  },
  {
    id: 'vscode',
    name: 'Extensión VS Code',
    description: 'Integra Aether directamente en tu editor de código',
    icon: Puzzle,
    platforms: [
      { name: 'VS Code', icon: Puzzle, available: true, size: '2.5 MB' },
      { name: 'VS Code Insiders', icon: Puzzle, available: true, size: '2.5 MB' },
    ],
    features: [
      'Generación de código con IA',
      'Refactorización inteligente',
      'Documentación automática',
      'Chat integrado en el editor',
    ],
    rating: 4.9,
    downloads: '100K+',
    featured: true,
  },
  {
    id: 'mobile',
    name: 'Aether Mobile',
    description: 'Lleva Aether contigo en tu dispositivo móvil',
    icon: Smartphone,
    platforms: [
      { name: 'iOS', icon: AppleIcon, available: true, size: '45 MB' },
      { name: 'Android', icon: Smartphone, available: true, size: '38 MB' },
    ],
    features: [
      'Entrada por voz optimizada',
      'Sincronización en la nube',
      'Widget para acceso rápido',
      'Modo oscuro automático',
    ],
    rating: 4.7,
    downloads: '25K+',
    featured: false,
  },
  {
    id: 'chrome',
    name: 'Extensión Chrome',
    description: 'Accede a Aether desde cualquier página web',
    icon: Chrome,
    platforms: [
      { name: 'Chrome', icon: Chrome, available: true, size: '1.2 MB' },
      { name: 'Edge', icon: Chrome, available: true, size: '1.2 MB' },
      { name: 'Brave', icon: Chrome, available: true, size: '1.2 MB' },
    ],
    features: [
      'Popup rápido con atajo de teclado',
      'Selección de texto para análisis',
      'Resumen de páginas web',
      'Sincronización con cuenta',
    ],
    rating: 4.6,
    downloads: '30K+',
    featured: false,
  },
]

interface AppsMarketplaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppsMarketplace({ open, onOpenChange }: AppsMarketplaceProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  const selectedAppData = apps.find(app => app.id === selectedApp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 bg-background border-primary-500/20 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Marketplace de Apps de Aether</DialogTitle>
          <DialogDescription>Descarga aplicaciones de escritorio, extensiones de navegador y plugins para integrar Aether en tu flujo de trabajo.</DialogDescription>
        </VisuallyHidden>
        {/* Header */}
        <div className="p-6 border-b border-primary-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedApp && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedApp(null)}
                  className="h-8 w-8 mr-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <Sparkles className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedAppData ? selectedAppData.name : 'Aplicaciones y Extensiones'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedAppData 
                    ? selectedAppData.description 
                    : 'Lleva Aether a todas partes'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          {selectedAppData ? (
            /* APP DETAIL VIEW */
            <div className="space-y-6">
              {/* Platforms */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Descargar para</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedAppData.platforms.map((platform) => {
                    const Icon = platform.icon
                    return (
                      <button
                        key={platform.name}
                        className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                          <Icon className="h-5 w-5 text-primary-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{platform.name}</div>
                          <div className="text-xs text-muted-foreground">{platform.size}</div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground ml-auto" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Características</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAppData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30"
                    >
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary/30 border border-primary-500/10">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{selectedAppData.rating}</span>
                  <span className="text-sm text-muted-foreground">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-400" />
                  <span className="font-semibold">{selectedAppData.downloads}</span>
                  <span className="text-sm text-muted-foreground">descargas</span>
                </div>
              </div>
            </div>
          ) : (
            /* APPS GRID */
            <div className="space-y-6">
              {/* Featured apps */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Destacados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apps.filter(app => app.featured).map((app) => {
                    const Icon = app.icon
                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary-500/10 to-transparent border border-primary-500/20 hover:border-primary-500/40 transition-all text-left"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/20 shrink-0">
                          <Icon className="h-7 w-7 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{app.name}</h4>
                            <span className="flex items-center gap-1 text-xs text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {app.rating}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {app.description}
                          </p>
                          <div className="flex items-center gap-2">
                            {app.platforms.slice(0, 3).map((platform) => {
                              const PlatformIcon = platform.icon
                              return (
                                <div
                                  key={platform.name}
                                  className="flex h-6 w-6 items-center justify-center rounded bg-secondary/50"
                                  title={platform.name}
                                >
                                  <PlatformIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* All apps */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Todas las apps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {apps.map((app) => {
                    const Icon = app.icon
                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 shrink-0">
                          <Icon className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{app.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {app.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {app.rating}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.downloads}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Coming soon */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-primary-500/10">
                <h3 className="font-semibold mb-2">Próximamente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Estamos trabajando en más integraciones. ¿Tienes alguna sugerencia?
                </p>
                <Button variant="outline" className="border-primary-500/20">
                  Solicitar integración
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
