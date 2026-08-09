import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AIAvatar, CandidateAvatar } from './Avatars'
import type { ChatMessage } from '@/types'

export function ChatBubble({
  message,
  candidateName = 'Candidate',
}: {
  message: ChatMessage
  candidateName?: string
}) {
  if (message.role === 'system') {
    return (
      <div className="my-3 text-center text-xs text-helix-muted">{message.content}</div>
    )
  }

  const isAi = message.role === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn('flex gap-3', isAi ? 'items-start' : 'flex-row-reverse items-start')}
    >
      {isAi ? <AIAvatar size="sm" /> : <CandidateAvatar name={candidateName} size="sm" />}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAi
            ? 'rounded-tl-md border border-helix-border bg-helix-elevated'
            : 'rounded-tr-md bg-helix-signal/15 text-helix-text',
        )}
      >
        {message.streaming ? <StreamingText text={message.content} /> : message.content}
      </div>
    </motion.div>
  )
}

/** Streaming cursor — marks live probe delivery, not a loading spinner */
export function StreamingText({ text }: { text: string }) {
  return (
    <span>
      {text}
      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-helix-signal align-middle" />
    </span>
  )
}
