import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [form] = await sql`
      SELECT id, title, description, schema, status, created_at
      FROM forms
      WHERE id = ${id} AND user_id = ${session.userId}
    `;

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const submissions = await sql`
      SELECT id, data, submitted_at
      FROM form_submissions
      WHERE form_id = ${id}
      ORDER BY submitted_at DESC
    `;

    return NextResponse.json({ form, submissions });
  } catch (err) {
    console.error("Fetch form detail error:", err);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [form] = await sql`
      UPDATE forms
      SET status = ${status}
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id, status
    `;

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, form });
  } catch (err) {
    console.error("Update status error:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}