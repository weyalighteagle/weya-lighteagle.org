import { NextResponse } from "next/server"
import { basePrompts } from "../chat/prompts"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const personaId = searchParams.get("personaId") || "impact_startups"

        // 1. Fetch Knowledge Base
        let knowledgeContext = ""
        console.log(`[Session] Fetching knowledge for persona: ${personaId}`)

        try {
            const { supabase } = await import("@/lib/supabase")
            const { data } = await supabase
                .from("weya_voicechat_kb")
                .select("content")
                .eq("persona_id", personaId)
                .single()

            if (data?.content) {
                knowledgeContext = data.content
                console.log(`[Session] Knowledge loaded from DB. Length: ${knowledgeContext.length}`)
            } else {
                console.warn("[Session] No knowledge found in DB.")
            }
        } catch (e) {
            console.warn("[Session] Supabase load failed, checking file...")
            try {
                // Fallback to file
                const filePath = path.join(process.cwd(), "data", "knowledge", `${personaId}.md`)
                knowledgeContext = await readFile(filePath, "utf-8")
                console.log(`[Session] File fallback loaded. Length: ${knowledgeContext.length}`)
            } catch (err) {
                console.error("[Session] File fallback failed")
            }
        }

        const basePrompt = basePrompts[personaId] || basePrompts["impact_startups"]
        const instructions = `${basePrompt}\n\n--- KNOWLEDGE BASE ---\n${knowledgeContext}\n--- END KNOWLEDGE BASE ---\n`

        // 2. Create Session with Instructions
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-10-01",
                voice: "alloy",
                instructions: instructions,
                turn_detection: { type: "server_vad" },
                input_audio_transcription: { model: "whisper-1" }
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json(error, { status: response.status })
        }

        const data = await response.json()

        // Return the ephemeral token to the client
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Session Error:", error)
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }
}
