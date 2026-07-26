import { sql } from "@/app/lib/db";
import { notFound } from "next/navigation";
import FormRenderer from "./FormRenderer";

export default async function FormPage({ params }) {
  const { id } = await params;

  const [form] = await sql`
    SELECT id, title, description, schema, status
    FROM forms
    WHERE id = ${id}
  `;

  if (!form) notFound();

  return <FormRenderer form={form} />;
}