import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  Code, 
  Image, 
  Video, 
  Music, 
  Zap, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'

const arenas = [
  {
    name: 'Arena de Texto',
    description: 'Chatea con los mejores modelos de lenguaje: GPT-4, Claude, Gemini',
    icon: MessageSquare,
    href: '/arena-texto',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    name: 'Arena de Código',
    description: 'Asistencia de programación con modelos especializados',
    icon: Code,
    href: '/arena-codigo',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  {
    name: 'Generación de Imágenes',
    description: 'Crea imágenes únicas con DALL-E, Stable Diffusion y más',
    icon: Image,
    href: '/arena/imagenes',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
  },
  {
    name: 'Generación de Video',
    description: 'Produce videos a partir de texto o imágenes',
    icon: Video,
    href: '/arena/video',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  {
    name: 'Generación de Audio',
    description: 'Convierte texto a voz y crea música con IA',
    icon: Music,
    href: '/arena/audio',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
  },
]

const recentSessions = [
  { id: 1, title: 'Análisis de mercado tech 2024', model: 'Qwen 3 32B', tokens: 12500, date: 'Hace 2 horas' },
  { id: 2, title: 'Refactorización de API REST', model: 'Llama 3.3 70B', tokens: 8200, date: 'Hace 5 horas' },
  { id: 3, title: 'Generación de logo para startup', model: 'Kimi K2', tokens: 3000, date: 'Ayer' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Bienvenido a Aether Hub</h1>
        <p className="text-muted-foreground mt-1">
          Tu portal unificado para acceder a múltiples modelos de IA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Disponibles</CardTitle>
            <Zap className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,000</div>
            <p className="text-xs text-muted-foreground">
              De 15,000 puntos mensuales
            </p>
            <Progress value={66} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450 pts</div>
            <p className="text-xs text-muted-foreground">
              +15% vs ayer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 sesiones esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Procesados</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Arenas Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Arenas de IA</h2>
          <Button variant="ghost" size="sm">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {arenas.map((arena) => (
            <Link key={arena.name} href={arena.href}>
              <Card className="h-full hover:border-primary-700/50 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className={`inline-flex w-12 h-12 items-center justify-center rounded-lg ${arena.bgColor} ${arena.color} mb-2`}>
                    <arena.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="group-hover:text-primary-400 transition-colors">
                    {arena.name}
                  </CardTitle>
                  <CardDescription>{arena.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sesiones Recientes</h2>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm">
              Ver historial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-700/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">{session.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.tokens.toLocaleString()} tokens</p>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
