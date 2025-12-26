import { readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get("personaId")

    // Security Check
    const authHeader = request.headers.get("x-admin-password")
    if (authHeader !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
        const { personaId, content, password, validateOnly } = body

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (validateOnly) {
            return NextResponse.json({ success: true, message: "Authorized" })
        }

        if (body.action === 'read') {
            if (!personaId) return NextResponse.json({ error: "Missing personaId" }, { status: 400 })

            // 1. Try fetching from Supabase
            const { data } = await supabase
                .from("weya_voicechat_kb")
                .select("content")
                .eq("persona_id", personaId)
                .single()

            if (data && data.content) {
                return NextResponse.json({ content: data.content })
            }

            // 2. Fallback to local file
            const filePath = path.join(process.cwd(), "data", "knowledge", `${personaId}.md`)
            try {
                const fileContent = await readFile(filePath, "utf-8")
                return NextResponse.json({ content: fileContent })
            } catch (fsError) {
                return NextResponse.json({ content: "" })
            }
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
