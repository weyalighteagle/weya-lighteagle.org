import { mkdir, appendFile } from "fs/promises";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "conversation_logs");
const LOG_FILE = path.join(LOG_DIR, "session_log.jsonl");

// 👇 İKİ URL BİRDEN
const N8N_URLS = [
  "https://lighteagle.app.n8n.cloud/webhook/weya-logs",
  "https://lighteagle.app.n8n.cloud/webhook/e583fe50-5ded-4be4-a239-a098b8935ae3",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, message, timestamp, session_id } = body;

    if (!sender || !message || !timestamp) {
      console.warn("❌ Missing required fields:", body);
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    // Log directory
    await mkdir(LOG_DIR, { recursive: true });

    // JSONL log entry
    const logEntry =
      JSON.stringify({
        sender,
        message,
        timestamp,
        ...(session_id && { session_id }),
      }) + "\n";

    await appendFile(LOG_FILE, logEntry, "utf8");

    // 👇 TÜM URL’LERE GÖNDERİYOR
    for (const url of N8N_URLS) {
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender,
            message,
            timestamp,
            source: "conversation_log_api",
            ...(session_id && { session_id }),
          }),
        });
      } catch (error) {
        console.error(`⚠️ Failed to forward to ${url}:`, error);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected server error in save-message:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
