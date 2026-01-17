import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            sessionId,
            personaId,
            role,
            content,
            userData,
            metadata
        } = body

        if (!sessionId || !role || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const user_name = ((userData?.firstName || "") + " " + (userData?.lastName || "")).trim()

        const { error } = await supabase.from("voice_chat_logs").insert({
            session_id: sessionId,
            persona_id: personaId || "unknown",
            user_email: userData?.email || "anonymous",
            user_name: user_name || "Anonymous",
            role: role,
            content: content,
            metadata: metadata || {}
        })

        if (error) {
            console.error("Supabase log error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error("Log API error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
