import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Max distinct values for a field to be considered "chartable" (categorical).
// Fields with more distinct values than this look like free text / unique IDs.
const MAX_DISTINCT_VALUES = 8;
// Free-text values longer than this (avg chars) are excluded from charts.
const MAX_AVG_VALUE_LENGTH = 40;

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

// Builds a key -> display label map from the schema, trying a few common
// shapes (id, name, key, label) since we don't know the exact schema format.
function buildLabelMap(schema) {
  const map = {};
  (schema || []).forEach((f) => {
    const label = f.label || f.name || f.title || null;
    if (!label) return;
    [f.id, f.name, f.key, f.label].forEach((k) => {
      if (k) map[k] = label;
    });
  });
  return map;
}

// Auto-detects which fields in the raw submission data are chartable
// (small, repeated set of values) vs free text (long / mostly unique),
// without depending on the form schema's "type" naming.
function buildFieldBreakdowns(schema, submissions) {
  if (submissions.length === 0) return [];

  const labelMap = buildLabelMap(schema);

  // Collect every key seen across all submissions' data objects.
  const allKeys = new Set();
  submissions.forEach((s) => {
    if (s.data && typeof s.data === "object") {
      Object.keys(s.data).forEach((k) => allKeys.add(k));
    }
  });

  const breakdowns = [];

  allKeys.forEach((key) => {
    const tally = {};
    let valueCount = 0;
    let totalLength = 0;

    submissions.forEach((s) => {
      const raw = s.data ? s.data[key] : undefined;
      if (raw === undefined || raw === null || raw === "") return;

      const values = Array.isArray(raw) ? raw : [raw];
      values.forEach((v) => {
        const strVal = String(v).trim();
        if (!strVal) return;
        valueCount += 1;
        totalLength += strVal.length;
        tally[strVal] = (tally[strVal] || 0) + 1;
      });
    });

    if (valueCount === 0) return;

    const distinctValues = Object.keys(tally);
    const avgLength = totalLength / valueCount;

    // Skip fields that look like free text or unique identifiers (emails,
    // names, comments): too many distinct values, or values are too long.
    if (distinctValues.length > MAX_DISTINCT_VALUES) return;
    if (avgLength > MAX_AVG_VALUE_LENGTH) return;
    // Skip fields where every value is unique with more than a couple of
    // responses - that's more likely an ID than a category.
    if (distinctValues.length === valueCount && valueCount > 3) return;

    breakdowns.push({
      label: labelMap[key] || key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      labels: distinctValues,
      data: distinctValues.map((l) => tally[l]),
    });
  });

  return breakdowns;
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