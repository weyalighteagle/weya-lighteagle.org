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
  let session_token = "";
  let session_id = "";

  try {
    /* -------------------- 1️⃣ Body -------------------- */
    const body = await request.json().catch(() => ({}));
    const { persona } = body;

    /* -------------------- 2️⃣ Persona → Context -------------------- */
    let context_id: string | null = null;

    switch (persona) {
      case "weya_live":
        context_id = CONTEXT_ID_WEYA_LIVE;
        break;
      case "weya_startup":
        context_id = CONTEXT_ID_WEYA_STARTUP;
        break;
      case "family_offices":
        context_id = CONTEXT_ID_FAMILY_OFFICES;
        break;
      case "fund_builders":
        context_id = CONTEXT_ID_FUND_BUILDERS;
        break;
      case "impact_startups":
        context_id = CONTEXT_ID_IMPACT_STARTUPS;
        break;
      case "light_eagle":
        context_id = CONTEXT_ID_LIGHT_EAGLE;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid persona" },
          { status: 400 }
        );
    }

    /* -------------------- 3️⃣ Create session (baseline logic) -------------------- */
    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,
        avatar_persona: {
          voice_id: VOICE_ID,
          context_id,
          language: LANGUAGE,
        },
      }),
    });

    if (!res.ok) {
      const resp = await res.json();
      const errorMessage =
        resp?.data?.[0]?.message ?? "Failed to retrieve session token";
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    session_token = data.data.session_token;
    session_id = data.data.session_id;
  } catch (error) {
    console.error("Error retrieving session token:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }

  if (!session_token || !session_id) {
    return NextResponse.json(
      { error: "Failed to retrieve session token" },
      { status: 500 }
    );
  }

  /* -------------------- 4️⃣ SESSION START MARKER -------------------- */
  // Sadece sistem işareti – gerçek konuşmalar etkilenmez
  const { error: dbError } = await supabase
    .from("chat_transcripts")
    .insert({
      session_id,
      sender: "system",
      input_type: "text", // constraint-safe
      message: "__SESSION_START__",
      client_timestamp: Date.now(),
    });

  if (dbError) {
    console.error("❌ Session meta insert failed:", dbError);
  }

  /* -------------------- 5️⃣ Return (baseline response shape) -------------------- */
  return NextResponse.json(
    { session_token, session_id },
    { status: 200 }
  );
}
