import { NextResponse } from "next/server";
import { supabase } from "../../../src/utils/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("[api/form-lead-internship] Received:", body);

        const { firstName, lastName, email, session_id } = body;

        // 🔒 Zorunlu alanlar (session_id opsiyonel)
        if (!firstName || !lastName || !email) {
            console.error("[api/form-lead-internship] Missing fields:", { firstName, lastName, email });
            return NextResponse.json(
                { error: "Missing required fields", received: { firstName, lastName, email } },
                { status: 400 }
            );
        }

        const { error } = await supabase.from("form_leads_internship").insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            session_id: session_id ?? null,
        });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (err) {
        console.error("form-lead-internship error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
