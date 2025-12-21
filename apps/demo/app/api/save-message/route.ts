import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sender,
      message,
      session_id,
      firstName,
      lastName,
      email,
      persona,
      timestamp,
      input_type,
    } = body;

    const finalTimestamp =
      typeof timestamp === "number" ? timestamp : Date.now();

    // ================= FORM =================
    if (input_type === "form") {
      if (!session_id || !firstName || !lastName || !email || !persona) {
        return NextResponse.json(
          { error: "Missing form fields" },
          { status: 400 },
        );
      }

      await supabase.from("chat_transcripts").insert({
        session_id,
        sender: "user",
        input_type: "form",
        message: `Form submitted – persona: ${persona}`,
        client_timestamp: finalTimestamp,
        user_name: `${firstName} ${lastName}`,
        user_email: email.trim(),
      });

      return NextResponse.json({ success: true });
    }

    // ================= TEXT =================
    if (!sender || !message || !session_id) {
      return NextResponse.json(
        { error: "Missing chat fields" },
        { status: 400 },
      );
    }

    // 🔒 SESSION META GUARD (KRİTİK)
    const { data: sessionMeta } = await supabase
      .from("chat_transcripts")
      .select("user_name, user_email")
      .eq("session_id", session_id)
      .eq("input_type", "session")
      .limit(1)
      .single();

    if (!sessionMeta) {
      return NextResponse.json(
        { error: "Session not initialized yet" },
        { status: 409 },
      );
    }

    await supabase.from("chat_transcripts").insert({
      session_id,
      sender,
      message,
      input_type: input_type || "text",
      client_timestamp: finalTimestamp,
      user_name: sessionMeta.user_name,
      user_email: sessionMeta.user_email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("save-message fatal:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
