# Plan de Implementación - Aether Hub

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación paso a paso para el proyecto Aether Hub, organizado en 6 fases secuenciales.

---

## 🔄 Diagramas de Flujo del Sistema

### Flujo General de la Aplicación

```mermaid
flowchart TB
    subgraph Onboarding
        A[Usuario visita la web] --> B{¿Autenticado?}
        B -->|No| C[Página de Landing]
        C --> D[Registro / Login]
        D --> E[Supabase Auth]
        E --> F[Crear perfil + 1000 pts bonus]
        F --> G[Dashboard]
        B -->|Sí| G
    end

    subgraph Dashboard
        G --> H{Seleccionar Arena}
        H --> I[Arena Texto]
        H --> J[Arena Código]
        H --> K[Arena Multimedia]
    end

    subgraph ChatFlow
        I --> L[Seleccionar Modelo]
        L --> M[Seleccionar Skill]
        M --> N[Escribir mensaje]
        N --> O{¿Saldo suficiente?}
        O -->|No| P[Modal Recarga]
        P --> Q[Stripe Checkout]
        Q --> O
        O -->|Sí| R[Procesar con IA]
        R --> S[Descontar puntos]
        S --> T[Mostrar respuesta]
        T --> U{¿Continuar?}
        U -->|Sí| N
        U -->|No| V[Guardar sesión]
    end
```

### Flujo de Facturación y Puntos

```mermaid
flowchart LR
    subgraph Usuario
        A[Solicita operación] --> B{Verificar saldo}
    end

    subgraph Sistema
        B -->|Saldo OK| C[Ejecutar operación]
        B -->|Sin saldo| D[Error: Saldo insuficiente]
        C --> E[Calcular costo]
        E --> F[Descontar puntos]
        F --> G[Registrar transacción]
        G --> H[Actualizar UI]
    end

    subgraph Pagos
        I[Comprar puntos] --> J[Stripe Checkout]
        J --> K[Webhook: pago exitoso]
        K --> L[Acreditar puntos]
        L --> M[Notificar usuario]
    end

    subgraph Suscripciones
        N[Suscribirse] --> O[Stripe Checkout]
        O --> P[Webhook: suscripción creada]
        P --> Q[Crear registro]
        Q --> R[Acreditar puntos mensuales]
    end
```

### Flujo de Contexto y Telemetría

```mermaid
flowchart TB
    subgraph Input
        A[Mensaje del usuario] --> B[Calcular tokens input]
        B --> C[Sumar al contexto total]
    end

    subgraph Monitoreo
        C --> D{¿Porcentaje contexto?}
        D -->|0-75%| E[Estado: Normal - Verde]
        D -->|75-90%| F[Estado: Advertencia - Amarillo]
        D -->|90-100%| G[Estado: Crítico - Rojo]
    end

    subgraph Alertas
        F --> H[Mostrar advertencia]
        G --> I[Alerta crítica + sugerencia]
        I --> J{¿Acción del usuario?}
        J -->|Limpiar| K[Resetear contexto]
        J -->|Nuevo chat| L[Nueva sesión]
        J -->|Continuar| M[Continuar con riesgo]
    end

    subgraph Output
        E --> N[Procesar respuesta]
        K --> N
        L --> N
        M --> N
        N --> O[Calcular tokens output]
        O --> P[Actualizar métricas]
        P --> Q[Mostrar costo en UI]
    end
```

### Flujo del Configurador de Packs

```mermaid
flowchart TB
    subgraph Seleccion
        A[Página Pricing] --> B[Ver planes fijos]
        A --> C[Configurar pack personalizado]
    end

    subgraph Configurador
        C --> D[Seleccionar módulos]
        D --> E{¿Texto?}
        E -->|Sí| F[Añadir $5/mes + 3000 pts]
        E -->|No| G{¿Código?}
        G -->|Sí| H[Añadir $7/mes + 4000 pts]
        G -->|No| I{¿Imagen?}
        I -->|Sí| J[Añadir $10/mes + 5000 pts]
        I -->|No| K{¿Audio/Video?}
        K -->|Sí| L[Añadir $15/mes + 8000 pts]
        K -->|No| M[Calcular total]
        F --> M
        H --> M
        J --> M
        L --> M
    end

    subgraph Checkout
        M --> N[Mostrar resumen]
        N --> O{¿Confirmar?}
        O -->|Sí| P[Stripe Checkout]
        O -->|No| C
        P --> Q[Procesar pago]
        Q --> R{¿Exitoso?}
        R -->|Sí| S[Activar pack]
        R -->|No| T[Mostrar error]
    end
```

---

## 📦 FASE 1: Inicialización y Setup

### Objetivo
Crear la estructura base del proyecto Next.js con todas las configuraciones necesarias.

### Tareas Detalladas

#### 1.1 Crear proyecto Next.js
```bash
npx create-next-app@latest aether-hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

#### 1.2 Instalar dependencias base
```bash
# Dependencias de producción
npm install @supabase/supabase-js @supabase/ssr
npm install @prisma/client
npm install stripe
npm install zustand
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress
npm install react-hot-toast
npm install date-fns

# Dependencias de desarrollo
npm install -D prisma
npm install -D @types/node
npm install -D tailwindcss-animate
```

#### 1.3 Configurar Shadcn UI
```bash
npx shadcn@latest init
npx shadcn@latest add button card input select tabs dialog dropdown-menu progress avatar badge separator skeleton tooltip
```

#### 1.4 Estructura de carpetas a crear
```
aether-hub/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── arena-texto/
│   │   ├── arena-codigo/
│   │   ├── arena-multimedia/
│   │   ├── pricing/
│   │   ├── settings/
│   │   └── history/
│   ├── api/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── billing/
│   │   ├── points/
│   │   ├── models/
│   │   └── user/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── chat/
│   ├── arena/
│   ├── billing/
│   └── telemetry/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── ai/
│   ├── points/
│   ├── auth.ts
│   └── utils.ts
├── hooks/
├── stores/
├── types/
├── prisma/
│   └── schema.prisma
└── public/
```

#### 1.5 Archivos de configuración

**tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#0f0f1a',
          tertiary: '#1a1a2e',
          elevated: '#252542',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**Variables de entorno (.env.local)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_URL=http://localhost:3000

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Database
DATABASE_URL=
```

### Checklist FASE 1
- [ ] Crear proyecto Next.js
- [ ] Instalar todas las dependencias
- [ ] Configurar Shadcn UI
- [ ] Crear estructura de carpetas
- [ ] Configurar Tailwind con colores personalizados
- [ ] Crear archivo de variables de entorno
- [ ] Configurar ESLint y Prettier
- [ ] Verificar que el proyecto compila correctamente

---

## 🗄️ FASE 2: Modelado de Datos

### Objetivo
Implementar el schema de Prisma y configurar la conexión con Supabase.

### Tareas Detalladas

#### 2.1 Configurar Prisma
```bash
npx prisma init
```

#### 2.2 Crear schema completo
Ver archivo [`plans/prisma-schema.md`](prisma-schema.md) para el schema completo.

#### 2.3 Configurar Supabase
1. Crear proyecto en Supabase
2. Obtener URL y keys
3. Configurar autenticación (email/password + OAuth opcional)
4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 2.4 Crear seed data
```bash
npx prisma db seed
```

#### 2.5 Crear cliente de Prisma
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Checklist FASE 2
- [ ] Configurar Prisma
- [ ] Crear schema completo
- [ ] Ejecutar migraciones
- [ ] Crear seed data
- [ ] Verificar conexión con Supabase
- [ ] Crear tipos TypeScript

---

## 🎨 FASE 3: UI/UX Core

### Objetivo
Desarrollar el layout principal y componentes base de la interfaz.

### Tareas Detalladas

#### 3.1 Crear layout principal
- Root layout con providers
- Dashboard layout con sidebar
- Auth layout para páginas de autenticación

#### 3.2 Componentes de layout
- `Sidebar.tsx` - Navegación lateral
- `Header.tsx` - Cabecera con controles
- `UserDropdown.tsx` - Menú de usuario
- `PointsBalance.tsx` - Indicador de puntos

#### 3.3 Páginas base
- Landing page
- Dashboard home
- Páginas de autenticación

#### 3.4 Providers y stores
- ThemeProvider
- AuthProvider
- Zustand stores para estado global

### Checklist FASE 3
- [ ] Crear layouts
- [ ] Implementar Sidebar
- [ ] Implementar Header
- [ ] Crear stores de Zustand
- [ ] Implementar tema oscuro
- [ ] Crear páginas de auth
- [ ] Verificar navegación

---

## 💬 FASE 4: Motor de Chat y Contexto

### Objetivo
Implementar la interfaz de chat con telemetría de contexto.

### Tareas Detalladas

#### 4.1 Componentes de chat
- `ChatInterface.tsx` - Contenedor principal
- `ChatMessage.tsx` - Mensaje individual
- `ChatInput.tsx` - Campo de entrada
- `ModelSelector.tsx` - Selector de modelo
- `SkillSelector.tsx` - Selector de skill

#### 4.2 Telemetría
- `ContextBar.tsx` - Barra de contexto
- `TelemetryPanel.tsx` - Panel de métricas
- `CostDisplay.tsx` - Mostrar costos

#### 4.3 Lógica de chat
- Estimación de tokens en frontend
- Streaming de respuestas
- Manejo de errores

#### 4.4 Integración con APIs
- Conexión con proveedores de IA
- Manejo de respuestas
- Persistencia de sesiones

### Checklist FASE 4
- [ ] Crear interfaz de chat
- [ ] Implementar selectores
- [ ] Crear barra de contexto
- [ ] Implementar telemetría
- [ ] Conectar con APIs de IA
- [ ] Manejar streaming
- [ ] Persistir sesiones

---

## 💰 FASE 5: Sistema de Facturación

### Objetivo
Implementar el sistema de puntos, pagos y suscripciones.

### Tareas Detalladas

#### 5.1 Middleware de facturación
- Verificación de saldo
- Cálculo de costos
- Registro de transacciones

#### 5.2 Integración con Stripe
- Checkout para puntos
- Suscripciones
- Webhooks

#### 5.3 Componentes de facturación
- `PricingCard.tsx`
- `PointsPurchase.tsx`
- `TransactionHistory.tsx`

#### 5.4 API Routes
- `/api/billing/*`
- `/api/points/*`

### Checklist FASE 5
- [ ] Crear middleware de puntos
- [ ] Integrar Stripe
- [ ] Implementar webhooks
- [ ] Crear componentes de pricing
- [ ] Crear API routes
- [ ] Probar flujo de pago

---

## 🎯 FASE 6: Configurador de Packs

### Objetivo
Implementar el sistema de planes personalizados.

### Tareas Detalladas

#### 6.1 Página de pricing
- Planes fijos
- Configurador interactivo
- Comparativa

#### 6.2 Configurador
- Selección de módulos
- Cálculo dinámico de precio
- Resumen de pack

#### 6.3 Checkout personalizado
- Crear suscripción personalizada
- Procesar pago

### Checklist FASE 6
- [ ] Crear página de pricing
- [ ] Implementar configurador
- [ ] Crear flujo de checkout
- [ ] Probar suscripciones
- [ ] Documentar uso

---

## 📊 Cronograma de Dependencias

```mermaid
gantt
    title Fases del Proyecto Aether Hub
    dateFormat  YYYY-MM-DD
    
    section FASE 1
    Setup Inicial           :f1, 2024-01-01, 3d
    
    section FASE 2
    Modelado de Datos       :f2, after f1, 2d
    
    section FASE 3
    UI/UX Core              :f3, after f2, 4d
    
    section FASE 4
    Motor de Chat           :f4, after f3, 5d
    
    section FASE 5
    Sistema de Facturación  :f5, after f4, 4d
    
    section FASE 6
    Configurador de Packs   :f6, after f5, 3d
```

---

## 🚀 Comandos de Inicio Rápido

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Migraciones
npx prisma migrate dev

# Seed
npx prisma db seed

# Studio
npx prisma studio
```

---

## 📝 Notas Finales

1. **Testing**: Implementar tests unitarios y de integración en paralelo
2. **Documentación**: Mantener documentación actualizada
3. **CI/CD**: Configurar GitHub Actions para deploy automático
4. **Monitoreo**: Implementar logging y monitoreo de errores
5. **Seguridad**: Revisar permisos y validaciones en cada endpoint
