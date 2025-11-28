import { NextResponse } from "next/server";
import {
  API_KEY,
  API_URL,
  AVATAR_ID,
  VOICE_ID,
  CONTEXT_ID,
  LANGUAGE,
} from "../secrets";

export async function POST() {
  try {
    if (!API_KEY) {
      console.error(
        "❌ API Key missing! Make sure LIVEAVATAR_API_KEY is set in apps/demo/.env.local",
      );
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // console.log("✅ API Key found. Requesting token from LiveAvatar API...");

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
          context_id: CONTEXT_ID,
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

    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: data.data.session_id,
    });
  } catch (error) {
    console.error("Server Error (route.ts):", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
