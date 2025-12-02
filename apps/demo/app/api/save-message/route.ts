import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sender, message, timestamp } = await request.json();

    if (!sender || !message || !timestamp) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await sql`
      INSERT INTO messages (sender, message, timestamp)
      VALUES (${sender}, ${message}, ${timestamp});
    `;

    try {
      await fetch("https://lighteagle.app.n8n.cloud/webhook-test/weya-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, message, timestamp }),
      });
    } catch (webhookError) {
      console.error("Error sending to webhook:", webhookError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error saving message:", err);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }
}
