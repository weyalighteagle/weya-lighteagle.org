import { API_URL } from "../secrets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_token, session_id, reason } = body;

    if (!session_token) {
      return new Response(
        JSON.stringify({ error: "session_token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(`${API_URL}/v1/sessions/stop`, {
      method: "POST",
      headers: {
        "X-API-KEY": session_token, // LiveAvatar docs
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        session_id: session_id ?? null, // token ile geliyorsa null olabilir
        reason: reason ?? "user_stopped",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error stopping session:", errorData);

      return new Response(
        JSON.stringify({
          error: errorData.message || "Failed to stop session",
        }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error stopping session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to stop session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
