'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Search,
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  FileText,
  ChevronRight,
  ExternalLink,
  Mail,
  Send,
  ArrowLeft,
  Zap,
} from 'lucide-react'

// FAQ categories
const faqCategories = [
  {
    id: 'getting-started',
    title: 'Primeros pasos',
    icon: Zap,
    articles: [
      { id: '1', title: '¿Cómo crear mi primera conversación?', views: 1234 },
      { id: '2', title: '¿Qué modelos están disponibles?', views: 892 },
      { id: '3', title: '¿Cómo funcionan los puntos?', views: 756 },
    ]
  },
  {
    id: 'billing',
    title: 'Facturación y planes',
    icon: FileText,
    articles: [
      { id: '4', title: '¿Cómo actualizar a Premium?', views: 2341 },
      { id: '5', title: 'Métodos de pago aceptados', views: 567 },
      { id: '6', title: '¿Cómo cancelar mi suscripción?', views: 432 },
    ]
  },
  {
    id: 'features',
    title: 'Características',
    icon: Book,
    articles: [
      { id: '7', title: '¿Qué es el modo incógnito?', views: 654 },
      { id: '8', title: 'Cómo usar la entrada por voz', views: 321 },
      { id: '9', title: 'Adjuntar archivos a conversaciones', views: 456 },
    ]
  },
  {
    id: 'technical',
    title: 'Problemas técnicos',
    icon: HelpCircle,
    articles: [
      { id: '10', title: 'La respuesta se cortó', views: 876 },
      { id: '11', title: 'Error al procesar imagen', views: 234 },
      { id: '12', title: 'Problemas de conexión', views: 567 },
    ]
  },
]

// Popular articles
const popularArticles = [
  { id: 'p1', title: 'Guía completa de Aether', category: 'Primeros pasos', readTime: '5 min' },
  { id: 'p2', title: 'Diferencias entre modelos', category: 'Características', readTime: '3 min' },
  { id: 'p3', title: 'Mejores prácticas para prompts', category: 'Tips', readTime: '4 min' },
]

interface SupportCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportCenter({ open, onOpenChange }: SupportCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  })

  const handleSendTicket = () => {
    console.log('Sending ticket:', contactForm)
    // TODO: Implement ticket submission
    setShowContactForm(false)
    setContactForm({ subject: '', message: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 bg-background border-primary-500/20 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Centro de Soporte de Aether</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="p-6 border-b border-primary-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {showContactForm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactForm(false)}
                  className="h-8 w-8 mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <HelpCircle className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Centro de Soporte</h2>
                <p className="text-xs text-muted-foreground">
                  ¿Cómo podemos ayudarte?
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          {!showContactForm && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos, tutoriales, FAQs..."
                className="pl-10 bg-secondary/50 border-primary-500/20"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {showContactForm ? (
            /* CONTACT FORM */
            <div className="max-w-lg mx-auto space-y-4">
              <h3 className="font-semibold mb-4">Contactar con Soporte</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <Input
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="¿En qué podemos ayudarte?"
                  className="bg-secondary/50 border-primary-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                  className="w-full h-40 px-3 py-2 rounded-lg bg-secondary/50 border border-primary-500/20 text-sm resize-none focus:outline-none focus:border-primary-500/50"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendTicket}
                  className="flex-1 bg-primary-600 hover:bg-primary-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
              </div>
            </div>
          ) : (
            /* MAIN CONTENT */
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                    <MessageSquare className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Contactar Soporte</div>
                    <div className="text-xs text-muted-foreground">Respuesta en 24h</div>
                  </div>
                </button>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Video className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Video Tutoriales</div>
                    <div className="text-xs text-muted-foreground">Aprende paso a paso</div>
                  </div>
                </a>
              </div>

              {/* Popular articles */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Artículos populares</h3>
                <div className="space-y-2">
                  {popularArticles.map((article) => (
                    <button
                      key={article.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{article.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {article.category} · {article.readTime}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Categories */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Categorías de ayuda</h3>
                <div className="grid grid-cols-2 gap-3">
                  {faqCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                      >
                        <Icon className="h-5 w-5 text-primary-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{category.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {category.articles.length} artículos
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected category articles */}
              {selectedCategory && (
                <div className="border-t border-primary-500/10 pt-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Volver a categorías
                  </button>
                  <h3 className="text-sm font-semibold mb-3">
                    {faqCategories.find(c => c.id === selectedCategory)?.title}
                  </h3>
                  <div className="space-y-2">
                    {faqCategories
                      .find(c => c.id === selectedCategory)
                      ?.articles.map((article) => (
                        <button
                          key={article.id}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-primary-500/10 hover:border-primary-500/30 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{article.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {article.views} vistas
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
