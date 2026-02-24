import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Crear planes
  console.log('Creating plans...')
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
        features: ['Todo incluido', 'API Access', 'Soporte dedicado', 'SLA garantizado'],
        isPopular: false,
        sortOrder: 3
      }
    ],
    skipDuplicates: true
  })

  // Crear paquetes de puntos
  console.log('Creating point packages...')
  await prisma.pointPackage.createMany({
    data: [
      { name: 'Starter', points: 1000, price: 2.99, bonusPoints: 0, sortOrder: 1 },
      { name: 'Basic', points: 5000, price: 9.99, bonusPoints: 500, isPopular: true, sortOrder: 2 },
      { name: 'Pro', points: 15000, price: 24.99, bonusPoints: 3000, sortOrder: 3 },
      { name: 'Ultimate', points: 50000, price: 69.99, bonusPoints: 15000, sortOrder: 4 }
    ],
    skipDuplicates: true
  })

  // Crear modelos de IA
  console.log('Creating AI models...')
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
        capabilities: { chat: true, code: true, image: true, video: false, audio: false, functionCalling: true, streaming: true }
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
        capabilities: { chat: true, code: true, image: false, video: false, audio: false, functionCalling: true, streaming: true }
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
        capabilities: { chat: true, code: true, image: false, video: false, audio: false, functionCalling: true, streaming: true }
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
        capabilities: { chat: true, code: true, image: false, video: false, audio: false, functionCalling: true, streaming: true }
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
        capabilities: { chat: true, code: true, image: true, video: true, audio: true, functionCalling: true, streaming: true }
      },
      {
        name: 'Gemini 1.5 Flash',
        slug: 'gemini-1-5-flash',
        provider: 'GOOGLE',
        contextWindow: 1000000,
        inputPrice1K: 0.000075,
        outputPrice1K: 0.0003,
        inputPoints1K: 0.075,
        outputPoints1K: 0.3,
        capabilities: { chat: true, code: true, image: true, video: false, audio: false, functionCalling: true, streaming: true }
      }
    ],
    skipDuplicates: true
  })

  // Crear skills
  console.log('Creating skills...')
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
        systemPrompt: 'Eres un escritor creativo con talento para la poesía y la narrativa. Deja fluir tu imaginación y crea obras originales y emotivas.',
        sortOrder: 2
      },
      {
        name: 'Redactor Académico',
        slug: 'academic',
        arenaType: 'TEXT',
        description: 'Escritura formal y académica',
        systemPrompt: 'Eres un académico experto. Escribe de forma formal, precisa y bien estructurada. Usa referencias cuando sea apropiado y mantén un tono profesional.',
        sortOrder: 3
      },
      {
        name: 'Experto SEO',
        slug: 'seo',
        arenaType: 'TEXT',
        description: 'Optimización de contenido para motores de búsqueda',
        systemPrompt: 'Eres un experto en SEO. Ayuda a crear contenido optimizado para motores de búsqueda, usando palabras clave estratégicamente y siguiendo las mejores prácticas.',
        sortOrder: 4
      },
      {
        name: 'Resumidor Ejecutivo',
        slug: 'summarizer',
        arenaType: 'TEXT',
        description: 'Resúmenes concisos y ejecutivos',
        systemPrompt: 'Eres un experto en crear resúmenes ejecutivos concisos y claros. Extrae los puntos clave y presenta la información de manera directa y actionable.',
        sortOrder: 5
      },
      {
        name: 'Arquitecto de Software',
        slug: 'architect',
        arenaType: 'CODE',
        description: 'Diseño de arquitecturas y sistemas',
        systemPrompt: 'Eres un arquitecto de software senior. Ayuda a diseñar sistemas escalables, limpios y mantenibles. Proporciona diagramas, patrones y mejores prácticas.',
        sortOrder: 1
      },
      {
        name: 'Depurador',
        slug: 'debugger',
        arenaType: 'CODE',
        description: 'Análisis y corrección de errores',
        systemPrompt: 'Eres un experto en debugging. Analiza el código, identifica errores y propone soluciones claras. Explica las causas raíz y cómo prevenir problemas similares.',
        sortOrder: 2
      },
      {
        name: 'Optimizador de Rendimiento',
        slug: 'optimizer',
        arenaType: 'CODE',
        description: 'Mejora de rendimiento y eficiencia',
        systemPrompt: 'Eres un experto en optimización de rendimiento. Identifica cuellos de botella, propone mejoras de algoritmos y ayuda a escribir código más eficiente.',
        sortOrder: 3
      },
      {
        name: 'Generador de Tests',
        slug: 'tester',
        arenaType: 'CODE',
        description: 'Creación de tests unitarios y de integración',
        systemPrompt: 'Eres un experto en testing. Genera tests completos, cubriendo casos edge y asegurando alta cobertura. Usa las mejores prácticas de testing.',
        sortOrder: 4
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
