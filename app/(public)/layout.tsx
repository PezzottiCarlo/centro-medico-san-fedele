import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { ChatbotButton } from '@/components/ChatbotButton'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AccessibilityProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatbotButton />
      </div>
    </AccessibilityProvider>
  )
}
