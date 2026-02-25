// AI Provider Types and Interfaces

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'groq'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
  stream?: boolean
  stop?: string[]
}

export interface ChatCompletionResponse {
  id: string
  provider: AIProvider
  model: string
  message: ChatMessage
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: 'stop' | 'length' | 'content_filter' | 'error'
  latency: number // in milliseconds
}

export interface StreamingChunk {
  id: string
  delta: string
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error' | null
}

export interface ModelConfig {
  id: string
  provider: AIProvider
  displayName: string
  description: string
  contextWindow: number
  maxOutputTokens: number
  inputCostPer1kTokens: number // in points
  outputCostPer1kTokens: number // in points
  capabilities: ('text' | 'code' | 'vision' | 'function_calling')[]
  skills: string[] // recommended skills for this model
}

export interface ProviderConfig {
  provider: AIProvider
  apiKey: string
  baseUrl?: string
  defaultModel?: string
  timeout?: number
}

// Abstract base class for AI providers
export abstract class AIProviderBase {
  protected config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  abstract chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>
  abstract chatStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<ChatCompletionResponse>
  abstract getModels(): ModelConfig[]
  abstract validateApiKey(): Promise<boolean>
}

// Error types
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: AIProvider, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${provider}. Retry after ${retryAfter || 60} seconds.`,
      provider,
      'RATE_LIMIT',
      429,
      true
    )
    this.name = 'RateLimitError'
  }
}

export class ContextLengthExceededError extends AIProviderError {
  constructor(provider: AIProvider, requestedTokens: number, maxTokens: number) {
    super(
      `Context length exceeded. Requested: ${requestedTokens}, Max: ${maxTokens}`,
      provider,
      'CONTEXT_LENGTH_EXCEEDED',
      400,
      false
    )
    this.name = 'ContextLengthExceededError'
  }
}

export class InsufficientPointsError extends Error {
  constructor(required: number, available: number) {
    super(
      `Insufficient points. Required: ${required}, Available: ${available}`
    )
    this.name = 'InsufficientPointsError'
  }
}
