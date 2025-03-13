"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function GradeLegend() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Particle configuration
    const particles: Particle[] = []
    const colors = ["#E85D5D", "#E89A5D", "#73C173", "#3A4DB9", "#8B6BF2"]

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw particles
      particles.forEach((particle) => {
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Boundary check
        if (particle.x < 0 || particle.x > rect.width) {
          particle.speedX *= -1
        }

        if (particle.y < 0 || particle.y > rect.height) {
          particle.speedY *= -1
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      // No cleanup needed for this simple animation
    }
  }, [])

  return (
    <div className="relative h-40 rounded-xl overflow-hidden mb-6 bg-[#0F172A]/5">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Grade Scale</h3>
        <div className="flex gap-4 items-center justify-center">
          {[
            { grade: 1, color: "#E85D5D", label: "Poor" },
            { grade: 2, color: "#E89A5D", label: "Fair" },
            { grade: 3, color: "#73C173", label: "Average" },
            { grade: 4, color: "#3A4DB9", label: "Good" },
            { grade: 5, color: "#8B6BF2", label: "Excellent" },
          ].map((item) => (
            <motion.div
              key={item.grade}
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: item.grade * 0.1,
              }}
              whileHover={{
                scale: 1.1,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="flex flex-col items-center"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                style={{
                  background: `linear-gradient(135deg, ${item.color}dd, ${item.color})`,
                  boxShadow: `0 8px 20px -4px ${item.color}80`,
                }}
              >
                <span className="font-bold text-white text-xl">{item.grade}</span>
              </div>
              <span className="text-sm font-medium" style={{ color: item.color }}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Particle {
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  opacity: number
}

