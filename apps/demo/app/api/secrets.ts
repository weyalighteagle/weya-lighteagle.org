export const API_KEY =
  process.env.LIVEAVATAR_API_KEY ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_API_KEY ||
  "";

export const API_URL =
  process.env.LIVEAVATAR_API_URL ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_API_URL ||
  "";

export const AVATAR_ID =
  process.env.LIVEAVATAR_AVATAR_ID ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID ||
  "";

export const VOICE_ID =
  process.env.LIVEAVATAR_VOICE_ID ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_VOICE_ID ||
  "";

/* ---------------- CONTEXTLER ---------------- */

export const CONTEXT_ID_WEYA_LIVE =
  process.env.LIVEAVATAR_CONTEXT_ID_WEYA_LIVE ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_WEYA_LIVE ||
  "";

export const CONTEXT_ID_WEYA_STARTUP =
  process.env.LIVEAVATAR_CONTEXT_ID_WEYA_STARTUP ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_WEYA_STARTUP ||
  "";

export const CONTEXT_ID_FAMILY_OFFICES =
  process.env.LIVEAVATAR_CONTEXT_ID_FAMILY_OFFICES ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_FAMILY_OFFICES ||
  "";

export const CONTEXT_ID_FUND_BUILDERS =
  process.env.LIVEAVATAR_CONTEXT_ID_FUND_BUILDERS ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_FUND_BUILDERS ||
  "";

export const CONTEXT_ID_IMPACT_STARTUPS =
  process.env.LIVEAVATAR_CONTEXT_ID_IMPACT_STARTUPS ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_IMPACT_STARTUPS ||
  "";

export const CONTEXT_ID_LIGHT_EAGLE =
  process.env.LIVEAVATAR_CONTEXT_ID_LIGHT_EAGLE ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_CONTEXT_ID_LIGHT_EAGLE ||
  "";

/* ---------------- LANGUAGE ---------------- */

// hangi dil aktif?

export const LANGUAGE =
  LANG === "eng"
    ? process.env.LIVEAVATAR_LANGUAGE_eng ||
      process.env.NEXT_PUBLIC_LIVEAVATAR_LANGUAGE_eng ||
      "en-US"
    : process.env.LIVEAVATAR_LANGUAGE_tr ||
      process.env.NEXT_PUBLIC_LIVEAVATAR_LANGUAGE_tr ||
      "tr";

/* ---------------- CUSTOM MODE ---------------- */

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
