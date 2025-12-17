import { NextResponse } from "next/server";
import {
  API_KEY,
  API_URL,
  AVATAR_ID,
  VOICE_ID,
  CONTEXT_ID,
  CONTEXT_ID_WEYA_LIVE,
  CONTEXT_ID_WEYA_STARTUP,
  LANGUAGE,
} from "../secrets";

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      console.error(
        "❌ API Key missing! Make sure LIVEAVATAR_API_KEY is set in apps/demo/.env.local",
      );
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // Parse body for persona
    const body = await request.json().catch(() => ({}));
    const { persona } = body;

    let selectedContextId = CONTEXT_ID;

    // Select context based on persona
    if (persona === "weya_live") {
      if (!CONTEXT_ID_WEYA_LIVE) {
        console.error("❌ Missing CONTEXT_ID_WEYA_LIVE");
        return NextResponse.json(
          { error: "Configuration error: Weya Live context missing" },
          { status: 500 },
        );
      }
      selectedContextId = CONTEXT_ID_WEYA_LIVE;
    } else if (persona === "weya_startup") {
      if (!CONTEXT_ID_WEYA_STARTUP) {
        console.error("❌ Missing CONTEXT_ID_WEYA_STARTUP");
        return NextResponse.json(
          { error: "Configuration error: Weya Startup context missing" },
          { status: 500 },
        );
      }
      selectedContextId = CONTEXT_ID_WEYA_STARTUP;
    } else if (persona) {
      // If persona provided but unknown
      return NextResponse.json(
        { error: "Invalid persona. Must be 'weya_live' or 'weya_startup'" },
        { status: 400 },
      );
    }

    // HeyGen session token oluştur
    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,
        avatar_persona: {
          avatar_id: AVATAR_ID,
          voice_id: VOICE_ID,
          context_id: selectedContextId,
          language: LANGUAGE,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("LiveAvatar API Error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to get token" },
        { status: res.status },
      );
    }

    // 🔥 Token ve Session ID başarıyla döndür
    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: data.data.session_id,
    });
  } catch (error: unknown) {
    console.error("Server Error (start-session route):", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
