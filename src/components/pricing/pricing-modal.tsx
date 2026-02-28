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
  Shield,
  ArrowRight,
} from 'lucide-react'

// Plan features - Simplificado para caber sin scroll
const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    description: 'Para empezar',
    icon: Zap,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    features: [
      'Modelos Groq gratuitos',
      '10,000 puntos de bienvenida',
      'Historial de conversaciones',
      'Arena Texto y Código',
    ],
    excludedFeatures: [
      'Modelos Premium',
      'Contexto 256K',
    ],
    cta: 'Plan actual',
    current: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    description: 'Lo mejor para ti',
    icon: Crown,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
    borderColor: 'border-primary-500/50',
    popular: true,
    features: [
      'Todo lo del Plan Gratuito',
      '50,000 puntos mensuales',
      'Claude 4.6, ChatGPT 5.2, Gemini 3.1',
      'Contexto ampliado 256K',
      'Soporte prioritario 24/7',
    ],
    excludedFeatures: [],
    cta: 'Actualizar',
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    description: 'Para equipos',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    features: [
      'Todo lo de Premium',
      '150,000 puntos mensuales',
      'Acceso anticipado a modelos',
      'API Access incluido',
      'Arena Imágenes ilimitado',
    ],
    excludedFeatures: [],
    cta: 'Contactar',
    current: false,
  },
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    console.log('Upgrading to:', planId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false} 
        className="w-[95vw] max-w-4xl h-auto max-h-[95vh] p-0 bg-background border-primary-500/20 overflow-hidden"
      >
        <VisuallyHidden>
          <DialogTitle>Planes y Precios de Aether</DialogTitle>
          <DialogDescription>Elige entre los planes Gratuito, Premium y Pro.</DialogDescription>
        </VisuallyHidden>
        
        {/* Header Compacto */}
        <div className="relative bg-gradient-to-b from-primary-500/10 to-transparent px-4 py-4 md:px-6 md:py-5 border-b border-primary-500/10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 md:top-4 md:right-4 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="text-center pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs md:text-sm font-medium mb-2 md:mb-3">
              <Crown className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Desbloquea todo el potencial
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              Elige tu plan
            </h2>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Accede a los modelos más potentes
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-3 md:mt-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all",
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
                "px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2",
                billingPeriod === 'yearly'
                  ? "bg-primary-500/20 text-primary-300"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              <span className="text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid - Compacto sin scroll innecesario */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon
              const price = billingPeriod === 'yearly' 
                ? Math.round(plan.price * 0.8) 
                : plan.price
              
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-xl md:rounded-2xl border p-4 md:p-5 transition-all duration-200",
                    plan.borderColor,
                    plan.popular && "ring-2 ring-primary-500/50",
                    plan.current && "opacity-75"
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-2.5 py-1 rounded-full bg-primary-500 text-white text-[10px] md:text-xs font-medium whitespace-nowrap">
                        Más popular
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
                    <div className={cn("flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl", plan.bgColor)}>
                      <Icon className={cn("h-4 w-4 md:h-5 md:w-5", plan.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base">{plan.name}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold">
                        {price === 0 ? 'Gratis' : `${price}€`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs md:text-sm text-muted-foreground">
                          /mes
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        {price * 12}€/año
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                        <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.excludedFeatures.map((feature, index) => (
                      <li key={`ex-${index}`} className="flex items-start gap-2 text-xs md:text-sm">
                        <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.current || isLoading}
                    className={cn(
                      "w-full text-xs md:text-sm h-9 md:h-10",
                      plan.popular 
                        ? "bg-primary-600 hover:bg-primary-500" 
                        : plan.current 
                          ? "bg-secondary text-muted-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {plan.current ? (
                      <>
                        <Check className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                        Plan actual
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1.5 md:ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Guarantee - Compacto */}
          <div className="mt-4 md:mt-6 text-center">
            <p className="text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1.5 md:gap-2">
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
              Garantía de devolución de 30 días
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
