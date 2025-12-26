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
        // Check for specific OpenAI errors
        if (error.response) {
            console.error(error.response.status, error.response.data);
        }
        return NextResponse.json({
            error: error.message || "STT Failed",
            details: error.toString()
        }, { status: 500 })
    }
}
