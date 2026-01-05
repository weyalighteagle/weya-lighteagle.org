"use client"

import { motion } from "framer-motion"
import type { ChatStatus } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface VoiceOrbProps {
  status: ChatStatus
}

export function VoiceOrb({ status }: VoiceOrbProps) {
  // Generate ticks for the spectrum ring
  const tickCount = 80
  const radius = 100 // SVG radius
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const angle = (i / tickCount) * 360
    return {
      angle,
      // Randomize length slightly for "audio" feel, or keep uniform
      length: 10 + Math.random() * 5
    }
  })

  return (
    <div className="relative flex items-center justify-center">
      {/* Main Gradient Orb (Inner) */}
      <motion.div
        className="relative z-20 h-32 w-32 rounded-full bg-gradient-to-br from-[#7B8FD8] via-[#CBA6F7] to-[#F5E8EB] shadow-2xl shadow-purple-500/30"
        animate={
          status === "idle"
            ? { scale: [1, 1.02, 1], opacity: 0.9 }
            : status === "listening"
              ? { scale: [1, 1.05, 1], opacity: 1 }
              : status === "speaking"
                ? { scale: [1, 1.1, 1], opacity: 1 }
                : { scale: 1, opacity: 0.8 }
        }
        transition={{
          duration: status === "listening" ? 2 : 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {status === "processing" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/80" />
          </div>
        )}
      </motion.div>

      {/* SVG Spectrum Ring - Only visible when Active */}
      {(status === "listening" || status === "speaking") && (
        <motion.div
          className="absolute z-10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 0.4 }
          }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            {ticks.map((tick, i) => (
              <line
                key={i}
                x1="150"
                y1="150" // Start from center (will offset with transform)
                x2="150"
                y2={150 - 130} // Outer radius
                stroke="url(#ringGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${tick.angle} 150 150) translate(0 ${80})`} // Shift out to create hole
              // The translate pushes the line start away from center to create the ring
              // Actually, simpler logic:
              // x1 = 150 + innerR * cos, y1 = 150 + innerR * sin
              // x2 = 150 + outerR * cos, y2 = 150 + outerR * sin
              />
            ))}
            {/* Let's try a better approach with explicit coordinates for cleaner rendering */}
            {ticks.map((tick, i) => {
              const angleRad = (tick.angle * Math.PI) / 180
              const innerR = 75 // Gap from orb
              const outerR = innerR + 15 + (i % 2 === 0 ? 5 : 0) // Alternating lengths
              const x1 = 150 + innerR * Math.cos(angleRad)
              const y1 = 150 + innerR * Math.sin(angleRad)
              const x2 = 150 + outerR * Math.cos(angleRad)
              const y2 = 150 + outerR * Math.sin(angleRad)

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke="url(#ringGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity={0.6}
                />
              )
            })}
          </svg>
        </motion.div>
      )}

      {/* Secondary faint pulse ring for depth */}
      {(status === "listening") && (
        <motion.div
          className="absolute inset-0 rounded-full border border-purple-400/20"
          style={{ width: '22rem', height: '22rem' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
      )}
    </div>
  )
}
