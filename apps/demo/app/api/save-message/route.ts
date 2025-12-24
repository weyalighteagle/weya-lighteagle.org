import { NextResponse } from "next/server";

// 🔴 anon yerine SERVER client
import { supabaseServer as supabase } from "../../../src/utils/supabase-server";

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

    // 🔒 Sert ama net validation
    if (!sender || !message || !session_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ⏱️ timestamp fallback
    const finalTimestamp =
      typeof timestamp === "number" ? timestamp : Date.now();

    let finalUserName = user_name || null;
    let finalUserEmail = user_email || null;

    // 🔥 FALLBACK: session-level metadata’dan çek
    if (!finalUserName || !finalUserEmail) {
      const { data: meta, error: metaError } = await supabase
        .from("chat_transcripts")
        .select("user_name, user_email")
        .eq("session_id", session_id)
        .eq("input_type", "session")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (metaError) {
        console.error("⚠️ Session meta fetch failed:", metaError);
      }

      if (meta) {
        finalUserName = finalUserName || meta.user_name;
        finalUserEmail = finalUserEmail || meta.user_email;
      }
    }

    // ✅ ARTIK HER ZAMAN YAZILIR
    const { error } = await supabase.from("chat_transcripts").insert({
      session_id,
      sender,
      message,
      input_type: input_type || "text",
      client_timestamp: finalTimestamp,
      user_name: finalUserName,
      user_email: finalUserEmail,
    });

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ save-message error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
