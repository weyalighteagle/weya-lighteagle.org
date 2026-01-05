/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@heygen/liveavatar-web-sdk"],
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.STORAGE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY,
  },
};

export default nextConfig;
