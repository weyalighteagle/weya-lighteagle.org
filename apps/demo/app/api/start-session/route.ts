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
      console.error("❌ API Key missing!");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { persona, firstName, lastName } = body;

    let selectedContextId = "";

    if (persona === "weya_live") {
      selectedContextId = CONTEXT_ID_WEYA_LIVE;
    } else if (persona === "weya_startup") {
      selectedContextId = CONTEXT_ID_WEYA_STARTUP;
    } else if (persona === "family_offices") {
      selectedContextId = CONTEXT_ID_FAMILY_OFFICES;
    } else if (persona === "fund_builders") {
      selectedContextId = CONTEXT_ID_FUND_BUILDERS;
    } else if (persona === "impact_startups") {
      selectedContextId = CONTEXT_ID_IMPACT_STARTUPS;
    } else if (persona === "light_eagle") {
      selectedContextId = CONTEXT_ID_LIGHT_EAGLE;
    } else {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

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
