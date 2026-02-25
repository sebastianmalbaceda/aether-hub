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
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ConfiguracionPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  })
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary-400" />
          Configuración
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu cuenta y preferencias
        </p>
      </div>
      
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-2xl font-bold text-white">
              U
            </div>
            <div>
              <Button variant="outline" size="sm">Cambiar avatar</Button>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input placeholder="Tu nombre" defaultValue="Usuario" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="tu@email.com" defaultValue="usuario@ejemplo.com" />
            </div>
          </div>
          
          <Button className="bg-primary-700 hover:bg-primary-600">
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
      
      {/* Subscription & Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Suscripción y Puntos
          </CardTitle>
          <CardDescription>Gestiona tu plan y consumo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <p className="font-medium">Plan Actual</p>
              <p className="text-sm text-muted-foreground">Plan Gratuito</p>
            </div>
            <Button variant="outline" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 hover:from-violet-500 hover:to-purple-500">
              <CreditCard className="h-4 w-4 mr-2" />
              Mejorar plan
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Puntos disponibles</span>
              <span className="font-medium">10,000 / 15,000</span>
            </div>
            <Progress value={66} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Se renuevan el 1 de cada mes
            </p>
          </div>
          
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-2xl font-bold">1.2M</p>
              <p className="text-xs text-muted-foreground">Tokens este mes</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-2xl font-bold">47</p>
              <p className="text-xs text-muted-foreground">Sesiones</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Días activo</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza la interfaz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="text-sm font-medium">Tema</label>
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
                    "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                    theme === option.value 
                      ? "border-primary-500 bg-primary-500/10" 
                      : "border-border hover:border-primary-500/50"
                  )}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-sm">{option.label}</span>
                  {theme === option.value && (
                    <Check className="h-4 w-4 text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo recibes alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'email', label: 'Notificaciones por email', desc: 'Recibe actualizaciones importantes' },
            { key: 'push', label: 'Notificaciones push', desc: 'Alertas en tiempo real' },
            { key: 'marketing', label: 'Comunicaciones de marketing', desc: 'Novedades y ofertas' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({
                  ...prev,
                  [item.key]: !prev[item.key as keyof typeof prev]
                }))}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  notifications[item.key as keyof typeof notifications] 
                    ? "bg-primary-600" 
                    : "bg-secondary"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  notifications[item.key as keyof typeof notifications] 
                    ? "translate-x-7" 
                    : "translate-x-1"
                )} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>Protege tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Contraseña</p>
              <p className="text-sm text-muted-foreground">Última cambio hace 30 días</p>
            </div>
            <Button variant="outline" size="sm">Cambiar</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Autenticación de dos factores</p>
              <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div>
              <p className="font-medium text-destructive">Zona de peligro</p>
              <p className="text-sm text-muted-foreground">Eliminar cuenta y todos los datos</p>
            </div>
            <Button variant="destructive" size="sm">Eliminar cuenta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
