import { useEffect, useState } from "react"
import type p5 from "p5"
import { ReactP5Wrapper } from "react-p5-wrapper"

type Particle = {
  x: number
  y: number
  originalX: number
  originalY: number
  vx: number
  vy: number
  radius: number
  color: string
  isBreaking: boolean
  noiseOffsetX: number
  noiseOffsetY: number
}

type SketchProps = {
  width: number
  height: number
}

export default function Corazon() {
  const [dimensions, setDimensions] = useState<SketchProps>({
    width: 800,
    height: 600,
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth, 800),
        height: Math.min(window.innerHeight, 600),
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function sketch(p: p5) {
    const particles: Particle[] = []
    const heartSize = 18 // Increased heart size
    const particleCount = 8500 // More particles for the larger heart
    const breakRadius = 40 // Adjusted break radius for larger heart
    const returnSpeed = 0.1
    const breakingForce = 40
    const particleMovementSpeed = 2 // Speed of natural particle movement
    let width = dimensions.width
    let height = dimensions.height

    // Function to check if a point is inside the heart
    function isInsideHeart(x: number, y: number): boolean {
      const dx = (x - width / 2) / (heartSize * 13)
      const dy = (y - height / 2) / (heartSize * 13)

      const x1 = dx
      const y1 = -dy + 0.4 // Flip y and adjust to center properly

      return Math.pow(x1 * x1 + y1 * y1 - 1, 3) - x1 * x1 * Math.pow(y1, 3) < 0
    }

    p.setup = () => {
      p.createCanvas(width, height)
      p.colorMode(p.HSB, 100)

      // Create particles inside heart shape
      for (let i = 0; i < particleCount; i++) {
        let x: number = 0, y: number = 0
        let isInHeart = false

        // Keep trying random positions until we find one inside the heart
        while (!isInHeart) {
          // Generate random position within canvas bounds
          const testX = p.random(width / 2 - heartSize * 16, width / 2 + heartSize * 16)
          const testY = p.random(height / 2 - heartSize * 16, height / 2 + heartSize * 16)

          if (isInsideHeart(testX, testY)) {
            x = testX
            y = testY
            isInHeart = true
          }
        }

        particles.push({
          x,
          y,
          originalX: x,
          originalY: y,
          vx: 0,
          vy: 0,
          radius: p.random(1, 2), // Smaller particles
          color: "rgb(255, 0, 50)", // Red color for all particles
          isBreaking: false,
          noiseOffsetX: p.random(0, 1000),
          noiseOffsetY: p.random(0, 1000),
        })
      }
    }

    p.draw = () => {
      p.background(0, 0, 0)

      // Update and draw particles
      for (const particle of particles) {
        const mouseDistance = p.dist(p.mouseX, p.mouseY, particle.x, particle.y)

        // Check if mouse is over canvas
        if (p.mouseX > 0 && p.mouseX < width && p.mouseY > 0 && p.mouseY < height) {
          // Break particles within radius
          if (mouseDistance < breakRadius) {
            particle.isBreaking = true

            // Calculate direction away from mouse
            const angle = p.atan2(particle.y - p.mouseY, particle.x - p.mouseX)
            const force = p.map(mouseDistance, 0, breakRadius, breakingForce, 0.1)

            particle.vx += p.cos(angle) * force
            particle.vy += p.sin(angle) * force
          }
        }

        // Apply velocity from mouse interaction
        particle.x += particle.vx
        particle.y += particle.vy

        // Apply friction
        particle.vx *= 0.95
        particle.vy *= 0.95

        // Return to original position when not breaking
        if (!particle.isBreaking || mouseDistance > breakRadius) {
          particle.isBreaking = false

          // Natural movement using noise
          particle.noiseOffsetX += 0.01
          particle.noiseOffsetY += 0.01

          const noiseX = p.map(p.noise(particle.noiseOffsetX), 0, 1, -particleMovementSpeed, particleMovementSpeed)
          const noiseY = p.map(p.noise(particle.noiseOffsetY), 0, 1, -particleMovementSpeed, particleMovementSpeed)

          // Apply natural movement
          particle.x += noiseX
          particle.y += noiseY

          // Gradually return to original position to stay within heart
          particle.x += (particle.originalX - particle.x) * (returnSpeed * 0.5)
          particle.y += (particle.originalY - particle.y) * (returnSpeed * 0.5)

          // Ensure particles stay inside heart
          if (!isInsideHeart(particle.x, particle.y)) {
            particle.x += (particle.originalX - particle.x) * returnSpeed * 2
            particle.y += (particle.originalY - particle.y) * returnSpeed * 2
          }
        }

        // Draw particle
        p.noStroke()
        p.fill(particle.color)
        p.circle(particle.x, particle.y, particle.radius * 2)
      }
    }

    p.windowResized = () => {
      width = dimensions.width
      height = dimensions.height
      p.resizeCanvas(width, height)
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <ReactP5Wrapper sketch={sketch} />
    </div>
  )
}

