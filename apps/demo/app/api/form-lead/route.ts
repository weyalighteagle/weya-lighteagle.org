import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("form_leads")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Insert failed" },
        { status: 500 }
      );
    }

    // fire-and-forget uyumlu
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Form lead error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
