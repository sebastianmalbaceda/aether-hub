import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950/20 via-background to-background" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold gradient-text mb-2">
            Aether Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            The Universal AI Hub
          </p>
        </div>

        {/* Description */}
        <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto">
          Tu portal unificado para acceder a múltiples modelos de inteligencia artificial 
          bajo una única interfaz elegante. Unifica, simplifica, potencia.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <Button asChild size="lg" className="glow">
            <Link href="/register">
              Comenzar Gratis
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              Iniciar Sesión
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Arena de Texto</h3>
            <p className="text-sm text-muted-foreground">
              Accede a GPT-4, Claude, Gemini y más desde una única interfaz.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="text-2xl mb-3">💻</div>
            <h3 className="font-semibold mb-2">Arena de Código</h3>
            <p className="text-sm text-muted-foreground">
              Asistencia de programación con los mejores modelos de código.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Multimedia</h3>
            <p className="text-sm text-muted-foreground">
              Genera imágenes, audio y video con IA de vanguardia.
            </p>
          </div>
        </div>

        {/* Pricing hint */}
        <p className="mt-8 text-sm text-muted-foreground">
          Sistema de puntos flexible · Sin sorpresas · Paga solo lo que uses
        </p>
      </div>
    </main>
  )
}
