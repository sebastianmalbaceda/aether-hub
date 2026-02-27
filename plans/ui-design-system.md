# Sistema de Diseño UI - Aether Hub

## 📋 Resumen Ejecutivo

Este documento define la especificación oficial del diseño de interfaz de Aether Hub, sirviendo como **Fuente de Verdad** para el estilo visual, componentes y comportamiento de la UI.

**Última actualización:** Febrero 2026  
**Estado:** En producción

---

## 🎨 Estilo Visual: Material Neon Minimalista

### Filosofía de Diseño

El diseño de Aether Hub sigue el estilo **"Material Neon Minimalista"**, una evolución del "Arcano-Tecnológico" original que prioriza:

1. **Oscuridad Elegante**: Fondos profundos que reducen la fatiga visual
2. **Minimalismo Radical**: Eliminación de bordes y elementos redundantes
3. **Translucidez Estratégica**: Uso de fondos translúcidos para jerarquía visual
4. **Acentos Tenues**: Violeta/eléctrico como color primario, aplicado con moderación
5. **Espaciado Generoso**: Respiración visual entre elementos

### Paleta de Colores

#### Fondos - Jerarquía de elevación

```css
--background: #0a0a0f;              /* Fondo base - el más oscuro */
--background-secondary: #0f0f1a;    /* Cards, sidebar */
--background-tertiary: #1a1a2e;     /* Elevación, hover states */
--background-elevated: #252542;     /* Modales, popovers */
```

#### Primario - Violeta eléctrico

```css
--primary-500: #a855f7;
--primary-600: #9333ea;
--primary-700: #7c3aed;             /* Principal para acentos */
```

#### Bordes sutiles

```css
--border-subtle: rgba(157, 78, 221, 0.1);      /* border-primary-500/10 */
--border-structural: rgba(255, 255, 255, 0.05); /* border-border/50 */
```

#### Texto

```css
--foreground: #ffffff;
--foreground-secondary: #a1a1aa;    /* muted-foreground */
--foreground-muted: #71717a;
```

### Principios de Aplicación

| Elemento | Estilo Correcto | Estilo Incorrecto |
|----------|-----------------|-------------------|
| Cards | `bg-background-secondary/50` sin borde | `bg-background-secondary border border-white/20` |
| Sidebar | `bg-background-secondary/50` translúcido | `bg-background-secondary` sólido |
| Separadores | `border-primary-500/10` tenue | `border-white/20` visible |
| Hover states | `hover:bg-primary-500/5` sutil | `hover:bg-primary-500/20` intenso |
| Activos | `bg-primary-500/15 border-l-2 border-primary-500` | `bg-primary-500 text-white` |

---

## 🏗️ Layout Estructural: The Holy Grail

### Arquitectura General

El layout implementa un patrón **Holy Grail** moderno usando Flexbox horizontal:

```
┌────────────────────────────────────────────────────────────────────┐
│                         VIEWPORT (h-screen)                        │
│  ┌──────────┬─────────────────────────────────┬────────────────┐  │
│  │          │           HEADER                 │                │  │
│  │          │  (h-14, shrink-0)                │                │  │
│  │  SIDEBAR ├─────────────────────────────────┤   TELEMETRÍA   │  │
│  │  (w-64)  │           MAIN                   │   (opcional)   │  │
│  │          │  (flex-1, overflow-y-auto)       │                │  │
│  │          │                                  │                │  │
│  │          │  ┌────────────────────────────┐  │                │  │
│  │          │  │   CONTENIDO (max-w-4xl)    │  │                │  │
│  │          │  │   mx-auto, centrado        │  │                │  │
│  │          │  └────────────────────────────┘  │                │  │
│  └──────────┴─────────────────────────────────┴────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Código Estructural Base

```tsx
// src/app/(dashboard)/layout.tsx
<div className="flex h-screen w-full overflow-hidden bg-background">
  {/* 1. SIDEBAR - Desktop fijo, móvil en Sheet */}
  <div className={cn(
    "hidden lg:block shrink-0 transition-[width] duration-300",
    "border-r border-border/50 h-full bg-background-secondary/30",
    sidebarCollapsed ? "w-16" : "w-64"
  )}>
    <Sidebar collapsed={sidebarCollapsed} />
  </div>

  {/* 2. ÁREA PRINCIPAL - Header + Contenido */}
  <div className="flex flex-1 flex-col overflow-hidden min-w-0">
    <Header onMenuClick={() => setSidebarOpen(true)} />
    <main className="flex-1 overflow-hidden">
      {children}
    </main>
  </div>
</div>
```

### Comportamiento Responsivo

| Breakpoint | Sidebar | Header | Contenido |
|------------|---------|--------|-----------|
| `< md` (móvil) | Oculto, Sheet deslizable | Hamburguesa visible | Ancho completo |
| `md - lg` (tablet) | Colapsado (w-16, solo iconos) | Logo en header | Expandido |
| `> lg` (desktop) | Expandido (w-64) | Minimalista | Centrado con márgenes |

---

## 📐 Componentes de Layout

### 1. Sidebar (Barra Lateral)

**Ubicación:** [`src/components/layout/sidebar.tsx`](../src/components/layout/sidebar.tsx)

**Estructura:**

```
┌─────────────────────────┐
│  🌌 AETHER    [◀]       │  ← Header con logo + colapsar
├─────────────────────────┤
│  🏠 Dashboard           │
│  💬 Arena Texto         │  ← Navegación principal
│  💻 Arena Código        │
│  🎨 Imágenes            │
│  🎬 Video               │
│  🎵 Audio               │
├─────────────────────────┤  ← Separador sutil
│  🔍 Buscar chats...     │
│  ─────────────────────  │
│  💬 Chat anterior 1     │  ← Historial con icono de arena
│  💻 Chat anterior 2     │
│  ...                    │
├─────────────────────────┤
│  👤 Usuario    ▼        │  ← Dropdown de perfil (INTEGRADO)
│  ⚙️ Configuración       │
│  🚪 Cerrar sesión       │
└─────────────────────────┘
```

**Características Clave:**

- **Ancho:** 256px (w-64) expandido, 64px (w-16) colapsado
- **Fondo:** `bg-background-secondary/50` con translucidez
- **Borde:** `border-r border-primary-500/10` estructural
- **Navegación activa:** `bg-primary-500/15 border-l-2 border-primary-500`
- **Historial multi-arena:** Cada chat muestra icono según tipo de arena
- **Perfil integrado:** Dropdown en la parte inferior (NO en header)

**Colores por tipo de arena:**

```typescript
const getArenaColor = (type: ArenaType) => {
  switch (type) {
    case 'texto': return 'text-blue-400'
    case 'codigo': return 'text-green-400'
    case 'imagenes': return 'text-pink-400'
    case 'video': return 'text-orange-400'
    case 'audio': return 'text-cyan-400'
  }
}
```

### 2. Header (Cabecera)

**Ubicación:** [`src/components/layout/header.tsx`](../src/components/layout/header.tsx)

**Estructura:**

```
┌────────────────────────────────────────────────────────────────────┐
│ [☰]                    [✨ Plan Gratuito · Actualizar]    [⚡ pts] [🔔] │
└────────────────────────────────────────────────────────────────────┘
   ↑                              ↑                           ↑
   Hamburguesa              Plan (centrado)           Puntos + Notif.
   (solo móvil)                                       (SIN perfil)
```

**Características Clave:**

- **Altura:** 56px (h-14)
- **Fondo:** `bg-background/80 backdrop-blur-xl` con blur
- **Borde:** `border-b border-primary-500/10`
- **Ultra minimalista:** SIN logo en desktop, SIN perfil de usuario
- **Centrado:** Botón de upgrade de plan (oculto en móvil)
- **Derecha:** Indicador de puntos + Campana de notificaciones

**IMPORTANTE - Lo que NO debe tener el Header:**
- ❌ Logo de Aether (está en el sidebar)
- ❌ Avatar/perfil de usuario (está en el sidebar)
- ❌ Breadcrumbs (eliminados por minimalismo)
- ❌ Selector de modelo (está en el área de chat)

### 3. Área de Contenido (Main)

**Comportamiento:**

- **Scroll independiente:** `overflow-y-auto` en el contenedor de mensajes
- **Ancho máximo limitado:** `max-w-4xl mx-auto` (estilo Claude)
- **Márgenes automáticos:** Centrado horizontal con padding responsivo

```tsx
// Arena de texto - Estructura
<div className="flex h-full w-full overflow-hidden">
  <div className="flex-1 flex flex-col overflow-hidden min-w-0">
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto w-full max-w-4xl h-full">
        {/* Contenido del chat */}
      </div>
    </div>
  </div>
</div>
```

---

## 💬 Componentes de Chat

### Chat Interface

**Ubicación:** [`src/components/chat/chat-interface.tsx`](../src/components/chat/chat-interface.tsx)

**Estructura:**

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👤 Tú                                                         │  │
│  │ Explica la teoría de la relatividad...                       │  │
│  │                                        15 tokens │ 0.02 pts  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🤖 Llama 3.3 70B                                              │  │
│  │                                                               │  │
│  │ La teoría de la relatividad, propuesta por Einstein...      │  │
│  │                                                               │  │
│  │ 📋 Copiar  🔄 Regenerar                                      │  │
│  │                                       245 tokens │ 3.5 pts   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [🤖 Modelo ▼]  [✨ Asistente ▼]                                │ │
│ │                                                                │ │
│ │ Escribe tu mensaje...                              [📎] [🎤]  │ │
│ │                                                                │ │
│ │ ──────────────────────────────────────────────────────────────│ │
│ │ Estimado: ~50 tokens │ Costo: ~0.5 pts            [Enviar ➤] │ │
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Chat Input - Comportamiento Crítico

**El input del chat debe:**

1. **Estar anclado abajo:** Usar `flex-col` con el input al final
2. **Auto-ajustarse:** `<textarea>` que crece hacia arriba con el contenido
3. **No romper el layout:** Usar `max-h-40` y `overflow-y-auto` para textos largos

```tsx
// Implementación del textarea auto-ajustable
<textarea
  value={inputValue}
  onChange={(e) => {
    setInputValue(e.target.value);
    updateEstimatedTokens();
  }}
  onKeyDown={handleKeyDown}
  placeholder="Escribe tu mensaje..."
  className={cn(
    "w-full resize-none bg-transparent",
    "min-h-[24px] max-h-40",        // Altura mínima y máxima
    "overflow-y-auto",               // Scroll interno si excede
    "focus:outline-none"
  )}
  style={{ height: 'auto' }}
  rows={1}
/>
```

---

## 📊 Panel de Telemetría

**Ubicación:** [`src/components/telemetry/telemetry-panel.tsx`](../src/components/telemetry/telemetry-panel.tsx)

### Estado Avanzado (showAdvancedStats)

El panel implementa un sistema de **toggle para métricas avanzadas** para evitar saturación cognitiva:

```tsx
// Estado para mostrar/ocultar estadísticas detalladas
const [showAdvancedStats, setShowAdvancedStats] = useState(false)
```

**Vista simplificada (por defecto):**
- Puntos restantes
- Uso diario
- Contexto usado

**Vista avanzada (expandida):**
- Última petición (tokens, coste)
- Total de sesión (tokens, coste)
- Información del modelo (ventana de contexto, output máximo)

### Colores de Contexto

```typescript
const getProgressColor = (percentage: number) => {
  if (percentage > 90) return 'bg-red-500'     // Crítico
  if (percentage > 75) return 'bg-yellow-500'  // Advertencia
  return 'bg-primary-500'                       // Normal
}
```

---

## 📱 Responsive Design

### Breakpoints Utilizados

```css
/* Tailwind breakpoints */
'sm': '640px',   /* Mobile landscape */
'md': '768px',   /* Tablet */
'lg': '1024px',  /* Desktop - Sidebar visible */
'xl': '1280px',  /* Large desktop */
'2xl': '1536px'  /* Extra large */
```

### Comportamiento del Sidebar

| Breakpoint | Comportamiento | Ancho |
|------------|----------------|-------|
| `< lg` | Oculto, Sheet deslizable | 100% en Sheet |
| `lg+` | Visible, colapsable | 256px / 64px |

---

## ✨ Animaciones y Transiciones

### Transiciones Principales

```css
/* Sidebar collapse/expand */
transition-[width] duration-300 ease-in-out

/* Hover en elementos */
transition-all duration-200

/* Fade in para contenido */
animate-in fade-in duration-500

/* Slide up para errores */
animate-slide-up
```

### Efectos de Glow

```css
/* Glow sutil para elementos activos */
.shadow-glow-sm {
  box-shadow: 0 0 20px rgba(157, 78, 221, 0.15);
}
```

---

## 🚫 Lo que NO debe modificarse

**REGLA DE ORO:** La interfaz actual agrada al usuario. Los siguientes elementos están **PROHIBIDOS de modificar**:

1. ❌ **Colores base** - La paleta violeta/oscura está consolidada
2. ❌ **Layout del Sidebar** - El perfil integrado funciona correctamente
3. ❌ **Header minimalista** - Sin añadir elementos innecesarios
4. ❌ **Chat Input auto-ajustable** - El comportamiento actual es correcto
5. ❌ **Translucidez del Sidebar** - El efecto visual está aprobado

---

## 📝 Checklist de Implementación UI

- [x] Layout Holy Grail con Flexbox
- [x] Sidebar colapsable con transición
- [x] Header ultra minimalista
- [x] Chat Input auto-ajustable anclado abajo
- [x] Panel de telemetría con toggle avanzado
- [x] Selector de modelo popup
- [x] Historial multi-arena con iconos
- [x] Dropdown de perfil en Sidebar
- [x] Null-checks en todos los componentes
- [x] Diseño responsivo completo
