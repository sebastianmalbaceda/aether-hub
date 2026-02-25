'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Image, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Trash2,
  Wand2,
  Grid3X3,
  LayoutGrid,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample generated images (placeholder)
const sampleImages = [
  { id: 1, prompt: 'Un dragón de cristal en un bosque mágico', model: 'DALL-E 3' },
  { id: 2, prompt: 'Ciudad futurista al atardecer', model: 'Stable Diffusion XL' },
  { id: 3, prompt: 'Retrato de un robot con flores', model: 'DALL-E 3' },
  { id: 4, prompt: 'Paisaje alienígena con dos lunas', model: 'Midjourney' },
]

function ImageCard({ 
  image, 
  onSelect 
}: { 
  image: typeof sampleImages[0]
  onSelect: () => void 
}) {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary-500/50 transition-all"
      onClick={onSelect}
    >
      <div className="aspect-square bg-gradient-to-br from-violet-900/20 to-purple-900/20 relative">
        {/* Placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="h-16 w-16 text-muted-foreground/30" />
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary">
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="text-sm text-foreground line-clamp-2">{image.prompt}</p>
        <p className="text-xs text-muted-foreground mt-1">{image.model}</p>
      </CardContent>
    </Card>
  )
}

export default function ArenaImagenesPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState(sampleImages)
  const [selectedImage, setSelectedImage] = useState<typeof sampleImages[0] | null>(null)
  const [gridSize, setGridSize] = useState<'small' | 'large'>('large')
  
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    
    // Simulate generation
    setTimeout(() => {
      setImages(prev => [
        { id: Date.now(), prompt, model: 'DALL-E 3' },
        ...prev
      ])
      setIsGenerating(false)
      setPrompt('')
    }, 2000)
  }
  
  const handleClear = () => {
    setImages([])
    setSelectedImage(null)
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-pink-400" />
            Arena de Imágenes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Genera imágenes únicas con IA
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setGridSize('small')}
            className={cn(gridSize === 'small' && 'bg-secondary')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setGridSize('large')}
            className={cn(gridSize === 'large' && 'bg-secondary')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Gallery */}
        <div className="flex-1 overflow-y-auto">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Image className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Sin imágenes generadas</p>
              <p className="text-sm mt-1">Escribe un prompt para crear tu primera imagen</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              gridSize === 'small' 
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}>
              {images.map((image) => (
                <ImageCard 
                  key={image.id} 
                  image={image} 
                  onSelect={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar - Prompt & Settings */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Prompt Input */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary-400" />
              Generar Imagen
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la imagen que quieres crear..."
              className="w-full h-32 p-3 rounded-lg border border-border bg-background-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
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
          
          {/* Selected Image Details */}
          {selectedImage && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Imagen Seleccionada</h3>
              <div className="aspect-square bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg mb-3 flex items-center justify-center">
                <Image className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-foreground">{selectedImage.prompt}</p>
              <p className="text-xs text-muted-foreground mt-1">Modelo: {selectedImage.model}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
          
          {/* Quick Prompts */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Prompts Sugeridos</h3>
            <div className="space-y-2">
              {[
                'Un paisaje cyberpunk con neones',
                'Retrato estilo anime',
                'Naturaleza surrealista',
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setPrompt(suggestion)}
                >
                  <span className="text-xs">{suggestion}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
