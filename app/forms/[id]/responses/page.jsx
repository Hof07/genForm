import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import ResponsesClient from "./ResponsesClient";

export default async function ResponsesPage({ params }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { id } = await params;

  const [form] = await sql`
    SELECT id, title, description, schema, status, created_at
    FROM forms
    WHERE id = ${id} AND user_id = ${session.userId}
  `;

  if (!form) notFound();

  const submissions = await sql`
    SELECT id, data, submitted_at
    FROM form_submissions
    WHERE form_id = ${id}
    ORDER BY submitted_at DESC
  `;

  return <ResponsesClient form={form} initialSubmissions={submissions} />;
}