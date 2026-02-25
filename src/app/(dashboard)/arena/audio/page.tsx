'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Music,
  Sparkles,
  Download,
  Play,
  Pause,
  Trash2,
  Wand2,
  Loader2,
  Mic,
  Volume2,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Audio types
type AudioType = 'voice' | 'music' | 'sfx'
type AudioStatus = 'completed' | 'processing'

interface AudioItem {
  id: number
  prompt: string
  duration: string
  type: AudioType
  status: AudioStatus
  progress?: number
}

// Sample audio projects
const sampleAudios: AudioItem[] = [
  {
    id: 1,
    prompt: 'Narración profesional para video corporativo',
    duration: '0:45',
    type: 'voice',
    status: 'completed',
  },
  {
    id: 2,
    prompt: 'Música ambiental relajante para meditación',
    duration: '2:30',
    type: 'music',
    status: 'completed',
  },
  {
    id: 3,
    prompt: 'Efectos de sonido de naturaleza',
    duration: '1:00',
    type: 'sfx',
    status: 'processing',
    progress: 45
  },
]

export default function ArenaAudioPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audios, setAudios] = useState(sampleAudios)
  const [selectedAudio, setSelectedAudio] = useState<typeof sampleAudios[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioType, setAudioType] = useState<'voice' | 'music' | 'sfx'>('voice')
  
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    
    // Simulate generation
    setTimeout(() => {
      setAudios(prev => [
        { 
          id: Date.now(), 
          prompt, 
          duration: '0:30',
          type: audioType,
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
    setAudios([])
    setSelectedAudio(null)
  }
  
  const getTypeIcon = (type: 'voice' | 'music' | 'sfx') => {
    switch (type) {
      case 'voice': return Mic
      case 'music': return Music
      case 'sfx': return Volume2
    }
  }
  
  const getTypeLabel = (type: 'voice' | 'music' | 'sfx') => {
    switch (type) {
      case 'voice': return 'Voz'
      case 'music': return 'Música'
      case 'sfx': return 'Efectos'
    }
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Music className="h-6 w-6 text-orange-400" />
          Arena de Audio
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Genera voz, música y efectos de sonido con IA
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Audio Gallery */}
        <div className="flex-1 overflow-y-auto">
          {audios.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Music className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Sin audios generados</p>
              <p className="text-sm mt-1">Escribe un prompt para crear tu primer audio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audios.map((audio) => {
                const TypeIcon = getTypeIcon(audio.type)
                return (
                  <Card 
                    key={audio.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedAudio?.id === audio.id && "ring-2 ring-primary-500"
                    )}
                    onClick={() => setSelectedAudio(audio)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Play button */}
                        <Button 
                          variant="secondary"
                          size="lg"
                          className="rounded-full h-12 w-12 flex-shrink-0"
                          disabled={audio.status !== 'completed'}
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsPlaying(!isPlaying)
                          }}
                        >
                          {audio.status === 'processing' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>
                        
                        {/* Waveform placeholder */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className="h-4 w-4 text-primary-400" />
                            <span className="text-xs text-muted-foreground">{getTypeLabel(audio.type)}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{audio.duration}</span>
                          </div>
                          <p className="text-sm text-foreground truncate">{audio.prompt}</p>
                          
                          {audio.status === 'processing' && (
                            <div className="mt-2">
                              <Progress value={audio.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        {audio.status === 'completed' && (
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Audio Type Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary-400" />
              Tipo de Audio
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['voice', 'music', 'sfx'] as const).map((type) => {
                const TypeIcon = getTypeIcon(type)
                return (
                  <Button
                    key={type}
                    variant={audioType === type ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setAudioType(type)}
                    className="flex-col h-auto py-2"
                  >
                    <TypeIcon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{getTypeLabel(type)}</span>
                  </Button>
                )
              })}
            </div>
          </Card>
          
          {/* Prompt Input */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary-400" />
              Generar Audio
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                audioType === 'voice' 
                  ? "Escribe el texto que quieres convertir a voz..."
                  : audioType === 'music'
                  ? "Describe el estilo de música que quieres..."
                  : "Describe el efecto de sonido que necesitas..."
              }
              className="w-full h-32 p-3 rounded-lg border border-border bg-background-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
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
          
          {/* Voice Settings (only for voice type) */}
          {audioType === 'voice' && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Configuración de Voz</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Voz</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm">Masculina</Button>
                    <Button variant="outline" size="sm">Femenina</Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Velocidad</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">Lenta</Button>
                    <Button variant="secondary" size="sm">Normal</Button>
                    <Button variant="outline" size="sm">Rápida</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Music Settings (only for music type) */}
          {audioType === 'music' && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Configuración Musical</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Género</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm">Ambiental</Button>
                    <Button variant="outline" size="sm">Electrónica</Button>
                    <Button variant="outline" size="sm">Clásica</Button>
                    <Button variant="outline" size="sm">Jazz</Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Duración</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">30s</Button>
                    <Button variant="secondary" size="sm">1min</Button>
                    <Button variant="outline" size="sm">2min</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
