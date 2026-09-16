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
        <Header />
        <main className="flex-1">{children}</main>
        <MelaChatCTA />
        <Footer />
        <ChatbotButton domande={domande} telefono={site.telefono} orari={orariInBreve(site)} />
      </div>
    </AccessibilityProvider>
  )
}
