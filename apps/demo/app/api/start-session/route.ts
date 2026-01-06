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
    if (!API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { persona = "weya_live", firstName, lastName, email } = body;

    let context_id: string | undefined;

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
        return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY, // ⬅️ DOĞRU HEADER
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

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.data?.[0]?.message || "Failed to get token" },
        { status: res.status },
      );
    }

    const sessionId = data.data.session_id;
    const sessionToken = data.data.session_token;

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
    });

    return NextResponse.json({
      session_token: sessionToken,
      session_id: sessionId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
