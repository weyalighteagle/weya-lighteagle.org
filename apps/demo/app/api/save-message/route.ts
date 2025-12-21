import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      // chat
      sender,
      message,
      session_id,

      // form
      firstName,
      lastName,
      email,
      persona,

      // meta
      timestamp,
      input_type,
    } = body;

    const finalTimestamp =
      typeof timestamp === "number" ? timestamp : Date.now();

    /**
     * =========================
     * 1️⃣ FORM SUBMIT
     * =========================
     */
    if (input_type === "form") {
      if (!firstName || !lastName || !email || !persona) {
        return NextResponse.json(
          { error: "Missing required form fields" },
          { status: 400 },
        );
      }

      const finalUserName =
        firstName && lastName ? `${firstName} ${lastName}` : null;

      const finalUserEmail =
        email && email.trim() !== "" ? email : null;

      const { error } = await supabase.from("chat_transcripts").insert({
        session_id: session_id || `form_${crypto.randomUUID()}`,
        sender: "user",
        message: `Form submitted – persona: ${persona}`,
        input_type: "form",
        client_timestamp: finalTimestamp,
        user_name: finalUserName,
        user_email: finalUserEmail,
      });

      if (error) {
        console.error("❌ Supabase form insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    /**
     * =========================
     * 2️⃣ CHAT MESSAGE
     * =========================
     */
    if (!sender || !message || !session_id) {
      return NextResponse.json(
        { error: "Missing required chat fields" },
        { status: 400 },
      );
    }

    let finalUserName: string | null = null;
    let finalUserEmail: string | null = null;

    /**
     * 🔎 Önce SESSION kaydından dene
     */
    const { data: sessionMeta } = await supabase
      .from("chat_transcripts")
      .select("user_name, user_email")
      .eq("session_id", session_id)
      .eq("input_type", "session")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (sessionMeta) {
      finalUserName = sessionMeta.user_name;
      finalUserEmail = sessionMeta.user_email;
    }

    /**
     * 🔎 Session yoksa FORM kaydından dene
     */
    if (!finalUserName || !finalUserEmail) {
      const { data: formMeta } = await supabase
        .from("chat_transcripts")
        .select("user_name, user_email")
        .eq("session_id", session_id)
        .eq("input_type", "form")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (formMeta) {
        finalUserName = finalUserName || formMeta.user_name;
        finalUserEmail = finalUserEmail || formMeta.user_email;
      }
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
