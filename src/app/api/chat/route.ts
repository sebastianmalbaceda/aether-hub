// ============================================
// Universal AI Chat Router - Aether Hub
// ============================================
// Router multi-modelo definitivo:
// - Free Tier (Groq) 100% funcional
// - Premium Tier preparado para plug-and-play
// ============================================

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

// ============================================
// Inicialización de Clientes AI (Plug-and-Play)
// ============================================
// Cada cliente se inicializa con su API key del .env
// Si la key no existe, el cliente se crea con string vacío
// y fallará solo cuando se intente usar ese proveedor

// 1. Cliente Groq (Free Tier Activo)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

// 2. Cliente OpenAI (Premium - requiere API key propia)
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// 3. Cliente Anthropic (Premium - requiere API key propia)
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// 4. Cliente Google/Gemini (Premium - requiere API key propia)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
})

// ============================================
// Función de Enrutamiento de Modelos
// ============================================
// Devuelve la instancia del modelo correcto según el proveedor

function getModelInstance(modelId: string, provider: string) {
  switch (provider) {
    case 'OPENAI':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('API Key de OpenAI no configurada. Añade OPENAI_API_KEY a tu archivo .env')
      }
      return openai(modelId)
    
    case 'ANTHROPIC':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('API Key de Anthropic no configurada. Añade ANTHROPIC_API_KEY a tu archivo .env')
      }
      return anthropic(modelId)
    
    case 'GOOGLE':
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
        throw new Error('API Key de Google/Gemini no configurada. Añade GEMINI_API_KEY a tu archivo .env')
      }
      return google(modelId)
    
    case 'GROQ':
      if (!process.env.GROQ_API_KEY) {
        throw new Error('API Key de Groq no configurada. Añade GROQ_API_KEY a tu archivo .env')
      }
      // Usar .chat() para endpoint /chat/completions (compatible con Groq)
      // El default groq(modelId) usa /responses que no es soportado por Groq
      return groq.chat(modelId)
    
    default:
      throw new Error(`Proveedor no soportado: ${provider}`)
  }
}

// ============================================
// Endpoint POST - Chat Streaming
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authUser = await getAuthUser()
    
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

    // Validar campos requeridos
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

    // Obtener configuración del modelo
    const modelConfig = getModelById(modelId)
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: `Model ${modelId} not found in configuration` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar disponibilidad del modelo
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

    // Obtener o crear usuario en Prisma
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pointsBalance: true,
        settings: {
          select: { dailyPointsLimit: true }
        }
      },
    })

    // Si el usuario no existe en Prisma, crearlo (sync desde Supabase Auth)
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

        // Crear transacción de bono de bienvenida
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

    // Verificar uso diario
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

    // Construir system prompt desde skill
    let systemPrompt = ''
    if (skillId) {
      const skill = getSkillById(skillId)
      if (skill) {
        systemPrompt = skill.systemPrompt
      }
    }

    // ============================================
    // SANITIZACIÓN DE MENSAJES (Crucial para Groq)
    // ============================================
    // Groq y otros modelos estrictos solo aceptan { role, content }
    // El frontend puede enviar objetos complejos o arrays que causan error 400
    
    // LOG: Ver mensajes originales recibidos
    console.log('[API /chat] === MENSAJES ORIGINALES ===')
    console.log('[API /chat] Total mensajes recibidos:', messages.length)
    messages.forEach((msg: { role: string; content: unknown }, idx: number) => {
      console.log(`[API /chat] Msg ${idx}: role="${msg.role}", content type=${typeof msg.content}, preview="${String(msg.content).substring(0, 50)}..."`)
    })
    
    const cleanMessages = messages.map((msg: { role: string; content: unknown }) => {
      // Extraer texto puro del contenido
      let pureText = ''
      
      if (typeof msg.content === 'string') {
        pureText = msg.content
      } else if (Array.isArray(msg.content)) {
        // Manejar contenido multimodal - extraer solo partes de texto
        pureText = msg.content
          .filter((part: unknown) =>
            typeof part === 'object' && part !== null && (part as { type?: string }).type === 'text'
          )
          .map((part: unknown) => (part as { text?: string }).text || '')
          .join('\n')
      } else if (msg.content !== null && msg.content !== undefined) {
        pureText = String(msg.content)
      }

      // Normalizar rol - Groq no acepta rol 'function'
      let normalizedRole = msg.role?.toLowerCase() || 'user'
      if (normalizedRole === 'function' || normalizedRole === 'system') {
        normalizedRole = 'assistant'
      }

      return {
        role: normalizedRole as 'user' | 'assistant',
        content: pureText,
      }
    }).filter((msg) => msg.content.trim().length > 0) // Eliminar mensajes vacíos
    
    // ============================================
    // CORRECCIÓN: Fusionar roles consecutivos iguales
    // ============================================
    // Groq y OpenAI rechazan mensajes con roles consecutivos iguales
    // Ejemplo: [user, user, assistant] -> [user, assistant]
    
    const mergedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    
    for (const msg of cleanMessages) {
      const lastMsg = mergedMessages[mergedMessages.length - 1]
      
      if (lastMsg && lastMsg.role === msg.role) {
        // Fusionar contenido de mensajes consecutivos del mismo rol
        console.log(`[API /chat] Fusionando mensajes consecutivos con rol "${msg.role}"`)
        lastMsg.content += '\n\n' + msg.content
      } else {
        mergedMessages.push({ ...msg })
      }
    }
    
    // LOG: Ver mensajes finales después de fusión
    console.log('[API /chat] === MENSAJES FINALES (después de fusión) ===')
    console.log('[API /chat] Total mensajes finales:', mergedMessages.length)
    mergedMessages.forEach((msg, idx) => {
      console.log(`[API /chat] Final ${idx}: role="${msg.role}", content length=${msg.content.length}`)
    })

    // Obtener instancia del modelo
    const model = getModelInstance(modelId, modelConfig.provider)

    // Calcular max tokens de salida
    const maxOutputTokens = Math.min(maxTokens, modelConfig.maxOutputTokens)

    // ============================================
    // Configuración de Opciones de Stream
    // ============================================
    
    const streamOptions: Record<string, unknown> = {
      model,
      system: systemPrompt || undefined,
      messages: mergedMessages,
      temperature,
      maxRetries: 5,
      abortSignal: undefined,
      // Configuración de reintentos con backoff exponencial
      retry: {
        maxRetries: 5,
        initialDelay: 1000, // 1 segundo
        maxDelay: 10000, // 10 segundos
        backoffMultiplier: 2,
      },
    }

    // Configurar body para Groq (max_tokens y reasoning_effort)
    if (modelConfig.provider === 'GROQ') {
      streamOptions.body = {
        max_tokens: maxOutputTokens,
      }

      // Inyectar reasoning_effort para modelos GPT-OSS en Groq
      if (modelConfig.reasoningEffort) {
        streamOptions.body = {
          ...streamOptions.body as object,
          reasoning_effort: modelConfig.reasoningEffort,
        }
      }
    }

    // Log para depuración
    console.log('[API /chat] === INICIANDO PETICIÓN A GROQ ===')
    console.log('[API /chat] Timestamp:', new Date().toISOString())
    console.log('[API /chat] Modelo:', modelId)
    console.log('[API /chat] Provider:', modelConfig.provider)
    console.log('[API /chat] Mensajes a enviar:', mergedMessages.length)
    console.log('[API /chat] Opciones body:', JSON.stringify(streamOptions.body || {}))
    console.log('[API /chat] Temperature:', temperature)
    console.log('[API /chat] Max retries:', streamOptions.maxRetries)
    
    // Verificar si hay mensajes problemáticos
    const problematicMsgs = mergedMessages.filter(m => !m.content || m.content.trim().length === 0)
    if (problematicMsgs.length > 0) {
      console.error('[API /chat] ⚠️ ALERTA: Hay mensajes vacíos que no fueron filtrados!')
    }
    
    // 🔍 LOG ADICIONAL: Verificar rate limits potenciales
    console.log('[API /chat] 🔍 DEBUG: Verificando posibles problemas...')
    console.log('[API /chat] 🔍 Total tokens estimados en contexto:', mergedMessages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0))
    console.log('[API /chat] 🔍 Número de mensajes en historial:', mergedMessages.length)
    console.log('[API /chat] 🔍 Primer mensaje role:', mergedMessages[0]?.role)
    console.log('[API /chat] 🔍 Último mensaje role:', mergedMessages[mergedMessages.length - 1]?.role)

    // Ejecutar stream con manejo de errores explícito
    let result
    try {
      result = streamText(streamOptions as Parameters<typeof streamText>[0])
      // Verificar si el result tiene errores inmediatos
      console.log('[API /chat] streamText() llamado, verificando resultado...')
    } catch (streamInitError) {
      console.error('[API /chat] ⚠️ ERROR al inicializar streamText:', streamInitError)
      throw streamInitError
    }

    // Variables para tracking de uso
    let totalPromptTokens = 0
    let totalCompletionTokens = 0

    // Crear stream de respuesta
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          let chunkCount = 0
          
          console.log('[API /chat] === INICIANDO STREAM ===')
          
          // Nota: En AI SDK v4/v6, los errores se capturan en el catch del for-await
          // No existe result.error como propiedad en StreamTextResult
          
          // Procesar el stream
          for await (const chunk of result.textStream) {
            chunkCount++
            fullContent += chunk
            // Enviar chunk al cliente
            controller.enqueue(encoder.encode(`0:"${chunk.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`))
          }
          
          console.log('[API /chat] === STREAM COMPLETADO ===')
          console.log('[API /chat] Chunks recibidos:', chunkCount)
          console.log('[API /chat] Contenido total:', fullContent.length, 'caracteres')
          
          // LOG: Detectar stream vacío
          if (fullContent.length === 0) {
            console.error('[API /chat] ⚠️ ERROR: Stream vacío - ningún contenido recibido de Groq')
            console.error('[API /chat] Modelo:', modelId, '- Posible rate limiting')
            console.error('[API /chat] 🔍 DEBUG: Chunk count:', chunkCount)
            console.error('[API /chat] 🔍 DEBUG: Mensajes enviados:', mergedMessages.length)
            console.error('[API /chat] 🔍 DEBUG: Último mensaje role:', mergedMessages[mergedMessages.length - 1]?.role)
            
            // 🔍 Intentar obtener más información del error
            // Nota: En AI SDK v4/v6, el error se captura en el catch del stream, no en result.error
            console.error('[API /chat] 🔍 Stream vacío - posible rate limit o error de Groq API')
            
            // Mensaje específico según el modelo
            let errorMessage = '⏳ El servidor está ocupado. Por favor, espera unos segundos e intenta de nuevo.'
            let errorCode = 'SERVER_BUSY'
            
            // Modelos con límites bajos (1000 RPD)
            const lowLimitModels = ['llama-3.3-70b-versatile', 'llama-4-maverick', 'llama-4-scout']
            if (lowLimitModels.some(m => modelId.includes(m))) {
              errorMessage = `⏳ El modelo "${modelConfig.name}" tiene límites bajos. Recomendamos usar "Llama 3.1 8B" (14,400 peticiones/día).`
              errorCode = 'RATE_LIMIT_LOW'
            }
            
            const errorData = JSON.stringify({
              type: 'error',
              message: errorMessage,
              code: errorCode,
              retryAble: true,
              modelId,
              suggestion: 'Espera 2-3 segundos antes de enviar otro mensaje.',
            })
            controller.enqueue(encoder.encode(`e:${errorData}\n`))
            controller.close()
            return
          }

          // Obtener info de uso - AI SDK v6 usa totalTokens
          const usage = await result.usage
          totalPromptTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.7) : 0
          totalCompletionTokens = usage?.totalTokens ? Math.floor(usage.totalTokens * 0.3) : 0

          // Calcular coste en puntos
          const pointsUsed = calculatePointsCost(
            modelId,
            totalPromptTokens,
            totalCompletionTokens
          )

          // Verificar si el usuario tiene suficientes puntos
          if (pointsUsed > user!.pointsBalance) {
            const errorData = JSON.stringify({
              type: 'error',
              code: 'INSUFFICIENT_POINTS',
              message: 'Insufficient points balance',
              required: pointsUsed,
              available: user!.pointsBalance,
            })
            controller.enqueue(encoder.encode(`e:${errorData}\n`))
            controller.close()
            return
          }

          // Descontar puntos y registrar transacción
          await prisma.$transaction([
            // Actualizar balance del usuario
            prisma.user.update({
              where: { id: userId },
              data: {
                pointsBalance: { decrement: pointsUsed },
              },
            }),
            // Crear registro de transacción
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

          // Enviar datos de telemetría
          const telemetryData = JSON.stringify({
            type: 'telemetry',
            pointsUsed,
            remainingPoints: user!.pointsBalance - pointsUsed,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            totalTokens: totalPromptTokens + totalCompletionTokens,
            dailyUsed: dailyUsed + pointsUsed,
            dailyLimit: dailyPointsLimit,
          })
          controller.enqueue(encoder.encode(`d:${telemetryData}\n`))
          
          controller.close()
        } catch (error) {
          console.error('[API /chat] === ERROR EN STREAM ===')
          console.error('[API /chat] Error type:', error?.constructor?.name)
          console.error('[API /chat] Error message:', error instanceof Error ? error.message : 'Unknown error')
          console.error('[API /chat] Error stack:', error instanceof Error ? error.stack : 'No stack')
          
          // Intentar obtener más detalles del error
          let errorDetails = {}
          if (error instanceof Error) {
            errorDetails = {
              name: error.name,
              message: error.message,
              cause: error.cause,
            }
            // Buscar si hay un error de API incrustado
            if (error.cause && typeof error.cause === 'object') {
              console.error('[API /chat] Error cause:', JSON.stringify(error.cause, null, 2))
              
              // 🔍 LOG ADICIONAL: Extraer detalles específicos de errores de Groq
              const causeObj = error.cause as Record<string, unknown>
              if (causeObj.statusCode) {
                console.error('[API /chat] 🔍 HTTP Status Code:', causeObj.statusCode)
              }
              if (causeObj.headers) {
                console.error('[API /chat] 🔍 Response Headers:', JSON.stringify(causeObj.headers, null, 2))
              }
              if (causeObj.body) {
                console.error('[API /chat] 🔍 Response Body:', JSON.stringify(causeObj.body, null, 2))
              }
            }
          }
          
          // 🔍 Determinar si es un error de rate limiting
          let errorMessage = error instanceof Error ? error.message : 'Unknown error'
          let errorCode = 'STREAM_ERROR'
          
          if (errorMessage.includes('429') || errorMessage.includes('rate') || errorMessage.includes('limit')) {
            errorMessage = '⏳ Límite de velocidad alcanzado. Espera unos segundos e intenta de nuevo.'
            errorCode = 'RATE_LIMIT'
          }
          
          const errorData = JSON.stringify({
            type: 'error',
            message: errorMessage,
            code: errorCode,
            details: errorDetails,
          })
          controller.enqueue(encoder.encode(`e:${errorData}\n`))
          controller.close()
        }
      },
    })

    // Retornar respuesta streaming
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Manejar tipos específicos de errores
    if (error instanceof Error) {
      // Errores de rate limit (429)
      if (error.message.includes('429') ||
          error.message.includes('rate limit') ||
          error.message.includes('quota') ||
          error.message.includes('Too Many Requests')) {
        return new Response(
          JSON.stringify({
            error: 'Límite gratuito alcanzado. Por favor, espera unos minutos antes de continuar.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60,
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Errores de autenticación
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
      
      // Errores de API key no configurada
      if (error.message.includes('API Key') && error.message.includes('no configurada')) {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: 'API_KEY_MISSING',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Error de longitud de contexto
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
