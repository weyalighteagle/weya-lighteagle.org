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
    const { persona, firstName, lastName, email } = body;

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

    /* -------------------------------------------------
       1️⃣ CREATE SESSION TOKEN
    -------------------------------------------------- */
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
          avatar_id: AVATAR_ID,
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

    const { session_id, session_token } = tokenData.data;

    /* -------------------------------------------------
       2️⃣ START SESSION (KRİTİK EKSİK PARÇA)
    -------------------------------------------------- */
    const startRes = await fetch(`${API_URL}/v1/sessions/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session_token}`,
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

    /* -------------------------------------------------
       3️⃣ METADATA INSERT (AYNI)
    -------------------------------------------------- */
    const { error: metaError } = await supabase
      .from("chat_transcripts")
      .insert({
        session_id,
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
      console.error("Session meta insert failed:", metaError);
    }

    /* -------------------------------------------------
       4️⃣ FRONTEND’E DÖN
    -------------------------------------------------- */
    return NextResponse.json({
      session_token,
      session_id,
    });
  } catch (err) {
    console.error("Server Error (start-session):", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
