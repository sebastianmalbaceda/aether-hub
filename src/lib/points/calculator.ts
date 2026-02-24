import type { AIModel } from '@/types'

/**
 * Calculadora de puntos y costos para el sistema de facturación
 * 1 Punto = $0.001 USD (0.1 centavos)
 */

// Conversión de moneda
export const POINTS_PER_DOLLAR = 1000 // 1000 puntos = $1.00
export const DOLLARS_PER_POINT = 0.001 // $0.001 por punto

/**
 * Interfaz para modelos con precios de puntos
 */
export interface ModelPricing {
  inputCostPer1kTokens: number
  outputCostPer1kTokens: number
}

/**
 * Convierte dólares a puntos
 */
export function dollarsToPoints(dollars: number): number {
  return Math.ceil(dollars * POINTS_PER_DOLLAR)
}

/**
 * Convierte puntos a dólares
 */
export function pointsToDollars(points: number): number {
  return points * DOLLARS_PER_POINT
}

/**
 * Calcula el costo en puntos para una petición
 */
export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model: AIModel | ModelPricing
): number {
  const inputPoints = (promptTokens / 1000) * ('inputPoints1K' in model ? model.inputPoints1K : model.inputCostPer1kTokens)
  const outputPoints = (completionTokens / 1000) * ('outputPoints1K' in model ? model.outputPoints1K : model.outputCostPer1kTokens)
  const totalPoints = Math.ceil(inputPoints + outputPoints)
  
  return totalPoints
}

/**
 * Calcula el costo con desglose USD
 */
export function calculateCostWithUSD(
  promptTokens: number,
  completionTokens: number,
  model: AIModel | ModelPricing
): { points: number; usd: number } {
  const points = calculateCost(promptTokens, completionTokens, model)
  const usd = pointsToDollars(points)
  
  return { points, usd }
}

/**
 * Estima los tokens de un texto
 * Aproximación: 1 token ≈ 4 caracteres para inglés, ≈ 3 caracteres para español
 */
export function estimateTokens(text: string, language: 'en' | 'es' = 'es'): number {
  const charsPerToken = language === 'es' ? 3 : 4
  return Math.ceil(text.length / charsPerToken)
}

/**
 * Estima el costo de una conversación completa
 */
export function estimateConversationCost(
  messages: Array<{ role: string; content: string }>,
  model: AIModel,
  estimatedCompletionTokens: number = 500
): {
  promptTokens: number
  estimatedCompletion: number
  estimatedCost: { points: number; usd: number }
} {
  // Calcular tokens del prompt
  const promptTokens = messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content) + 4 // +4 por el formato del mensaje
  }, 0)

  const estimatedCost = calculateCostWithUSD(promptTokens, estimatedCompletionTokens, model)

  return {
    promptTokens,
    estimatedCompletion: estimatedCompletionTokens,
    estimatedCost,
  }
}

/**
 * Verifica si el usuario tiene saldo suficiente
 */
export function hasEnoughPoints(
  currentBalance: number,
  requiredPoints: number
): boolean {
  return currentBalance >= requiredPoints
}

/**
 * Calcula el porcentaje de uso del contexto
 */
export function calculateContextPercentage(used: number, limit: number): number {
  return Math.min((used / limit) * 100, 100)
}

/**
 * Determina el estado del contexto
 */
export function getContextStatus(percentage: number): 'normal' | 'warning' | 'critical' {
  if (percentage > 90) return 'critical'
  if (percentage > 75) return 'warning'
  return 'normal'
}

/**
 * Formatea puntos para mostrar
 */
export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  }
  return points.toString()
}

/**
 * Formatea costo en dólares
 */
export function formatCost(usd: number): string {
  if (usd < 0.01) {
    return `$${(usd * 100).toFixed(3)}¢`
  }
  return `$${usd.toFixed(4)}`
}

/**
 * Tabla de precios de referencia (por 1K tokens)
 */
export const PRICING_REFERENCE = {
  'gpt-4o': { input: 2.5, output: 10, name: 'GPT-4o' },
  'gpt-4o-mini': { input: 0.15, output: 0.6, name: 'GPT-4o Mini' },
  'claude-3-5-sonnet': { input: 3, output: 15, name: 'Claude 3.5 Sonnet' },
  'claude-3-haiku': { input: 0.25, output: 1.25, name: 'Claude 3 Haiku' },
  'gemini-1-5-pro': { input: 1.25, output: 5, name: 'Gemini 1.5 Pro' },
  'gemini-1-5-flash': { input: 0.075, output: 0.3, name: 'Gemini 1.5 Flash' },
} as const

/**
 * Obtiene el precio de referencia de un modelo
 */
export function getModelPricing(modelSlug: string) {
  return PRICING_REFERENCE[modelSlug as keyof typeof PRICING_REFERENCE] || null
}
