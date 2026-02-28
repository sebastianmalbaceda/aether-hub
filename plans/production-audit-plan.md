# Plan de Auditoría Completa para Producción - Aether Hub

**Fecha de creación:** Febrero 2026  
**Estado:** En progreso  
**Objetivo:** Verificar que el sistema de chat está listo para producción

---

## 📋 Resumen Ejecutivo

Este documento contiene el plan de auditoría exhaustivo dividido en 7 fases, con checklists específicos para verificar cada funcionalidad individual del sistema.

---

## 🎯 FASE 1: Auditoría de Frontend - Componentes del Chat

### 1.1 ChatInterface ([`src/components/chat/chat-interface.tsx`](../src/components/chat/chat-interface.tsx))

#### Estados del Componente
- [ ] **Estado de mensajes**: Verificar que `messages[]` se renderiza correctamente
- [ ] **Estado de carga**: `isLoading` muestra indicador visual apropiado
- [ ] **Estado de streaming**: `isStreaming` actualiza UI en tiempo real
- [ ] **Estado de error**: `error` muestra mensaje amigable al usuario
- [ ] **Estado de input**: `inputValue` controlado correctamente

#### Funcionalidades de Mensajes
- [ ] **Envío de mensaje**: Botón/envío con Enter funciona
- [ ] **Streaming de respuesta**: Texto aparece progresivamente
- [ ] **Copia de mensaje**: Botón de copiar al portapapeles
- [ ] **Regenerar respuesta**: Botón de regenerar funciona
- [ ] **Feedback positivo/negativo**: Thumbs up/down registra feedback
- [ ] **Scroll automático**: Scroll al último mensaje

#### Selector de Modelo
- [ ] **Lista de modelos gratuitos**: Muestra modelos Groq disponibles
- [ ] **Lista de modelos premium**: Muestra modelos bloqueados con candado
- [ ] **Persistencia de selección**: Modelo seleccionado persiste en store
- [ ] **Indicador de proveedor**: Muestra "Groq", "OpenAI", etc.
- [ ] **Información de contexto**: Muestra ventana de contexto

#### Adjuntos y Archivos
- [ ] **Botón de adjuntar**: Abre selector de archivos
- [ ] **Vista previa de archivos**: Muestra archivos adjuntos
- [ ] **Eliminación de adjunto**: Permite quitar archivos
- [ ] **Validación de tipos**: Solo acepta tipos permitidos
- [ ] **Validación de tamaño**: Rechaza archivos muy grandes

#### Accesibilidad
- [ ] **Navegación por teclado**: Tab/Enter funcionan
- [ ] **ARIA labels**: Etiquetas apropiadas en botones
- [ ] **Focus management**: Focus correcto tras acciones
- [ ] **Screen reader**: Contenido legible por lectores

#### Responsive Design
- [ ] **Mobile (< 640px)**: Layout adaptado
- [ ] **Tablet (640-1024px)**: Layout intermedio
- [ ] **Desktop (> 1024px)**: Layout completo
- [ ] **Orientación horizontal**: Se adapta correctamente

### 1.2 ModelSelector ([`src/components/chat/model-selector-popup.tsx`](../src/components/chat/model-selector-popup.tsx))

- [ ] **Popup se abre/cierra**: Funciona correctamente
- [ ] **Búsqueda de modelos**: Filtra por nombre
- [ ] **Categorización**: Agrupa por proveedor/tier
- [ ] **Modelo actual resaltado**: Indica selección actual
- [ ] **Tooltips informativos**: Muestra info adicional

### 1.3 Sidebar ([`src/components/layout/sidebar.tsx`](../src/components/layout/sidebar.tsx))

#### Navegación
- [ ] **Links de navegación**: Todos los items funcionan
- [ ] **Indicador de ruta activa**: Resalta página actual
- [ ] **Colapso/expandir**: Funciona en desktop
- [ ] **Versión móvil**: Se abre/cierra correctamente

#### Historial de Chat
- [ ] **Lista de chats recientes**: Muestra historial
- [ ] **Búsqueda en historial**: Filtra conversaciones
- [ ] **Eliminar chat**: Funcionalidad de borrado
- [ ] **Renombrar chat**: Edición de título
- [ ] **Agrupación por fecha**: Hoy, Ayer, Esta semana

#### Perfil de Usuario
- [ ] **Avatar del usuario**: Muestra imagen/iniciales
- [ ] **Nombre y email**: Información correcta
- [ ] **Dropdown de opciones**: Configuración, logout
- [ ] **Indicador de puntos**: Balance visible

### 1.4 Header ([`src/components/layout/header.tsx`](../src/components/layout/header.tsx))

- [ ] **Indicador de puntos**: Muestra balance actual
- [ ] **Formato de puntos**: K para miles (10K)
- [ ] **Botón de upgrade**: Abre modal de pricing
- [ ] **Notificaciones**: Popup funcional (aunque vacío)
- [ ] **Menú móvil**: Abre sidebar en mobile

### 1.5 Modales

#### SettingsModal ([`src/components/settings/settings-modal.tsx`](../src/components/settings/settings-modal.tsx))
- [ ] **Secciones de configuración**: General, Apariencia, Idioma, Privacidad
- [ ] **Guardado de preferencias**: Persiste cambios
- [ ] **Cambio de tema**: Dark/Light/System
- [ ] **Selección de idioma**: Cambia idioma
- [ ] **Cierre con ESC**: Cierra modal

#### PricingModal ([`src/components/pricing/pricing-modal.tsx`](../src/components/pricing/pricing-modal.tsx))
- [ ] **Planes mostrados**: Free, Premium, Pro
- [ ] **Comparativa de features**: Lista completa
- [ ] **Botón de upgrade**: Inicia checkout
- [ ] **Toggle mensual/anual**: Cambia precios
- [ ] **Indicador de plan actual**: Resalta plan activo

### 1.6 Stores (Zustand)

#### ChatStore ([`src/stores/chat-store.ts`](../src/stores/chat-store.ts))
- [ ] **Persistencia**: Estado persiste en localStorage
- [ ] **Mensajes**: CRUD completo funciona
- [ ] **Selección de modelo**: Actualiza correctamente
- [ ] **Telemetría**: Cálculos de tokens/puntos
- [ ] **Reset de sesión**: Limpia estado correctamente

#### UserStore ([`src/stores/user-store.ts`](../src/stores/user-store.ts))
- [ ] **Datos de usuario**: Almacena correctamente
- [ ] **Balance de puntos**: Sincroniza con API
- [ ] **Estado de autenticación**: isAuth correcto
- [ ] **Logout**: Limpia todos los datos

---

## 🎯 FASE 2: Auditoría de Backend - API Routes

### 2.1 /api/chat ([`src/app/api/chat/route.ts`](../src/app/api/chat/route.ts))

#### Autenticación
- [ ] **Verificación de sesión**: Rechaza usuarios no autenticados
- [ ] **Código 401 correcto**: Retorna status correcto
- [ ] **Mensaje de error claro**: "Unauthorized"

#### Validación de Input
- [ ] **Messages requerido**: Valida array de mensajes
- [ ] **ModelId requerido**: Valida ID de modelo
- [ ] **Formato de mensajes**: Valida estructura
- [ ] **Sanitización de contenido**: Limpia input

#### Selección de Modelo
- [ ] **Modelo existe en config**: Valida contra AI_MODELS
- [ ] **Modelo disponible**: Verifica isAvailable
- [ ] **Error 403 si no disponible**: Código correcto
- [ ] **Mensaje informativo**: Indica modelos alternativos

#### Gestión de Usuario
- [ ] **Usuario existe en Prisma**: Lo crea si no existe
- [ ] **Puntos de bienvenida**: 10,000 puntos iniciales
- [ ] **Settings por defecto**: Crea configuración inicial

#### Sistema de Puntos
- [ ] **Verificación de saldo**: Rechaza si sin puntos
- [ ] **Cálculo de costo**: Estimación correcta
- [ ] **Deducción de puntos**: Descuenta después de respuesta
- [ ] **Límite diario**: Verifica límite

#### Streaming
- [ ] **Respuesta en streaming**: Usa streamText()
- [ ] **Formato SSE correcto**: Server-Sent Events
- [ ] **Manejo de errores en stream**: No rompe conexión
- [ ] **Cancelación de stream**: Cliente puede cancelar

#### Manejo de Errores
- [ ] **Error de API key**: Mensaje claro
- [ ] **Error de rate limit**: Mensaje informativo
- [ ] **Error de modelo**: Mensaje con detalles
- [ ] **Error genérico**: No expone internals

### 2.2 /api/user/me ([`src/app/api/user/me/route.ts`](../src/app/api/user/me/route.ts))

#### Respuesta
- [ ] **Datos de usuario**: id, email, nombre, avatar
- [ ] **Balance de puntos**: pointsBalance correcto
- [ ] **Suscripción**: Datos de plan si existe
- [ ] **Settings**: Preferencias del usuario
- [ ] **Uso diario**: Cálculo del día actual

#### Fallback 200
- [ ] **Usuario no existe en Prisma**: Lo crea automáticamente
- [ ] **No devuelve 404**: Siempre 200 o 401
- [ ] **Sincronización con Supabase**: Datos consistentes

### 2.3 /api/auth/logout ([`src/app/api/auth/logout/route.ts`](../src/app/api/auth/logout/route.ts))

- [ ] **Cierra sesión en Supabase**: Limpia cookies
- [ ] **Redirección correcta**: A login o home
- [ ] **Limpia stores cliente**: Estado limpio

### 2.4 /api/stripe/checkout ([`src/app/api/stripe/checkout/route.ts`](../src/app/api/stripe/checkout/route.ts))

- [ ] **Verifica autenticación**: Usuario logueado
- [ ] **Crea sesión de Stripe**: Correctamente
- [ ] **URL de retorno**: Configurada
- [ ] **Metadata correcta**: userId, planId

### 2.5 /api/stripe/webhook ([`src/app/api/stripe/webhook/route.ts`](../src/app/api/stripe/webhook/route.ts))

- [ ] **Verificación de firma**: Valida webhook
- [ ] **checkout.session.completed**: Maneja correctamente
- [ ] **customer.subscription.created**: Crea suscripción
- [ ] **customer.subscription.updated**: Actualiza datos
- [ ] **customer.subscription.deleted**: Cancela suscripción
- [ ] **invoice.paid**: Registra pago
- [ ] **invoice.payment_failed**: Registra fallo

### 2.6 /auth/callback ([`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts))

- [ ] **Intercambio de código**: Por sesión
- [ ] **Redirección post-login**: A dashboard
- [ ] **Manejo de errores**: Redirige a login

---

## 🎯 FASE 3: Auditoría de Base de Datos - Prisma Schema

### 3.1 Modelos Principales ([`prisma/schema.prisma`](../prisma/schema.prisma))

#### User
- [ ] **Campos requeridos**: id, email, createdAt, updatedAt
- [ ] **Campos opcionales**: passwordHash, fullName, avatarUrl, stripeCustomerId
- [ ] **Valores por defecto**: pointsBalance = 10000, isActive = true
- [ ] **Índices**: email, stripeCustomerId
- [ ] **Relaciones**: subscription, transactions, sessions, settings

#### Subscription
- [ ] **Relación con User**: userId único
- [ ] **Relación con Plan**: planId requerido
- [ ] **Estados válidos**: ACTIVE, PAST_DUE, CANCELLED, INCOMPLETE, TRIALING
- [ ] **Fechas de período**: currentPeriodStart, currentPeriodEnd

#### Transaction
- [ ] **Tipos válidos**: SUBSCRIPTION_CREDIT, PURCHASE_POINTS, USAGE_DEDUCTION, REFUND, BONUS, EXPIRATION
- [ ] **Relación con User**: onDelete Cascade
- [ ] **Índices**: userId, type, createdAt

#### ChatSession
- [ ] **Tipos de arena**: TEXT, CODE, IMAGE, VIDEO, AUDIO
- [ ] **Relación con Messages**: Cascade delete
- [ ] **Contexto**: contextData como Json

#### Message
- [ ] **Roles válidos**: USER, ASSISTANT, SYSTEM
- [ ] **Relación con ChatSession**: onDelete Cascade
- [ ] **Metadatos**: metadata como Json

### 3.2 Integridad Referencial

- [ ] **User → Subscription**: One-to-one
- [ ] **User → Transaction**: One-to-many
- [ ] **User → ChatSession**: One-to-many
- [ ] **ChatSession → Message**: One-to-many
- [ ] **onDelete Cascade**: Configurado correctamente

### 3.3 Migraciones

- [ ] **Migraciones aplicadas**: Todas ejecutadas
- [ ] **Estado de migración**: Sin pendientes
- [ ] **Seed ejecutado**: Datos iniciales presentes

---

## 🎯 FASE 4: Auditoría de Integraciones

### 4.1 Supabase Auth

#### Configuración ([`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts))
- [ ] **Variables de entorno**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] **Cliente servidor**: createSupabaseServerClient()
- [ ] **Cliente middleware**: createSupabaseMiddlewareClient()
- [ ] **getAuthUser()**: Retorna usuario o null

#### Flujo de Autenticación
- [ ] **Registro**: Crea usuario en Supabase
- [ ] **Login**: Autentica correctamente
- [ ] **Logout**: Cierra sesión
- [ ] **Callback**: Intercambia código
- [ ] **Middleware**: Protege rutas

### 4.2 AI Providers ([`src/lib/ai/`](../src/lib/ai/))

#### Groq (Activo)
- [ ] **API Key configurada**: GROQ_API_KEY
- [ ] **Modelos disponibles**: Todos los de AI_MODELS con provider GROQ
- [ ] **Endpoint correcto**: /chat/completions (no /responses)
- [ ] **Rate limits**: Documentados y manejados

#### OpenAI (Premium)
- [ ] **Cliente configurado**: createOpenAI()
- [ ] **API Key opcional**: OPENAI_API_KEY
- [ ] **Modelos deshabilitados**: isAvailable = false

#### Anthropic (Premium)
- [ ] **Cliente configurado**: createAnthropic()
- [ ] **API Key opcional**: ANTHROPIC_API_KEY
- [ ] **Modelos deshabilitados**: isAvailable = false

#### Google (Premium)
- [ ] **Cliente configurado**: createGoogleGenerativeAI()
- [ ] **API Key opcional**: GEMINI_API_KEY
- [ ] **Modelos deshabilitados**: isAvailable = false

### 4.3 Stripe

#### Configuración ([`src/lib/stripe/client.ts`](../src/lib/stripe/client.ts))
- [ ] **Secret Key**: STRIPE_SECRET_KEY
- [ ] **Webhook Secret**: STRIPE_WEBHOOK_SECRET
- [ ] **Precio IDs**: Configurados para cada plan

#### Checkout
- [ ] **Creación de sesión**: Funciona
- [ ] **URL de éxito**: Configurada
- [ ] **URL de cancelación**: Configurada
- [ ] **Metadata**: userId, planId, type

### 4.4 Sistema de Puntos ([`src/lib/points/calculator.ts`](../src/lib/points/calculator.ts))

- [ ] **Cálculo de costo**: Basado en tokens
- [ ] **Estimación de tokens**: Aproximación correcta
- [ ] **Deducción de puntos**: Transaccional
- [ ] **Registro de transacción**: Crea registro

---

## 🎯 FASE 5: Auditoría de Documentación

### 5.1 Coherencia con Código

#### [`plans/aether-hub-architecture.md`](./aether-hub-architecture.md)
- [ ] **Stack tecnológico**: Coincide con package.json
- [ ] **Estructura de carpetas**: Coincide con realidad
- [ ] **Modelos listados**: Coinciden con ai-models.ts
- [ ] **Sistema de puntos**: Coincide con implementación

#### [`plans/api-routes.md`](./api-routes.md)
- [ ] **Endpoints documentados**: Todos existen
- [ ] **Parámetros**: Coinciden con implementación
- [ ] **Respuestas**: Coinciden con código
- [ ] **Códigos de error**: Documentados

#### [`plans/prisma-schema.md`](./prisma-schema.md)
- [ ] **Modelos**: Coinciden con schema.prisma
- [ ] **Relaciones**: Correctamente documentadas
- [ ] **Enums**: Valores actualizados

#### [`plans/ui-design-system.md`](./ui-design-system.md)
- [ ] **Componentes**: Existen en src/components
- [ ] **Colores**: Coinciden con Tailwind
- [ ] **Tipografía**: Implementada

### 5.2 Documentación Faltante

- [ ] **README.md**: Instrucciones de instalación
- [ ] **Variables de entorno**: .env.example
- [ ] **Guía de contribución**: CONTRIBUTING.md
- [ ] **Changelog**: CHANGELOG.md

---

## 🎯 FASE 6: Auditoría de Seguridad

### 6.1 Autenticación

- [ ] **Rutas protegidas**: Middleware las protege
- [ ] **Rutas públicas**: Login, register, callback
- [ ] **Sesión expirada**: Manejo correcto
- [ ] **Token refresh**: Funciona automáticamente

### 6.2 Autorización

- [ ] **Usuario solo ve sus datos**: Queries filtradas por userId
- [ ] **Admin puede ver todo**: Role ADMIN funciona
- [ ] **APIs validan ownership**: Verifican userId

### 6.3 Rate Limiting

- [ ] **Límite diario de puntos**: Implementado
- [ ] **Límite de requests**: Groq tiene límites
- [ ] **Protección contra abuso**: Medidas en lugar

### 6.4 Input Validation

- [ ] **Sanitización de mensajes**: Antes de enviar a AI
- [ ] **Validación de tipos**: TypeScript estricto
- [ ] **Escape de HTML**: En markdown rendering
- [ ] **Validación de archivos**: Tipos y tamaños

### 6.5 API Keys Protection

- [ ] **Keys en servidor**: Nunca en cliente
- [ ] **NEXT_PUBLIC_**: Solo para keys públicas
- [ ] **.env en .gitignore**: No se sube
- [ ] **Webhook signature**: Verificada

### 6.6 Headers de Seguridad

- [ ] **Content-Security-Policy**: Configurado
- [ ] **X-Frame-Options**: DENY
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **Strict-Transport-Security**: HSTS

---

## 🎯 FASE 7: Auditoría de Performance

### 7.1 Optimizaciones

- [ ] **React.memo**: Componentes pesados memoizados
- [ ] **useCallback**: Funciones estables
- [ ] **useMemo**: Cálculos costosos cacheados
- [ ] **Lazy loading**: Componentes grandes

### 7.2 Caching

- [ ] **Static generation**: Páginas estáticas
- [ ] **ISR**: Incremental Static Regeneration
- [ ] **API caching**: Headers apropiados
- [ ] **CDN**: Assets en CDN

### 7.3 Bundle Size

- [ ] **Tree shaking**: Funciona
- [ ] **Code splitting**: Por ruta
- [ ] **Dynamic imports**: react-markdown
- [ ] **Análisis de bundle**: Sin bloat

### 7.4 Base de Datos

- [ ] **Índices**: En columnas usadas en WHERE
- [ ] **Queries optimizadas**: SELECT específico
- [ ] **Connection pooling**: Configurado
- [ ] **N+1 queries**: Evitadas

### 7.5 Métricas Web Vitals

- [ ] **LCP**: < 2.5s
- [ ] **FID**: < 100ms
- [ ] **CLS**: < 0.1
- [ ] **TTFB**: < 600ms

---

## 📊 Diagrama de Flujo de Auditoría

```mermaid
flowchart TD
    A[Inicio Auditoría] --> B[FASE 1: Frontend]
    B --> B1[ChatInterface]
    B --> B2[ModelSelector]
    B --> B3[Sidebar]
    B --> B4[Header]
    B --> B5[Modales]
    B --> B6[Stores]
    
    B --> C[FASE 2: Backend]
    C --> C1[/api/chat]
    C --> C2[/api/user/me]
    C --> C3[/api/auth/*]
    C --> C4[/api/stripe/*]
    
    C --> D[FASE 3: Base de Datos]
    D --> D1[Modelos]
    D --> D2[Relaciones]
    D --> D3[Migraciones]
    
    D --> E[FASE 4: Integraciones]
    E --> E1[Supabase Auth]
    E --> E2[AI Providers]
    E --> E3[Stripe]
    E --> E4[Puntos]
    
    E --> F[FASE 5: Documentación]
    F --> F1[Coherencia]
    F --> F2[Faltantes]
    
    F --> G[FASE 6: Seguridad]
    G --> G1[Autenticación]
    G --> G2[Autorización]
    G --> G3[Rate Limiting]
    G --> G4[Input Validation]
    G --> G5[API Keys]
    G --> G6[Headers]
    
    G --> H[FASE 7: Performance]
    H --> H1[Optimizaciones]
    H --> H2[Caching]
    H --> H3[Bundle]
    H --> H4[Database]
    H --> H5[Web Vitals]
    
    H --> I[FASE 8: Reporte Final]
    I --> J[Fin Auditoría]
```

---

## 📝 Formato de Reporte de Hallazgos

Para cada issue encontrado, usar el siguiente formato:

```markdown
### [ID-XXX] Título del Issue

**Severidad:** CRÍTICA | ALTA | MEDIA | BAJA  
**Fase:** X - Nombre de Fase  
**Archivo:** ruta/del/archivo.ts:línea  
**Descripción:** Descripción clara del problema  
**Impacto:** Qué afecta en producción  
**Recomendación:** Cómo solucionarlo  
**Referencia:** Link a documentación o código
```

---

## 🚀 Próximos Pasos

1. **Ejecutar cada fase** en orden
2. **Documentar hallazgos** en formato especificado
3. **Clasificar por severidad** para priorización
4. **Crear issues/tickets** para cada hallazgo
5. **Asignar responsables** para correcciones
6. **Re-auditar** tras correcciones

---

*Documento generado para auditoría de producción - Aether Hub*
