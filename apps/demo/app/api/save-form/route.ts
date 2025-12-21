import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      persona,
      session_id,
    } = body;

    // 🔒 Form için minimal validation
    if (!email || !persona) {
      return NextResponse.json(
        { error: "Missing required form fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("chat_transcripts")
      .insert({
        session_id: session_id || null, // session yoksa da sorun değil
        sender: "user",
        message: "pre-chat form submitted",
        input_type: "form",
        user_name: `${firstName || ""} ${lastName || ""}`.trim() || null,
        user_email: email,
        persona,
        client_timestamp: Date.now(),
      });

    if (error) {
      console.error("❌ Supabase form insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ save-form error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
