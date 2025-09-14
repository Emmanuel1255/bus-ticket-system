"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  value: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ value, size = 200, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Simple QR code placeholder - in production, use a proper QR code library
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, size, size)

    // Create a simple pattern that looks like a QR code
    const cellSize = size / 25
    ctx.fillStyle = "black"

    // Generate a pseudo-random pattern based on the value
    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Create deterministic pattern based on position and hash
        const shouldFill =
          (row * col + hash) % 3 === 0 || (row < 7 && col < 7) || (row < 7 && col > 17) || (row > 17 && col < 7)

        if (shouldFill) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add corner squares (typical QR code pattern)
    const cornerSize = cellSize * 7
    ctx.fillStyle = "black"

    // Top-left corner
    ctx.fillRect(0, 0, cornerSize, cornerSize)
    ctx.fillStyle = "white"
    ctx.fillRect(cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)

    // Top-right corner
    ctx.fillStyle = "black"
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize)
    ctx.fillStyle = "white"
    ctx.fillRect(size - cornerSize + cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(size - cornerSize + 2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)

    // Bottom-left corner
    ctx.fillStyle = "black"
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize)
    ctx.fillStyle = "white"
    ctx.fillRect(cellSize, size - cornerSize + cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "black"
    ctx.fillRect(2 * cellSize, size - cornerSize + 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)
  }, [value, size])

  return (
    <canvas ref={canvasRef} className={`border border-gray-200 ${className}`} style={{ width: size, height: size }} />
  )
}
