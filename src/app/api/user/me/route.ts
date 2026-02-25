import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify authentication
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user data with subscription and settings
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate daily usage
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

    // Build response
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
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
