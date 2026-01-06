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

export const CONTEXT_ID = CONTEXT_ID_WEYA_LIVE;

export const LANGUAGE =
  process.env.LIVEAVATAR_LANGUAGE ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_LANGUAGE ||
  "tr-TR";

/*
export const API_KEY = process.env.API_KEY  || "";
export const API_URL = "https://api.liveavatar.com";
export const AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

// FULL MODE Customizations
// Wayne's avatar voice and context
export const VOICE_ID = "c2527536-6d1f-4412-a643-53a3497dada9";
export const CONTEXT_ID = "00689a04-e1f4-4f1d-bdbd-c46d7bd3d8e7";
export const LANGUAGE = "en";
*/

// CUSTOM MODE Customizations
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
