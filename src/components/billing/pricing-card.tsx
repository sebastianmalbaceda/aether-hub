'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Zap, Crown, Rocket } from 'lucide-react'
import type { Plan } from '@/types'

interface PricingCardProps {
  plan: Plan
  onSelect?: () => void
  isLoading?: boolean
  currentPlan?: string
}

const planIcons: Record<string, React.ElementType> = {
  explorer: Zap,
  creator: Crown,
  enterprise: Rocket,
}

export function PricingCard({ plan, onSelect, isLoading, currentPlan }: PricingCardProps) {
  const Icon = planIcons[plan.slug] || Zap
  const isCurrentPlan = currentPlan === plan.slug

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-300',
        plan.isPopular && 'border-primary-500 shadow-lg shadow-primary-500/20',
        isCurrentPlan && 'ring-2 ring-primary-500'
      )}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Más Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={cn(
          'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
          plan.isPopular ? 'bg-primary-600/20' : 'bg-muted'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            plan.isPopular ? 'text-primary-400' : 'text-muted-foreground'
          )} />
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.type === 'FIXED' ? 'Plan mensual' : 'Personalizado'}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">€{plan.priceMonthly}</span>
            <span className="text-muted-foreground">/mes</span>
          </div>
          {plan.priceYearly && (
            <p className="text-sm text-muted-foreground mt-1">
              €{plan.priceYearly}/año (ahorra {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
            </p>
          )}
        </div>

        {/* Points */}
        <div className="bg-muted/50 rounded-lg p-3 text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-2xl font-bold">{plan.pointsIncluded.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">puntos incluidos</p>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {(plan.features as string[]).map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.isPopular ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading ? 'Procesando...' : isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
        </Button>
      </CardFooter>
    </Card>
  )
}
