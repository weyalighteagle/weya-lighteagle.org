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
    const { persona, firstName, lastName, email } = body;

    let selectedContextId = "";

    if (persona === "weya_live") selectedContextId = CONTEXT_ID_WEYA_LIVE;
    else if (persona === "weya_startup") selectedContextId = CONTEXT_ID_WEYA_STARTUP;
    else if (persona === "family_offices") selectedContextId = CONTEXT_ID_FAMILY_OFFICES;
    else if (persona === "fund_builders") selectedContextId = CONTEXT_ID_FUND_BUILDERS;
    else if (persona === "impact_startups") selectedContextId = CONTEXT_ID_IMPACT_STARTUPS;
    else if (persona === "light_eagle") selectedContextId = CONTEXT_ID_LIGHT_EAGLE;
    else {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    /* 1️⃣ CREATE SESSION TOKEN */
    const tokenRes = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,
        avatar_persona: {
          voice_id: VOICE_ID,
          context_id: selectedContextId,
          language: LANGUAGE,
        },
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: tokenData.message || "Failed to create session token" },
        { status: tokenRes.status },
      );
    }

    const sessionToken = tokenData.data.session_token;

    /* 2️⃣ START SESSION (KRİTİK EKSİK OLAN KISIM) */
    const startRes = await fetch(`${API_URL}/v1/sessions/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        Accept: "application/json",
      },
    });

    const startData = await startRes.json();

    if (!startRes.ok) {
      return NextResponse.json(
        { error: startData.message || "Failed to start session" },
        { status: startRes.status },
      );
    }

    const sessionId = startData.data.session_id;

    /* 3️⃣ SESSION META INSERT (ARTIK GERÇEKTEN BAŞLAMIŞ SESSION) */
    const { error: metaError } = await supabase
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
    }

    /* 4️⃣ CLIENT'E DÖN */
    return NextResponse.json({
      session_id: sessionId,
      session_token: sessionToken,
      livekit: {
        url: startData.data.livekit_url,
        token: startData.data.livekit_client_token,
      },
      ws_url: startData.data.ws_url,
      max_session_duration: startData.data.max_session_duration,
    });
  } catch (error) {
    console.error("Server Error (start-session):", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
