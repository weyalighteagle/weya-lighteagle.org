import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sender,
      message,
      timestamp,
      session_id,
      input_type,
      user_name,
      user_email,
    } = body;

    if (!sender || !message || !timestamp || !session_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let finalUserName = user_name || null;
    let finalUserEmail = user_email || null;

    // 🔥 FALLBACK: session metadata’dan çek
    if (!finalUserName || !finalUserEmail) {
      const { data: meta } = await supabase
        .from("chat_transcripts")
        .select("user_name, user_email")
        .eq("session_id", session_id)
        .eq("input_type", "meta")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (meta) {
        finalUserName = finalUserName || meta.user_name;
        finalUserEmail = finalUserEmail || meta.user_email;
      }
    }

    const { error } = await supabase.from("chat_transcripts").insert({
      session_id,
      sender,
      message,
      input_type: input_type || "text",
      client_timestamp: timestamp,
      user_name: finalUserName,
      user_email: finalUserEmail,
    });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ save-message error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
