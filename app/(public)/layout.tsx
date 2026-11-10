import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { ChatbotButton } from '@/components/ChatbotButton'
import { MelaChatCTA } from '@/components/MelaChatCTA'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { orariInBreve, SITE_CONFIG_DEFAULT } from '@/lib/siteConfig'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const site = await getSiteConfig()
  const configured = (site.chatbotDomande ?? []).map((q) => q.trim()).filter(Boolean)
  const domande = configured.length ? configured : SITE_CONFIG_DEFAULT.chatbotDomande ?? []

  return (
    <AccessibilityProvider>
      <div className="flex flex-col min-h-screen">
        {/* Primo elemento della pagina: chi usa la tastiera salta il menu */}
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Salta al contenuto
        </a>
        <Header />
        <main id="contenuto" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <MelaChatCTA />
        <Footer />
        <ChatbotButton domande={domande} telefono={site.telefono} orari={orariInBreve(site)} />
      </div>
    </AccessibilityProvider>
  )
}
