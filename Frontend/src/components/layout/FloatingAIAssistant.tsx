import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { AIAvatar } from '@/components/shared/Avatars'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { api } from '@/lib/api'

export function FloatingAIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<
    { role: 'ai' | 'user'; content: string }[]
  >([
    {
      role: 'ai',
      content: 'I can brief you on readiness, open a chamber, or explain your DNA signals. What do you need?',
    },
  ])
  const { toast } = useToast()

  const send = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: userMsg }])

    try {
      const data = await api.post<{ reply: string }>('/assistant', { message: userMsg })
      setMessages((m) => [...m, { role: 'ai', content: data.reply }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          content:
            'Noted. Connect `/api/assistant` to stream live answers. For now, try Mission Control or the Interview Chamber.',
        },
      ])
      toast({
        title: 'Assistant offline',
        description: 'Mock fallback used. Connect /api/assistant to enable live replies.',
        variant: 'info',
      })
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="panel-float mb-3 flex h-[420px] w-[340px] flex-col overflow-hidden"
          >
            <div className="relative z-[1] flex items-center justify-between border-b border-helix-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <AIAvatar size="sm" />
                <div>
                  <p className="font-display text-sm font-semibold">Helix Guide</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-helix-signal">OS Assistant</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="!px-2" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative z-[1] flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'ai'
                      ? 'rounded-xl rounded-tl-sm bg-helix-elevated px-3 py-2 text-sm'
                      : 'ml-8 rounded-xl rounded-tr-sm bg-helix-signal/15 px-3 py-2 text-sm'
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="relative z-[1] flex gap-2 border-t border-helix-border/60 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask Helix…"
                className="h-10 flex-1 rounded-xl border border-helix-border bg-helix-elevated/50 px-3 text-sm outline-none focus:border-helix-signal/50"
              />
              <Button size="sm" className="!px-3" onClick={send}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-helix-signal text-helix-bg shadow-glow"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>
    </div>
  )
}
