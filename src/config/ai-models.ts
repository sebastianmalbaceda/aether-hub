// ============================================
// AI Models Configuration
// ============================================
// Central configuration for all available AI models
// Each model includes pricing per 1K tokens (in points)

import type { AIProvider } from '@/types'

export interface AIModelConfig {
  id: string
  name: string
  provider: AIProvider
  providerDisplayName: string
  contextWindow: number
  maxOutputTokens: number
  supportsVision: boolean
  supportsFunctionCalling: boolean
  supportsJsonMode: boolean
  // Pricing in points per 1K tokens
  pricing: {
    inputPer1K: number    // Points per 1K input tokens
    outputPer1K: number   // Points per 1K output tokens
  }
  // For display purposes
  tier: 'free' | 'standard' | 'premium' | 'flagship'
  isAvailable: boolean
  description?: string
  // Optional reasoning effort for models that support it (Groq)
  reasoningEffort?: 'default' | 'medium' | 'high'
}

export const AI_MODELS: AIModelConfig[] = [
  // ============================================
  // OpenAI Models
  // ============================================
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 5,    // 5 puntos por 1K tokens de entrada
      outputPer1K: 15,  // 15 puntos por 1K tokens de salida
    },
    tier: 'premium',
    isAvailable: true,
    description: 'Modelo multimodal más avanzado de OpenAI. Ideal para tareas complejas.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0.15,
      outputPer1K: 0.6,
    },
    tier: 'standard',
    isAvailable: true,
    description: 'Versión ligera y económica de GPT-4o. Perfecto para tareas rápidas.',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 10,
      outputPer1K: 30,
    },
    tier: 'flagship',
    isAvailable: true,
    description: 'GPT-4 con visión y contexto de 128K tokens.',
  },
  {
    id: 'o1-preview',
    name: 'o1 Preview',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 128000,
    maxOutputTokens: 32768,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsJsonMode: false,
    pricing: {
      inputPer1K: 15,
      outputPer1K: 60,
    },
    tier: 'flagship',
    isAvailable: true,
    description: 'Modelo de razonamiento avanzado para problemas complejos.',
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    supportsVision: false,
    supportsFunctionCalling: false,
    supportsJsonMode: false,
    pricing: {
      inputPer1K: 3,
      outputPer1K: 12,
    },
    tier: 'premium',
    isAvailable: true,
    description: 'Versión económica del modelo de razonamiento o1.',
  },

  // ============================================
  // Anthropic Models
  // ============================================
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'ANTHROPIC',
    providerDisplayName: 'Anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: false,
    pricing: {
      inputPer1K: 3,
      outputPer1K: 15,
    },
    tier: 'premium',
    isAvailable: true,
    description: 'El modelo más inteligente de Anthropic. Excelente para código y análisis.',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'ANTHROPIC',
    providerDisplayName: 'Anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: false,
    pricing: {
      inputPer1K: 0.8,
      outputPer1K: 4,
    },
    tier: 'standard',
    isAvailable: true,
    description: 'Modelo rápido y económico de Anthropic. Ideal para respuestas rápidas.',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'ANTHROPIC',
    providerDisplayName: 'Anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: false,
    pricing: {
      inputPer1K: 15,
      outputPer1K: 75,
    },
    tier: 'flagship',
    isAvailable: true,
    description: 'El modelo más potente de Claude para tareas que requieren máxima inteligencia.',
  },

  // ============================================
  // Groq Models (Free Tier - Ultra Fast Inference)
  // ============================================
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Llama 3.3 70B en Groq. Inferencia ultra-rápida gratuita.',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Llama 3.1 8B en Groq. Ideal para respuestas rápidas.',
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 Instruct',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Kimi K2 de Moonshot AI en Groq. Excelente para razonamiento.',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo GPT-OSS 120B en Groq. Razonamiento medio.',
    reasoningEffort: 'medium',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo GPT-OSS 20B en Groq. Razonamiento medio.',
    reasoningEffort: 'medium',
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Qwen 3 32B en Groq. Razonamiento por defecto.',
    reasoningEffort: 'default',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 32768,
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Mixtral 8x7B en Groq. Excelente para tareas generales.',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    provider: 'GROQ',
    providerDisplayName: 'Groq',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo Gemma 2 9B de Google en Groq. Compacto y eficiente.',
  },

  // ============================================
  // Google Models
  // ============================================
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'GOOGLE',
    providerDisplayName: 'Google',
    contextWindow: 1000000, // 1M tokens!
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 1.25,
      outputPer1K: 5,
    },
    tier: 'premium',
    isAvailable: true,
    description: 'Modelo de Google con contexto de hasta 1M tokens. Ideal para documentos largos.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'GOOGLE',
    providerDisplayName: 'Google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0.075,
      outputPer1K: 0.3,
    },
    tier: 'standard',
    isAvailable: true,
    description: 'Versión rápida y económica de Gemini. Gran relación calidad-precio.',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'GOOGLE',
    providerDisplayName: 'Google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 0,
      outputPer1K: 0,
    },
    tier: 'free',
    isAvailable: true,
    description: 'Modelo experimental gratuito de Google. Sujeto a cambios.',
  },
]

// ============================================
// Helper Functions
// ============================================

export function getModelById(modelId: string): AIModelConfig | undefined {
  return AI_MODELS.find(m => m.id === modelId)
}

export function getModelsByProvider(provider: AIProvider): AIModelConfig[] {
  return AI_MODELS.filter(m => m.provider === provider && m.isAvailable)
}

export function getModelsByTier(tier: AIModelConfig['tier']): AIModelConfig[] {
  return AI_MODELS.filter(m => m.tier === tier && m.isAvailable)
}

export function getAvailableModels(): AIModelConfig[] {
  return AI_MODELS.filter(m => m.isAvailable)
}

export function getDefaultModel(): AIModelConfig {
  // Default to GPT-4o Mini as it's a good balance of cost/performance
  return AI_MODELS.find(m => m.id === 'gpt-4o-mini') || AI_MODELS[0]
}

/**
 * Calculate the cost in points for a given model and token usage
 */
export function calculatePointsCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = getModelById(modelId)
  if (!model) return 0

  const inputCost = (inputTokens / 1000) * model.pricing.inputPer1K
  const outputCost = (outputTokens / 1000) * model.pricing.outputPer1K

  return Math.ceil(inputCost + outputCost)
}

/**
 * Estimate tokens from text (rough approximation: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Get context status based on percentage used
 */
export function getContextStatus(percentage: number): 'normal' | 'warning' | 'critical' {
  if (percentage < 70) return 'normal'
  if (percentage < 90) return 'warning'
  return 'critical'
}
