"use client"

import { motion, type Variants } from "framer-motion"
import type { ChatStatus } from "@/lib/types"

interface VoiceOrbProps {
  status: ChatStatus
}

export function VoiceOrb({ status }: VoiceOrbProps) {
  // Container: Breathing and floating (Same effect, smaller scale)
  const containerVariants: Variants = {
    idle: {
      scale: 1,
      opacity: 0.9,
      y: [0, -4, 0],
      filter: "brightness(1) blur(0px)",
      transition: {
        scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
        y: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
      }
    },
    listening: {
      scale: 1.1,
      opacity: 1,
      y: 0,
      filter: "brightness(1.1)",
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }
    },
    speaking: {
      scale: 1.2,
      opacity: 1,
      y: 0,
      filter: "brightness(1.2) contrast(1.1)",
      transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeOut" }
    },
    processing: { scale: 0.95, opacity: 0.8 },
  }

  // Inner Swirls: Fluid light movement
  const swirlVariants: Variants = {
    idle: { rotate: 360, scale: [1, 1.1, 1], transition: { rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 5, repeat: Number.POSITIVE_INFINITY } } },
    listening: { rotate: 360, scale: [1, 1.2, 1], transition: { rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 2, repeat: Number.POSITIVE_INFINITY } } },
    speaking: { rotate: 360, scale: [1, 1.3, 1], transition: { rotate: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 1, repeat: Number.POSITIVE_INFINITY } } }
  }

  const counterSwirlVariants: Variants = {
    idle: { rotate: -360, scale: [1, 1.2, 1], transition: { rotate: { duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 6, repeat: Number.POSITIVE_INFINITY } } },
    listening: { rotate: -360, scale: [1, 1.3, 1], transition: { rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 2.5, repeat: Number.POSITIVE_INFINITY } } },
    speaking: { rotate: -360, scale: [1, 1.4, 1], transition: { rotate: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY } } }
  }

  return (
    // Reduced container size
    <div className="relative flex items-center justify-center h-64 w-64">
      {/* 1. Ambient Background Glow (Softer, Lavender) */}
      <motion.div
        className="absolute inset-0 bg-purple-300/20 blur-[50px] rounded-full"
        animate={status === "speaking" ? { opacity: [0.3, 0.5, 0.3], scale: 1.1 } : { opacity: 0.2, scale: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* 2. Main Orb Composition */}
      <motion.div
        className="relative h-32 w-32 rounded-full z-10" // Reduced size from h-48 w-48
        variants={containerVariants}
        animate={status}
      >
        {/* Mask Container */}
        <div className="absolute inset-0 rounded-full overflow-hidden bg-transparent isolate">

          {/* Base Light (Very Soft Lavender/White) */}
          <div className="absolute inset-0 bg-gradient-radial from-white/30 via-purple-100/10 to-transparent opacity-60" />

          {/* Swirl Layer 1: Soft Lavender/White Gases */}
          <motion.div
            className="absolute -inset-[100%] opacity-80 mix-blend-plus-lighter"
            style={{
              // Colors closer to image: White, Soft Violet, Transparent
              background: "conic-gradient(from 0deg, transparent 0%, #E9D5FF 20%, transparent 40%, #F3E8FF 60%, transparent 100%)",
              filter: "blur(20px)",
            }}
            variants={swirlVariants}
            animate={status}
          />

          {/* Swirl Layer 2: Counter-flow Light (Subtle Purple) */}
          <motion.div
            className="absolute -inset-[100%] opacity-70 mix-blend-plus-lighter"
            style={{
              // Removing Strong Cyan/Pink - sticking to monochromatic purple spectrum
              background: "conic-gradient(from 180deg, transparent 0%, #D8B4FE 30%, transparent 50%, #E9D5FF 70%, transparent 100%)",
              filter: "blur(18px)",
            }}
            variants={counterSwirlVariants}
            animate={status}
          />

          {/* Inner Core Glow (Bright center) */}
          <motion.div
            className="absolute inset-[15%] rounded-full bg-white/50 blur-lg mix-blend-overlay"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        {/* 3. Surface Effects (Glass/Highlight) - Tuned for scale */}

        {/* Rim Light */}
        <div className="absolute inset-0 rounded-full border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.3),inset_0_0_15px_rgba(255,255,255,0.2)]" />

        {/* Top-Left Specular Refection (Clean White) */}
        <div className="absolute top-3 left-5 h-8 w-14 -rotate-12 rounded-[100%] bg-gradient-to-b from-white/90 to-transparent blur-md opacity-90" />

        {/* Subtle sparkle texture */}
        <div className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "radial-gradient(1px 1px at 50% 50%, white, transparent)" }}
        />

      </motion.div>
    </div>
  )
}
