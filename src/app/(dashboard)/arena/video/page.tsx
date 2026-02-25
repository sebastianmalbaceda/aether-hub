'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Video, 
  Sparkles, 
  Download, 
  Play, 
  Pause,
  Trash2,
  Wand2,
  Loader2,
  Film,
  Clock,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample video projects
const sampleVideos = [
  { 
    id: 1, 
    prompt: 'Transición suave de día a noche en una ciudad', 
    duration: '5s',
    status: 'completed' as const,
    progress: 100
  },
  { 
    id: 2, 
    prompt: 'Zoom cinematográfico sobre un paisaje montañoso', 
    duration: '10s',
    status: 'processing' as const,
    progress: 65
  },
]

export default function ArenaVideoPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videos, setVideos] = useState(sampleVideos)
  const [selectedVideo, setSelectedVideo] = useState<typeof sampleVideos[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    
    // Simulate generation
    setTimeout(() => {
      setVideos(prev => [
        { 
          id: Date.now(), 
          prompt, 
          duration: '5s',
          status: 'processing',
          progress: 0
        },
        ...prev
      ])
      setIsGenerating(false)
      setPrompt('')
    }, 1500)
  }
  
  const handleClear = () => {
    setVideos([])
    setSelectedVideo(null)
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-purple-400" />
          Arena de Video
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Genera y edita videos con IA
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Video Gallery */}
        <div className="flex-1 overflow-y-auto">
          {videos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Video className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Sin videos generados</p>
              <p className="text-sm mt-1">Escribe un prompt para crear tu primer video</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {videos.map((video) => (
                <Card 
                  key={video.id}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all",
                    selectedVideo?.id === video.id && "ring-2 ring-primary-500"
                  )}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-violet-900/30 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {video.status === 'completed' ? (
                        <Button 
                          variant="secondary" 
                          size="lg"
                          className="rounded-full h-14 w-14"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsPlaying(!isPlaying)
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6 ml-1" />
                          )}
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary-400" />
                          <p className="text-sm text-muted-foreground">Procesando...</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-xs">
                      {video.duration}
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground line-clamp-2">{video.prompt}</p>
                    
                    {video.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={video.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">{video.progress}% completado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Prompt Input */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary-400" />
              Generar Video
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe el video que quieres crear..."
              className="w-full h-32 p-3 rounded-lg border border-border bg-background-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generar
              </Button>
              <Button variant="outline" size="icon" onClick={handleClear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          {/* Video Settings */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary-400" />
              Configuración
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Duración</label>
                <div className="grid grid-cols-3 gap-2">
                  {['5s', '10s', '15s'].map((dur) => (
                    <Button key={dur} variant="outline" size="sm">
                      {dur}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Resolución</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">720p</Button>
                  <Button variant="secondary" size="sm">1080p</Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Estilo</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm">Cinematográfico</Button>
                  <Button variant="outline" size="sm">Animación</Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Selected Video Details */}
          {selectedVideo && selectedVideo.status === 'completed' && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Acciones</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar MP4
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Film className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Extender
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
