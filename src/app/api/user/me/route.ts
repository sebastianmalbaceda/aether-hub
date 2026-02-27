import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Puntos de bienvenida para nuevos usuarios
const WELCOME_BONUS_POINTS = 10000

export async function GET() {
  try {
    // Verificar autenticación con Supabase
    const authUser = await getAuthUser()
    
    // Si no hay usuario autenticado, devolver 401
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Buscar usuario en la base de datos Prisma
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        pointsBalance: true,
        isActive: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                id: true,
                name: true,
                slug: true,
                pointsIncluded: true,
              }
            }
          }
        },
        settings: {
          select: {
            dailyPointsLimit: true,
            sessionTokensLimit: true,
            preferredModel: true,
            theme: true,
            language: true,
          }
        }
      }
    })

    // Si el usuario existe en Supabase Auth pero NO en Prisma, crearlo
    if (!user) {
      console.log(`[API /user/me] Usuario ${authUser.id} no encontrado en Prisma, creando...`)
      
      try {
        // Crear usuario en Prisma con puntos de bienvenida
        user = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email || `user_${authUser.id}@aether.local`,
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
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            pointsBalance: true,
            isActive: true,
            createdAt: true,
            subscription: {
              select: {
                id: true,
                status: true,
                currentPeriodEnd: true,
                plan: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    pointsIncluded: true,
                  }
                }
              }
            },
            settings: {
              select: {
                dailyPointsLimit: true,
                sessionTokensLimit: true,
                preferredModel: true,
                theme: true,
                language: true,
              }
            }
          }
        })

        // Crear transacción de bono de bienvenida
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'BONUS',
            pointsAmount: WELCOME_BONUS_POINTS,
            description: 'Bono de bienvenida - 10,000 puntos gratis',
            metadata: { type: 'welcome_bonus' }
          }
        })

        console.log(`[API /user/me] Usuario ${authUser.id} creado exitosamente con ${WELCOME_BONUS_POINTS} puntos de bienvenida`)
      } catch (createError) {
        console.error('[API /user/me] Error creando usuario en Prisma:', createError)
        return NextResponse.json(
          { error: 'Error creating user profile', code: 'USER_CREATE_ERROR' },
          { status: 500 }
        )
      }
    }

    // Calcular uso diario
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = await prisma.transaction.aggregate({
      where: {
        userId: authUser.id,
        type: 'USAGE_DEDUCTION',
        createdAt: { gte: today },
      },
      _sum: { pointsAmount: true },
    })

    const dailyUsed = Math.abs(todayUsage._sum.pointsAmount || 0)
    const dailyLimit = user.settings?.dailyPointsLimit || 10000

    // Construir respuesta
    const response = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        pointsBalance: user.pointsBalance,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      settings: user.settings,
      points: {
        balance: user.pointsBalance,
        dailyUsage: dailyUsed,
        dailyLimit,
        remainingToday: Math.max(0, dailyLimit - dailyUsed),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API /user/me] Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
