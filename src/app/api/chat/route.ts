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

// Initialize AI clients
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

// Groq uses OpenAI-compatible API
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

// Get the appropriate model instance for the AI SDK
function getModelInstance(modelId: string) {
  const modelConfig = getModelById(modelId)
  if (!modelConfig) {
    throw new Error(`Model ${modelId} not found`)
  }

  switch (modelConfig.provider) {
    case 'OPENAI':
      return openai(modelId)
    case 'ANTHROPIC':
      return anthropic(modelId)
    case 'GOOGLE':
      return google(modelId)
    case 'GROQ':
      return groq(modelId)
    default:
      throw new Error(`Unsupported provider: ${modelConfig.provider}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await getAuthUser()
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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
        JSON.stringify({ error: `Model ${modelId} not found` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user's current points balance and settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        pointsBalance: true,
        settings: {
          select: { dailyPointsLimit: true }
        }
      },
    })

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const dailyPointsLimit = user.settings?.dailyPointsLimit || 10000

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

    // Convert messages to core format for AI SDK
    const coreMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }))

    // Get model instance
    const model = getModelInstance(modelId)

    // Build stream options with optional reasoning effort for Groq models
    const streamOptions: Record<string, unknown> = {
      model,
      system: systemPrompt || undefined,
      messages: coreMessages,
      temperature,
      maxTokens: Math.min(maxTokens, modelConfig.maxOutputTokens),
    }

    // Add reasoning_effort for Groq models that support it
    if (modelConfig.provider === 'GROQ' && modelConfig.reasoningEffort) {
      streamOptions.reasoning_effort = modelConfig.reasoningEffort
    }

    // Execute streaming chat
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

          // Get usage info
          const usage = await result.usage
          totalPromptTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.7) : 0 // Estimate
          totalCompletionTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.3) : 0 // Estimate

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
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
