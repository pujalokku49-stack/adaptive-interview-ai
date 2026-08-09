import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type IllustProps = { className?: string }

/** Abstract Helix-style SVG illustrations for application states */
export function LoadingIllustration({ className }: IllustProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full max-w-[220px]', className)} aria-hidden>
      <defs>
        <linearGradient id="loadGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3EE0C5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E8A87C" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="70"
        r="36"
        fill="none"
        stroke="url(#loadGrad)"
        strokeWidth="3"
        strokeDasharray="40 80"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '100px', originY: '70px' }}
      />
      <motion.circle
        cx="100"
        cy="70"
        r="22"
        fill="none"
        stroke="#3EE0C5"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="20 40"
        animate={{ rotate: -360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '100px', originY: '70px' }}
      />
      <circle cx="100" cy="70" r="6" fill="#3EE0C5" opacity="0.85" />
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          x={28 + i * 38}
          y={112}
          width="28"
          height="8"
          rx="4"
          fill="#243840"
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </svg>
  )
}

export function EmptyIllustration({ className }: IllustProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full max-w-[220px]', className)} aria-hidden>
      <defs>
        <linearGradient id="emptyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3EE0C5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E8A87C" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect x="40" y="28" width="120" height="84" rx="16" fill="url(#emptyGrad)" stroke="#243840" strokeWidth="1.5" />
      <motion.path
        d="M70 58h60M70 74h44M70 90h52"
        stroke="#7a909c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 10"
        animate={{ strokeDashoffset: [0, 36] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <motion.circle
        cx="148"
        cy="40"
        r="14"
        fill="#152229"
        stroke="#E8A87C"
        strokeWidth="2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <path d="M148 34v8M144 38h8" stroke="#E8A87C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ErrorIllustration({ className }: IllustProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full max-w-[220px]', className)} aria-hidden>
      <motion.path
        d="M100 24 L168 116 H32 Z"
        fill="rgb(232 122 122 / 0.12)"
        stroke="#e87a7a"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.line
        x1="100"
        y1="52"
        x2="100"
        y2="84"
        stroke="#e87a7a"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ opacity: [1, 0.45, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <circle cx="100" cy="98" r="3.5" fill="#e87a7a" />
      <motion.circle
        cx="100"
        cy="72"
        r="48"
        fill="none"
        stroke="#e87a7a"
        strokeOpacity="0.2"
        strokeWidth="1"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ originX: '100px', originY: '72px' }}
      />
    </svg>
  )
}

export function OfflineIllustration({ className }: IllustProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full max-w-[220px]', className)} aria-hidden>
      <motion.path
        d="M56 88c12-18 28-28 44-28s32 10 44 28"
        fill="none"
        stroke="#7a909c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 8"
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M72 100c8-12 18-18 28-18s20 6 28 18"
        fill="none"
        stroke="#E8A87C"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, delay: 0.2 }}
      />
      <circle cx="100" cy="114" r="5" fill="#E8A87C" />
      <motion.line
        x1="58"
        y1="42"
        x2="142"
        y2="108"
        stroke="#e87a7a"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </svg>
  )
}

export function SuccessIllustration({ className }: IllustProps) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full max-w-[220px]', className)} aria-hidden>
      <motion.circle
        cx="100"
        cy="70"
        r="40"
        fill="rgb(109 203 142 / 0.12)"
        stroke="#6dcb8e"
        strokeWidth="2.5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ originX: '100px', originY: '70px' }}
      />
      <motion.path
        d="M78 72 L94 88 L126 54"
        fill="none"
        stroke="#6dcb8e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.55, delay: 0.15 }}
      />
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
        const x = 100 + Math.cos(angle) * 58
        const y = 70 + Math.sin(angle) * 40
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="#3EE0C5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0.4, 1, 0.4] }}
            transition={{ delay: 0.3 + i * 0.08, duration: 2, repeat: Infinity }}
          />
        )
      })}
    </svg>
  )
}
