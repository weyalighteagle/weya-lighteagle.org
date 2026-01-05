// apps/demo/app/api/secrets.ts
// SERVER-ONLY

export const API_KEY = process.env.LIVEAVATAR_API_KEY || "";
export const API_URL = process.env.LIVEAVATAR_API_URL || "";
export const AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "";
export const VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || "";

export const CONTEXT_ID_WEYA_LIVE =
  process.env.LIVEAVATAR_CONTEXT_ID_WEYA_LIVE || "";

export const CONTEXT_ID_WEYA_STARTUP =
  process.env.LIVEAVATAR_CONTEXT_ID_WEYA_STARTUP || "";

export const CONTEXT_ID_FAMILY_OFFICES =
  process.env.LIVEAVATAR_CONTEXT_ID_FAMILY_OFFICES || "";

export const CONTEXT_ID_FUND_BUILDERS =
  process.env.LIVEAVATAR_CONTEXT_ID_FUND_BUILDERS || "";

export const CONTEXT_ID_IMPACT_STARTUPS =
  process.env.LIVEAVATAR_CONTEXT_ID_IMPACT_STARTUPS || "";

export const CONTEXT_ID_LIGHT_EAGLE =
  process.env.LIVEAVATAR_CONTEXT_ID_LIGHT_EAGLE || "";

// AKTİF CONTEXT
export const CONTEXT_ID = CONTEXT_ID_WEYA_LIVE;

export const LANGUAGE = process.env.LIVEAVATAR_LANGUAGE || "tr-TR";

// CUSTOM MODE
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
