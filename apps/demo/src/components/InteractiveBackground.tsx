"use client"

export function InteractiveBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-full h-full bg-white">
            {/* Base White Layer */}
            <div className="absolute inset-0 bg-white" />

            {/* "Blushed" Effect - Defined Circular Glows on White with Brand Lilac (#B69DF8) */}

            {/* Lilac Blush (Brand Match) - Center / Upper Center */}
            <div
                className="absolute top-[15%] left-[25%] w-[50%] h-[40%] rounded-full bg-[#B69DF8] opacity-35 blur-[100px]"
                aria-hidden="true"
            />

            {/* Soft Purple Blush - Top Left Area */}
            <div
                className="absolute top-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-[#E6E6FA] opacity-45 blur-[100px]"
                aria-hidden="true"
            />

            {/* Soft Pink Blush - Top Right Area */}
            <div
                className="absolute top-[0%] right-[10%] w-[45%] h-[45%] rounded-full bg-[#FFD1DC] opacity-40 blur-[85px]"
                aria-hidden="true"
            />

            {/* Pink Blush - Bottom Left Area */}
            <div
                className="absolute bottom-[10%] left-[-5%] w-[55%] h-[55%] rounded-full bg-[#FADADD] opacity-50 blur-[100px]"
                aria-hidden="true"
            />

            {/* Lilac Blush (Brand Match) - Bottom Right Area */}
            <div
                className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] rounded-full bg-[#B69DF8] opacity-30 blur-[90px]"
                aria-hidden="true"
            />

            {/* Purple Blush - Lower Left Center */}
            <div
                className="absolute bottom-[20%] left-[30%] w-[35%] h-[35%] rounded-full bg-[#F3E5F5] opacity-45 blur-[80px]"
                aria-hidden="true"
            />

            {/* Noise Texture Overlay for Premium Feel */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    )
}
