import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, personaId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      console.warn("ELEVENLABS_API_KEY not set")
      return NextResponse.json({ error: "TTS configuration missing" }, { status: 503 })
    }

    // Use the generic voice ID for all personas as requested
    const voiceId = process.env.ELEVENLABS_VOICE_ID

    if (!voiceId) {
      console.error("ELEVENLABS_VOICE_ID is not set")
      return NextResponse.json({ error: "Voice ID configuration missing" }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Faster model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API Error:", errorText)
      return NextResponse.json({
        error: "TTS generation failed",
        details: errorText
      }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    // Return audio as a stream/blob
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })

  } catch (error) {
    console.error("TTS API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
