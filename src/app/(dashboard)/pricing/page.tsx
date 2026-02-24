'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/billing/pricing-card'
import { cn } from '@/lib/utils'
import { Zap, Check, Sparkles, Calculator } from 'lucide-react'
import type { Plan, ArenaModule } from '@/types'

// Mock plans data
const plans: Plan[] = [
  {
    id: '1',
    name: 'Explorer',
    slug: 'explorer',
    type: 'FIXED',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    pointsIncluded: 5000,
    features: ['Acceso a modelos básicos', 'Arena de Texto', 'Soporte por email'],
    isActive: true,
    isPopular: false,
    sortOrder: 1,
  },
  {
    id: '2',
    name: 'Creator',
    slug: 'creator',
    type: 'FIXED',
    priceMonthly: 19.99,
    priceYearly: 199.99,
    pointsIncluded: 12000,
    features: ['Todos los modelos', 'Todas las Arenas', 'Prioridad en cola', 'Soporte prioritario'],
    isActive: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    id: '3',
    name: 'Enterprise',
    slug: 'enterprise',
    type: 'FIXED',
    priceMonthly: 49.99,
    priceYearly: 499.99,
    pointsIncluded: 35000,
    features: ['Todo incluido', 'API Access', 'Soporte dedicado', 'SLA garantizado'],
    isActive: true,
    isPopular: false,
    sortOrder: 3,
  },
]

const modules: Array<{
  id: string
  name: string
  description: string
  price: number
  points: number
  icon: string
}> = [
  { id: 'text', name: 'Arena de Texto', description: 'Chat con modelos de lenguaje', price: 5, points: 3000, icon: '💬' },
  { id: 'code', name: 'Arena de Código', description: 'Asistencia de programación', price: 7, points: 4000, icon: '💻' },
  { id: 'image', name: 'Generación de Imágenes', description: 'DALL-E, Stable Diffusion', price: 10, points: 5000, icon: '🎨' },
  { id: 'video', name: 'Generación de Video', description: 'Videos con IA', price: 15, points: 8000, icon: '🎬' },
  { id: 'audio', name: 'Generación de Audio', description: 'Texto a voz, música', price: 12, points: 6000, icon: '🎵' },
]

const pointPackages = [
  { id: '1', name: 'Starter', points: 1000, price: 2.99, bonus: 0 },
  { id: '2', name: 'Basic', points: 5000, price: 9.99, bonus: 500, isPopular: true },
  { id: '3', name: 'Pro', points: 15000, price: 24.99, bonus: 3000 },
  { id: '4', name: 'Ultimate', points: 50000, price: 69.99, bonus: 15000 },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedModules, setSelectedModules] = useState<string[]>(['text'])
  const [activeTab, setActiveTab] = useState<'plans' | 'custom' | 'points'>('plans')

  // Calculate custom pack price
  const customPackTotal = selectedModules.reduce((total, moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    return total + (module?.price || 0)
  }, 0)

  const customPackPoints = selectedModules.reduce((total, moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    return total + (module?.points || 0)
  }, 0)

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Planes y Precios</h1>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
        <Button
          variant={activeTab === 'plans' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('plans')}
        >
          Planes Fijos
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('custom')}
        >
          Arma tu Pack
        </Button>
        <Button
          variant={activeTab === 'points' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('points')}
        >
          Comprar Puntos
        </Button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn('text-sm', billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                billingCycle === 'yearly' ? 'bg-primary-600' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                  billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
            <span className={cn('text-sm', billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground')}>
              Anual
              <span className="ml-1 text-green-500 text-xs">(Ahorra 17%)</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={() => console.log('Selected plan:', plan.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Pack Tab */}
      {activeTab === 'custom' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Module Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              Selecciona los módulos que necesitas
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedModules.includes(module.id)
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'hover:border-muted-foreground/50'
                  )}
                  onClick={() => toggleModule(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{module.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{module.name}</h3>
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                            selectedModules.includes(module.id)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-muted-foreground/30'
                          )}>
                            {selectedModules.includes(module.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span className="font-semibold">€{module.price}/mes</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-primary-400">{module.points.toLocaleString()} pts</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary-400" />
                  Tu Pack Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedModules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Selecciona al menos un módulo
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {selectedModules.map((moduleId) => {
                        const module = modules.find(m => m.id === moduleId)!
                        return (
                          <div key={moduleId} className="flex justify-between text-sm">
                            <span>{module.icon} {module.name}</span>
                            <span>€{module.price}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total mensual</span>
                        <span>€{customPackTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Puntos incluidos</span>
                        <span className="text-primary-400">{customPackPoints.toLocaleString()} pts</span>
                      </div>
                    </div>
                    <Button className="w-full" disabled={selectedModules.length === 0}>
                      Suscribirse a este Pack
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Recarga de Puntos</h2>
            <p className="text-muted-foreground">
              Compra puntos adicionales sin suscripción
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pointPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={cn(
                  'relative cursor-pointer transition-all hover:border-primary-500',
                  pkg.isPopular && 'border-primary-500'
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    <span className="text-2xl font-bold">{pkg.points.toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">puntos</p>
                  {pkg.bonus > 0 && (
                    <p className="text-green-500 text-sm mb-2">+{pkg.bonus.toLocaleString()} bonus</p>
                  )}
                  <p className="text-xl font-semibold">€{pkg.price}</p>
                  <Button
                    variant={pkg.isPopular ? 'default' : 'outline'}
                    className="w-full mt-4"
                  >
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Los puntos nunca caducan. Úsalos cuando los necesites.
                1,000 puntos ≈ $1.00 USD en valor de tokens.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
