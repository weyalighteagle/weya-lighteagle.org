import { NextResponse } from "next/server"
import OpenAI from "openai"
import { toFile } from "openai/uploads"



export async function POST(request: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const formData = await request.formData()
        const audioFile = formData.get("file") as Blob

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
        }

        // Convert Blob to File object that OpenAI expects
        const file = await toFile(audioFile, "audio.webm", { type: "audio/webm" })

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: "whisper-1",
            language: "en",
        })

        return NextResponse.json({ text: transcription.text })
    } catch (error: any) {
        console.error("STT API Critical Error:", error)

        let errorMessage = error.message || "STT Failed"
        let errorCode = "STT_FAILED"

        // Handle OpenAI specific errors
        if (error.status === 401) {
            errorMessage = "Invalid OpenAI API Key"
            errorCode = "INVALID_API_KEY"
        } else if (error.status === 429) {
            errorMessage = "OpenAI Rate Limit or Quota Exceeded. Please check your billing."
            errorCode = "QUOTA_EXCEEDED"
        } else if (error.message && error.message.includes("quota")) {
            errorMessage = "OpenAI Quota Exceeded. Please check your billing."
            errorCode = "QUOTA_EXCEEDED"
        }

        return NextResponse.json({
            error: errorMessage,
            code: errorCode,
            details: error.toString()
        }, { status: error.status || 500 })
    }
}
