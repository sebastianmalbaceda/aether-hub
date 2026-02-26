'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  CreditCard,
  Zap,
  Moon,
  Sun,
  Monitor,
  Check,
  Globe,
  Puzzle,
  Code,
  Save,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Settings navigation items
const settingsNavItems = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Cuenta', icon: User },
  { id: 'privacy', label: 'Privacidad', icon: Shield },
  { id: 'billing', label: 'Facturación', icon: CreditCard },
  { id: 'capabilities', label: 'Capacidades', icon: Puzzle },
  { id: 'code', label: 'Aether Code', icon: Code },
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

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    completions: true,
    email: false,
    marketing: false,
  })
  
  // Form state
  const [profile, setProfile] = useState({
    fullName: 'Usuario Demo',
    preferredName: '',
    email: 'usuario@ejemplo.com',
    jobRole: 'engineering',
    customInstructions: '',
  })

  const handleSave = () => {
    // Save logic here
    console.log('Saving profile:', profile)
  }

  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="flex h-full">
        {/* ═══════════════════════════════════════════════════════════════
            SIDEBAR DE NAVEGACIÓN DE AJUSTES
        ═══════════════════════════════════════════════════════════════ */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-border/50 bg-background-secondary/30 flex-col">
          <div className="p-4 border-b border-border/50">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-400" />
              Ajustes
            </h1>
          </div>
          
          <nav className="flex-1 p-2 space-y-0.5">
            {settingsNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeSection === item.id
                    ? "bg-primary-500/15 text-primary-400"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO PRINCIPAL
        ═══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            
            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: GENERAL / PERFIL
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'general' && (
              <div className="space-y-8">
                {/* Profile Section */}
                <section className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Perfil</h2>
                    <p className="text-sm text-muted-foreground">
                      Gestiona tu información personal
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xl font-bold text-white shadow-glow-sm">
                      {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="h-8">
                        Cambiar avatar
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG o GIF. Máximo 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre completo</label>
                      <Input
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="bg-secondary/50 border-border/50 focus:border-primary-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">¿Cómo quieres que Aether te llame?</label>
                      <Input
                        value={profile.preferredName}
                        onChange={(e) => setProfile({ ...profile, preferredName: e.target.value })}
                        placeholder="Tu apodo preferido"
                        className="bg-secondary/50 border-border/50 focus:border-primary-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-secondary/50 border-border/50 focus:border-primary-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">¿Qué descripción se ajusta mejor a su trabajo?</label>
                    <div className="relative">
                      <select
                        value={profile.jobRole}
                        onChange={(e) => setProfile({ ...profile, jobRole: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
                      >
                        {jobRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </section>

                {/* Custom Instructions */}
                <section className="space-y-4 pt-6 border-t border-border/50">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Instrucciones Personalizadas</h3>
                    <p className="text-sm text-muted-foreground">
                      ¿Qué preferencias personales debería considerar Aether en sus respuestas?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferencias personales</label>
                    <textarea
                      value={profile.customInstructions}
                      onChange={(e) => setProfile({ ...profile, customInstructions: e.target.value })}
                      placeholder="Ej: Principalmente programo en Python y uso React para frontend. Prefiero respuestas concisas y directas..."
                      rows={5}
                      className="w-full p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm resize-none focus:outline-none focus:border-primary-500/50 placeholder:text-muted-foreground/60"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tus preferencias se aplicarán a todas las conversaciones.
                    </p>
                  </div>
                </section>

                {/* Notifications */}
                <section className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Notificaciones</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <div>
                        <p className="font-medium text-sm">Completaciones de respuesta</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Recibe notificaciones cuando Aether haya terminado tareas de larga duración
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, completions: !prev.completions }))}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors duration-200",
                          notifications.completions ? "bg-primary-600" : "bg-secondary"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                          notifications.completions && "translate-x-5"
                        )} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Appearance */}
                <section className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Apariencia</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Modo de color</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Claro', icon: Sun },
                        { value: 'dark', label: 'Oscuro', icon: Moon },
                        { value: 'system', label: 'Sistema', icon: Monitor },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as typeof theme)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                            theme === option.value 
                              ? "border-primary-500/50 bg-primary-500/10" 
                              : "border-border/50 hover:border-primary-500/30 hover:bg-secondary/30"
                          )}
                        >
                          <option.icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{option.label}</span>
                          {theme === option.value && (
                            <Check className="h-4 w-4 text-primary-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-border/50">
                  <Button 
                    onClick={handleSave}
                    className="bg-primary-600 hover:bg-primary-500 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: CUENTA
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'account' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Cuenta</h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona la seguridad y acceso a tu cuenta
                  </p>
                </div>

                <Card className="bg-secondary/30 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-base">Cambiar contraseña</CardTitle>
                    <CardDescription>Actualiza tu contraseña regularmente para mantener tu cuenta segura</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input type="password" placeholder="Contraseña actual" className="bg-secondary/50 border-border/50" />
                    <Input type="password" placeholder="Nueva contraseña" className="bg-secondary/50 border-border/50" />
                    <Input type="password" placeholder="Confirmar nueva contraseña" className="bg-secondary/50 border-border/50" />
                    <Button variant="outline" className="h-9">Actualizar contraseña</Button>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-base">Sesiones activas</CardTitle>
                    <CardDescription>Dispositivos donde has iniciado sesión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Monitor className="h-4 w-4 text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Chrome en Windows</p>
                            <p className="text-xs text-muted-foreground">Actualmente activo</p>
                          </div>
                        </div>
                        <span className="text-xs text-primary-400">Esta sesión</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: FACTURACIÓN
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'billing' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Facturación</h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu plan y consumo
                  </p>
                </div>

                {/* Current Plan */}
                <Card className="bg-gradient-to-br from-primary-600/10 to-primary-800/10 border-primary-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan actual</p>
                        <p className="text-2xl font-bold">Plan Gratuito</p>
                      </div>
                      <Button className="bg-primary-600 hover:bg-primary-500 gap-2">
                        <Zap className="h-4 w-4" />
                        Mejorar plan
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Puntos disponibles</span>
                        <span className="font-medium">10,000 / 15,000</span>
                      </div>
                      <Progress value={66} className="h-2 bg-secondary" />
                      <p className="text-xs text-muted-foreground">
                        Se renuevan el 1 de cada mes
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="bg-secondary/30 border-border/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">1.2M</p>
                      <p className="text-xs text-muted-foreground mt-1">Tokens este mes</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">47</p>
                      <p className="text-xs text-muted-foreground mt-1">Sesiones</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-border/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-xs text-muted-foreground mt-1">Días activo</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: PRIVACIDAD
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Privacidad</h2>
                  <p className="text-sm text-muted-foreground">
                    Controla cómo se utilizan tus datos
                  </p>
                </div>

                <Card className="bg-secondary/30 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-base">Entrenamiento de modelos</CardTitle>
                    <CardDescription>Permite que tus conversaciones mejoren nuestros modelos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Tus datos nunca se comparten con terceros
                      </p>
                      <button className="relative h-6 w-11 rounded-full bg-primary-600 transition-colors duration-200">
                        <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 translate-x-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-base">Exportar datos</CardTitle>
                    <CardDescription>Descarga una copia de todos tus datos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="h-9">Solicitar exportación</Button>
                  </CardContent>
                </Card>

                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">Eliminar cuenta</CardTitle>
                    <CardDescription>Esta acción es permanente y no se puede deshacer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="h-9">Eliminar mi cuenta</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: CAPACIDADES
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'capabilities' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Capacidades</h2>
                  <p className="text-sm text-muted-foreground">
                    Habilita o deshabilita funciones experimentales
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Generación de imágenes', desc: 'Crea imágenes con IA', enabled: true },
                    { name: 'Análisis de código', desc: 'Revisión automática de código', enabled: true },
                    { name: 'Búsqueda web', desc: 'Acceso a información en tiempo real', enabled: false },
                    { name: 'Memoria extendida', desc: 'Recuerda más contexto entre sesiones', enabled: false },
                  ].map((cap) => (
                    <div key={cap.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <div>
                        <p className="font-medium text-sm">{cap.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
                      </div>
                      <button className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-200",
                        cap.enabled ? "bg-primary-600" : "bg-secondary"
                      )}>
                        <span className={cn(
                          "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                          cap.enabled && "translate-x-5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN: AETHER CODE
            ═══════════════════════════════════════════════════════════════ */}
            {activeSection === 'code' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Aether Code</h2>
                  <p className="text-sm text-muted-foreground">
                    Configuración del editor de código integrado
                  </p>
                </div>

                <Card className="bg-secondary/30 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-base">Editor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tema del editor</label>
                      <select className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary-500/50">
                        <option>Oscuro (predeterminado)</option>
                        <option>Claro</option>
                        <option>Monokai</option>
                        <option>Dracula</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamaño de fuente</label>
                      <select className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:border-primary-500/50">
                        <option>12px</option>
                        <option>14px (predeterminado)</option>
                        <option>16px</option>
                        <option>18px</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
