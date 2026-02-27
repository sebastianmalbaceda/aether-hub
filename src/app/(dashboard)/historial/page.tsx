'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  History, 
  Search, 
  MessageSquare, 
  Code, 
  Image, 
  Video, 
  Music,
  Trash2,
  RotateCcw,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample history data
const historyItems = [
  {
    id: 1,
    title: 'Análisis de mercado tech 2024',
    type: 'text' as const,
    model: 'Qwen 3 32B',
    tokens: 12500,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preview: 'El mercado tecnológico en 2024 muestra tendencias claras hacia la inteligencia artificial...',
  },
  {
    id: 2,
    title: 'Refactorización de API REST',
    type: 'code' as const,
    model: 'Llama 3.3 70B',
    tokens: 8200,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    preview: 'Aquí tienes una versión refactorizada de tu API con mejores prácticas...',
  },
  {
    id: 3,
    title: 'Logo para startup tecnológica',
    type: 'image' as const,
    model: 'Kimi K2',
    tokens: 3000,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    preview: 'Un logo minimalista con gradientes azules y formas geométricas...',
  },
  {
    id: 4,
    title: 'Video promocional producto',
    type: 'video' as const,
    model: 'Runway Gen-2',
    tokens: 5000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    preview: 'Transición suave mostrando el producto desde múltiples ángulos...',
  },
  {
    id: 5,
    title: 'Narración para tutorial',
    type: 'audio' as const,
    model: 'ElevenLabs',
    tokens: 1500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    preview: 'Bienvenidos a este tutorial sobre desarrollo web moderno...',
  },
]

const typeIcons = {
  text: MessageSquare,
  code: Code,
  image: Image,
  video: Video,
  audio: Music,
}

const typeColors = {
  text: 'text-blue-400 bg-blue-400/10',
  code: 'text-green-400 bg-green-400/10',
  image: 'text-pink-400 bg-pink-400/10',
  video: 'text-purple-400 bg-purple-400/10',
  audio: 'text-orange-400 bg-orange-400/10',
}

const typeLabels = {
  text: 'Texto',
  code: 'Código',
  image: 'Imagen',
  video: 'Video',
  audio: 'Audio',
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  if (diffHours < 24) return `Hace ${diffHours} horas`
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES')
}

export default function HistorialPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<typeof historyItems[0] | null>(null)
  
  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.preview.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterType || item.type === filterType
    return matchesSearch && matchesFilter
  })
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary-400" />
          Historial de Sesiones
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revisa y retoma tus conversaciones anteriores
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* List */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en el historial..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={filterType === null ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setFilterType(null)}
              >
                Todos
              </Button>
              {Object.entries(typeLabels).map(([type, label]) => {
                const Icon = typeIcons[type as keyof typeof typeIcons]
                return (
                  <Button
                    key={type}
                    variant={filterType === type ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
          
          {/* History List */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                  <History className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Sin resultados</p>
                  <p className="text-sm mt-1">No se encontraron sesiones que coincidan</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const TypeIcon = typeIcons[item.type]
                    const typeColor = typeColors[item.type]
                    
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-4 p-4 cursor-pointer transition-colors",
                          selectedItem?.id === item.id 
                            ? "bg-primary-700/10" 
                            : "hover:bg-secondary/50"
                        )}
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Type Icon */}
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                          typeColor
                        )}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{item.title}</h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.preview}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(item.date)}
                            </span>
                            <span>{item.model}</span>
                            <span>{item.tokens.toLocaleString()} tokens</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Selected Item Details */}
        {selectedItem && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <Card className="sticky top-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    typeColors[selectedItem.type]
                  )}>
                    {(() => {
                      const Icon = typeIcons[selectedItem.type]
                      return <Icon className="h-6 w-6" />
                    })()}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedItem.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.model}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <span>{typeLabels[selectedItem.type]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens usados</span>
                    <span>{selectedItem.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha</span>
                    <span>{selectedItem.date.toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {selectedItem.preview}
                </p>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary-700 hover:bg-primary-600">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retomar
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
