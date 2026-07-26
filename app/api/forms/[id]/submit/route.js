import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.json();

    const [form] = await sql`SELECT id FROM forms WHERE id = ${id} AND status = 'active'`;

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    await sql`
      INSERT INTO form_submissions (form_id, data)
      VALUES (${id}, ${JSON.stringify(formData)})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}