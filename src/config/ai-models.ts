// ============================================
// AI Models Configuration - Aether Hub
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
  // FREE TIER - Groq (Ultra Fast Inference)
  // ============================================
  // Modelos 100% gratuitos y funcionales
  // Ordenados de más simple/rápido a más complejo/potente
  // ============================================
  
  // 1. Más rápido y con mayor límite (14,400 RPD)
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
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
    description: 'El más rápido y con mayor límite diario (14,400 peticiones/día). Ideal para uso intensivo.',
  },
  
  // 2. Buen balance velocidad/calidad
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
    description: 'Excelente balance entre velocidad y calidad. Bueno para razonamiento general.',
  },
  
  // 3. Kimi K2 - Razonamiento avanzado
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
    description: 'Modelo de Moonshot AI. Excelente para razonamiento complejo.',
  },
  
  // 4. GPT-OSS 20B - Experimental ligero
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
    description: 'Modelo experimental OpenAI. Buen balance calidad/velocidad.',
    reasoningEffort: 'medium',
  },
  
  // 5. Llama 3.3 70B - Potente pero límite bajo (1000 RPD)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
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
    description: 'Muy potente pero límite diario bajo (1,000 peticiones/día). Úsalo para tareas complejas.',
  },
  
  // 6. GPT-OSS 120B - Experimental más pesado
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
    description: 'El más potente de los experimentales. Puede ser más lento.',
    reasoningEffort: 'medium',
  },

  // ============================================
  // PREMIUM TIER - Google (Deshabilitados)
  // ============================================
  // Modelos de próxima generación - requieren API Key propia
  // ============================================
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'GOOGLE',
    providerDisplayName: 'Google',
    contextWindow: 2000000, // 2M tokens
    maxOutputTokens: 65536,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 7,
      outputPer1K: 21,
    },
    tier: 'flagship',
    isAvailable: false, // Premium - requiere API key propia
    description: 'Gemini 3.1 Pro - El modelo más avanzado de Google. (Premium - Próximamente)',
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
    isAvailable: false, // Experimental - disponible próximamente
    description: 'Modelo experimental de Google. Sujeto a cambios.',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'GOOGLE',
    providerDisplayName: 'Google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 1.25,
      outputPer1K: 5,
    },
    tier: 'premium',
    isAvailable: false, // Premium - requiere API key propia
    description: 'Modelo de Google con contexto de hasta 1M tokens. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'Versión rápida y económica de Gemini. (Premium - No disponible)',
  },

  // ============================================
  // PREMIUM TIER - Anthropic (Deshabilitados)
  // ============================================
  // Modelos Claude de próxima generación
  // ============================================
  {
    id: 'claude-4.6-opus',
    name: 'Claude 4.6 Opus',
    provider: 'ANTHROPIC',
    providerDisplayName: 'Anthropic',
    contextWindow: 200000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 75,
      outputPer1K: 375,
    },
    tier: 'flagship',
    isAvailable: false, // Premium - requiere API key propia
    description: 'Claude 4.6 Opus - El modelo más potente de Anthropic. (Premium - Próximamente)',
  },
  {
    id: 'claude-4.6-sonnet',
    name: 'Claude 4.6 Sonnet',
    provider: 'ANTHROPIC',
    providerDisplayName: 'Anthropic',
    contextWindow: 200000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 15,
      outputPer1K: 75,
    },
    tier: 'premium',
    isAvailable: false, // Premium - requiere API key propia
    description: 'Claude 4.6 Sonnet - Equilibrio perfecto entre potencia y velocidad. (Premium - Próximamente)',
  },
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'El modelo más inteligente de Anthropic. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'Modelo rápido y económico de Anthropic. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'El modelo más potente de Claude. (Premium - No disponible)',
  },

  // ============================================
  // PREMIUM TIER - OpenAI (Deshabilitados)
  // ============================================
  // Modelos de próxima generación - requieren API Key propia
  // ============================================
  {
    id: 'chatgpt-5.2',
    name: 'ChatGPT 5.2',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 256000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 15,
      outputPer1K: 60,
    },
    tier: 'flagship',
    isAvailable: false, // Premium - requiere API key propia
    description: 'ChatGPT 5.2 - El modelo más avanzado de OpenAI. (Premium - Próximamente)',
  },
  {
    id: 'chatgpt-5.2-fast',
    name: 'ChatGPT 5.2 Fast',
    provider: 'OPENAI',
    providerDisplayName: 'OpenAI',
    contextWindow: 256000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    pricing: {
      inputPer1K: 5,
      outputPer1K: 20,
    },
    tier: 'premium',
    isAvailable: false, // Premium - requiere API key propia
    description: 'ChatGPT 5.2 Fast - Versión optimizada para velocidad. (Premium - Próximamente)',
  },
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
      inputPer1K: 5,
      outputPer1K: 15,
    },
    tier: 'premium',
    isAvailable: false, // Premium - requiere API key propia
    description: 'Modelo multimodal más avanzado de OpenAI. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'Versión ligera y económica de GPT-4o. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'GPT-4 con visión y contexto de 128K tokens. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'Modelo de razonamiento avanzado para problemas complejos. (Premium - No disponible)',
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
    isAvailable: false, // Premium - requiere API key propia
    description: 'Versión económica del modelo de razonamiento o1. (Premium - No disponible)',
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

export function getAllModels(): AIModelConfig[] {
  return AI_MODELS
}

export function getDefaultModel(): AIModelConfig {
  // Default to Llama 3.1 8B Instant (Groq Free Tier) as default
  return AI_MODELS.find(m => m.id === 'llama-3.1-8b-instant' && m.isAvailable) ||
         AI_MODELS.find(m => m.isAvailable) ||
         AI_MODELS[0]
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
