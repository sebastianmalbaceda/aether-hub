import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Aether Hub - The Universal AI Hub',
  description: 'Tu portal unificado para acceder a múltiples modelos de inteligencia artificial bajo una única interfaz elegante.',
  keywords: ['AI', 'Artificial Intelligence', 'ChatGPT', 'Claude', 'Gemini', 'Machine Learning'],
  authors: [{ name: 'Aether Hub Team' }],
  openGraph: {
    title: 'Aether Hub - The Universal AI Hub',
    description: 'Tu portal unificado para acceder a múltiples modelos de inteligencia artificial.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* Script para eliminar atributos de extensiones del navegador antes de la hidratación */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var removeAttributes = function() {
                  var elements = document.querySelectorAll('[bis_skin_checked]');
                  elements.forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                };
                removeAttributes();
                if (typeof MutationObserver !== 'undefined') {
                  var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                        mutation.target.removeAttribute('bis_skin_checked');
                      }
                    });
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked'],
                    subtree: true
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  )
}
