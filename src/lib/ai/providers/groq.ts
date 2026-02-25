// ============================================
// Groq Provider - Ultra-fast inference
// ============================================
// Uses OpenAI-compatible API format

import OpenAI, { APIError } from 'openai'
import {
  AIProviderBase,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
  ModelConfig,
  ProviderConfig,
  AIProviderError,
  RateLimitError,
  ContextLengthExceededError,
} from '../types'

export class GroqProvider extends AIProviderBase {
  private client: OpenAI
  static provider: AIProvider = 'groq'

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.groq.com/openai/v1',
      timeout: config.timeout || 60000,
    })
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now()

    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        })),
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        stop: request.stop,
      })

      const choice = response.choices[0]

      return {
        id: response.id,
        provider: GroqProvider.provider,
        model: response.model,
        message: {
          role: 'assistant',
          content: choice.message.content || '',
        },
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        finishReason: this.mapFinishReason(choice.finish_reason),
        latency: Date.now() - startTime,
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async chatStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now()
    let fullContent = ''
    let promptTokens = 0
    let completionTokens = 0
    let finishReason: 'stop' | 'length' | 'content_filter' | 'error' = 'stop'
    let responseId = ''

    try {
      const stream = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map((m) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content,
        })),
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        stop: request.stop,
        stream: true,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        const content = delta?.content || ''

        if (content) {
          fullContent += content
          onChunk({
            id: chunk.id || responseId,
            delta: content,
            finishReason: null,
          })
        }

        if (chunk.choices[0]?.finish_reason) {
          finishReason = this.mapFinishReason(chunk.choices[0].finish_reason)
        }

        if (chunk.id) {
          responseId = chunk.id
        }

        // Groq provides usage in the final chunk via x_groq
        const groqChunk = chunk as typeof chunk & { 
          x_groq?: { 
            usage?: { 
              prompt_tokens?: number
              completion_tokens?: number 
            } 
          } 
        }
        if (groqChunk.x_groq?.usage) {
          promptTokens = groqChunk.x_groq.usage.prompt_tokens || 0
          completionTokens = groqChunk.x_groq.usage.completion_tokens || 0
        }
      }

      onChunk({
        id: responseId || `groq-${Date.now()}`,
        delta: '',
        finishReason: finishReason,
      })

      return {
        id: responseId || `groq-${Date.now()}`,
        provider: GroqProvider.provider,
        model: request.model,
        message: {
          role: 'assistant',
          content: fullContent,
        },
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        finishReason: finishReason || 'stop',
        latency: Date.now() - startTime,
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  getModels(): ModelConfig[] {
    return [
      {
        id: 'llama-3.3-70b-versatile',
        provider: 'groq',
        displayName: 'Llama 3.3 70B Versatile',
        description: 'Modelo Llama 3.3 70B en Groq. Inferencia ultra-rápida gratuita.',
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'coding', 'analysis'],
      },
      {
        id: 'llama-3.1-8b-instant',
        provider: 'groq',
        displayName: 'Llama 3.1 8B Instant',
        description: 'Modelo Llama 3.1 8B en Groq. Ideal para respuestas rápidas.',
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'quick-tasks'],
      },
      {
        id: 'mixtral-8x7b-32768',
        provider: 'groq',
        displayName: 'Mixtral 8x7B',
        description: 'Modelo Mixtral 8x7B en Groq. Excelente para tareas generales.',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'coding', 'analysis'],
      },
      {
        id: 'gemma2-9b-it',
        provider: 'groq',
        displayName: 'Gemma 2 9B',
        description: 'Modelo Gemma 2 9B de Google en Groq. Compacto y eficiente.',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'quick-tasks'],
      },
    ]
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to validate the API key
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof APIError) {
      if (error.status === 429) {
        return new RateLimitError('groq')
      }
      if (error.status === 400 && error.message.includes('context')) {
        return new ContextLengthExceededError('groq', 0, 0)
      }
      return new AIProviderError(
        `Groq API error: ${error.message}`,
        'groq',
        error.code || 'UNKNOWN',
        error.status,
        error.status === 429 || error.status === 503
      )
    }
    return new AIProviderError(
      `Unknown error: ${error instanceof Error ? error.message : 'Unknown'}`,
      'groq',
      'UNKNOWN',
      undefined,
      false
    )
  }

  private mapFinishReason(
    reason: string | null | undefined
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop'
      case 'length':
        return 'length'
      case 'content_filter':
        return 'content_filter'
      default:
        return 'stop' // Default to 'stop' for unknown reasons
    }
  }
}
