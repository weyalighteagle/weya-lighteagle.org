import { readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { basePrompts } from "./prompts"

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const startTime = Date.now()
    const body = await request.json()
    const { personaId, sessionId, userMessage, messages } = body

    // Determine the actual message to send (userMessage or last from messages)
    const currentMessage = userMessage || (messages && messages.length > 0 ? messages[messages.length - 1].content : "")

    if (!currentMessage) {
      return NextResponse.json(
        { error: "Missing userMessage" },
        { status: 400 }
      )
    }

    // Load Knowledge Base (Keeping existing logic for context)
    let knowledgeContext = ""
    let targetPersonaId = personaId || "impact_startups"
    // ... existing knowledge fetch logic ...

    // Construct System Prompt
    const basePrompt = basePrompts[targetPersonaId] || basePrompts["impact_startups"]

    // Check for Interview Mode
    const { nextQuestion, isInterviewMode } = body

    let systemPrompt = ""

    if (isInterviewMode) {
      // INTERVIEW AGENT PROTOCOL
      systemPrompt = `
You are Weya, a professional and neutral interviewer.
You are currently conducting a structured interview.

CRITICAL RULES:
1. You must ONLY ask the "NEXT QUESTION" provided below.
2. Acknowledge the user's previous answer using professional, varied, and neutral phrases (e.g. "I understand, thank you for sharing that," "Clear, let's move forward," "Got it, thank you for the insight").
3. PERMISSION TO SPEAK FREELY IS DENIED. You are a script reader.
4. Do NOT judge or evaluate the answer (e.g. avoid "That's a great strategy"). Be strictly neutral.
5. If the user asks a question, politely deflect and ask the NEXT QUESTION.

NEXT QUESTION TO ASK: "${nextQuestion || 'Thank you for your time. The interview is complete.'}"

If "nextQuestion" is null or empty, thank the user and wrap up.
`.trim()
    } else {
      // Standard Chat Mode (Fetch RAG)

      // Load Knowledge Base
      let knowledgeContext = ""
      let targetPersonaId = personaId || "impact_startups"

      try {
        console.log(`[RAG] Fetching knowledge for persona: ${targetPersonaId}`)
        // 1. Try Supabase
        const { supabase } = await import("@/lib/supabase")
        const { data } = await supabase
          .from("weya_voicechat_kb")
          .select("content")
          .eq("persona_id", targetPersonaId)
          .single()

        if (data && data.content) {
          knowledgeContext = data.content
          console.log(`[RAG] Found context in DB. Length: ${knowledgeContext.length}`)
        } else {
          console.log(`[RAG] No context found in DB for ${targetPersonaId}`)
          throw new Error("No data in Supabase")
        }
      } catch (dbError) {
        console.warn(`Knowledge not found in DB for ${targetPersonaId}, falling back to file.`)
        // 2. Fallback to file
        try {
          const knowledgePath = path.join(process.cwd(), "data", "knowledge", `${targetPersonaId}.md`)
          knowledgeContext = await readFile(knowledgePath, "utf-8")
          console.log(`[RAG] Found context in File. Length: ${knowledgeContext.length}`)
        } catch (err) {
          console.warn(`Could not load knowledge file, using default fallback.`)
          try {
            const defaultPath = path.join(process.cwd(), "data", "knowledge", "impact_startups.md")
            knowledgeContext = await readFile(defaultPath, "utf-8")
          } catch (fallbackErr) {
            knowledgeContext = ""
          }
        }
      }

      // Standard Prompt Construction
      systemPrompt = `${basePrompt}\n\n--- KNOWLEDGE BASE (persona-specific, authoritative) ---\n${knowledgeContext}\n--- END KNOWLEDGE BASE ---\n`
      // console.log("[RAG] System Prompt Preview:", systemPrompt.substring(0, 200))
    }

    // Construct Messages for OpenAI
    const openAIMessages = [
      { role: "system", content: systemPrompt },
      ...(messages ? messages.map((m: any) => ({ role: m.role, content: m.content })) : []),
      ...(!messages || messages.length === 0 || messages[messages.length - 1].content !== currentMessage
        ? [{ role: "user" as const, content: currentMessage }]
        : [])
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAIMessages as any,
      temperature: 0.7,
    })

    const assistantText = completion.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    // --- LOGGING TO SUPABASE ---
    const endTime = Date.now()
    const latencyMs = endTime - startTime

    try {
      const { supabase } = await import("@/lib/supabase")
      const { userData, sessionId, mode } = body // Extract mode

      const metadata = {
        mode: mode || "text",
        tts_provider: "ElevenLabs",
        voice_id: process.env.ELEVENLABS_VOICE_ID || "unknown",
        latency_ms: latencyMs,
        // KB IDs are deeper to extract, but we can log that we used Supabase or File
        kb_source: knowledgeContext ? "Supabase/File" : "None"
      }

      // Log User Message
      await supabase.from("voice_chat_logs").insert({
        session_id: sessionId || "unknown",
        persona_id: targetPersonaId,
        user_email: userData?.email || "anonymous",
        user_name: ((userData?.firstName || "") + " " + (userData?.lastName || "")).trim(),
        role: "user",
        content: currentMessage,
        metadata: { ...metadata, role: "user" }
      })

      // Log Assistant Message
      await supabase.from("voice_chat_logs").insert({
        session_id: sessionId || "unknown",
        persona_id: targetPersonaId,
        user_email: userData?.email || "anonymous",
        user_name: ((userData?.firstName || "") + " " + (userData?.lastName || "")).trim(),
        role: "assistant",
        content: assistantText,
        metadata: { ...metadata, role: "assistant" }
      })
    } catch (logError) {
      console.error("Failed to log chat to Supabase:", logError)
      // Don't block the response if logging fails
    }

    return NextResponse.json({
      assistantText: assistantText
    })

  } catch (error: any) {
    console.error("Error in chat route:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
