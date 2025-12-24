import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(req: Request) {
  try {
    const { session_id, firstName, lastName, email } = await req.json();

    if (!session_id) {
      return NextResponse.json({ error: "no session_id" }, { status: 400 });
    }

    const { error } = await supabase.from("chat_transcripts").insert({
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

    if (error) {
      console.error("save-session-meta error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
