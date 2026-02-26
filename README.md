# 🌌 Aether Hub

**Tu Centro Universal de Inteligencia Artificial**

Aether Hub es una plataforma SaaS que unifica múltiples APIs de IA (OpenAI, Anthropic, Google) bajo una sola interfaz elegante, con un sistema de facturación basado en puntos.

![Aether Hub](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)

## ✨ Características

### 🤖 Múltiples Proveedores de IA
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5, o1 Preview, o1 Mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash

### 💰 Sistema de Puntos
- 1 Punto = $0.001 USD
- Transparencia total en costos
- Telemetría en tiempo real del uso de contexto
- Límites diarios configurables

### 🎨 Diseño Arcano-Tecnológico
- Tema oscuro elegante con acentos violeta (#7c3aed)
- Glassmorphism y efectos sutiles
- Interfaz responsive y accesible

### 🔐 Autenticación Completa
- Email/Contraseña con Supabase Auth
- OAuth con Google
- Middleware de protección de rutas

### 💳 Pagos con Stripe
- Suscripciones mensuales y anuales
- Paquetes de puntos one-time
- Portal de cliente para gestión de suscripciones

## 🏗️ Arquitectura

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Rutas protegidas
│   │   ├── arena-texto/   # Chat de texto
│   │   └── pricing/       # Planes y precios
│   ├── api/               # API Routes
│   │   ├── auth/
│   │   ├── chat/
│   │   └── stripe/
│   └── auth/callback/
├── components/
│   ├── ui/                # Componentes base (shadcn-style)
│   ├── layout/            # Sidebar, Header
│   ├── chat/              # ChatInterface
│   ├── telemetry/         # ContextBar, TelemetryPanel
│   └── billing/           # PricingCard
├── lib/
│   ├── ai/                # Integración de proveedores IA
│   │   ├── providers/     # OpenAI, Anthropic, Google
│   │   ├── registry.ts    # Registro centralizado
│   │   └── chat-service.ts
│   ├── billing/           # Middleware de facturación
│   ├── points/            # Calculadora de puntos
│   ├── stripe/            # Cliente Stripe
│   ├── supabase/          # Clientes Supabase
│   └── prisma.ts          # Cliente Prisma
├── stores/                # Estado global (Zustand)
│   ├── auth-store.ts
│   └── chat-store.ts
└── types/                 # Tipos TypeScript
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o Supabase)
- Cuentas en OpenAI, Anthropic, Google AI
- Cuenta en Stripe

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
- `DATABASE_URL`: URL de PostgreSQL
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Credenciales de Supabase
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`: APIs de IA
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Credenciales de Stripe

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
- Balance de puntos
- Configuración de límites diarios

### Suscripción
- Planes: Starter, Pro, Enterprise
- Estados: Active, Canceled, Past Due
- Integración con Stripe

### Sesiones de Chat
- Historial de mensajes
- Uso de tokens y puntos
- Metadatos de modelo usado

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Enviar mensaje al modelo de IA
- `GET /api/chat` - Obtener modelos disponibles

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

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia All Rights Reserved. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [OpenAI](https://openai.com/) por GPT
- [Anthropic](https://anthropic.com/) por Claude
- [Google](https://ai.google/) por Gemini
- [Supabase](https://supabase.com/) por la infraestructura
- [Stripe](https://stripe.com/) por los pagos
- [Vercel](https://vercel.com/) por el hosting

---

**Hecho con 💜 por el equipo de Aether Hub**
