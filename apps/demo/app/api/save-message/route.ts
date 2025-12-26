import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sender,
      message,
      timestamp,
      session_id,
      input_type,
    } = body;

    if (!sender || !message || !session_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const finalTimestamp =
      typeof timestamp === "number" ? timestamp : Date.now();

    const { error } = await supabase.from("chat_transcripts").insert({
      session_id,
      sender,
      message,
      input_type: input_type || "text",
      client_timestamp: finalTimestamp,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("save-message error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
