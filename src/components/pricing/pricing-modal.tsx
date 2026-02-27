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
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  Bot,
  Brain,
  Image,
  MessageSquare,
  Shield,
  Headphones,
  ArrowRight,
} from 'lucide-react'

// Plan features
const plans = [
  {
    id: 'free',
    name: 'Plan Gratuito',
    price: 0,
    description: 'Perfecto para empezar a explorar',
    icon: Zap,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    features: [
      { text: 'Acceso a modelos open-source (Llama, Mixtral, Qwen)', included: true },
      { text: '5,000 puntos mensuales', included: true },
      { text: 'Historial de conversaciones', included: true },
      { text: 'Arena Texto y Código', included: true },
      { text: 'Modelos Premium (Claude, GPT-4)', included: false },
      { text: 'Contexto ampliado (200K)', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
    cta: 'Plan actual',
    current: true,
  },
  {
    id: 'premium',
    name: 'Aether Premium',
    price: 19.99,
    description: 'Para usuarios que buscan lo mejor',
    icon: Crown,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/50',
    popular: true,
    features: [
      { text: 'Todo lo del Plan Gratuito', included: true },
      { text: '50,000 puntos mensuales', included: true },
      { text: 'Acceso a Claude 3.5 Sonnet', included: true },
      { text: 'Acceso a GPT-4o y GPT-4 Turbo', included: true },
      { text: 'Acceso a Gemini 1.5 Pro', included: true },
      { text: 'Contexto ampliado hasta 200K tokens', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
    ],
    cta: 'Actualizar ahora',
    current: false,
  },
  {
    id: 'pro',
    name: 'Aether Pro',
    price: 49.99,
    description: 'Para equipos y uso intensivo',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    features: [
      { text: 'Todo lo de Premium', included: true },
      { text: '150,000 puntos mensuales', included: true },
      { text: 'Acceso anticipado a nuevos modelos', included: true },
      { text: 'API Access incluido', included: true },
      { text: 'Uso ilimitado de Arena Imágenes', included: true },
      { text: 'Historial ilimitado', included: true },
      { text: 'Cuenta dedicada + SLA', included: true },
    ],
    cta: 'Contactar ventas',
    current: false,
  },
]

// Premium models showcase
const premiumModels = [
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: Bot },
  { name: 'GPT-4o', provider: 'OpenAI', icon: Brain },
  { name: 'Gemini 1.5 Pro', provider: 'Google', icon: Sparkles },
]

interface PricingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return
    
    setIsLoading(true)
    // Simular redirección a checkout
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // TODO: Implementar Stripe checkout
    console.log('Upgrading to:', planId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 bg-background border-primary-500/20 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Planes y Precios de Aether</DialogTitle>
          <DialogDescription>Elige entre los planes Gratuito, Premium y Pro para acceder a diferentes modelos de IA y características.</DialogDescription>
        </VisuallyHidden>
        {/* Header */}
        <div className="relative bg-gradient-to-b from-primary-500/10 to-transparent p-6 border-b border-primary-500/10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-4">
              <Crown className="h-4 w-4" />
              Desbloquea todo el potencial
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Elige el plan perfecto para ti
            </h2>
            <p className="text-muted-foreground">
              Accede a los modelos más potentes y características avanzadas
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                billingPeriod === 'monthly'
                  ? "bg-primary-500/20 text-primary-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                billingPeriod === 'yearly'
                  ? "bg-primary-500/20 text-primary-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon
              const price = billingPeriod === 'yearly' 
                ? Math.round(plan.price * 0.8) 
                : plan.price
              
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border p-5 transition-all duration-200",
                    plan.borderColor,
                    plan.popular && "ring-2 ring-primary-500/50",
                    plan.current && "opacity-75"
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-medium">
                        Más popular
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", plan.bgColor)}>
                      <Icon className={cn("h-5 w-5", plan.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {price === 0 ? 'Gratis' : `${price}€`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{billingPeriod === 'yearly' ? 'mes' : 'mes'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Facturado anualmente ({price * 12}€/año)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.current || isLoading}
                    className={cn(
                      "w-full",
                      plan.popular 
                        ? "bg-primary-600 hover:bg-primary-500" 
                        : plan.current 
                          ? "bg-secondary text-muted-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {plan.current ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Plan actual
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Premium models showcase */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-primary-500/10 border border-primary-500/20">
            <h4 className="font-semibold mb-4 text-center">
              Modelos incluidos en Premium
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {premiumModels.map((model) => {
                const ModelIcon = model.icon
                return (
                  <div
                    key={model.name}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50 border border-primary-500/10"
                  >
                    <ModelIcon className="h-5 w-5 text-primary-400" />
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.provider}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              Garantía de devolución de 30 días. Sin preguntas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
