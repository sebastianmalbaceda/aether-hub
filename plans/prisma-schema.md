# Prisma Schema - Aether Hub

## Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?   // Nullable si usa OAuth
  fullName      String?
  avatarUrl     String?
  role          UserRole  @default(USER)
  pointsBalance Int       @default(0)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relaciones
  subscription  Subscription?
  transactions  Transaction[]
  sessions      ChatSession[]
  settings      UserSettings?
  pointPurchases PointPurchase[]

  @@index([email])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

// ============================================
// SUSCRIPCIONES Y PLANES
// ============================================

model Plan {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  type            PlanType
  priceMonthly    Float
  priceYearly     Float?
  pointsIncluded  Int
  features        Json        // Array de características
  arenaModules    Json?       // Módulos de arena incluidos
  isActive        Boolean     @default(true)
  isPopular       Boolean     @default(false)
  sortOrder       Int         @default(0)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relaciones
  subscriptions Subscription[]

  @@index([slug])
  @@map("plans")
}

enum PlanType {
  FIXED           // Plan fijo con puntos definidos
  CUSTOM          // Plan personalizado (arma tu pack)
  PAY_AS_YOU_GO   // Solo recargas
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  planId               String
  stripeSubscriptionId String?            @unique
  stripeCustomerId     String?
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  // Relaciones
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan Plan  @relation(fields: [planId], references: [id])

  @@index([userId])
  @@index([stripeSubscriptionId])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  INCOMPLETE
  TRIALING
}

// ============================================
// TRANSACCIONES Y PUNTOS
// ============================================

model Transaction {
  id              String          @id @default(cuid())
  userId          String
  type            TransactionType
  pointsAmount    Int
  moneyAmount     Float?
  description     String
  stripePaymentId String?
  metadata        Json?           // Datos adicionales
  createdAt       DateTime        @default(now())

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@map("transactions")
}

enum TransactionType {
  SUBSCRIPTION_CREDIT   // Crédito por suscripción
  PURCHASE_POINTS       // Compra de puntos
  USAGE_DEDUCTION       // Deducción por uso
  REFUND               // Reembolso
  BONUS                // Puntos de bonificación
  EXPIRATION           // Expiración de puntos
}

model PointPackage {
  id          String   @id @default(cuid())
  name        String
  points      Int
  price       Float
  bonusPoints Int      @default(0)
  isPopular   Boolean  @default(false)
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("point_packages")
}

model PointPurchase {
  id              String   @id @default(cuid())
  userId          String
  packageId       String?
  pointsPurchased Int
  amountPaid      Float
  stripePaymentId String?
  status          String   @default("completed")
  createdAt       DateTime @default(now())

  // Relaciones
  user     User          @relation(fields: [userId], references: [id])
  package  PointPackage? @relation(fields: [packageId], references: [id])

  @@index([userId])
  @@map("point_purchases")
}

// ============================================
// SESIONES DE CHAT Y MENSAJES
// ============================================

model ChatSession {
  id               String      @id @default(cuid())
  userId           String
  arenaType        ArenaType
  title            String?
  modelUsed        String
  skillMode        String?
  systemPrompt     String?
  totalTokensUsed  Int         @default(0)
  totalPointsSpent Int         @default(0)
  contextData      Json?       // Datos de contexto serializados
  isActive         Boolean     @default(true)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  // Relaciones
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId])
  @@index([arenaType])
  @@index([createdAt])
  @@map("chat_sessions")
}

enum ArenaType {
  TEXT
  CODE
  IMAGE
  VIDEO
  AUDIO
}

model Message {
  id           String      @id @default(cuid())
  sessionId    String
  role         MessageRole
  content      String      @db.Text
  tokensUsed   Int         @default(0)
  pointsCost   Int         @default(0)
  modelUsed    String?
  metadata     Json?       // Datos adicionales (ej. imagen generada)
  createdAt    DateTime    @default(now())

  // Relaciones
  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([createdAt])
  @@map("messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ============================================
// CONFIGURACIÓN DE USUARIO
// ============================================

model UserSettings {
  id                 String   @id @default(cuid())
  userId             String   @unique
  dailyPointsLimit   Int      @default(10000)
  sessionTokensLimit Int      @default(100000)
  preferredModel     String?
  preferredArena     String?
  notificationsEmail Boolean  @default(true)
  notificationsPush  Boolean  @default(false)
  arenaPreferences   Json?    // Preferencias por arena
  theme              String   @default("dark")
  language           String   @default("es")
  updatedAt          DateTime @updatedAt

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ============================================
// MODELOS DE IA Y PRECIOS
// ============================================

model AIModel {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  provider        AIProvider
  contextWindow   Int
  inputPrice1K    Float       // Precio por 1K tokens input
  outputPrice1K   Float       // Precio por 1K tokens output
  inputPoints1K   Int         // Puntos por 1K tokens input
  outputPoints1K  Int         // Puntos por 1K tokens output
  capabilities    Json?       // Capacidades del modelo
  isActive        Boolean     @default(true)
  isAvailable     Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([provider])
  @@index([slug])
  @@map("ai_models")
}

enum AIProvider {
  OPENAI
  ANTHROPIC
  GOOGLE
  META
  MISTRAL
  COHERE
  CUSTOM
}

// ============================================
// SKILLS Y MODOS
// ============================================

model Skill {
  id           String    @id @default(cuid())
  name         String
  slug         String    @unique
  arenaType    ArenaType
  description  String?
  systemPrompt String    @db.Text
  icon         String?
  isActive     Boolean   @default(true)
  sortOrder    Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([arenaType])
  @@index([slug])
  @@map("skills")
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  metadata  Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## Tipos TypeScript

```typescript
// types/index.ts

// ============================================
// User Types
// ============================================

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  pointsBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscription?: Subscription;
  settings?: UserSettings;
}

// ============================================
// Subscription & Plans
// ============================================

export type PlanType = 'FIXED' | 'CUSTOM' | 'PAY_AS_YOU_GO';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE' | 'TRIALING';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  type: PlanType;
  priceMonthly: number;
  priceYearly: number | null;
  pointsIncluded: number;
  features: string[];
  arenaModules?: ArenaModule[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

// ============================================
// Points & Transactions
// ============================================

export type TransactionType = 
  | 'SUBSCRIPTION_CREDIT'
  | 'PURCHASE_POINTS'
  | 'USAGE_DEDUCTION'
  | 'REFUND'
  | 'BONUS'
  | 'EXPIRATION';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  pointsAmount: number;
  moneyAmount: number | null;
  description: string;
  stripePaymentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PointPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  bonusPoints: number;
  isPopular: boolean;
}

// ============================================
// Chat & Messages
// ============================================

export type ArenaType = 'TEXT' | 'CODE' | 'IMAGE' | 'VIDEO' | 'AUDIO';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatSession {
  id: string;
  userId: string;
  arenaType: ArenaType;
  title: string | null;
  modelUsed: string;
  skillMode: string | null;
  systemPrompt: string | null;
  totalTokensUsed: number;
  totalPointsSpent: number;
  contextData: ContextData | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number;
  pointsCost: number;
  modelUsed: string | null;
  metadata: MessageMetadata | null;
  createdAt: Date;
}

export interface ContextData {
  messages: Array<{ role: string; content: string }>;
  totalTokens: number;
  lastUpdated: Date;
}

export interface MessageMetadata {
  imageUrls?: string[];
  codeBlocks?: Array<{ language: string; code: string }>;
  finishReason?: string;
  modelVersion?: string;
}

// ============================================
// AI Models
// ============================================

export type AIProvider = 
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'GOOGLE'
  | 'META'
  | 'MISTRAL'
  | 'COHERE'
  | 'CUSTOM';

export interface AIModel {
  id: string;
  name: string;
  slug: string;
  provider: AIProvider;
  contextWindow: number;
  inputPrice1K: number;
  outputPrice1K: number;
  inputPoints1K: number;
  outputPoints1K: number;
  capabilities: ModelCapabilities | null;
  isActive: boolean;
  isAvailable: boolean;
}

export interface ModelCapabilities {
  chat: boolean;
  code: boolean;
  image: boolean;
  video: boolean;
  audio: boolean;
  functionCalling: boolean;
  streaming: boolean;
}

// ============================================
// Skills
// ============================================

export interface Skill {
  id: string;
  name: string;
  slug: string;
  arenaType: ArenaType;
  description: string | null;
  systemPrompt: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ============================================
// User Settings
// ============================================

export interface UserSettings {
  id: string;
  userId: string;
  dailyPointsLimit: number;
  sessionTokensLimit: number;
  preferredModel: string | null;
  preferredArena: string | null;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  arenaPreferences: ArenaPreferences | null;
  theme: 'dark' | 'light' | 'system';
  language: string;
}

export interface ArenaPreferences {
  text?: {
    defaultModel?: string;
    defaultSkill?: string;
  };
  code?: {
    defaultModel?: string;
    defaultSkill?: string;
    editorTheme?: string;
  };
  image?: {
    defaultAspectRatio?: string;
    defaultStyle?: string;
  };
}

// ============================================
// Telemetry
// ============================================

export interface SessionTelemetry {
  contextUsed: number;
  contextLimit: number;
  contextPercentage: number;
  lastRequestCost: number;
  lastRequestTokens: number;
  totalSessionCost: number;
  totalSessionTokens: number;
  currentModel: string;
  currentSkill: string;
  contextStatus: ContextStatus;
}

export type ContextStatus = 'normal' | 'warning' | 'critical';

// ============================================
// API Types
// ============================================

export interface ChatCompletionRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  model: string;
  skill?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  id: string;
  message: Message;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    points: number;
    usd: number;
  };
  telemetry: SessionTelemetry;
}

export interface PointsBalanceResponse {
  balance: number;
  dailyUsage: number;
  dailyLimit: number;
  remainingToday: number;
}

// ============================================
// Pricing Calculator
// ============================================

export interface PricingCalculatorInput {
  modules: ArenaModule[];
  estimatedUsage: {
    text: number;  // mensajes/día
    code: number;  // mensajes/día
    image: number; // imágenes/día
  };
}

export interface ArenaModule {
  type: ArenaType;
  enabled: boolean;
  models: string[];
}

export interface PricingCalculatorOutput {
  monthlyPrice: number;
  yearlyPrice: number;
  pointsIncluded: number;
  breakdown: {
    module: string;
    price: number;
    points: number;
  }[];
}
```

---

## Consultas Frecuentes (Prisma)

```typescript
// lib/queries/user.ts

import { prisma } from '@/lib/prisma';

// Obtener usuario con suscripción y configuración
export async function getUserWithDetails(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: { plan: true }
      },
      settings: true
    }
  });
}

// Obtener saldo de puntos y uso diario
export async function getUserPointsBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pointsBalance: true, settings: { select: { dailyPointsLimit: true } } }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyUsage = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'USAGE_DEDUCTION',
      createdAt: { gte: today }
    },
    _sum: { pointsAmount: true }
  });

  return {
    balance: user?.pointsBalance ?? 0,
    dailyUsage: Math.abs(dailyUsage._sum.pointsAmount ?? 0),
    dailyLimit: user?.settings?.dailyPointsLimit ?? 10000
  };
}

// Crear sesión de chat con mensaje inicial
export async function createChatSession(data: {
  userId: string;
  arenaType: ArenaType;
  model: string;
  skill?: string;
  systemPrompt?: string;
  initialMessage?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.chatSession.create({
      data: {
        userId: data.userId,
        arenaType: data.arenaType,
        modelUsed: data.model,
        skillMode: data.skill,
        systemPrompt: data.systemPrompt
      }
    });

    if (data.initialMessage) {
      await tx.message.create({
        data: {
          sessionId: session.id,
          role: 'USER',
          content: data.initialMessage
        }
      });
    }

    return session;
  });
}

// Registrar uso y descontar puntos
export async function recordUsage(data: {
  userId: string;
  sessionId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  pointsCost: number;
  userMessage: string;
  assistantMessage: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Descontar puntos
    await tx.user.update({
      where: { id: data.userId },
      data: { pointsBalance: { decrement: data.pointsCost } }
    });

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
    });

    // Crear mensajes
    await tx.message.createMany({
      data: [
        {
          sessionId: data.sessionId,
          role: 'USER',
          content: data.userMessage,
          tokensUsed: data.promptTokens
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
    });

    // Actualizar sesión
    await tx.chatSession.update({
      where: { id: data.sessionId },
      data: {
        totalTokensUsed: { increment: data.promptTokens + data.completionTokens },
        totalPointsSpent: { increment: data.pointsCost }
      }
    });
  });
}
```

---

## Seed Data

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear planes
  await prisma.plan.createMany({
    data: [
      {
        name: 'Explorer',
        slug: 'explorer',
        type: 'FIXED',
        priceMonthly: 9.99,
        priceYearly: 99.99,
        pointsIncluded: 5000,
        features: ['Acceso a modelos básicos', 'Arena de Texto', 'Soporte por email'],
        isPopular: false,
        sortOrder: 1
      },
      {
        name: 'Creator',
        slug: 'creator',
        type: 'FIXED',
        priceMonthly: 19.99,
        priceYearly: 199.99,
        pointsIncluded: 12000,
        features: ['Todos los modelos', 'Todas las Arenas', 'Prioridad en cola', 'Soporte prioritario'],
        isPopular: true,
        sortOrder: 2
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        type: 'FIXED',
        priceMonthly: 49.99,
        priceYearly: 499.99,
        pointsIncluded: 35000,
        features: ['Todo incluido', 'API Access', 'Dedicado', 'SLA garantizado'],
        isPopular: false,
        sortOrder: 3
      }
    ]
  });

  // Crear paquetes de puntos
  await prisma.pointPackage.createMany({
    data: [
      { name: 'Starter', points: 1000, price: 2.99, bonusPoints: 0, sortOrder: 1 },
      { name: 'Basic', points: 5000, price: 9.99, bonusPoints: 500, isPopular: true, sortOrder: 2 },
      { name: 'Pro', points: 15000, price: 24.99, bonusPoints: 3000, sortOrder: 3 },
      { name: 'Ultimate', points: 50000, price: 69.99, bonusPoints: 15000, sortOrder: 4 }
    ]
  });

  // Crear modelos de IA
  await prisma.aIModel.createMany({
    data: [
      {
        name: 'GPT-4o',
        slug: 'gpt-4o',
        provider: 'OPENAI',
        contextWindow: 128000,
        inputPrice1K: 0.0025,
        outputPrice1K: 0.01,
        inputPoints1K: 3,
        outputPoints1K: 10,
        capabilities: { chat: true, code: true, image: true, functionCalling: true, streaming: true }
      },
      {
        name: 'GPT-4o-mini',
        slug: 'gpt-4o-mini',
        provider: 'OPENAI',
        contextWindow: 128000,
        inputPrice1K: 0.00015,
        outputPrice1K: 0.0006,
        inputPoints1K: 0.15,
        outputPoints1K: 0.6,
        capabilities: { chat: true, code: true, functionCalling: true, streaming: true }
      },
      {
        name: 'Claude 3.5 Sonnet',
        slug: 'claude-3-5-sonnet',
        provider: 'ANTHROPIC',
        contextWindow: 200000,
        inputPrice1K: 0.003,
        outputPrice1K: 0.015,
        inputPoints1K: 3,
        outputPoints1K: 15,
        capabilities: { chat: true, code: true, functionCalling: true, streaming: true }
      },
      {
        name: 'Claude 3 Haiku',
        slug: 'claude-3-haiku',
        provider: 'ANTHROPIC',
        contextWindow: 200000,
        inputPrice1K: 0.00025,
        outputPrice1K: 0.00125,
        inputPoints1K: 0.25,
        outputPoints1K: 1.25,
        capabilities: { chat: true, code: true, streaming: true }
      },
      {
        name: 'Gemini 1.5 Pro',
        slug: 'gemini-1-5-pro',
        provider: 'GOOGLE',
        contextWindow: 1000000,
        inputPrice1K: 0.00125,
        outputPrice1K: 0.005,
        inputPoints1K: 1.25,
        outputPoints1K: 5,
        capabilities: { chat: true, code: true, image: true, video: true, audio: true, streaming: true }
      }
    ]
  });

  // Crear skills
  await prisma.skill.createMany({
    data: [
      {
        name: 'Asistente Estándar',
        slug: 'assistant',
        arenaType: 'TEXT',
        description: 'Un asistente útil y equilibrado para tareas generales',
        systemPrompt: 'Eres un asistente útil, amable y conocedor. Proporciona respuestas claras y precisas.',
        sortOrder: 1
      },
      {
        name: 'Poeta/Creativo',
        slug: 'creative',
        arenaType: 'TEXT',
        description: 'Especializado en escritura creativa y poesía',
        systemPrompt: 'Eres un escritor creativo con talento para la poesía y la narrativa. Deja fluir tu imaginación.',
        sortOrder: 2
      },
      {
        name: 'Redactor Académico',
        slug: 'academic',
        arenaType: 'TEXT',
        description: 'Escritura formal y académica',
        systemPrompt: 'Eres un académico experto. Escribe de forma formal, precisa y bien estructurada. Usa referencias cuando sea apropiado.',
        sortOrder: 3
      },
      {
        name: 'Arquitecto de Software',
        slug: 'architect',
        arenaType: 'CODE',
        description: 'Diseño de arquitecturas y sistemas',
        systemPrompt: 'Eres un arquitecto de software senior. Ayuda a diseñar sistemas escalables, limpios y mantenibles.',
        sortOrder: 1
      },
      {
        name: 'Depurador',
        slug: 'debugger',
        arenaType: 'CODE',
        description: 'Análisis y corrección de errores',
        systemPrompt: 'Eres un experto en debugging. Analiza el código, identifica errores y propone soluciones claras.',
        sortOrder: 2
      }
    ]
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```
