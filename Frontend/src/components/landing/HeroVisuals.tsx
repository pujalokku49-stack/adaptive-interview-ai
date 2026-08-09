import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function NeuralNetworkBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const nodes: { x: number; y: number; vx: number; vy: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const init = () => {
      nodes.length = 0
      const w = canvas.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 800)
      const h = canvas.offsetHeight || (typeof window !== 'undefined' ? window.innerHeight : 600)
      const count = Math.max(24, Math.min(48, Math.floor((w * h) / 18000)))
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.offsetWidth) n.vx *= -1
        if (n.y < 0 || n.y > canvas.offsetHeight) n.vy *= -1
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            ctx.strokeStyle = `rgba(62, 224, 197, ${0.18 * (1 - dist / 140)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(232, 168, 124, 0.55)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()
    const onResize = () => {
      resize()
      init()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export function InteractiveIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[8%] rounded-full border border-dashed border-helix-signal/30"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[18%] rounded-full border border-helix-copper/25"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-[28%] flex items-center justify-center rounded-[2rem] border border-helix-border bg-helix-surface/80 shadow-glow backdrop-blur-xl"
      >
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-helix-muted">
            Live Signal
          </p>
          <p className="mt-2 font-display text-5xl font-bold text-helix-signal">84</p>
          <p className="mt-1 text-sm text-helix-muted">Adaptive score</p>
        </div>
      </motion.div>
      {[
        { label: 'RAG', x: '6%', y: '22%', delay: 0 },
        { label: 'Agents', x: '72%', y: '14%', delay: 0.4 },
        { label: 'Systems', x: '78%', y: '68%', delay: 0.8 },
        { label: 'DNA', x: '12%', y: '74%', delay: 1.2 },
      ].map((chip) => (
        <motion.span
          key={chip.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: chip.delay },
            scale: { delay: chip.delay },
            y: { delay: chip.delay, duration: 4, repeat: Infinity },
          }}
          className="absolute rounded-xl border border-helix-border bg-helix-elevated/90 px-3 py-1.5 font-display text-xs font-semibold shadow-soft backdrop-blur"
          style={{ left: chip.x, top: chip.y }}
        >
          {chip.label}
        </motion.span>
      ))}
    </div>
  )
}
