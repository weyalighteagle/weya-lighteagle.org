import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM messages ORDER BY created_at DESC LIMIT 100;
    `;
    return NextResponse.json({ logs: result.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
