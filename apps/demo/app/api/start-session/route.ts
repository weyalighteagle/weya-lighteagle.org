function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST() {
  try {
    const API_KEY = getEnv("API_KEY");
    const API_URL = getEnv("API_URL");
    const AVATAR_ID = getEnv("AVATAR_ID");
    const VOICE_ID = getEnv("VOICE_ID");
    const CONTEXT_ID = getEnv("CONTEXT_ID_WEYA_LIVE");
    // gerekiyorsa: LIVEAVATAR_CONTEXT_ID_FUND_BUILDERS
    const LANGUAGE = process.env.LANGUAGE ?? "en";

    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: AVATAR_ID,
        avatar_persona: {
          voice_id: VOICE_ID,
          context_id: CONTEXT_ID,
          language: LANGUAGE,
        },
      }),
    });

    if (!res.ok) {
      const resp = await res.json();
      const errorMessage =
        resp?.data?.[0]?.message ?? "Failed to retrieve session token";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
      });
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({
        session_token: data.data.session_token,
        session_id: data.data.session_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error retrieving session token:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}
