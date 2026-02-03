/* ================== API ================== */

export const API_KEY =
  process.env.LIVEAVATAR_API_KEY ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_API_KEY ||
  "";

/**
 * LIVEAVATAR_BACKEND_API_URL: The actual LiveAvatar API endpoint
 * Used by backend routes to make server-side requests to LiveAvatar
 * Example: https://api.liveavatar.com
 */
export const LIVEAVATAR_BACKEND_API_URL =
  process.env.LIVEAVATAR_API_URL ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_API_URL ||
  "https://api.liveavatar.com";

/**
 * API_URL: The frontend SDK API endpoint (should be your backend proxy)
 * Used by the LiveAvatar SDK in the browser to avoid CORS issues
 * Development: http://localhost:3001/api/liveavatar-proxy
 * Production: https://www.weya-lighteagle.org/api/liveavatar-proxy
 */
export const API_URL =
  process.env.NEXT_PUBLIC_LIVEAVATAR_SDK_API_URL ||
  (typeof window !== "undefined" 
    ? `${window.location.origin}/api/liveavatar-proxy`
    : "/api/liveavatar-proxy");

export const AVATAR_ID =
  process.env.LIVEAVATAR_AVATAR_ID ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID ||
  "";

export const VOICE_ID =
  process.env.LIVEAVATAR_VOICE_ID ||
  process.env.NEXT_PUBLIC_LIVEAVATAR_VOICE_ID ||
  "";

/* ================= CONTEXTLER ================= */

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

/* ================= LANGUAGE ================= */

// ❌ LANG YOK
// ✅ Build-safe, persona bazlı çözüm start-session'da yapılır
//
//export const LANGUAGE_ENG =
//  process.env.LIVEAVATAR_LANGUAGE_eng ||
//  process.env.NEXT_PUBLIC_LIVEAVATAR_LANGUAGE_eng ||
//  "en-US";

//export const LANGUAGE_TR =
//  process.env.LIVEAVATAR_LANGUAGE_tr ||
//  process.env.NEXT_PUBLIC_LIVEAVATAR_LANGUAGE_tr ||
//  "tr-TR";

/* ================= CUSTOM MODE ================= */

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
