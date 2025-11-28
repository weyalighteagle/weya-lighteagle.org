import { writeFile, mkdir, appendFile } from "fs/promises";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "conversation_logs");
const LOG_FILE = path.join(LOG_DIR, "session_log.jsonl"); // JSON Lines format

export async function POST(request: Request) {
  try {
    const { sender, message, timestamp } = await request.json();

    if (!sender || !message || !timestamp) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    // Ensure directory exists
    await mkdir(LOG_DIR, { recursive: true });

    // Append to log file
    const logEntry = JSON.stringify({ sender, message, timestamp }) + "\n";
    await appendFile(LOG_FILE, logEntry, "utf8");

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error saving message:", err);
    return new Response(JSON.stringify({ error: "Failed to save message" }), {
      status: 500,
    });
  }
}
