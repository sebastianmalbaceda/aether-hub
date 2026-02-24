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

export class OpenAIProvider extends AIProviderBase {
  private client: OpenAI
  static provider: AIProvider = 'openai'

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
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
        provider: OpenAIProvider.provider,
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
        const delta = chunk.choices[0]?.delta?.content || ''
        const finish = chunk.choices[0]?.finish_reason

        if (delta) {
          fullContent += delta
          onChunk({
            id: chunk.id,
            delta,
            finishReason: finish ? this.mapFinishReasonForStream(finish) : null,
          })
        }

        if (chunk.id) responseId = chunk.id
        if (finish) {
          finishReason = this.mapFinishReason(finish)
        }

        // Estimate tokens for streaming (rough approximation)
        if (delta) {
          completionTokens += Math.ceil(delta.length / 4)
        }
      }

      // Estimate prompt tokens
      promptTokens = Math.ceil(
        request.messages.reduce((acc, m) => acc + m.content.length, 0) / 4
      )

      return {
        id: responseId || `openai-stream-${Date.now()}`,
        provider: OpenAIProvider.provider,
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
        finishReason,
        latency: Date.now() - startTime,
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  getModels(): ModelConfig[] {
    return [
      {
        id: 'gpt-4o',
        provider: 'openai',
        displayName: 'GPT-4o',
        description: 'Most advanced multimodal model, fast and efficient',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 5, // 5 points per 1k tokens
        outputCostPer1kTokens: 15, // 15 points per 1k tokens
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'analysis', 'creative'],
      },
      {
        id: 'gpt-4o-mini',
        provider: 'openai',
        displayName: 'GPT-4o Mini',
        description: 'Affordable and intelligent small model',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputCostPer1kTokens: 0.15,
        outputCostPer1kTokens: 0.6,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'quick-tasks'],
      },
      {
        id: 'gpt-4-turbo',
        provider: 'openai',
        displayName: 'GPT-4 Turbo',
        description: 'Previous generation flagship model',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 10,
        outputCostPer1kTokens: 30,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'analysis'],
      },
      {
        id: 'gpt-3.5-turbo',
        provider: 'openai',
        displayName: 'GPT-3.5 Turbo',
        description: 'Fast and economical model for simple tasks',
        contextWindow: 16385,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 0.5,
        outputCostPer1kTokens: 1.5,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'quick-tasks', 'coding'],
      },
      {
        id: 'o1-preview',
        provider: 'openai',
        displayName: 'o1 Preview',
        description: 'Advanced reasoning model for complex problems',
        contextWindow: 128000,
        maxOutputTokens: 32768,
        inputCostPer1kTokens: 15,
        outputCostPer1kTokens: 60,
        capabilities: ['text', 'code'],
        skills: ['reasoning', 'math', 'coding', 'analysis'],
      },
      {
        id: 'o1-mini',
        provider: 'openai',
        displayName: 'o1 Mini',
        description: 'Fast reasoning model for coding and math',
        contextWindow: 128000,
        maxOutputTokens: 65536,
        inputCostPer1kTokens: 3,
        outputCostPer1kTokens: 12,
        capabilities: ['text', 'code'],
        skills: ['reasoning', 'math', 'coding'],
      },
    ]
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
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
        return 'stop'
    }
  }

  private mapFinishReasonForStream(
    reason: string | null | undefined
  ): 'stop' | 'length' | 'content_filter' | null {
    switch (reason) {
      case 'stop':
        return 'stop'
      case 'length':
        return 'length'
      case 'content_filter':
        return 'content_filter'
      default:
        return null
    }
  }

  private handleError(error: unknown): AIProviderError {
    if (error instanceof APIError) {
      const apiError = error as APIError & { status?: number; headers?: Record<string, string> }
      if (apiError.status === 429) {
        const retryAfter = apiError.headers?.['retry-after']
        return new RateLimitError(
          OpenAIProvider.provider,
          retryAfter ? parseInt(retryAfter) : 60
        )
      }
      if (apiError.status === 400 && apiError.message.includes('context')) {
        return new ContextLengthExceededError(
          OpenAIProvider.provider,
          0,
          128000
        )
      }
      return new AIProviderError(
        apiError.message,
        OpenAIProvider.provider,
        'API_ERROR',
        apiError.status,
        apiError.status !== undefined && apiError.status >= 500
      )
    }

    if (error instanceof Error) {
      return new AIProviderError(
        error.message,
        OpenAIProvider.provider,
        'UNKNOWN_ERROR',
        undefined,
        false
      )
    }

    return new AIProviderError(
      'Unknown error occurred',
      OpenAIProvider.provider,
      'UNKNOWN_ERROR',
      undefined,
      false
    )
  }
}
