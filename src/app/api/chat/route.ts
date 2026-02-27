import { NextRequest } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { getAuthUser } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getModelById, getSkillById, calculatePointsCost } from '@/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Puntos de bienvenida para nuevos usuarios
const WELCOME_BONUS_POINTS = 10000

// Initialize AI clients
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY,
})

// Groq uses OpenAI-compatible API
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

// Get the appropriate model instance for the AI SDK
function getModelInstance(modelId: string, provider: string) {
  switch (provider) {
    case 'OPENAI':
      return openai(modelId)
    case 'ANTHROPIC':
      return anthropic(modelId)
    case 'GOOGLE':
      return google(modelId)
    case 'GROQ':
      return groq(modelId)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await getAuthUser()
    
    // Require authentication - no more demo mode
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = authUser.id
    const body = await request.json()
    
    const { 
      messages, 
      modelId, 
      skillId,
      maxTokens = 4096,
      temperature = 0.7,
    } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!modelId) {
      return new Response(
        JSON.stringify({ error: 'Model ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get model configuration
    const modelConfig = getModelById(modelId)
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: `Model ${modelId} not found in configuration` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if model is available (premium models disabled)
    if (!modelConfig.isAvailable) {
      return new Response(
        JSON.stringify({
          error: `El modelo ${modelConfig.name} no está disponible en el plan actual. Por favor, selecciona un modelo gratuito de Groq.`,
          code: 'MODEL_UNAVAILABLE',
          modelName: modelConfig.name,
          provider: modelConfig.providerDisplayName,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get or create user in Prisma
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pointsBalance: true,
        settings: {
          select: { dailyPointsLimit: true }
        }
      },
    })

    // If user doesn't exist in Prisma, create it (sync from Supabase Auth)
    if (!user) {
      console.log(`[API /chat] Usuario ${userId} no encontrado en Prisma, creando...`)
      
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: authUser.email || `user_${userId}@aether.local`,
            fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
            pointsBalance: WELCOME_BONUS_POINTS,
            role: 'USER',
            isActive: true,
            settings: {
              create: {
                dailyPointsLimit: 10000,
                sessionTokensLimit: 100000,
                preferredModel: 'llama-3.1-8b-instant',
                theme: 'dark',
                language: 'es',
              }
            }
          },
          select: {
            pointsBalance: true,
            settings: {
              select: { dailyPointsLimit: true }
            }
          }
        })

        // Create welcome bonus transaction
        await prisma.transaction.create({
          data: {
            userId,
            type: 'BONUS',
            pointsAmount: WELCOME_BONUS_POINTS,
            description: 'Bono de bienvenida - 10,000 puntos gratis',
            metadata: { type: 'welcome_bonus' }
          }
        })

        console.log(`[API /chat] Usuario ${userId} creado con ${WELCOME_BONUS_POINTS} puntos de bienvenida`)
      } catch (createError) {
        console.error('[API /chat] Error creando usuario:', createError)
        return new Response(
          JSON.stringify({ error: 'Error creating user profile', code: 'USER_CREATE_ERROR' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check daily usage
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'USAGE_DEDUCTION',
        createdAt: { gte: today },
      },
      _sum: { pointsAmount: true },
    })

    const dailyUsed = Math.abs(todayUsage._sum.pointsAmount || 0)
    const dailyPointsLimit = user.settings?.dailyPointsLimit || 10000
    const remainingDaily = dailyPointsLimit - dailyUsed

    if (remainingDaily <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Daily limit exceeded',
          code: 'DAILY_LIMIT_EXCEEDED',
          dailyLimit: dailyPointsLimit,
          dailyUsed,
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build system prompt from skill
    let systemPrompt = ''
    if (skillId) {
      const skill = getSkillById(skillId)
      if (skill) {
        systemPrompt = skill.systemPrompt
      }
    }

    // SANITIZATION: Convert messages to clean format for AI SDK
    // Groq and strict models only accept { role: 'user' | 'assistant', content: string }
    // Frontend may send complex objects or arrays that cause 400 errors
    const coreMessages = messages.map((msg: { role: string; content: unknown }) => {
      // Extract pure text from content
      let pureText = ''
      
      if (typeof msg.content === 'string') {
        pureText = msg.content
      } else if (Array.isArray(msg.content)) {
        // Handle multimodal content arrays - extract only text parts
        pureText = msg.content
          .filter((part: unknown) =>
            typeof part === 'object' && part !== null && (part as { type?: string }).type === 'text'
          )
          .map((part: unknown) => (part as { text?: string }).text || '')
          .join('\n')
      } else if (msg.content !== null && msg.content !== undefined) {
        pureText = String(msg.content)
      }

      // Normalize role - Groq doesn't accept 'function' role
      let normalizedRole = msg.role?.toLowerCase() || 'user'
      if (normalizedRole === 'function' || normalizedRole === 'system') {
        normalizedRole = 'assistant'
      }

      return {
        role: normalizedRole as 'user' | 'assistant',
        content: pureText,
      }
    }).filter((msg) => msg.content.trim().length > 0) // Remove empty messages

    // Get model instance
    const model = getModelInstance(modelId, modelConfig.provider)

    // Build stream options
    const maxOutputTokens = Math.min(maxTokens, modelConfig.maxOutputTokens)

    // Execute streaming chat
    // For Groq models with reasoning_effort, we need to pass it in the body
    const streamOptions: Record<string, unknown> = {
      model,
      system: systemPrompt || undefined,
      messages: coreMessages,
      temperature,
      maxRetries: 3,
    }

    // Add max_tokens via body for Groq compatibility
    streamOptions.body = {
      max_tokens: maxOutputTokens,
    }

    // Add reasoning_effort for Groq models that support it
    if (modelConfig.provider === 'GROQ' && modelConfig.reasoningEffort) {
      streamOptions.body = {
        ...streamOptions.body as object,
        reasoning_effort: modelConfig.reasoningEffort,
      }
    }

    const result = streamText(streamOptions as Parameters<typeof streamText>[0])

    // Track usage after stream completes
    let totalPromptTokens = 0
    let totalCompletionTokens = 0

    // Create a transform stream to process the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          
          // Process the stream
          for await (const chunk of result.textStream) {
            fullContent += chunk
            // Forward the chunk to the client
            controller.enqueue(encoder.encode(`0:"${chunk.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`))
          }

          // Get usage info - AI SDK v6 uses totalTokens
          const usage = await result.usage
          totalPromptTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.7) : 0
          totalCompletionTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.3) : 0

          // Calculate points cost
          const pointsUsed = calculatePointsCost(
            modelId,
            totalPromptTokens,
            totalCompletionTokens
          )

          // Check if user has enough points
          if (pointsUsed > user.pointsBalance) {
            const errorData = JSON.stringify({
              type: 'error',
              code: 'INSUFFICIENT_POINTS',
              message: 'Insufficient points balance',
              required: pointsUsed,
              available: user.pointsBalance,
            })
            controller.enqueue(encoder.encode(`e:${errorData}\n`))
            controller.close()
            return
          }

          // Deduct points and record transaction
          await prisma.$transaction([
            // Update user balance
            prisma.user.update({
              where: { id: userId },
              data: {
                pointsBalance: { decrement: pointsUsed },
              },
            }),
            // Create transaction record
            prisma.transaction.create({
              data: {
                userId,
                type: 'USAGE_DEDUCTION',
                pointsAmount: -pointsUsed,
                description: `Chat usage: ${modelConfig.name}`,
                metadata: {
                  modelId,
                  skillId,
                  promptTokens: totalPromptTokens,
                  completionTokens: totalCompletionTokens,
                  totalTokens: totalPromptTokens + totalCompletionTokens,
                },
              },
            }),
          ])

          // Send telemetry data
          const telemetryData = JSON.stringify({
            type: 'telemetry',
            pointsUsed,
            remainingPoints: user.pointsBalance - pointsUsed,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            totalTokens: totalPromptTokens + totalCompletionTokens,
            dailyUsed: dailyUsed + pointsUsed,
            dailyLimit: dailyPointsLimit,
          })
          controller.enqueue(encoder.encode(`d:${telemetryData}\n`))
          
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          controller.enqueue(encoder.encode(`e:${errorData}\n`))
          controller.close()
        }
      },
    })

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      // Rate limit errors (429)
      if (error.message.includes('429') ||
          error.message.includes('rate limit') ||
          error.message.includes('quota') ||
          error.message.includes('Too Many Requests')) {
        return new Response(
          JSON.stringify({
            error: 'Límite gratuito alcanzado. Por favor, espera unos minutos antes de continuar.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60, // Suggest retry after 60 seconds
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Authentication errors
      if (error.message.includes('401') ||
          error.message.includes('Unauthorized') ||
          error.message.includes('Invalid API key')) {
        return new Response(
          JSON.stringify({
            error: 'Error de autenticación con el proveedor de IA. Verifica la configuración.',
            code: 'AUTH_ERROR',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Context length exceeded
      if (error.message.includes('context') ||
          error.message.includes('token') ||
          error.message.includes('maximum')) {
        return new Response(
          JSON.stringify({
            error: 'El mensaje es demasiado largo. Por favor, reduce la longitud del contexto.',
            code: 'CONTEXT_LENGTH_EXCEEDED',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
