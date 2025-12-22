import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, message, timestamp, session_id, input_type, request_id } =
      body;

    console.log("📝 save-message received:", {
      sender,
      message,
      session_id,
      input_type,
      timestamp,
      request_id,
    });

    if (!sender || !message || !timestamp) {
      console.warn("❌ Missing required fields:", body);
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase.from("chat_transcripts").insert({
      session_id: session_id || "unknown",
      sender,
      message,
      input_type: input_type || "text", // Default to text if not provided
      client_timestamp: timestamp,
    });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Message saved successfully:", data);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected server error in save-message:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
