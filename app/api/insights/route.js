import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CHARTABLE_TYPES = ["select", "radio", "checkbox", "rating", "dropdown", "multiplechoice"];

function getFieldKey(field, sampleData) {
  // Response data may be keyed by field.id or field.label depending on how the
  // form schema was generated - detect whichever key actually exists.
  if (field.id && sampleData && Object.prototype.hasOwnProperty.call(sampleData, field.id)) {
    return field.id;
  }
  return field.label;
}

function buildTimeline(submissions) {
  const counts = {};
  submissions.forEach((s) => {
    const d = new Date(s.submitted_at);
    if (isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    counts[key] = (counts[key] || 0) + 1;
  });

  const sortedDates = Object.keys(counts).sort();
  return {
    labels: sortedDates,
    data: sortedDates.map((d) => counts[d]),
  };
}

function buildFieldBreakdowns(schema, submissions) {
  if (!schema || submissions.length === 0) return [];

  const sample = submissions[0].data || {};

  return schema
    .filter((f) => f.type && CHARTABLE_TYPES.includes(f.type.toLowerCase()))
    .map((field) => {
      const key = getFieldKey(field, sample);
      const tally = {};

      submissions.forEach((s) => {
        const raw = s.data ? s.data[key] : undefined;
        if (raw === undefined || raw === null || raw === "") return;

        const values = Array.isArray(raw) ? raw : [raw];
        values.forEach((v) => {
          const label = String(v);
          tally[label] = (tally[label] || 0) + 1;
        });
      });

      const labels = Object.keys(tally);
      if (labels.length === 0) return null;

      return {
        label: field.label,
        type: field.type,
        labels,
        data: labels.map((l) => tally[l]),
      };
    })
    .filter(Boolean);
}

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

    // Deterministic chart data, computed directly from the DB (not the AI)
    const timeline = buildTimeline(submissions);
    const fieldBreakdowns = buildFieldBreakdowns(form.schema, submissions);

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
      "  ],\n" +
      '  "sentiment": { "positive": 0, "neutral": 0, "negative": 0 },\n' +
      '  "topics": [\n' +
      '    { "topic": "short topic label", "count": 0 }\n' +
      "  ]\n" +
      "}\n\n" +
      "For 'sentiment', estimate the overall emotional tone found in any free-text responses as percentages that sum to 100. " +
      "If there are no free-text fields at all, return { \"positive\": 0, \"neutral\": 100, \"negative\": 0 }.\n" +
      "For 'topics', identify up to 5 recurring themes or keywords mentioned in free-text responses, each with an approximate count of how many responses mention it. Return an empty array if there is no free text.\n" +
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
      charts: {
        timeline,
        fieldBreakdowns,
      },
    });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate insights" }, { status: 500 });
  }
}