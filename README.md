# 🌌 Aether Hub

**Tu Centro Universal de Inteligencia Artificial**

Aether Hub es una plataforma SaaS que unifica múltiples APIs de IA bajo una sola interfaz elegante, con un sistema de facturación basado en puntos y un diseño "Material Neon Minimalista".

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)
![Groq](https://img.shields.io/badge/Groq-API-orange?style=flat-square)

## ✨ Características

### 🤖 Modelos de IA Disponibles

#### Gratuitos (Groq - Inferencia Ultra-Rápida)
| Modelo | Contexto | Descripción |
|--------|----------|-------------|
| Llama 3.3 70B | 128K tokens | Modelo principal, razonamiento avanzado |
| Llama 3.1 8B Instant | 128K tokens | Respuestas rápidas y eficientes |
| Qwen 3 32B | 128K tokens | Excelente para tareas generales |
| Kimi K2 Instruct | 128K tokens | Especializado en razonamiento |
| GPT-OSS 120B | 128K tokens | Razonamiento medio |
| GPT-OSS 20B | 128K tokens | Razonamiento medio |
| Mixtral 8x7B | 32K tokens | Tareas generales |
| Gemma 2 9B | 8K tokens | Compacto y eficiente |

#### Premium (Requiere API Key propia)
- **OpenAI**: GPT-4o, GPT-4 Turbo, o1 Preview/Mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini 1.5 Pro/Flash (contexto de 1M tokens)

### 💰 Sistema de Puntos
- **Bonus de bienvenida**: 10,000 puntos gratuitos
- 1 Punto = $0.001 USD
- Transparencia total en costos
- Telemetría en tiempo real del uso de contexto
- Límites diarios configurables

### 🎨 Diseño Material Neon Minimalista
- Tema oscuro elegante con acentos violeta (#9D4EDD)
- Glassmorphism y efectos sutiles
- Layout "Holy Grail" con Sidebar + Header + Main
- Interfaz responsive y accesible
- Tipografía: Inter (UI) + Playfair Display (títulos) + JetBrains Mono (código)

### 🔐 Autenticación Completa
- Email/Contraseña con Supabase Auth
- OAuth con Google
- Middleware de protección de rutas

### 💳 Pagos con Stripe
- Suscripciones mensuales y anuales
- Paquetes de puntos one-time
- Portal de cliente para gestión de suscripciones

## 📚 Documentación

La documentación técnica detallada se encuentra en la carpeta [`plans/`](plans/):

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura](plans/aether-hub-architecture.md) | Visión general, diagramas y referencia rápida |
| [Sistema de Diseño UI](plans/ui-design-system.md) | "Material Neon Minimalista", componentes y layouts |
| [API Routes](plans/api-routes.md) | Endpoints, Vercel AI SDK, modelos Groq |
| [Base de Datos](plans/prisma-schema.md) | Schema Prisma, stores Zustand, patrones |
| [Plan de Implementación](plans/implementation-plan.md) | Roadmap y tareas pendientes |

## 🏗️ Arquitectura

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/                # Página de login
│   │   └── register/             # Página de registro
│   ├── (dashboard)/              # Rutas protegidas
│   │   ├── arena-texto/          # Chat de texto principal
│   │   ├── arena-codigo/         # Arena de código
│   │   ├── arena/                # Arenas multimedia
│   │   │   ├── audio/            # Generación de audio
│   │   │   ├── imagenes/         # Generación de imágenes
│   │   │   └── video/            # Generación de video
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── historial/            # Historial de chats
│   │   ├── configuracion/        # Configuración de usuario
│   │   └── pricing/              # Planes y precios
│   ├── api/                      # API Routes
│   │   ├── auth/logout/          # Cerrar sesión
│   │   ├── chat/                 # Chat con IA (streaming)
│   │   ├── user/me/              # Datos de usuario
│   │   └── stripe/               # Webhooks y checkout
│   └── auth/callback/            # Callback OAuth
├── components/
│   ├── ui/                       # Componentes base (shadcn-style)
│   ├── layout/                   # Sidebar, Header
│   ├── chat/                     # ChatInterface, MessageBubble
│   ├── telemetry/                # ContextBar, TelemetryPanel
│   ├── billing/                  # PricingCard
│   ├── settings/                 # SettingsModal
│   └── providers/                # StoresProvider
├── lib/
│   ├── ai/                       # Integración de proveedores IA
│   │   ├── providers/            # OpenAI, Anthropic, Google, Groq
│   │   ├── registry.ts           # Registro centralizado
│   │   └── chat-service.ts       # Servicio de chat
│   ├── billing/                  # Middleware de facturación
│   ├── points/                   # Calculadora de puntos
│   ├── stripe/                   # Cliente Stripe
│   ├── supabase/                 # Clientes Supabase
│   └── prisma.ts                 # Cliente Prisma
├── stores/                       # Estado global (Zustand)
│   ├── auth-store.ts             # Estado de autenticación
│   ├── user-store.ts             # Estado de usuario
│   └── chat-store.ts             # Estado del chat
├── config/                       # Configuración centralizada
│   ├── ai-models.ts              # Modelos de IA disponibles
│   ├── skills.ts                 # Habilidades especiales
│   └── index.ts                  # Exports principales
├── hooks/                        # Custom hooks
│   └── use-toast.ts              # Sistema de notificaciones
└── types/                        # Tipos TypeScript
    └── index.ts                  # Tipos globales
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o Supabase)
- Cuenta en Groq (gratuito)
- Cuenta en Stripe (opcional, para pagos)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/your-org/aether-hub.git
cd aether-hub
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Base de datos
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase (Autenticación)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Groq (Requerido - Modelos gratuitos)
GROQ_API_KEY="gsk_..."

# OpenAI (Opcional - Modelos premium)
OPENAI_API_KEY="sk-..."

# Anthropic (Opcional - Modelos premium)
ANTHROPIC_API_KEY="sk-ant-..."

# Google AI (Opcional)
GOOGLE_AI_API_KEY="AI..."

# Stripe (Opcional - Pagos)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
```

4. **Inicializar la base de datos**
```bash
npx prisma db push
npx prisma db seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Modelos de Datos

### Usuario
- Autenticación con Supabase
- Balance de puntos (10,000 de bienvenida)
- Configuración de límites diarios
- Roles: USER, ADMIN, MODERATOR

### Suscripción
- Planes: Starter, Pro, Enterprise
- Estados: Active, Canceled, Past Due, Trialing
- Integración con Stripe

### Sesiones de Chat
- Historial de mensajes
- Uso de tokens y puntos
- Metadatos de modelo usado
- Soporte para múltiples arenas (texto, código, imagen, audio, video)

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Enviar mensaje al modelo de IA (streaming)

### Usuario
- `GET /api/user/me` - Obtener datos del usuario autenticado

### Autenticación
- `POST /api/auth/logout` - Cerrar sesión

### Pagos
- `POST /api/stripe/checkout` - Crear sesión de checkout
- `POST /api/stripe/webhook` - Webhook de Stripe

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build de producción
npm run build

# Iniciar servidor de producción
npm run start
```

### Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linter ESLint |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Sincronizar schema con BD |
| `npm run db:migrate` | Crear migración |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Poblar BD con datos iniciales |

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia All Rights Reserved. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Groq](https://groq.com/) por la inferencia ultra-rápida gratuita
- [OpenAI](https://openai.com/) por GPT
- [Anthropic](https://anthropic.com/) por Claude
- [Google](https://ai.google/) por Gemini
- [Supabase](https://supabase.com/) por la infraestructura
- [Stripe](https://stripe.com/) por los pagos
- [Vercel](https://vercel.com/) por el hosting y Vercel AI SDK

---

<p align="center">
  <strong>Documentación técnica detallada en <a href="plans/">plans/</a></strong>
</p>
