import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, fields } = await req.json();

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid form schema" }, { status: 400 });
    }

    const [form] = await sql`
      INSERT INTO forms (user_id, title, description, schema)
      VALUES (
        ${session.userId},
        ${title},
        ${description || null},
        ${JSON.stringify(fields)}
      )
      RETURNING id, title, description, schema, status, created_at
    `;

    return NextResponse.json({ success: true, form }, { status: 201 });
  } catch (err) {
    console.error("Form save error:", err);
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forms = await sql`
      SELECT id, title, description, status, created_at
      FROM forms
      WHERE user_id = ${session.userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ forms });
  } catch (err) {
    console.error("Fetch forms error:", err);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}