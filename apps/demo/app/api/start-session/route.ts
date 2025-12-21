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
import { createClient } from "@supabase/supabase-js";

// 🔐 SERVICE ROLE CLIENT (SADECE SERVER)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      console.error("❌ API Key missing!");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { persona, firstName, lastName, email } = body;

    let selectedContextId = "";

    if (persona === "weya_live") {
      selectedContextId = CONTEXT_ID_WEYA_LIVE;
    } else if (persona === "weya_startup") {
      selectedContextId = CONTEXT_ID_WEYA_STARTUP;
    } else {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
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
      return NextResponse.json(
        { error: data.message || "Failed to get token" },
        { status: res.status },
      );
    }

    const sessionId = data.data.session_id;

    // ================= SESSION HEADER ROW =================
    // 🔥 FORM VERİSİ — SESSION LEVEL (GARANTİLİ WRITE)
    const { error: metaError } = await supabaseAdmin
      .from("chat_transcripts")
      .insert({
        session_id: sessionId,
        sender: "user",
        input_type: "session",
        message: "__SESSION_META__",
        client_timestamp: Date.now(),
        user_name:
          firstName || lastName
            ? `${firstName || ""} ${lastName || ""}`.trim()
            : null,
        user_email: email || null,
      });

    if (metaError) {
      console.error("❌ Session meta insert failed:", metaError);
      // ❗ Session devam eder, chat bozulmaz
    }

    // ================= RESPONSE =================
    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: sessionId,
    });
  } catch (error: unknown) {
    console.error("Server Error (start-session):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
