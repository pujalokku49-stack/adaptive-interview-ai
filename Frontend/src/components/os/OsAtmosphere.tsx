import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/utils'

/** Persistent neural field behind Mission Control surfaces */
export function OsAtmosphere({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="absolute inset-0 os-atmosphere" />
      <div className="absolute inset-0 neural-mesh opacity-80" />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-helix-signal/10 blur-3xl"
        style={{ animation: 'aurora-drift 18s ease-in-out infinite' }}
      />
      <div
        className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-helix-copper/10 blur-3xl"
        style={{ animation: 'aurora-drift 22s ease-in-out infinite reverse' }}
      />
      <ConnectionField className="absolute inset-0 opacity-50" />
    </div>
  )
}

/** Animated intelligent connection lines */
export function ConnectionField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      return { width, height }
    }

    const seed = (width: number, height: number) => {
      nodes.length = 0
      const count = Math.min(36, Math.max(14, Math.floor((width * height) / 28000)))
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.2 + Math.random() * 1.6,
        })
      }
    }

    let dims = resize()
    seed(dims.width, dims.height)

    const draw = () => {
      const { width, height } = dims
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 150) {
            const alpha = 0.22 * (1 - dist / 150)
            ctx.strokeStyle = `rgba(62, 224, 197, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(232, 168, 124, 0.55)'
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      dims = resize()
      seed(dims.width, dims.height)
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
      className={cn('h-full w-full', className)}
      aria-hidden
    />
  )
}

/** Decorative SVG node constellation for panels / headers */
export function NodeConstellation({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 320 80"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3EE0C5" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#3EE0C5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E8A87C" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <line x1="20" y1="40" x2="90" y2="22" className="connection-pulse" stroke={`url(#${id}-g)`} strokeWidth="1.2" fill="none" />
      <line x1="90" y1="22" x2="160" y2="48" className="connection-pulse" stroke={`url(#${id}-g)`} strokeWidth="1.2" fill="none" style={{ animationDelay: '0.4s' }} />
      <line x1="160" y1="48" x2="230" y2="18" className="connection-pulse" stroke={`url(#${id}-g)`} strokeWidth="1.2" fill="none" style={{ animationDelay: '0.8s' }} />
      <line x1="230" y1="18" x2="300" y2="42" className="connection-pulse" stroke={`url(#${id}-g)`} strokeWidth="1.2" fill="none" style={{ animationDelay: '1.2s' }} />
      <line x1="90" y1="22" x2="120" y2="62" stroke="rgba(62,224,197,0.2)" strokeWidth="1" />
      <line x1="160" y1="48" x2="200" y2="68" stroke="rgba(232,168,124,0.2)" strokeWidth="1" />
      {[
        [20, 40],
        [90, 22],
        [120, 62],
        [160, 48],
        [200, 68],
        [230, 18],
        [300, 42],
      ].map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={i % 2 === 0 ? 3.2 : 2.4}
          fill={i % 3 === 0 ? '#E8A87C' : '#3EE0C5'}
          opacity={0.85}
          style={{ animation: `node-breathe 3.2s ease-in-out ${i * 0.25}s infinite` }}
        />
      ))}
    </svg>
  )
}
