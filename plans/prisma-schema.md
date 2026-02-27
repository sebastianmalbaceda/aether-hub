# Prisma Schema y Estado - Aether Hub

## 📋 Resumen Ejecutivo

Este documento define la especificación oficial del esquema de base de datos y la gestión de estado del frontend de Aether Hub, sirviendo como **Fuente de Verdad** para la persistencia de datos y el estado de la aplicación.

**Última actualización:** Febrero 2026  
**Estado:** En producción

---

## 🗄️ Esquema Prisma

### Ubicación

[`prisma/schema.prisma`](../prisma/schema.prisma)

### Diagrama Entidad-Relación

```mermaid
erDiagram
    User ||--o{ Subscription : has
    User ||--o{ Transaction : creates
    User ||--o{ ChatSession : owns
    User ||--o{ UserSettings : has
    User ||--o{ PointPurchase : makes
    ChatSession ||--o{ Message : contains
    Subscription }o--|| Plan : references
    PointPurchase }o--o| PointPackage : references
    
    User {
        string id PK
        string email UK
        string passwordHash
        string fullName
        string avatarUrl
        string role
        int pointsBalance
        boolean isActive
        string stripeCustomerId UK
        datetime createdAt
        datetime updatedAt
    }
    
    Plan {
        string id PK
        string name
        string slug UK
        string type
        float priceMonthly
        float priceYearly
        int pointsIncluded
        json features
        json arenaModules
        boolean isActive
        boolean isPopular
        int sortOrder
    }
    
    Subscription {
        string id PK
        string userId FK
        string planId FK
        string stripeSubscriptionId UK
        string stripeCustomerId
        string status
        datetime currentPeriodStart
        datetime currentPeriodEnd
        boolean cancelAtPeriodEnd
    }
    
    Transaction {
        string id PK
        string userId FK
        string type
        int pointsAmount
        float moneyAmount
        string description
        string stripePaymentId
        json metadata
        datetime createdAt
    }
    
    ChatSession {
        string id PK
        string userId FK
        string arenaType
        string title
        string modelUsed
        string skillMode
        string systemPrompt
        int totalTokensUsed
        int totalPointsSpent
        json contextData
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    Message {
        string id PK
        string sessionId FK
        string role
        string content
        int tokensUsed
        int pointsCost
        string modelUsed
        json metadata
        datetime createdAt
    }
    
    UserSettings {
        string id PK
        string userId FK UK
        int dailyPointsLimit
        int sessionTokensLimit
        string preferredModel
        string theme
        string language
        datetime updatedAt
    }
```

---

## 📊 Modelos Principales

### User

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  fullName      String?
  avatarUrl     String?
  role          UserRole  @default(USER)
  pointsBalance Int       @default(10000)
  isActive      Boolean   @default(true)
  stripeCustomerId String? @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relaciones
  subscription  Subscription?
  transactions  Transaction[]
  sessions      ChatSession[]
  settings      UserSettings?
  pointPurchases PointPurchase[]

  @@index([email])
  @@index([stripeCustomerId])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

**Notas importantes:**
- `pointsBalance` tiene valor por defecto de **10,000 puntos**
- `passwordHash` es nullable (usuarios OAuth no tienen contraseña)
- `stripeCustomerId` permite vincular cliente de Stripe

### Transaction

```prisma
model Transaction {
  id              String          @id @default(cuid())
  userId          String
  type            TransactionType
  pointsAmount    Int
  moneyAmount     Float?
  description     String
  stripePaymentId String?
  metadata        Json?
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
```

**Notas importantes:**
- `pointsAmount` puede ser **negativo** (deducciones) o **positivo** (créditos)
- `metadata` almacena información adicional como `modelId`, `tokens`, etc.

### ChatSession

```prisma
model ChatSession {
  id               String      @id @default(cuid())
  userId           String
  arenaType        ArenaType
  title            String?
  modelUsed        String
  skillMode        String?
  systemPrompt     String?     @db.Text
  totalTokensUsed  Int         @default(0)
  totalPointsSpent Int         @default(0)
  contextData      Json?
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
```

### Message

```prisma
model Message {
  id           String      @id @default(cuid())
  sessionId    String
  role         MessageRole
  content      String      @db.Text
  tokensUsed   Int         @default(0)
  pointsCost   Int         @default(0)
  modelUsed    String?
  metadata     Json?
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
```

### UserSettings

```prisma
model UserSettings {
  id                 String   @id @default(cuid())
  userId             String   @unique
  dailyPointsLimit   Int      @default(10000)
  sessionTokensLimit Int      @default(100000)
  preferredModel     String?
  preferredArena     String?
  notificationsEmail Boolean  @default(true)
  notificationsPush  Boolean  @default(false)
  arenaPreferences   Json?
  theme              String   @default("dark")
  language           String   @default("es")
  updatedAt          DateTime @updatedAt

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}
```

---

## 🎁 Lógica de Bienvenida (Fallback 200)

### El Problema

Cuando un usuario se autentica por primera vez con Supabase Auth, **existe en Supabase pero NO en Prisma**. Esto causaba errores 404 que rompían la experiencia de onboarding.

### La Solución: Upsert Transparente

**REGLA DE ORO:** El endpoint `/api/user/me` **NUNCA debe devolver 404** para un usuario autenticado.

```typescript
// src/app/api/user/me/route.ts

export async function GET() {
  // Verificar autenticación con Supabase
  const authUser = await getAuthUser()
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  // Buscar usuario en Prisma
  let user = await prisma.user.findUnique({
    where: { id: authUser.id },
    // ... select fields
  })

  // ═══════════════════════════════════════════════════════════════
  // FALLBACK 200: Si no existe, CREARLO con puntos de bienvenida
  // ═══════════════════════════════════════════════════════════════
  if (!user) {
    console.log(`[API /user/me] Usuario ${authUser.id} no encontrado, creando...`)
    
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email || `user_${authUser.id}@aether.local`,
        fullName: authUser.user_metadata?.full_name || 
                  authUser.user_metadata?.name || null,
        avatarUrl: authUser.user_metadata?.avatar_url || 
                   authUser.user_metadata?.picture || null,
        pointsBalance: WELCOME_BONUS_POINTS,  // 10,000 puntos
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
      // ... select fields
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
  }

  // SIEMPRE devolver 200 con datos válidos
  return NextResponse.json(response)
}
```

### Constantes de Bienvenida

```typescript
// Puntos de bienvenida para nuevos usuarios
const WELCOME_BONUS_POINTS = 10000

// Límite diario por defecto
const DEFAULT_DAILY_LIMIT = 10000

// Modelo preferido por defecto
const DEFAULT_MODEL = 'llama-3.1-8b-instant'
```

---

## 🔄 Gestión de Estado (Zustand)

### Stores Principales

| Store | Ubicación | Propósito |
|-------|-----------|-----------|
| `useUserStore` | [`src/stores/user-store.ts`](../src/stores/user-store.ts) | Usuario, puntos, autenticación |
| `useChatStore` | [`src/stores/chat-store.ts`](../src/stores/chat-store.ts) | Chat, modelo, telemetría |
| `useAuthStore` | [`src/stores/auth-store.ts`](../src/stores/auth-store.ts) | Estado de autenticación |

### User Store

```typescript
// src/stores/user-store.ts

interface UserState {
  // User data
  user: User | null
  subscription: Subscription | null
  settings: UserSettings | null
  
  // Points & Usage
  pointsBalance: number
  dailyUsage: number
  dailyLimit: number
  remainingToday: number
  
  // UI State
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setPointsBalance: (balance: number) => void
  deductPoints: (amount: number) => boolean
  login: (user: User, subscription?, settings?) => void
  logout: () => void
}
```

### Chat Store

```typescript
// src/stores/chat-store.ts

interface ChatState {
  // Current session
  currentSessionId: string | null
  messages: Message[]
  
  // Selected options
  selectedModelId: string
  selectedSkillId: string
  
  // Telemetry
  telemetry: SessionTelemetry
  
  // UI State
  isStreaming: boolean
  isSending: boolean
  error: string | null
  
  // Actions
  setSelectedModelId: (modelId: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  clearSession: () => void
}
```

---

## 🛡️ Null-Checks Obligatorios

### REGLA DE ORO

**TODO acceso a datos del usuario debe ser null-safe.** Los crashes por `null` o `undefined` son inaceptables.

### Patrones Correctos

```typescript
// ═══════════════════════════════════════════════════════════════
// ACCESO A PROPIEDADES DE USUARIO
// ═══════════════════════════════════════════════════════════════

// ❌ INCORRECTO - Puede causar crash
<span>{user.fullName}</span>

// ✅ CORRECTO - Null-safe con optional chaining
<span>{user?.fullName ?? 'Usuario'}</span>


// ═══════════════════════════════════════════════════════════════
// PUNTOS Y BALANCE
// ═══════════════════════════════════════════════════════════════

// ❌ INCORRECTO - Puede mostrar "null" o "undefined"
<span>{pointsBalance} pts</span>

// ✅ CORRECTO - Función formatPoints con null-safety
const formatPoints = (points: number | null | undefined) => {
  if (points === null || points === undefined || isNaN(points)) return '0'
  if (points >= 1000) return `${(points / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return points.toString()
}

<span>{formatPoints(pointsBalance)} pts</span>


// ═══════════════════════════════════════════════════════════════
// CÁLCULOS CON PUNTOS
// ═══════════════════════════════════════════════════════════════

// ❌ INCORRECTO - Puede resultar en NaN
const remaining = dailyLimit - dailyUsage

// ✅ CORRECTO - Con valores por defecto
const remaining = Math.max(0, (dailyLimit || 10000) - (dailyUsage || 0))


// ═══════════════════════════════════════════════════════════════
// AVATAR Y METADATOS
// ═══════════════════════════════════════════════════════════════

// ✅ CORRECTO - Con fallback
<Avatar>
  <AvatarImage src={user?.avatarUrl || undefined} />
  <AvatarFallback>{getUserInitials()}</AvatarFallback>
</Avatar>

// Función helper para iniciales
const getUserInitials = () => {
  if (user?.fullName) {
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return 'AU'  // Fallback genérico
}
```

---

## 📊 Tipos TypeScript

### Tipos Principales

```typescript
// src/types/index.ts

// User Types
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

export interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: UserRole
  pointsBalance: number
  isActive: boolean
  createdAt: Date
}

// Subscription Types
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'INCOMPLETE' | 'TRIALING'

export interface Subscription {
  id: string
  userId: string
  planId: string
  stripeSubscriptionId: string | null
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  plan?: Plan
}

// Chat Types
export type ArenaType = 'TEXT' | 'CODE' | 'IMAGE' | 'VIDEO' | 'AUDIO'
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface Message {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  tokensUsed: number
  pointsCost: number
  modelUsed: string | null
  createdAt: Date
}

// Telemetry Types
export type ContextStatus = 'normal' | 'warning' | 'critical'

export interface SessionTelemetry {
  contextUsed: number
  contextLimit: number
  contextPercentage: number
  lastRequestCost: number
  lastRequestTokens: number
  totalSessionCost: number
  totalSessionTokens: number
  currentModel: string
  currentSkill: string
  contextStatus: ContextStatus
}
```

---

## 🚫 Errores Comunes y Soluciones

### Error: "Cannot read properties of null"

**Causa:** Acceso a propiedad de objeto null.

**Solución:** Usar optional chaining (`?.`) y nullish coalescing (`??`).

### Error: "User not found" (404)

**Causa:** Usuario existe en Supabase Auth pero no en Prisma.

**Solución:** Implementar upsert automático en `/api/user/me`.

### Error: "Points balance is NaN"

**Causa:** Operación matemática con valor null/undefined.

**Solución:** Usar valores por defecto: `(pointsBalance || 0)`.

---

## 📝 Checklist de Implementación

- [x] Esquema Prisma completo y migrado
- [x] Relaciones entre tablas configuradas
- [x] Índices para queries frecuentes
- [x] Fallback 200 en /api/user/me
- [x] Fallback 200 en /api/chat
- [x] Stores de Zustand configurados
- [x] Null-checks en todos los componentes
- [x] Funciones de formateo null-safe
- [x] Tipos TypeScript actualizados
