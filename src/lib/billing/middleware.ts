import { prisma } from '@/lib/prisma'
import { calculateCost, hasEnoughPoints } from '@/lib/points/calculator'
import type { AIModel, User } from '@/types'

export interface BillingCheckResult {
  canProceed: boolean
  reason?: string
  code?: 'INSUFFICIENT_POINTS' | 'DAILY_LIMIT_EXCEEDED' | 'SESSION_LIMIT_EXCEEDED' | 'OK'
  estimatedCost?: number
  currentBalance?: number
}

export interface UsageRecordData {
  userId: string
  sessionId: string
  model: string
  promptTokens: number
  completionTokens: number
  pointsCost: number
  userMessage: string
  assistantMessage: string
}

/**
 * Middleware de facturación que verifica saldo y límites antes de procesar
 */
export class BillingMiddleware {
  /**
   * Verifica si el usuario puede proceder con una petición
   */
  static async verifyUserCanProceed(
    userId: string,
    estimatedPoints: number
  ): Promise<BillingCheckResult> {
    // Obtener usuario con configuración
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true }
    })

    if (!user) {
      return {
        canProceed: false,
        reason: 'Usuario no encontrado',
        code: 'INSUFFICIENT_POINTS'
      }
    }

    // Verificar saldo
    if (!hasEnoughPoints(user.pointsBalance, estimatedPoints)) {
      return {
        canProceed: false,
        reason: `Saldo insuficiente. Tienes ${user.pointsBalance} puntos, necesitas ${estimatedPoints}.`,
        code: 'INSUFFICIENT_POINTS',
        currentBalance: user.pointsBalance
      }
    }

    // Verificar límite diario
    const dailyLimit = user.settings?.dailyPointsLimit || 10000
    const dailyUsage = await this.getDailyUsage(userId)
    
    if (dailyUsage + estimatedPoints > dailyLimit) {
      return {
        canProceed: false,
        reason: `Límite diario excedido. Usado: ${dailyUsage}, Límite: ${dailyLimit}`,
        code: 'DAILY_LIMIT_EXCEEDED',
        currentBalance: user.pointsBalance
      }
    }

    return {
      canProceed: true,
      code: 'OK',
      estimatedCost: estimatedPoints,
      currentBalance: user.pointsBalance
    }
  }

  /**
   * Obtiene el uso de puntos del día actual
   */
  static async getDailyUsage(userId: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'USAGE_DEDUCTION',
        createdAt: { gte: today }
      },
      _sum: { pointsAmount: true }
    })

    return Math.abs(result._sum.pointsAmount || 0)
  }

  /**
   * Registra el uso y descuenta los puntos
   */
  static async recordUsage(data: UsageRecordData): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Descontar puntos del usuario
      await tx.user.update({
        where: { id: data.userId },
        data: {
          pointsBalance: { decrement: data.pointsCost }
        }
      })

      // Registrar transacción
      await tx.transaction.create({
        data: {
          userId: data.userId,
          type: 'USAGE_DEDUCTION',
          pointsAmount: -data.pointsCost,
          description: `Uso de ${data.model}`,
          metadata: {
            sessionId: data.sessionId,
            promptTokens: data.promptTokens,
            completionTokens: data.completionTokens
          }
        }
      })

      // Crear mensajes en la sesión
      await tx.message.createMany({
        data: [
          {
            sessionId: data.sessionId,
            role: 'USER',
            content: data.userMessage,
            tokensUsed: data.promptTokens,
            pointsCost: 0
          },
          {
            sessionId: data.sessionId,
            role: 'ASSISTANT',
            content: data.assistantMessage,
            tokensUsed: data.completionTokens,
            pointsCost: data.pointsCost,
            modelUsed: data.model
          }
        ]
      })

      // Actualizar totales de la sesión
      await tx.chatSession.update({
        where: { id: data.sessionId },
        data: {
          totalTokensUsed: { increment: data.promptTokens + data.completionTokens },
          totalPointsSpent: { increment: data.pointsCost }
        }
      })
    })
  }

  /**
   * Acredita puntos al usuario (suscripción, compra, bonificación)
   */
  static async creditPoints(
    userId: string,
    points: number,
    type: 'SUBSCRIPTION_CREDIT' | 'PURCHASE_POINTS' | 'BONUS',
    description: string,
    stripePaymentId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Acreditar puntos
      await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: { increment: points }
        }
      })

      // Registrar transacción
      await tx.transaction.create({
        data: {
          userId,
          type,
          pointsAmount: points,
          description,
          stripePaymentId
        }
      })
    })
  }

  /**
   * Obtiene el balance de puntos del usuario
   */
  static async getPointsBalance(userId: string): Promise<{
    balance: number
    dailyUsage: number
    dailyLimit: number
    remainingToday: number
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    const dailyUsage = await this.getDailyUsage(userId)
    const dailyLimit = user.settings?.dailyPointsLimit || 10000
    const remainingToday = Math.max(dailyLimit - dailyUsage, 0)

    return {
      balance: user.pointsBalance,
      dailyUsage,
      dailyLimit,
      remainingToday
    }
  }
}
