"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground({ centered = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Fog particles with different layers for depth
    const fogLayers = [
      { particles: [], count: 20, speed: 0.2, size: [150, 300], opacity: [0.02, 0.06] },
      { particles: [], count: 15, speed: 0.1, size: [250, 450], opacity: [0.01, 0.04] },
      { particles: [], count: 10, speed: 0.05, size: [400, 700], opacity: [0.005, 0.02] },
    ]

    // Create fog particles for each layer
    fogLayers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        layer.particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          opacity: layer.opacity[0] + Math.random() * (layer.opacity[1] - layer.opacity[0]),
          speed: layer.speed * (0.5 + Math.random()),
          vx: Math.random() * 0.2 - 0.1,
          vy: Math.random() * 0.2 - 0.1,
          hue: Math.random() > 0.7 ? 0 : 0, // Red or white (0 for red hue)
          saturation: Math.random() > 0.7 ? 100 : 0, // Red or white saturation
          phase: Math.random() * Math.PI * 2,
        })
      }
    })

    // Draw gradient background
    const drawBackground = () => {
      // Create a radial gradient for a subtle vignette effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width,
      )
      gradient.addColorStop(0, "#050505")
      gradient.addColorStop(0.7, "#030303")
      gradient.addColorStop(1, "#000000")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add subtle red glow at the bottom
      const redGlow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height + 100,
        0,
        canvas.width / 2,
        canvas.height + 100,
        canvas.width * 0.8,
      )
      redGlow.addColorStop(0, "rgba(255, 0, 0, 0.08)")
      redGlow.addColorStop(0.5, "rgba(255, 0, 0, 0.03)")
      redGlow.addColorStop(1, "rgba(255, 0, 0, 0)")

      ctx.fillStyle = redGlow
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw volumetric light rays
    const drawLightRays = (time) => {
      const rayCount = 5

      // If centered, use the center of the canvas, otherwise use a fixed position
      const centerX = canvas.width / 2
      const centerY = centered ? canvas.height / 2 : canvas.height * 0.3

      // Create a complete rotation effect
      const baseRotation = (time * 0.0001) % (Math.PI * 2) // Complete 360-degree rotation

      for (let i = 0; i < rayCount; i++) {
        // Distribute rays evenly in a circle and add rotation over time
        const angle = baseRotation + (i / rayCount) * Math.PI * 2
        const length = canvas.height * 1.5
        const width = 40 + Math.sin(time * 0.0003 + i) * 20

        // Calculate ray end point
        const endX = centerX + Math.cos(angle) * length
        const endY = centerY + Math.sin(angle) * length

        // Create gradient for ray
        const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY)

        if (i % 2 === 0) {
          // Red ray
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.08)")
          gradient.addColorStop(0.3, "rgba(255, 0, 0, 0.04)")
          gradient.addColorStop(1, "rgba(255, 0, 0, 0)")
        } else {
          // White ray
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.05)")
          gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.02)")
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        }

        // Draw ray
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)
        ctx.fillStyle = gradient
        ctx.fillRect(-width / 2, 0, width, length)
        ctx.restore()
      }
    }

    // Draw fog effect with multiple layers
    const drawFog = (time) => {
      fogLayers.forEach((layer) => {
        layer.particles.forEach((particle) => {
          // Create more circular motion patterns
          const radius = 50 + Math.random() * 30
          const speed = particle.speed * 0.5

          // Update particle position with circular motion
          particle.phase += speed * 0.01

          // Add circular motion component
          particle.x += particle.vx * particle.speed + Math.sin(particle.phase) * radius * 0.01
          particle.y += particle.vy * particle.speed + Math.cos(particle.phase) * radius * 0.01

          // Wrap around edges with smooth transition
          if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius
          if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius
          if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius
          if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius

          // Subtle pulsing effect
          const pulse = Math.sin(time * 0.0008 + particle.phase) * 0.2 + 0.8
          const currentOpacity = particle.opacity * pulse

          // Draw fog particle with soft edges
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius)

          // Use HSL for better color control
          if (particle.saturation > 0) {
            // Red fog
            gradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, 50%, ${currentOpacity * 0.7})`)
            gradient.addColorStop(0.4, `hsla(${particle.hue}, ${particle.saturation}%, 50%, ${currentOpacity * 0.3})`)
            gradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, 50%, 0)`)
          } else {
            // White fog
            gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.5})`)
            gradient.addColorStop(0.4, `rgba(255, 255, 255, ${currentOpacity * 0.2})`)
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
          }

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
          ctx.fill()
        })
      })
    }

    // Draw subtle floating particles
    const drawParticles = (time) => {
      const particleCount = 50
      const centerX = canvas.width / 2
      const centerY = centered ? canvas.height / 2 : canvas.height * 0.3

      for (let i = 0; i < particleCount; i++) {
        // Create orbital motion with different radii and speeds
        const orbitRadius = 100 + (i % 5) * 50
        const orbitSpeed = 0.0005 + (i % 3) * 0.0002
        const orbitPhase = (i / particleCount) * Math.PI * 2

        // Calculate position with orbital motion
        const x = centerX + Math.cos(time * orbitSpeed + orbitPhase) * orbitRadius
        const y = centerY + Math.sin(time * orbitSpeed + orbitPhase) * orbitRadius

        const size = 1 + Math.sin(time * 0.002 + i) * 0.5
        const opacity = 0.1 + Math.sin(time * 0.003 + i) * 0.05

        // Draw particle
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)

        if (i % 5 === 0) {
          ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        }

        ctx.fill()
      }
    }

    // Animation loop with time parameter for smooth animations
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawBackground()
      drawLightRays(time)
      drawFog(time)
      drawParticles(time)

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [centered])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "black" }} />
}
