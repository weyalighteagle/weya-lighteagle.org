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
  CONTEXT_ID_WEYA_INTERNSHIP,
  FBN_AVATAR_ID,
  CONTEXT_ID_FBN_IMPACT,
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
      case "weya_internship":
        selectedContextId = CONTEXT_ID_WEYA_INTERNSHIP;
        break;
      case "fbn_impact":
        selectedContextId = CONTEXT_ID_FBN_IMPACT;
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

    console.log(`[start-session] persona=${persona}, contextId=${selectedContextId ? selectedContextId.substring(0, 8) + '...' : 'EMPTY'}, language=${resolvedLanguage}`);
    console.log(`[start-session] AVATAR_ID=${AVATAR_ID ? 'set' : 'EMPTY'}, VOICE_ID=${VOICE_ID ? 'set' : 'EMPTY'}, API_KEY=${API_KEY ? 'set' : 'EMPTY'}`);
    console.log(`[start-session] BACKEND_URL=${LIVEAVATAR_BACKEND_API_URL}`);

    const res = await fetch(`${LIVEAVATAR_BACKEND_API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: persona === "fbn_impact" ? FBN_AVATAR_ID : AVATAR_ID,
        avatar_persona: {
          avatar_id: persona === "fbn_impact" ? FBN_AVATAR_ID : AVATAR_ID,
          voice_id: VOICE_ID,
          context_id: selectedContextId,
          language: resolvedLanguage,
        },
      }),
    });

    const data = await res.json();

    console.log(`[start-session] HeyGen response status: ${res.status}`);
    console.log(`[start-session] HeyGen response:`, JSON.stringify(data).substring(0, 500));

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to get token" },
        { status: res.status },
      );
    }

    /* ---------------- DB ---------------- */

    const sessionId = data.data.session_id;

    // Save session metadata to the appropriate table
    let tableName: string;
    if (persona === "weya_internship") {
      tableName = "internship_chat_history";
    } else if (persona === "fbn_impact") {
      tableName = "fbnimpact_chat_history";
    } else {
      tableName = "chat_transcripts";
    }

    const insertData: Record<string, unknown> = {
      session_id: sessionId,
      sender: "user",
      input_type: "session",
      message: "__SESSION_META__",
      client_timestamp: Date.now(),
    };

    // Add user info for tables that support it
    if (tableName === "chat_transcripts" || tableName === "fbnimpact_chat_history") {
      insertData.user_name = firstName || lastName
        ? `${firstName || ""} ${lastName || ""}`.trim()
        : null;
      insertData.user_email = email || null;
      insertData.language = resolvedLanguage;
    }

    await supabase.from(tableName).insert(insertData);

    return NextResponse.json({
      session_token: data.data.session_token,
      session_id: sessionId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
