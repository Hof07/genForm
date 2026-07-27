import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");

    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }

    const forms = await sql`
      SELECT id, title, schema
      FROM forms
      WHERE user_id = ${session.userId} AND id = ${formId}
    `;

    if (forms.length === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const form = forms[0];

    const submissions = await sql`
      SELECT data, submitted_at
      FROM form_submissions
      WHERE form_id = ${formId}
      ORDER BY submitted_at DESC
      LIMIT 200
    `;

    if (submissions.length === 0) {
      return NextResponse.json({
        hasData: false,
        insights: null,
        formTitle: form.title,
        formId: form.id,
      });
    }

    const summaryPayload = {
      title: form.title,
      fields: (form.schema || []).map((f) => f.label),
      responses: submissions.map((s) => s.data),
    };

    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt =
      "You are a data analyst. Analyze the following form response data and return STRICT JSON only, no markdown, no explanation.\n\n" +
      "Data:\n" +
      JSON.stringify(summaryPayload).slice(0, 12000) +
      "\n\n" +
      "Return this exact JSON shape:\n" +
      "{\n" +
      '  "summary": "one or two sentence overview of what the data shows",\n' +
      '  "insights": [\n' +
      '    { "title": "short insight title", "detail": "one sentence explaining the pattern found" }\n' +
      "  ],\n" +
      '  "suggestions": [\n' +
      '    { "title": "short suggestion title", "detail": "one sentence actionable recommendation" }\n' +
      "  ]\n" +
      "}\n\n" +
      "Keep insights and suggestions to a maximum of 4 each. Be specific, reference actual field names or values where relevant. Do not invent data that isn't present.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\s*|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid response. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      hasData: true,
      insights: parsed,
      responseCount: submissions.length,
      formTitle: form.title,
      formId: form.id,
    });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate insights" }, { status: 500 });
  }
}