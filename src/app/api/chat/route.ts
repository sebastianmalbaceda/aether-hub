import { NextRequest, NextResponse } from 'next/server'
import { chatService, InsufficientPointsError } from '@/lib/ai'
import { AIProviderError } from '@/lib/ai/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      userId, 
      model, 
      messages, 
      maxTokens, 
      temperature, 
      topP, 
      skill, 
      sessionId,
      stream 
    } = body

    // Validate required fields
    if (!userId || !model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, model, messages' },
        { status: 400 }
      )
    }

    // Validate messages format
    for (const msg of messages) {
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return NextResponse.json(
          { error: `Invalid message role: ${msg.role}` },
          { status: 400 }
        )
      }
      if (typeof msg.content !== 'string') {
        return NextResponse.json(
          { error: 'Message content must be a string' },
          { status: 400 }
        )
      }
    }

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await chatService.chatStream(
              {
                userId,
                model,
                messages,
                maxTokens,
                temperature,
                topP,
                skill,
                sessionId,
              },
              (chunk) => {
                const data = JSON.stringify({
                  type: 'chunk',
                  delta: chunk.delta,
                  finishReason: chunk.finishReason,
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            )

            // Send final result
            const finalData = JSON.stringify({
              type: 'done',
              pointsUsed: result.pointsUsed,
              remainingPoints: result.remainingPoints,
              usage: result.response.usage,
            })
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
            controller.close()
          } catch (error) {
            const errorData = JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Unknown error',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Handle non-streaming response
    const result = await chatService.chat({
      userId,
      model,
      messages,
      maxTokens,
      temperature,
      topP,
      skill,
      sessionId,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.response.id,
        model: result.response.model,
        provider: result.response.provider,
        message: result.response.message,
        usage: result.response.usage,
        finishReason: result.response.finishReason,
        latency: result.response.latency,
      },
      billing: {
        pointsUsed: result.pointsUsed,
        remainingPoints: result.remainingPoints,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof InsufficientPointsError) {
      return NextResponse.json(
        { 
          error: 'Insufficient points',
          code: 'INSUFFICIENT_POINTS',
          required: error.required,
          available: error.available,
        },
        { status: 402 }
      )
    }

    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          provider: error.provider,
          retryable: error.retryable,
        },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve available models
export async function GET() {
  try {
    const models = chatService.getAvailableModels()
    
    return NextResponse.json({
      success: true,
      data: models,
    })
  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { error: 'Failed to get models' },
      { status: 500 }
    )
  }
}
