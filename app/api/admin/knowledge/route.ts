import { readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get("personaId")

    if (!personaId) {
        return NextResponse.json({ error: "Missing personaId" }, { status: 400 })
    }

    try {
        // 1. Try fetching from Supabase
        const { data, error } = await supabase
            .from("weya_voicechat_kb")
            .select("content")
            .eq("persona_id", personaId)
            .single()

        if (data && data.content) {
            return NextResponse.json({ content: data.content })
        }

        // 2. Fallback to local file if not in DB yet
        const filePath = path.join(process.cwd(), "data", "knowledge", `${personaId}.md`)
        try {
            const content = await readFile(filePath, "utf-8")
            return NextResponse.json({ content })
        } catch (fsError) {
            // File also missing
            return NextResponse.json({ content: "" })
        }

    } catch (error) {
        console.error(`Error fetching knowledge for ${personaId}:`, error)
        return NextResponse.json({ content: "" })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { personaId, content, password } = body

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!personaId || typeof content !== "string") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        }

        // Upsert to Supabase
        const { error } = await supabase
            .from("weya_voicechat_kb")
            .upsert(
                { persona_id: personaId, content, updated_at: new Date().toISOString() },
                { onConflict: "persona_id" }
            )

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Error writing knowledge:", error)
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 })
    }
}
