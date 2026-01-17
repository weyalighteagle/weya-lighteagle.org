import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get("personaId")

    if (!personaId) {
        return NextResponse.json({ error: "Missing personaId" }, { status: 400 })
    }

    try {
        const { data, error } = await supabase
            .from("weya_voicechat_kb")
            .select("intro_sentence")
            .eq("persona_id", personaId)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error("Supabase error fetching intro:", error)
        }

        const intro = data?.intro_sentence || "Hi! I am Weya the digital member of Light Eagle. How can I assist you?"

        // Fetch questions
        let questions: string[] = []
        try {
            const { data: qData, error: qError } = await supabase
                .from("weya_interview_questions")
                .select("question_text")
                .eq("persona_id", personaId)
                .order("order_index", { ascending: true })

            if (qData) {
                questions = qData.map(q => q.question_text)
            }
        } catch (e) {
            console.error("Error fetching questions:", e)
        }

        // Fallback Questions if DB is empty (for demo/testing)
        // Fallback Questions if DB is empty (for demo/testing) -- ONLY for impact_startups
        if (questions.length === 0 && personaId === "impact_startups") {
            questions = [
                "Could you briefly describe your background and what led you to found this company?",
                "What is the core problem you are solving, and why is it important right now?",
                "How does your solution create systemic impact beyond just financial returns?",
                "What is your long-term vision for where this company will be in 10 years?"
            ]
        }

        return NextResponse.json({ intro, questions })
    } catch (error: any) {
        console.error("Error fetching intro:", error)
        // Fallback
        return NextResponse.json({
            intro: "Hi! I am Weya the digital member of Light Eagle. How can I assist you?",
            questions: []
        })
    }
}
