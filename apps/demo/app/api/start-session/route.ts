import { NextResponse } from "next/server";
import {
  API_KEY,
  API_URL,
  AVATAR_ID,
  VOICE_ID,
  CONTEXT_ID_WEYA_LIVE,
  CONTEXT_ID_WEYA_STARTUP,
  CONTEXT_ID_FAMILY_OFFICES,
  CONTEXT_ID_FUND_BUILDERS,
  CONTEXT_ID_IMPACT_STARTUPS,
  CONTEXT_ID_LIGHT_EAGLE,
  LANGUAGE,
} from "../secrets";
import { supabase } from "../../../src/utils/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    /* 1️⃣ Guard */
    if (!API_KEY) {
      return NextResponse.json(
        { error: "API Key missing" },
        { status: 500 }
      );
    }

    /* 2️⃣ Body */
    const body = await request.json().catch(() => ({}));
    const { persona } = body;

    /* 3️⃣ Persona → Context */
    let selectedContextId: string | null = null;

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
        return NextResponse.json(
          { error: "Invalid persona" },
          { status: 400 }
        );
    }

    /* 4️⃣ Create LiveAvatar session */
    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,          // ✅ sadece burada
        avatar_persona: {
          voice_id: VOICE_ID,
          context_id: selectedContextId,
          language: LANGUAGE,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.data?.session_id) {
      return NextResponse.json(
        { error: data?.message || "Failed to get token" },
        { status: res.status || 500 }
      );
    }

    const sessionId = data.data.session_id;

    /* 5️⃣ SESSION START META (SYSTEM) */
    await supabase.from("chat_transcripts").insert({
      session_id: sessionId,
      sender: "system",          // ❗ user DEĞİL
      input_type: "system",      // ya da "text"
      message: "__SESSION_START__",
      client_timestamp: Date.now(),
    });

    /* 6️⃣ Return */
    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: sessionId,
    });
  } catch (error) {
    console.error("Server Error (start-session):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
