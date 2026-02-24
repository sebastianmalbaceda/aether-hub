// AI Provider Registry - Central management for all AI providers

import { AIProviderBase, ProviderConfig, ModelConfig, AIProvider } from './types'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { GoogleProvider } from './providers/google'

export interface ProviderCredentials {
  openai?: string
  anthropic?: string
  google?: string
}

class AIProviderRegistry {
  private providers: Map<AIProvider, AIProviderBase> = new Map()
  private credentials: ProviderCredentials = {}

  initialize(credentials: ProviderCredentials): void {
    this.credentials = credentials

    if (credentials.openai) {
      this.providers.set('openai', new OpenAIProvider({
        provider: 'openai',
        apiKey: credentials.openai,
      }))
    }

    if (credentials.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider({
        provider: 'anthropic',
        apiKey: credentials.anthropic,
      }))
    }

    if (credentials.google) {
      this.providers.set('google', new GoogleProvider({
        provider: 'google',
        apiKey: credentials.google,
      }))
    }
  }

  getProvider(provider: AIProvider): AIProviderBase | undefined {
    return this.providers.get(provider)
  }

  getProviderForModel(modelId: string): AIProviderBase | undefined {
    const provider = this.detectProviderFromModel(modelId)
    return this.providers.get(provider)
  }

  private detectProviderFromModel(modelId: string): AIProvider {
    if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('chatgpt')) {
      return 'openai'
    }
    if (modelId.startsWith('claude')) {
      return 'anthropic'
    }
    if (modelId.startsWith('gemini')) {
      return 'google'
    }
    // Default to OpenAI
    return 'openai'
  }

  getAllModels(): ModelConfig[] {
    const models: ModelConfig[] = []
    for (const provider of this.providers.values()) {
      models.push(...provider.getModels())
    }
    return models
  }

  getModelsByProvider(provider: AIProvider): ModelConfig[] {
    const providerInstance = this.providers.get(provider)
    return providerInstance ? providerInstance.getModels() : []
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys())
  }

  isProviderAvailable(provider: AIProvider): boolean {
    return this.providers.has(provider)
  }

  async validateAllProviders(): Promise<Record<AIProvider, boolean>> {
    const results: Record<AIProvider, boolean> = {
      openai: false,
      anthropic: false,
      google: false,
      meta: false,
      mistral: false,
    }

    for (const [provider, instance] of this.providers) {
      try {
        results[provider] = await instance.validateApiKey()
      } catch {
        results[provider] = false
      }
    }

    return results
  }

  getModelConfig(modelId: string): ModelConfig | undefined {
    for (const provider of this.providers.values()) {
      const model = provider.getModels().find((m) => m.id === modelId)
      if (model) return model
    }
    return undefined
  }
}

// Singleton instance
export const aiProviderRegistry = new AIProviderRegistry()

// Export types and classes
export * from './types'
export { OpenAIProvider } from './providers/openai'
export { AnthropicProvider } from './providers/anthropic'
export { GoogleProvider } from './providers/google'
