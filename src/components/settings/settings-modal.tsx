'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Settings,
  User,
  Palette,
  Globe,
  Save,
  X,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useUserStore } from '@/stores/user-store'

// Settings navigation items
const settingsNavItems = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'language', label: 'Idioma', icon: Globe },
]

// Job roles
const jobRoles = [
  { value: 'engineering', label: 'Ingeniería' },
  { value: 'design', label: 'Diseño' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Ventas' },
  { value: 'product', label: 'Producto' },
  { value: 'research', label: 'Investigación' },
  { value: 'education', label: 'Educación' },
  { value: 'other', label: 'Otro' },
]

// Languages
const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

// Theme options
const themeOptions = [
  { id: 'light', label: 'Claro', icon: Sun, description: 'Tema claro para uso diurno' },
  { id: 'dark', label: 'Oscuro', icon: Moon, description: 'Tema oscuro para reducir la fatiga visual' },
  { id: 'system', label: 'Sistema', icon: Monitor, description: 'Usar la configuración del sistema' },
]

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState('general')
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  
  // User store
  const user = useUserStore((state) => state.user)
  
  // Form state
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Usuario Demo',
    preferredName: '',
    email: user?.email || 'usuario@ejemplo.com',
    jobRole: 'engineering',
    customInstructions: '',
  })

  const handleSave = () => {
    console.log('Saving settings:', { profile, theme, selectedLanguage })
    // TODO: Implement save logic
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 bg-background border-primary-500/20 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Configuración de Aether</DialogTitle>
        </VisuallyHidden>
        <div className="flex h-full">
          {/* Sidebar de navegación */}
          <aside className="w-64 shrink-0 border-r border-primary-500/10 bg-background-secondary/30 flex flex-col">
            <div className="p-4 border-b border-primary-500/10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-400" />
                Ajustes
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Personaliza tu experiencia
              </p>
            </div>
            
            <nav className="flex-1 p-2 space-y-0.5">
              {settingsNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    activeSection === item.id
                      ? "bg-primary-500/15 text-primary-400"
                      : "text-muted-foreground hover:bg-primary-500/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
            
            {/* Footer con versión */}
            <div className="p-4 border-t border-primary-500/10">
              <p className="text-xs text-muted-foreground">
                Aether v1.0.0
              </p>
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary-500/10">
              <h3 className="font-semibold">
                {settingsNavItems.find(item => item.id === activeSection)?.label}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 hover:bg-primary-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* GENERAL / PERFIL */}
              {activeSection === 'general' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Perfil</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Información básica de tu cuenta
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Nombre completo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre completo</label>
                      <Input
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="bg-secondary/50 border-primary-500/20"
                      />
                    </div>

                    {/* Nombre preferido */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">¿Cómo llamarte?</label>
                      <Input
                        value={profile.preferredName}
                        onChange={(e) => setProfile({ ...profile, preferredName: e.target.value })}
                        placeholder="Ej: Alex"
                        className="bg-secondary/50 border-primary-500/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        La IA usará este nombre para dirigirse a ti
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        value={profile.email}
                        disabled
                        className="bg-secondary/50 border-primary-500/20 opacity-60"
                      />
                    </div>

                    {/* Rol */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rol</label>
                      <select
                        value={profile.jobRole}
                        onChange={(e) => setProfile({ ...profile, jobRole: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-primary-500/20 text-sm focus:outline-none focus:border-primary-500/50"
                      >
                        {jobRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-primary-500/10 pt-4">
                      <h4 className="text-sm font-medium mb-1">Instrucciones Personalizadas</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        System Prompt global que se aplicará a todas las conversaciones
                      </p>
                      <textarea
                        value={profile.customInstructions}
                        onChange={(e) => setProfile({ ...profile, customInstructions: e.target.value })}
                        placeholder="Ej: Siempre responde en español. Usa un tono profesional pero amigable..."
                        className="w-full h-32 px-3 py-2 rounded-lg bg-secondary/50 border border-primary-500/20 text-sm resize-none focus:outline-none focus:border-primary-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* APARIENCIA */}
              {activeSection === 'appearance' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tema</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona el aspecto visual de la aplicación
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as 'dark' | 'light' | 'system')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                          theme === option.id
                            ? "bg-primary-500/15 border-primary-500/50"
                            : "bg-secondary/30 border-primary-500/10 hover:border-primary-500/30"
                        )}
                      >
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          theme === option.id ? "bg-primary-500/20" : "bg-secondary"
                        )}>
                          <option.icon className={cn(
                            "h-6 w-6",
                            theme === option.id ? "text-primary-400" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "text-sm font-medium",
                            theme === option.id && "text-primary-300"
                          )}>
                            {option.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {option.description}
                          </div>
                        </div>
                        {theme === option.id && (
                          <Check className="h-4 w-4 text-primary-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* IDIOMA */}
              {activeSection === 'language' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Idioma de la interfaz</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona el idioma para los textos de la aplicación
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                          selectedLanguage === lang.code
                            ? "bg-primary-500/15 border-primary-500/50"
                            : "bg-secondary/30 border-primary-500/10 hover:border-primary-500/30"
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          selectedLanguage === lang.code && "text-primary-300"
                        )}>
                          {lang.name}
                        </span>
                        {selectedLanguage === lang.code && (
                          <Check className="h-4 w-4 text-primary-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botón de guardar */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-primary-500/10">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="hover:bg-secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
