import { NextResponse } from "next/server";
import {
  API_KEY,
  LIVEAVATAR_BACKEND_API_URL,
  AVATAR_ID,
  VOICE_ID,
  CONTEXT_ID_WEYA_LIVE,
  CONTEXT_ID_WEYA_STARTUP,
  CONTEXT_ID_FAMILY_OFFICES,
  CONTEXT_ID_FUND_BUILDERS,
  CONTEXT_ID_IMPACT_STARTUPS,
  CONTEXT_ID_LIGHT_EAGLE,
} from "../secrets";
import { supabase } from "../../../src/utils/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { persona, firstName, lastName, email, language } = body;

    /* ---------------- CONTEXT (AYNI) ---------------- */

    let selectedContextId = "";

    switch (persona) {
      case "weya_live":
        selectedContextId = CONTEXT_ID_WEYA_LIVE;
        break;
      case "weya_startup":
        selectedContextId = CONTEXT_ID_WEYA_STARTUP;
        break;
      case "family_offices":
        selectedContextId = CONTEXT_ID_FAMILY_OFFICES;
        break;
      case "fund_builders":
        selectedContextId = CONTEXT_ID_FUND_BUILDERS;
        break;
      case "impact_startups":
        selectedContextId = CONTEXT_ID_IMPACT_STARTUPS;
        break;
      case "light_eagle":
        selectedContextId = CONTEXT_ID_LIGHT_EAGLE;
        break;
      default:
        return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    /* ---------------- LANGUAGE (ASIL DÜZELTME) ---------------- */
    // Frontend ne gönderirse onu kullan
    // Göndermezse default: en-US

    const resolvedLanguage =
      typeof language === "string" && language.trim().length > 0
        ? language
        : "en-US";

    /* ---------------- API CALL ---------------- */

    const res = await fetch(`${LIVEAVATAR_BACKEND_API_URL}/v1/sessions/token`, {
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
          language: resolvedLanguage,
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

    /* ---------------- DB (RESILIENT) ---------------- */
    const sessionId = data.data.session_id;

    try {
      await supabase.from("chat_transcripts").insert({
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
        language: resolvedLanguage,
      });
    } catch (dbErr) {
      console.error("Database logging failed (non-blocking):", dbErr);
    }

    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: sessionId,
    });
  } catch (err) {
    console.error("Critical error in start-session:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
