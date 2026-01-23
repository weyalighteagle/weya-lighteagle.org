"use client"

import { useEffect, useRef, useState } from "react"

interface Color {
    r: number
    g: number
    b: number
}

interface Point {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    color: Color // Derived current color
}

interface Orb extends Point {
    colorPair: [Color, Color] // [Dark, Light]
    phase: number
}

export function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const requestRef = useRef<number>(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || window.matchMedia("(hover: none)").matches)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    useEffect(() => {
        if (isMobile) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Refined Palette: Stronger Tonal Pairs for Light <-> Dark Oscillation
        // Each pair is [Dark/Deep Tone, Light/Bright Tone]
        const colorPairs: [Color, Color][] = [
            [{ r: 199, g: 21, b: 133 }, { r: 255, g: 192, b: 203 }],   // Medium Violet Red <-> Pink
            [{ r: 75, g: 0, b: 130 }, { r: 230, g: 230, b: 250 }],   // Indigo <-> Lavender
            [{ r: 139, g: 0, b: 139 }, { r: 218, g: 112, b: 214 }],   // Dark Magenta <-> Orchid
            [{ r: 72, g: 61, b: 139 }, { r: 176, g: 196, b: 222 }],   // Dark Slate Blue <-> Light Steel Blue
            [{ r: 148, g: 0, b: 211 }, { r: 255, g: 240, b: 245 }],   // Dark Violet <-> Lavender Blush
            [{ r: 65, g: 105, b: 225 }, { r: 135, g: 206, b: 235 }],   // Royal Blue <-> Sky Blue
        ]

        const orbs: Orb[] = []
        const numOrbs = 7

        // Cursor orb: Brighter, larger radius of influence
        let cursorOrb = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            radius: 800, // Very large glow
            color: { r: 255, g: 255, b: 255 },
            vx: 0,
            vy: 0
        }

        const initOrbs = () => {
            orbs.length = 0
            for (let i = 0; i < numOrbs; i++) {
                const pairIndex = i % colorPairs.length
                // Fallback to first pair or a default black pair to satisfy TypeScript
                const pair = colorPairs[pairIndex] || colorPairs[0] || [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }]
                orbs.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    // Horizontal flow: mostly horizontal velocity, very little vertical
                    vx: 0.8 + Math.random() * 0.5, // Faster drift for visible flow
                    vy: (Math.random() - 0.5) * 0.5, // Vertical mix
                    radius: Math.random() * 500 + 500, // 500-1000px
                    color: pair[0], // Initial value
                    colorPair: pair,
                    phase: Math.random() * Math.PI * 2, // Random starting phase
                })
            }
            cursorOrb.x = canvas.width / 2
            cursorOrb.y = canvas.height / 2
            mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 }
        }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initOrbs()
        }

        resize()
        window.addEventListener("resize", resize)

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener("mousemove", handleMouseMove)

        const lerpColor = (start: Color, end: Color, t: number): Color => {
            return {
                r: start.r + (end.r - start.r) * t,
                g: start.g + (end.g - start.g) * t,
                b: start.b + (end.b - start.b) * t,
            }
        }

        const animate = () => {
            if (!ctx || !canvas) return

            // Clear with Soft Lavender/White tint base to reduce "empty white space" feel
            ctx.fillStyle = "#FAF5FF" // Very light purple/rose tint
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Global time scalar for slow oscillation speed
            const time = Date.now() * 0.0008

            // 1. Background Orbs (Ambient Auto-Flow + Oscillating Colors)
            orbs.forEach((orb, i) => {
                // Parallax approximation via depth factor
                const depthFactor = 1 + (i % 3) * 0.2

                // Automatic wide horizontal drift
                orb.x += orb.vx * depthFactor
                orb.y += orb.vy * depthFactor

                // Wrap smoothly
                if (orb.x > canvas.width + orb.radius) {
                    orb.x = -orb.radius // Wrap to left
                }

                // Minimal vertical bouncing wrap
                if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
                if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius

                // Color Oscillation: Light <-> Dark "Breathing"
                // Sin wave mapped from [-1, 1] to [0, 1]
                const osc = (Math.sin(time + orb.phase) + 1) / 2
                // Interpolate between Dark (0) and Light (1)
                const currentColor = lerpColor(orb.colorPair[0], orb.colorPair[1], osc)

                // Mouse Influence (Responsive "Wave")
                const dx = mouseRef.current.x - orb.x
                const dy = mouseRef.current.y - orb.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                // Cursor provides local turbulence/pull on top of the flow
                if (dist < canvas.width * 1.5) {
                    const force = (canvas.width * 1.5 - dist) / (canvas.width * 1.5)
                    const pull = 0.008 * force * (1 / depthFactor)

                    orb.x += dx * pull
                    orb.y += dy * pull
                }

                const gradient = ctx.createRadialGradient(
                    orb.x, orb.y, 0,
                    orb.x, orb.y, orb.radius
                )
                const c = currentColor;
                // Higher opacity for visibility, relying on blend
                gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`)
                gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`)

                ctx.beginPath()
                ctx.fillStyle = gradient
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
                ctx.fill()
            })

            // 2. Cursor Orb (Liquid Leader)
            const targetX = mouseRef.current.x
            const targetY = mouseRef.current.y

            cursorOrb.x += (targetX - cursorOrb.x) * 0.12
            cursorOrb.y += (targetY - cursorOrb.y) * 0.12

            const cursorGradient = ctx.createRadialGradient(
                cursorOrb.x, cursorOrb.y, 0,
                cursorOrb.x, cursorOrb.y, cursorOrb.radius
            )
            // Brighter center, pure light
            cursorGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
            cursorGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)")
            cursorGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

            // 'Overlay' for that lighting effect to cut through the flow
            ctx.globalCompositeOperation = 'overlay'
            ctx.beginPath()
            ctx.fillStyle = cursorGradient
            ctx.arc(cursorOrb.x, cursorOrb.y, cursorOrb.radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalCompositeOperation = 'source-over'

            requestRef.current = requestAnimationFrame(animate)
        }

        requestRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("resize", resize)
            window.removeEventListener("mousemove", handleMouseMove)
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [isMobile])

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#F8F7FC]">
            {/* Noise Texture */}
            <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none z-10 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ filter: 'blur(50px)' }}
            />
        </div>
    )
}
