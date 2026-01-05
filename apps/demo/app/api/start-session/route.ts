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
    /* --------------------------------------------------
       1️⃣ Guard: API key
    -------------------------------------------------- */
    if (!API_KEY) {
      console.error("❌ API Key missing!");
      return NextResponse.json(
        { error: "API Key missing" },
        { status: 500 }
      );
    }

    /* --------------------------------------------------
       2️⃣ Parse body
    -------------------------------------------------- */
    const body = await request.json().catch(() => ({}));
    const { persona, firstName, lastName, email } = body;

    /* --------------------------------------------------
       3️⃣ Persona → Context mapping
    -------------------------------------------------- */
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

    if (!selectedContextId) {
      return NextResponse.json(
        { error: "Context ID not configured" },
        { status: 500 }
      );
    }

    /* --------------------------------------------------
       4️⃣ Create LiveAvatar session
    -------------------------------------------------- */
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

    if (!res.ok || !data?.data?.session_id) {
      console.error("❌ LiveAvatar session error:", data);
      return NextResponse.json(
        { error: data?.message || "Failed to create session" },
        { status: res.status || 500 }
      );
    }

    const sessionId = data.data.session_id;

    /* --------------------------------------------------
       5️⃣ Insert SESSION META (DB-safe)
    -------------------------------------------------- */
    const fullName =
      firstName || lastName
        ? `${firstName || ""} ${lastName || ""}`.trim()
        : null;

    const { error: metaError } = await supabase
      .from("chat_transcripts")
      .insert({
        session_id: sessionId,
        sender: "system",                 // ✅ NOT user
        input_type: "system",             // ✅ CHECK-constraint safe
        message: "__SESSION_META__",       // ✅ marker
        client_timestamp: Date.now(),
        user_name: fullName,
        user_email: email || null,
      });

    if (metaError) {
      console.error("❌ Session meta insert failed:", metaError);
      // deliberately NOT failing request
    }

    /* --------------------------------------------------
       6️⃣ Return token
    -------------------------------------------------- */
    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: sessionId,
    });
  } catch (error) {
    console.error("❌ Server Error (start-session):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
