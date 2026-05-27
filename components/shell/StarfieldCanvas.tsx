'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  alpha: number
  twinkleSpeed: number
  twinkleDirection: number
  color: string
  originalX: number
  originalY: number
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, rx: 0, ry: 0 }) // actual and reactive mouse positions

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let stars: Star[] = []
    const starCount = 140

    // Set canvas sizes
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    // Initialize stars
    const initStars = () => {
      stars = []
      const w = canvas.width
      const h = canvas.height
      const colors = ['#ffffff', '#e0f2fe', '#bae6fd', '#38bdf8', '#818cf8']

      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * w
        const y = Math.random() * h
        stars.push({
          x,
          y,
          originalX: x,
          originalY: y,
          size: Math.random() * 1.8 + 0.4,
          alpha: Math.random(),
          twinkleSpeed: 0.005 + Math.random() * 0.015,
          twinkleDirection: Math.random() > 0.5 ? 1 : -1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    // Capture mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // Init
    handleResize()

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const w = canvas.width
      const h = canvas.height

      // Ease reactive mouse position toward actual mouse position for fluid lag/inertia
      const m = mouseRef.current
      m.rx += (m.x - m.rx) * 0.08
      m.ry += (m.y - m.ry) * 0.08

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // 1. Twinkling effect (alpha loop)
        star.alpha += star.twinkleSpeed * star.twinkleDirection
        if (star.alpha >= 1) {
          star.alpha = 1
          star.twinkleDirection = -1
        } else if (star.alpha <= 0.05) {
          star.alpha = 0.05
          star.twinkleDirection = 1
        }

        // 2. Reactive mouse displacement (magnetic warp)
        const dx = star.originalX - m.rx
        const dy = star.originalY - m.ry
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 200

        let offsetX = 0
        let offsetY = 0

        if (dist < maxDist) {
          // Push stars slightly away from mouse cursor
          const force = (maxDist - dist) / maxDist
          const angle = Math.atan2(dy, dx)
          offsetX = Math.cos(angle) * force * 15
          offsetY = Math.sin(angle) * force * 15
        }

        // Update positions with dynamic inertia
        star.x += (star.originalX + offsetX - star.x) * 0.1
        star.y += (star.originalY + offsetY - star.y) * 0.1

        // 3. Gentle drift based on time (slow cosmic float)
        star.originalX += 0.015
        if (star.originalX > w) star.originalX = 0
        
        // Render
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.alpha
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-transparent"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
