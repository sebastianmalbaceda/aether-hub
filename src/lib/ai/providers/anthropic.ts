import Anthropic from '@anthropic-ai/sdk'
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

export class AnthropicProvider extends AIProviderBase {
  private client: Anthropic
  static provider: AIProvider = 'anthropic'

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout || 60000,
    })
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now()

    try {
      // Extract system message if present
      const systemMessage = request.messages.find((m) => m.role === 'system')
      const otherMessages = request.messages.filter((m) => m.role !== 'system')

      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
      })

      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')

      return {
        id: response.id,
        provider: AnthropicProvider.provider,
        model: response.model,
        message: {
          role: 'assistant',
          content: textContent,
        },
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: this.mapFinishReason(response.stop_reason),
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
      // Extract system message if present
      const systemMessage = request.messages.find((m) => m.role === 'system')
      const otherMessages = request.messages.filter((m) => m.role !== 'system')

      const stream = await this.client.messages.stream({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const delta = event.delta.text
          fullContent += delta
          onChunk({
            id: event.index.toString(),
            delta,
            finishReason: null,
          })
        }

        if (event.type === 'message_start') {
          responseId = event.message.id
          promptTokens = event.message.usage.input_tokens
        }

        if (event.type === 'message_delta') {
          completionTokens = event.usage.output_tokens
          if (event.delta.stop_reason) {
            finishReason = this.mapFinishReason(event.delta.stop_reason)
          }
        }
      }

      return {
        id: responseId || `anthropic-stream-${Date.now()}`,
        provider: AnthropicProvider.provider,
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
        id: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        displayName: 'Claude 3.5 Sonnet',
        description: 'Most intelligent model, ideal for complex tasks',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 3,
        outputCostPer1kTokens: 15,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'analysis', 'creative', 'reasoning'],
      },
      {
        id: 'claude-3-5-haiku-20241022',
        provider: 'anthropic',
        displayName: 'Claude 3.5 Haiku',
        description: 'Fastest model for quick responses',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0.8,
        outputCostPer1kTokens: 4,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'quick-tasks', 'coding'],
      },
      {
        id: 'claude-3-opus-20240229',
        provider: 'anthropic',
        displayName: 'Claude 3 Opus',
        description: 'Powerful model for highly complex tasks',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 15,
        outputCostPer1kTokens: 75,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['reasoning', 'analysis', 'creative', 'coding'],
      },
      {
        id: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        displayName: 'Claude 3 Sonnet',
        description: 'Balanced performance and speed',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 3,
        outputCostPer1kTokens: 15,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'analysis'],
      },
      {
        id: 'claude-3-haiku-20240307',
        provider: 'anthropic',
        displayName: 'Claude 3 Haiku',
        description: 'Fast and cost-effective for simple tasks',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputCostPer1kTokens: 0.25,
        outputCostPer1kTokens: 1.25,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'quick-tasks'],
      },
    ]
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      })
      return true
    } catch {
      return false
    }
  }

  private mapFinishReason(
    reason: string | null | undefined
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop'
      case 'max_tokens':
        return 'length'
      case 'stop':
        return 'stop'
      default:
        return 'stop'
    }
  }

  private handleError(error: unknown): AIProviderError {
    if (error instanceof Anthropic.APIError) {
      const apiError = error as InstanceType<typeof Anthropic.APIError> & {
        status?: number
        headers?: Record<string, string>
        error?: { error?: { type?: string } }
      }
      
      if (apiError.status === 429) {
        const retryAfter = apiError.headers?.['retry-after']
        return new RateLimitError(
          AnthropicProvider.provider,
          retryAfter ? parseInt(retryAfter) : 60
        )
      }
      
      if (apiError.status === 400 && apiError.message.includes('context')) {
        return new ContextLengthExceededError(
          AnthropicProvider.provider,
          0,
          200000
        )
      }
      
      return new AIProviderError(
        apiError.message,
        AnthropicProvider.provider,
        'API_ERROR',
        apiError.status,
        apiError.status !== undefined && apiError.status >= 500
      )
    }

    if (error instanceof Error) {
      return new AIProviderError(
        error.message,
        AnthropicProvider.provider,
        'UNKNOWN_ERROR',
        undefined,
        false
      )
    }

    return new AIProviderError(
      'Unknown error occurred',
      AnthropicProvider.provider,
      'UNKNOWN_ERROR',
      undefined,
      false
    )
  }
}
