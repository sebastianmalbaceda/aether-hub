import { GoogleGenerativeAI, GenerativeModel, Content, Part } from '@google/generative-ai'
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

export class GoogleProvider extends AIProviderBase {
  private client: GoogleGenerativeAI
  static provider: AIProvider = 'google'

  constructor(config: ProviderConfig) {
    super(config)
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  private getModel(modelId: string): GenerativeModel {
    return this.client.getGenerativeModel({ model: modelId })
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now()

    try {
      const model = this.getModel(request.model)
      
      // Convert messages to Google's format
      const history: Content[] = []
      let systemInstruction: string | undefined
      
      for (const msg of request.messages) {
        if (msg.role === 'system') {
          systemInstruction = msg.content
        } else {
          history.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content } as Part],
          })
        }
      }

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
          topP: request.topP,
          stopSequences: request.stop,
        },
        systemInstruction: systemInstruction,
      })

      // Get the last user message
      const lastUserMessage = request.messages.filter((m) => m.role === 'user').pop()
      if (!lastUserMessage) {
        throw new AIProviderError(
          'No user message provided',
          GoogleProvider.provider,
          'INVALID_REQUEST',
          400,
          false
        )
      }

      const result = await chat.sendMessage(lastUserMessage.content)
      const response = result.response

      return {
        id: `google-${Date.now()}`,
        provider: GoogleProvider.provider,
        model: request.model,
        message: {
          role: 'assistant',
          content: response.text(),
        },
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: this.mapFinishReason(response.candidates?.[0]?.finishReason),
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

    try {
      const model = this.getModel(request.model)
      
      // Convert messages to Google's format
      const history: Content[] = []
      let systemInstruction: string | undefined
      
      for (const msg of request.messages) {
        if (msg.role === 'system') {
          systemInstruction = msg.content
        } else {
          history.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content } as Part],
          })
        }
      }

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
          topP: request.topP,
          stopSequences: request.stop,
        },
        systemInstruction: systemInstruction,
      })

      // Get the last user message
      const lastUserMessage = request.messages.filter((m) => m.role === 'user').pop()
      if (!lastUserMessage) {
        throw new AIProviderError(
          'No user message provided',
          GoogleProvider.provider,
          'INVALID_REQUEST',
          400,
          false
        )
      }

      const result = await chat.sendMessageStream(lastUserMessage.content)
      
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullContent += text
        onChunk({
          id: `google-chunk-${Date.now()}`,
          delta: text,
          finishReason: null,
        })

        if (chunk.usageMetadata) {
          promptTokens = chunk.usageMetadata.promptTokenCount || promptTokens
          completionTokens = chunk.usageMetadata.candidatesTokenCount || completionTokens
        }
      }

      // Get final usage from the response
      const finalResponse = await result.response
      promptTokens = finalResponse.usageMetadata?.promptTokenCount || promptTokens
      completionTokens = finalResponse.usageMetadata?.candidatesTokenCount || completionTokens
      finishReason = this.mapFinishReason(finalResponse.candidates?.[0]?.finishReason)

      return {
        id: `google-stream-${Date.now()}`,
        provider: GoogleProvider.provider,
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
        id: 'gemini-2.0-flash',
        provider: 'google',
        displayName: 'Gemini 2.0 Flash',
        description: 'Fast and efficient multimodal model',
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0.1,
        outputCostPer1kTokens: 0.4,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'quick-tasks', 'multimodal'],
      },
      {
        id: 'gemini-1.5-pro',
        provider: 'google',
        displayName: 'Gemini 1.5 Pro',
        description: 'Most capable Gemini model with 1M context',
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 1.25,
        outputCostPer1kTokens: 5,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'analysis', 'multimodal', 'reasoning'],
      },
      {
        id: 'gemini-1.5-flash',
        provider: 'google',
        displayName: 'Gemini 1.5 Flash',
        description: 'Fast and versatile multimodal model',
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0.075,
        outputCostPer1kTokens: 0.3,
        capabilities: ['text', 'code', 'vision', 'function_calling'],
        skills: ['general', 'coding', 'quick-tasks', 'multimodal'],
      },
      {
        id: 'gemini-1.5-flash-8b',
        provider: 'google',
        displayName: 'Gemini 1.5 Flash-8B',
        description: 'Smaller, faster model for simple tasks',
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        inputCostPer1kTokens: 0.0375,
        outputCostPer1kTokens: 0.15,
        capabilities: ['text', 'code', 'vision'],
        skills: ['general', 'quick-tasks'],
      },
      {
        id: 'gemini-1.0-pro',
        provider: 'google',
        displayName: 'Gemini 1.0 Pro',
        description: 'Reliable model for text-only tasks',
        contextWindow: 32000,
        maxOutputTokens: 2048,
        inputCostPer1kTokens: 0.5,
        outputCostPer1kTokens: 1.5,
        capabilities: ['text', 'code', 'function_calling'],
        skills: ['general', 'coding'],
      },
    ]
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.getModel('gemini-1.5-flash')
      await model.generateContent('Hi')
      return true
    } catch {
      return false
    }
  }

  private mapFinishReason(
    reason: string | undefined
  ): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'STOP':
        return 'stop'
      case 'MAX_TOKENS':
      case 'LENGTH':
        return 'length'
      case 'SAFETY':
        return 'content_filter'
      case 'RECITATION':
        return 'content_filter'
      default:
        return 'stop'
    }
  }

  private handleError(error: unknown): AIProviderError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      if (message.includes('rate limit') || message.includes('quota')) {
        return new RateLimitError(GoogleProvider.provider, 60)
      }
      
      if (message.includes('context') || message.includes('token')) {
        return new ContextLengthExceededError(
          GoogleProvider.provider,
          0,
          1000000
        )
      }
      
      // Check for Google API error structure
      const googleError = error as Error & { 
        status?: number
        statusCode?: number
      }
      
      const status = googleError.status || googleError.statusCode
      
      if (status === 429) {
        return new RateLimitError(GoogleProvider.provider, 60)
      }
      
      return new AIProviderError(
        error.message,
        GoogleProvider.provider,
        'API_ERROR',
        status,
        status !== undefined && status >= 500
      )
    }

    return new AIProviderError(
      'Unknown error occurred',
      GoogleProvider.provider,
      'UNKNOWN_ERROR',
      undefined,
      false
    )
  }
}
