// app/api/stop-session/route.ts

export async function POST() {
  // ⚠️ HeyGen session artık SDK tarafından kapatılıyor.
  // Bu endpoint sadece frontend akışını bozmamak için tutuluyor.

  return new Response(
    JSON.stringify({
      success: true,
      message: "Session closed (handled by SDK)",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
