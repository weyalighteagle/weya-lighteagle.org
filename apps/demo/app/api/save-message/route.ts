import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      // chat için
      sender,
      message,
      session_id,

      // form için
      firstName,
      lastName,
      email,
      persona,

      // ortak / opsiyonel
      timestamp,
      input_type,
    } = body;

    const finalTimestamp =
      typeof timestamp === "number" ? timestamp : Date.now();

    /**
     * =========================
     * 1️⃣ FORM SUBMIT AKIŞI
     * =========================
     */
    if (input_type === "form") {
      if (!firstName || !lastName || !email || !persona) {
        return NextResponse.json(
          { error: "Missing required form fields" },
          { status: 400 },
        );
      }

      const { error } = await supabase.from("chat_transcripts").insert({
        session_id: session_id || `form_${crypto.randomUUID()}`,
        sender: "user",
        message: `Form submitted – persona: ${persona}`,
        input_type: "form",
        client_timestamp: finalTimestamp,
        user_name: `${firstName} ${lastName}`,
        user_email: email,
      });

      if (error) {
        console.error("❌ Supabase form insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    /**
     * =========================
     * 2️⃣ CHAT MESSAGE AKIŞI
     * =========================
     */
    if (!sender || !message || !session_id) {
      return NextResponse.json(
        { error: "Missing required chat fields" },
        { status: 400 },
      );
    }

    let finalUserName = null;
    let finalUserEmail = null;

    // user meta fallback (ilk session mesajından çek)
    const { data: meta } = await supabase
      .from("chat_transcripts")
      .select("user_name, user_email")
      .eq("session_id", session_id)
      .eq("input_type", "session")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (meta) {
      finalUserName = meta.user_name;
      finalUserEmail = meta.user_email;
    }

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
      console.error("❌ Supabase chat insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ save-message fatal error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
