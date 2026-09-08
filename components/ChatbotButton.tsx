'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { CENTER_INFO } from '@/lib/siteConfig'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  visible: boolean
}

const GREETING_TEXT = 'Ciao! Sono **MelaBot**, l\'assistente del Centro Medico San Fedele. Come posso aiutarti? 😊'

const TEASER_KEY = 'sanfedele:chat-teaser-visto'

const ERROR_FALLBACK = `Mi dispiace, in questo momento non riesco a rispondere. Puoi chiamarci al ${CENTER_INFO.telefono} (${CENTER_INFO.orari}). 📞`

// Componenti custom per ReactMarkdown nelle bolle del bot — link in rosso brand,
// elenchi compatti, niente titoli/tabelle (il system prompt vieta markdown pesante).
const botMarkdownComponents: Components = {
  a: ({ href, children }) => {
    const isExternal = !!href && /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="font-medium underline underline-offset-2 hover:opacity-80 break-words"
        style={{ color: '#D05241' }}
      >
        {children}
      </a>
    )
  },
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-0.5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
}

export function ChatbotButton({ domande = [] }: { domande?: string[] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Nasconde il fumetto di invito e lo ricorda per la sessione corrente
  const dismissTeaser = useCallback(() => {
    setTeaser(false)
    try {
      sessionStorage.setItem(TEASER_KEY, '1')
    } catch {
      /* sessionStorage non disponibile: pazienza, riapparirà */
    }
  }, [])

  // Entrance animation for FAB
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Fumetto di invito: spiega a cosa serve il bottone. Una volta per sessione,
  // si mostra dopo qualche secondo e si ritira da solo.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TEASER_KEY) === '1') return
    } catch {
      /* sessionStorage non disponibile: mostriamo comunque il fumetto */
    }
    const show = setTimeout(() => setTeaser(true), 3500)
    const hide = setTimeout(() => setTeaser(false), 16000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  // Allow other components (e.g. DoctorScroller mela card) to open the chat
  useEffect(() => {
    function openHandler() {
      setOpen(true)
      dismissTeaser()
      // Autofocus input at bottom once the window is visible
      setTimeout(() => inputRef.current?.focus(), 450)
    }
    window.addEventListener('sanfedele:open-chat', openHandler)
    return () => window.removeEventListener('sanfedele:open-chat', openHandler)
  }, [dismissTeaser])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Track real chat visibility (delays unmount-like behavior to wait for close animation)
  useEffect(() => {
    if (open) {
      setChatVisible(true)
      return
    }
    const t = setTimeout(() => setChatVisible(false), 250) // matches chatSlideDown duration
    return () => clearTimeout(t)
  }, [open])

  // Show greeting on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true)
      // Simulate the bot typing the greeting
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages([{
          id: 'greeting',
          text: GREETING_TEXT,
          sender: 'bot',
          timestamp: new Date(),
          visible: true,
        }])
      }, 1200)
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [open, hasOpened])

  async function handleSend(presetText?: string) {
    const text = (presetText ?? input).trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      visible: false,
    }

    // Snapshot della conversazione PRIMA del nuovo messaggio (esclude il greeting
    // sintetico), mappata al formato dell'API. Tiene gli ultimi scambi.
    const history = messages
      .filter((m) => m.id !== 'greeting')
      .slice(-9)
      .map((m) => ({
        role: m.sender === 'bot' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Animate user message in
    requestAnimationFrame(() => {
      setMessages((prev) =>
        prev.map((m) => m.id === userMsg.id ? { ...m, visible: true } : m)
      )
    })

    setIsTyping(true)

    let replyText: string
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user' as const, content: text }],
        }),
      })
      const data = await res.json()
      replyText =
        data?.success && data?.reply
          ? data.reply
          : data?.message || ERROR_FALLBACK
    } catch {
      replyText = ERROR_FALLBACK
    } finally {
      setIsTyping(false)
    }

    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      text: replyText,
      sender: 'bot',
      timestamp: new Date(),
      visible: false,
    }
    setMessages((prev) => [...prev, botMsg])
    // Animate bot message in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMessages((prev) =>
          prev.map((m) => m.id === botMsg.id ? { ...m, visible: true } : m)
        )
      })
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatSlideDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fabPop {
          0% { transform: scale(0); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(208, 82, 65, 0.45); }
          50% { box-shadow: 0 0 0 12px rgba(208, 82, 65, 0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-window-open {
          animation: chatSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chat-window-close {
          animation: chatSlideDown 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
          pointer-events: none;
        }
        .msg-appear {
          animation: msgFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .msg-hidden {
          opacity: 0;
          transform: translateY(8px);
        }
        .fab-enter {
          animation: fabPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .fab-pulse {
          animation: fabPulse 2.5s ease-in-out infinite;
        }
        .typing-dot {
          animation: typingDot 1.4s ease-in-out infinite;
        }
        @keyframes teaserIn {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .teaser-in {
          animation: teaserIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom right;
        }
      `}</style>

      {/* Su mobile il FAB sta a filo del bordo inferiore dell'area sicura: senza
          `viewport-fit=cover` l'inset vale 0 e il viewport già esclude la zona
          dell'home indicator, ma tenerlo regge anche se in futuro si passa a
          cover. Su desktop resta staccato dal fondo. */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] md:bottom-16 right-4 sm:right-5 z-50 flex flex-col items-end">
        {/* Mela cucù — appesa SOPRA la chat window quando è aperta. In flusso e larga
            quanto la finestra, così resta centrata a qualsiasi viewport; il margine
            negativo la fa "aggrappare" al bordo superiore della finestra. */}
        {chatVisible && (
          <div
            className={`pointer-events-none relative z-[51] -mb-2.5 flex w-[360px] max-w-[calc(100vw-2.5rem)] justify-center ${
              open ? 'chat-window-open' : 'chat-window-close'
            }`}
            style={{ transformOrigin: 'bottom center' }}
            aria-hidden
          >
            <Image
              src="/mela-cucu.png"
              alt=""
              width={1114}
              height={720}
              className="w-32 h-auto drop-shadow-md"
              priority={false}
            />
          </div>
        )}

        {/* Chat window */}
        {chatVisible && (
          <div
            className={`mb-3 w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              open ? 'chat-window-open' : 'chat-window-close'
            }`}
            style={{ height: '480px', transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
              style={{ background: 'linear-gradient(to right, #D05241, #B6452F)' }}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden ring-2 ring-white/40">
                  <Image
                    src="/mela-chatbot.png"
                    alt="MelaBot"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2"
                  style={{ borderColor: '#B6452F' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">MelaBot</p>
                <p className="text-white/70 text-xs">Assistente San Fedele · Di solito risponde subito</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all duration-200"
                aria-label="Chiudi chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50/80 to-gray-50/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                    msg.visible ? 'msg-appear' : 'msg-hidden'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-text-main rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                    }`}
                    style={msg.sender === 'user' ? { backgroundColor: '#D05241' } : undefined}
                  >
                    {msg.sender === 'bot' ? (
                      <ReactMarkdown components={botMarkdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1.5 text-right ${
                        msg.sender === 'user' ? 'text-white/50' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Domande suggerite — mostrate finché l'utente non scrive */}
              {domande.length > 0 &&
                !isTyping &&
                messages.length > 0 &&
                messages.every((m) => m.sender === 'bot') && (
                  <div className="flex flex-col items-start gap-2 pt-1 msg-appear">
                    {domande.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="text-left text-sm px-3.5 py-2 rounded-2xl rounded-bl-md bg-white border border-gray-200 text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                        style={{ color: '#D05241' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start msg-appear">
                  <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scrivi un messaggio..."
                  disabled={isTyping}
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 disabled:opacity-50"
                  style={{ '--tw-ring-color': 'rgba(208,82,65,0.3)' } as React.CSSProperties}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex-shrink-0"
                  style={{ backgroundColor: '#D05241' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B6452F')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D05241')}
                  aria-label="Invia messaggio"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fumetto di invito — dice esplicitamente a cosa serve il bottone.
            Il margine inferiore lascia spazio alla mela appesa sopra il FAB. */}
        {!chatVisible && mounted && teaser && (
          <div className="relative z-[52] mb-12 sm:mb-14 max-w-[15rem] teaser-in">
            <button
              type="button"
              onClick={() => {
                setOpen(true)
                dismissTeaser()
              }}
              className="block w-full text-left bg-white rounded-2xl rounded-br-md shadow-2xl border border-gray-100 pl-4 pr-9 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="block text-sm font-bold text-text-main">Hai una domanda?</span>
              <span className="block text-xs text-text-main/60 mt-0.5 leading-snug">
                Chiedi a MelaBot: orari, visite, prenotazioni e convenzioni.
              </span>
            </button>
            <button
              type="button"
              onClick={dismissTeaser}
              className="absolute top-1.5 right-1.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Chiudi il suggerimento"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* FAB toggle — pill con etichetta esplicita (anche su mobile).
            Il wrapper relativo àncora la mela cucù: `inset-x-0 + justify-center`
            la centra sul bottone qualunque sia la sua larghezza. */}
        <div className={`relative ${mounted ? 'fab-enter' : 'scale-0'}`}>
          {!chatVisible && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-6px)] z-10 flex justify-center"
              aria-hidden
            >
              <Image
                src="/mela-cucu.png"
                alt=""
                width={1114}
                height={720}
                className="w-16 sm:w-20 h-auto drop-shadow-md"
                priority={false}
              />
            </div>
          )}

          <button
            onClick={() => {
              setOpen((v) => !v)
              dismissTeaser()
            }}
            style={{ backgroundColor: '#D05241' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B6452F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D05241')}
            className={`group flex items-center gap-2.5 text-white shadow-xl rounded-full active:scale-95 transition-all duration-200 ${
              open ? 'p-4' : 'pl-4 pr-5 py-3'
            } ${!open && mounted ? 'fab-pulse' : ''}`}
            aria-expanded={open}
            aria-label={
              open
                ? 'Chiudi la chat'
                : 'Apri la chat con MelaBot, l’assistente virtuale del Centro Medico San Fedele'
            }
          >
            <span className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <MessageCircle
                size={24}
                className={`absolute transition-all duration-300 ${
                  open ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                size={24}
                className={`absolute transition-all duration-300 ${
                  open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`}
              />
            </span>
            {!open && (
              <span className="flex flex-col items-start text-left leading-tight">
                <span className="font-bold text-[15px] whitespace-nowrap">Chiedi a MelaBot</span>
                <span className="text-[11px] font-medium text-white/80 whitespace-nowrap">
                  Orari, visite, prenotazioni
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
