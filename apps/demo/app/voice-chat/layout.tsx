import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Voice Chat Interview",
    description: "Voice-enabled AI interview session",
}

export default function VoiceChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="voice-chat-layout h-full w-full">
            {children}
        </div>
    )
}
