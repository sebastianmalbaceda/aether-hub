// Chat Service - High-level service for AI chat operations

import { 
  aiProviderRegistry, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  StreamingChunk,
  ModelConfig,
  AIProvider,
  AIProviderError,
} from './registry'
import { BillingMiddleware } from '../billing/middleware'
import { calculateCost, estimateTokens } from '../points/calculator'

export interface ChatOptions {
  userId: string
  model: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  maxTokens?: number
  temperature?: number
  topP?: number
  stream?: boolean
  skill?: string
  sessionId?: string
}

export interface ChatResult {
  response: ChatCompletionResponse
  pointsUsed: number
  remainingPoints: number
}

export interface StreamResult {
  pointsUsed: number
  remainingPoints: number
  response: ChatCompletionResponse
}

export class InsufficientPointsError extends Error {
  constructor(public required: number, public available: number) {
    super(`Insufficient points. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientPointsError'
  }
}

class ChatService {
  /**
   * Execute a chat completion request
   */
  async chat(options: ChatOptions): Promise<ChatResult> {
    const { userId, model, messages, maxTokens, temperature, topP, skill, sessionId } = options

    // Get model configuration
    const modelConfig = aiProviderRegistry.getModelConfig(model)
    if (!modelConfig) {
      throw new AIProviderError(
        `Model ${model} not found`,
        'openai',
        'MODEL_NOT_FOUND',
        404,
        false
      )
    }

    // Estimate tokens for cost preview
    const totalContent = messages.map((m) => m.content).join('')
    const estimatedPromptTokens = estimateTokens(totalContent)
    const estimatedCompletionTokens = maxTokens || modelConfig.maxOutputTokens
    const estimatedCost = calculateCost(
      estimatedPromptTokens,
      estimatedCompletionTokens,
      modelConfig
    )

    // Verify user has enough points
    const billingCheck = await BillingMiddleware.verifyUserCanProceed(userId, estimatedCost)
    if (!billingCheck.canProceed) {
      throw new InsufficientPointsError(estimatedCost, billingCheck.currentBalance || 0)
    }

    // Get the appropriate provider
    const provider = aiProviderRegistry.getProviderForModel(model)
    if (!provider) {
      throw new AIProviderError(
        `No provider available for model ${model}`,
        modelConfig.provider,
        'PROVIDER_NOT_AVAILABLE',
        503,
        true
      )
    }

    // Build the request
    const request: ChatCompletionRequest = {
      messages,
      model,
      maxTokens: maxTokens || modelConfig.maxOutputTokens,
      temperature: temperature ?? 0.7,
      topP: topP ?? 1,
      stream: false,
    }

    // Apply skill-specific system prompt if provided
    if (skill) {
      const skillPrompt = this.getSkillPrompt(skill)
      if (skillPrompt) {
        request.messages = [
          { role: 'system', content: skillPrompt },
          ...request.messages.filter((m) => m.role !== 'system'),
        ]
      }
    }

    try {
      // Execute the chat
      const response = await provider.chat(request)

      // Calculate actual cost
      const actualCost = calculateCost(
        response.usage.promptTokens,
        response.usage.completionTokens,
        modelConfig
      )

      // Record usage if sessionId provided
      if (sessionId) {
        const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
        await BillingMiddleware.recordUsage({
          userId,
          sessionId,
          model,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          pointsCost: actualCost,
          userMessage: lastUserMessage?.content || '',
          assistantMessage: response.message.content,
        })
      }

      return {
        response,
        pointsUsed: actualCost,
        remainingPoints: (billingCheck.currentBalance || 0) - actualCost,
      }
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error
      }
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        modelConfig.provider,
        'CHAT_ERROR',
        500,
        true
      )
    }
  }

  /**
   * Execute a streaming chat completion
   */
  async chatStream(
    options: ChatOptions,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<StreamResult> {
    const { userId, model, messages, maxTokens, temperature, topP, skill, sessionId } = options

    // Get model configuration
    const modelConfig = aiProviderRegistry.getModelConfig(model)
    if (!modelConfig) {
      throw new AIProviderError(
        `Model ${model} not found`,
        'openai',
        'MODEL_NOT_FOUND',
        404,
        false
      )
    }

    // Estimate tokens for cost preview
    const totalContent = messages.map((m) => m.content).join('')
    const estimatedPromptTokens = estimateTokens(totalContent)
    const estimatedCompletionTokens = maxTokens || modelConfig.maxOutputTokens
    const estimatedCost = calculateCost(
      estimatedPromptTokens,
      estimatedCompletionTokens,
      modelConfig
    )

    // Verify user has enough points
    const billingCheck = await BillingMiddleware.verifyUserCanProceed(userId, estimatedCost)
    if (!billingCheck.canProceed) {
      throw new InsufficientPointsError(estimatedCost, billingCheck.currentBalance || 0)
    }

    // Get the appropriate provider
    const provider = aiProviderRegistry.getProviderForModel(model)
    if (!provider) {
      throw new AIProviderError(
        `No provider available for model ${model}`,
        modelConfig.provider,
        'PROVIDER_NOT_AVAILABLE',
        503,
        true
      )
    }

    // Build the request
    const request: ChatCompletionRequest = {
      messages,
      model,
      maxTokens: maxTokens || modelConfig.maxOutputTokens,
      temperature: temperature ?? 0.7,
      topP: topP ?? 1,
      stream: true,
    }

    // Apply skill-specific system prompt if provided
    if (skill) {
      const skillPrompt = this.getSkillPrompt(skill)
      if (skillPrompt) {
        request.messages = [
          { role: 'system', content: skillPrompt },
          ...request.messages.filter((m) => m.role !== 'system'),
        ]
      }
    }

    try {
      // Execute the streaming chat
      const response = await provider.chatStream(request, onChunk)

      // Calculate actual cost
      const actualCost = calculateCost(
        response.usage.promptTokens,
        response.usage.completionTokens,
        modelConfig
      )

      // Record usage if sessionId provided
      if (sessionId) {
        const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
        await BillingMiddleware.recordUsage({
          userId,
          sessionId,
          model,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          pointsCost: actualCost,
          userMessage: lastUserMessage?.content || '',
          assistantMessage: response.message.content,
        })
      }

      return {
        response,
        pointsUsed: actualCost,
        remainingPoints: (billingCheck.currentBalance || 0) - actualCost,
      }
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error
      }
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        modelConfig.provider,
        'CHAT_ERROR',
        500,
        true
      )
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): ModelConfig[] {
    return aiProviderRegistry.getAllModels()
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: AIProvider): ModelConfig[] {
    return aiProviderRegistry.getModelsByProvider(provider)
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelId: string): ModelConfig | undefined {
    return aiProviderRegistry.getModelConfig(modelId)
  }

  /**
   * Estimate cost for a chat
   */
  estimateCost(
    model: string,
    promptText: string,
    estimatedCompletionTokens: number
  ): number {
    const modelConfig = aiProviderRegistry.getModelConfig(model)
    if (!modelConfig) return 0

    const promptTokens = estimateTokens(promptText)
    return calculateCost(promptTokens, estimatedCompletionTokens, modelConfig)
  }

  /**
   * Get skill-specific system prompts
   */
  private getSkillPrompt(skill: string): string | null {
    const skillPrompts: Record<string, string> = {
      coding: `You are an expert software developer. Provide clean, well-documented code with explanations. Follow best practices and consider edge cases. Use appropriate design patterns and optimize for readability and maintainability.`,
      analysis: `You are an expert analyst. Provide thorough, data-driven insights. Consider multiple perspectives, identify patterns, and highlight key findings. Structure your analysis clearly with actionable recommendations.`,
      creative: `You are a creative assistant with expertise in storytelling, content creation, and creative writing. Be imaginative while maintaining coherence and engagement. Adapt your style to the user's needs.`,
      reasoning: `You are an expert at logical reasoning and problem-solving. Think step-by-step, consider assumptions, evaluate evidence, and draw well-supported conclusions. Be precise and methodical.`,
      math: `You are an expert mathematician. Solve problems step-by-step, showing your work clearly. Verify your answers and explain the underlying mathematical concepts.`,
      'quick-tasks': `You are a fast, efficient assistant for quick tasks. Provide concise, direct answers without unnecessary elaboration. Focus on accuracy and speed.`,
      general: `You are a helpful, knowledgeable assistant. Provide accurate, balanced information and adapt your responses to the user's needs and context.`,
      multimodal: `You are a multimodal AI assistant capable of understanding and generating content across text and images. Describe visual content accurately and provide comprehensive analysis.`,
    }

    return skillPrompts[skill] || null
  }
}

// Singleton instance
export const chatService = new ChatService()
