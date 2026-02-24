# Sistema de Diseño UI - Aether Hub

## 🎨 Filosofía de Diseño: "Arcano-Tecnológico"

El diseño combina elementos místicos/arcánicos con una estética tecnológica moderna, creando una experiencia visual única que evoca poder, misterio y sofisticación.

### Principios Clave

1. **Oscuridad Elegante**: Fondos profundos que reducen la fatiga visual
2. **Acentos Violeta**: El color primario transmite creatividad y exclusividad
3. **Transparencia y Profundidad**: Efectos de glassmorphism y capas
4. **Animaciones Sutiles**: Micro-interacciones que dan vida a la interfaz
5. **Tipografía Nítida**: Contraste claro para máxima legibilidad

---

## 🎨 Paleta de Colores

### Colores Primarios (Violeta)

```css
/* Tailwind config */
colors: {
  primary: {
    50: '#faf5ff',   /* Más claro */
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',  /* Principal */
    800: '#6b21a8',
    900: '#581c87',  /* Más oscuro */
    950: '#3b0764'
  }
}
```

### Background (Modo Oscuro)

```css
colors: {
  background: {
    DEFAULT: '#0a0a0f',    /* Fondo base */
    secondary: '#0f0f1a',  /* Cards */
    tertiary: '#1a1a2e',   /* Elevación */
    elevated: '#252542',   /* Modales, popovers */
    muted: '#16213e'       /* Áreas secundarias */
  }
}
```

### Colores Semánticos

```css
colors: {
  success: {
    DEFAULT: '#22c55e',
    muted: '#16a34a',
    background: 'rgba(34, 197, 94, 0.1)'
  },
  warning: {
    DEFAULT: '#eab308',
    muted: '#ca8a04',
    background: 'rgba(234, 179, 8, 0.1)'
  },
  error: {
    DEFAULT: '#ef4444',
    muted: '#dc2626',
    background: 'rgba(239, 68, 68, 0.1)'
  },
  info: {
    DEFAULT: '#3b82f6',
    muted: '#2563eb',
    background: 'rgba(59, 130, 246, 0.1)'
  }
}
```

### Texto

```css
colors: {
  foreground: {
    DEFAULT: '#ffffff',
    secondary: '#a1a1aa',    /* Texto secundario */
    muted: '#71717a',        /* Texto deshabilitado */
    subtle: '#52525b'        /* Placeholders */
  }
}
```

---

## 📐 Sistema de Espaciado

```css
/* Tailwind spacing extendido */
spacing: {
  '18': '4.5rem',
  '88': '22rem',
  '128': '32rem'
}

/* Padding estándar de componentes */
--padding-card: 1.5rem;      /* p-6 */
--padding-section: 2rem;     /* p-8 */
--padding-modal: 1.5rem;     /* p-6 */
--padding-sidebar: 1rem;     /* p-4 */
```

---

## 🔤 Tipografía

### Fuentes

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace']
}
```

### Escala Tipográfica

| Elemento | Tamaño | Peso | Clase Tailwind |
|----------|--------|------|----------------|
| H1 | 2.25rem (36px) | 700 | `text-4xl font-bold` |
| H2 | 1.875rem (30px) | 600 | `text-3xl font-semibold` |
| H3 | 1.5rem (24px) | 600 | `text-2xl font-semibold` |
| H4 | 1.25rem (20px) | 500 | `text-xl font-medium` |
| Body | 1rem (16px) | 400 | `text-base` |
| Small | 0.875rem (14px) | 400 | `text-sm` |
| XSmall | 0.75rem (12px) | 400 | `text-xs` |

---

## 🧩 Componentes Core

### 1. Sidebar de Navegación

```
┌─────────────────────────┐
│  🌌 AETHER              │
│                         │
│  ┌─────────────────────┐│
│  │ 💬 Arena Texto      ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 💻 Arena Código     ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 🎨 Multimedia       ││
│  └─────────────────────┘│
│                         │
│  ─────────────────────  │
│                         │
│  ⚡ 12,450 puntos       │
│  ━━━━━━━━━━━━━━━━━━━   │
│  75% usado hoy          │
│                         │
│  ┌─────────────────────┐│
│  │ 👤 Usuario    ▼     ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Características:**
- Ancho fijo: 260px (colapsable a 72px)
- Fondo: `background-secondary` con blur
- Items activos con gradiente violeta sutil
- Indicador de puntos con barra de progreso
- Avatar con dropdown de usuario

### 2. Header Principal

```
┌──────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard  >  Arena Texto                    🔔  ⚙️  🌙     │
├──────────────────────────────────────────────────────────────────┤
│ Modelo: [GPT-4o ▼]   Skill: [Asistente ▼]   Nuevo Chat [+]     │
└──────────────────────────────────────────────────────────────────┘
```

**Características:**
- Altura: 64px
- Breadcrumb de navegación
- Selectores de modelo y skill
- Acciones rápidas

### 3. Context Window Bar

```
┌──────────────────────────────────────────────────────────────────┐
│ Contexto: 45,230 / 128,000 tokens                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                  │
│ ⚠️ 35% restante - Considere limpiar contexto antiguo             │
└──────────────────────────────────────────────────────────────────┘
```

**Estados de Color:**
- 0-75%: Verde (`success`)
- 75-90%: Amarillo (`warning`)
- 90-100%: Rojo (`error`)

### 4. Chat Interface

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 Tú                                                       │  │
│  │ Explica la teoría de la relatividad de forma simple        │  │
│  │                                          15 tokens │ 0.02 pts│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🤖 Claude 3.5 Sonnet                                       │  │
│  │                                                             │  │
│  │ La teoría de la relatividad, propuesta por Einstein...     │  │
│  │                                                             │  │
│  │ 📋 Copiar  🔄 Regenerar  ⭐ Guardar                        │  │
│  │                                          245 tokens │ 3.5 pts│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Escribe tu mensaje...                              [📎] [🎤] │ │
│ │                                                              │ │
│ │ ────────────────────────────────────────────────────────────│ │
│ │ Estimado: ~50 tokens │ Costo: ~0.5 pts           [Enviar ➤] │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 5. Panel de Telemetría

```
┌─────────────────────────────────────┐
│ 📊 Sesión Actual                    │
├─────────────────────────────────────┤
│                                     │
│ Puntos Restantes                    │
│ ┌─────────────────────────────────┐ │
│ │     8,750 / 10,000              │ │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Última Petición                     │
│ ┌─────────────────────────────────┐ │
│ │ Tokens: 260                     │ │
│ │ Costo:  3.5 pts ($0.0035)       │ │
│ │ Modelo: Claude 3.5 Sonnet       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Total de Sesión                     │
│ ┌─────────────────────────────────┐ │
│ │ Mensajes: 12                    │ │
│ │ Tokens:  3,450                  │ │
│ │ Gastado: 45 pts                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ Límite Diario: 7,500 / 10,000   │
└─────────────────────────────────────┘
```

### 6. Configurador de Packs

```
┌──────────────────────────────────────────────────────────────────┐
│                  🎯 Arma tu Pack Personalizado                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Selecciona los módulos que necesitas:                          │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │ ☑️ Arena Texto     │  │ ☑️ Arena Código    │                 │
│  │    $5/mes          │  │    $7/mes          │                 │
│  │    3,000 pts       │  │    4,000 pts       │                 │
│  └────────────────────┘  └────────────────────┘                 │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │ ☐ Imágenes         │  │ ☐ Audio/Video      │                 │
│  │    $10/mes         │  │    $15/mes         │                 │
│  │    5,000 pts       │  │    8,000 pts       │                 │
│  └────────────────────┘  └────────────────────┘                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Tu Pack:                                         $12/mes       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ Arena Texto + Arena Código                                   │
│  ✓ 7,000 puntos incluidos                                       │
│  ✓ Acceso a todos los modelos de texto y código                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              🚀 Suscribirse a este Pack                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Componentes Shadcn UI Personalizados

### Button (Botón)

```tsx
// Variantes personalizadas
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary-700 text-white hover:bg-primary-600 shadow-lg shadow-primary-700/25",
        destructive: "bg-error text-white hover:bg-error-muted",
        outline: "border border-primary-700 text-primary-400 hover:bg-primary-700/10",
        secondary: "bg-background-tertiary text-foreground hover:bg-background-elevated",
        ghost: "text-foreground-secondary hover:bg-background-tertiary hover:text-foreground",
        link: "text-primary-400 underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10"
      }
    }
  }
)
```

### Card (Tarjeta)

```tsx
// Card con efecto glassmorphism
<div className="relative overflow-hidden rounded-xl border border-white/10 bg-background-secondary/80 backdrop-blur-xl">
  {/* Glow effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary-700/5 via-transparent to-transparent" />
  
  {/* Content */}
  <div className="relative p-6">
    {children}
  </div>
</div>
```

### Input (Campo de entrada)

```tsx
// Input con estilo oscuro
<input
  className={cn(
    "flex h-10 w-full rounded-lg border border-white/10",
    "bg-background-tertiary px-3 py-2 text-sm",
    "placeholder:text-foreground-subtle",
    "focus:outline-none focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700",
    "disabled:cursor-not-allowed disabled:opacity-50"
  )}
/>
```

### Select (Selector)

```tsx
// Select con dropdown oscuro
<Select>
  <SelectTrigger className="w-full bg-background-tertiary border-white/10">
    <SelectValue placeholder="Seleccionar modelo" />
  </SelectTrigger>
  <SelectContent className="bg-background-elevated border-white/10">
    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
  </SelectContent>
</Select>
```

---

## ✨ Efectos y Animaciones

### Gradientes

```css
/* Gradiente primario para botones y highlights */
.gradient-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%);
}

/* Gradiente sutil para fondos */
.gradient-subtle {
  background: linear-gradient(180deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%);
}

/* Gradiente de brillo para elementos activos */
.gradient-glow {
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent);
}
```

### Animaciones

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulse para indicadores */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0); }
}

/* Shimmer para loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Transiciones

```css
/* Transición suave para hover */
.transition-smooth {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Transición para expandir */
.transition-expand {
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Tailwind breakpoints */
screens: {
  'sm': '640px',   /* Mobile landscape */
  'md': '768px',   /* Tablet */
  'lg': '1024px',  /* Desktop */
  'xl': '1280px',  /* Large desktop */
  '2xl': '1536px'  /* Extra large */
}
```

### Comportamiento del Sidebar

| Breakpoint | Comportamiento |
|------------|----------------|
| < md | Oculto, se abre con botón hamburguesa |
| md - lg | Colapsado (solo iconos) |
| > lg | Expandido completo |

### Grid de Arenas

```css
/* Grid responsivo para tarjetas de arena */
.arena-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .arena-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .arena-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🖼️ Iconografía

### Iconos Sugeridos (Lucide React)

```tsx
import {
  // Navegación
  Home, MessageSquare, Code, Image, Video, Music,
  
  // Acciones
  Send, Plus, Settings, Bell, Search, Menu,
  
  // Estados
  Check, X, AlertTriangle, Info, Loader2,
  
  // Archivos
  FileText, Download, Upload, Copy, Trash,
  
  // Usuario
  User, LogOut, CreditCard, Crown
} from 'lucide-react';
```

### Tamaños de Iconos

| Uso | Tamaño | Clase |
|-----|--------|-------|
| Sidebar | 20px | `w-5 h-5` |
| Botones | 16px | `w-4 h-4` |
| Indicadores | 14px | `w-3.5 h-3.5` |
| Headers | 24px | `w-6 h-6` |

---

## 🎭 Estados de Componentes

### Button States

```tsx
// Estados visuales del botón
<button className={cn(
  "transition-all duration-200",
  "hover:scale-[1.02] active:scale-[0.98]",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  isLoading && "cursor-wait opacity-80"
)}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  {children}
</button>
```

### Input States

```tsx
// Estados del campo de entrada
<input className={cn(
  hasError && "border-error focus:ring-error/50 focus:border-error",
  isSuccess && "border-success focus:ring-success/50 focus:border-success",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

---

## 📋 Checklist de Implementación UI

### Fase 1: Setup
- [ ] Configurar Tailwind con colores personalizados
- [ ] Instalar y configurar Shadcn UI
- [ ] Crear archivo de variables CSS globales
- [ ] Configurar fuentes (Inter, JetBrains Mono)

### Fase 2: Componentes Base
- [ ] Personalizar Button con variantes
- [ ] Personalizar Card con glassmorphism
- [ ] Personalizar Input y Select
- [ ] Crear componente Badge
- [ ] Crear componente Progress

### Fase 3: Layout
- [ ] Crear componente Sidebar
- [ ] Crear componente Header
- [ ] Crear layout principal (dashboard)
- [ ] Implementar responsive sidebar

### Fase 4: Componentes de Chat
- [ ] Crear ChatMessage component
- [ ] Crear ChatInput component
- [ ] Crear ContextBar component
- [ ] Crear TelemetryPanel component

### Fase 5: Componentes de Facturación
- [ ] Crear PricingCard component
- [ ] Crear PackConfigurator component
- [ ] Crear PointsBalance component
- [ ] Crear TransactionHistory component
