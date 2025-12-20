import { NextResponse } from "next/server";
import {
  API_KEY,
  API_URL,
  AVATAR_ID,
  VOICE_ID,
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

    const body = await request.json().catch(() => ({}));
    const { persona } = body;

    let selectedContextId = "";

    if (persona === "weya_live") {
      selectedContextId = CONTEXT_ID_WEYA_LIVE;
    } else if (persona === "weya_startup") {
      selectedContextId = CONTEXT_ID_WEYA_STARTUP;
    } else {
      console.error("❌ Error: Invalid or missing persona:", persona);
      return NextResponse.json(
        { error: "Invalid persona. Must be 'weya_live' or 'weya_startup'" },
        { status: 400 },
      );
    }

    if (!selectedContextId) {
      return NextResponse.json(
        { error: "Context ID not configured for this persona" },
        { status: 500 },
      );
    }

    // ================= HEYGEN =================
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

    // ================= RESPONSE =================
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
