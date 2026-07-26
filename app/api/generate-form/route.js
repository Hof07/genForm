import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt: userPrompt } = body;

    if (!userPrompt || !userPrompt.trim()) {
      return NextResponse.json(
        { success: false, error: "prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a backend API that generates STRICT minimal JSON form schemas.

RULES:
- Return ONLY valid JSON
- No explanation
- No markdown, no code fences
- Keep the form MINIMAL (only essential fields)
- Do NOT add extra or unnecessary fields
- Infer the right field types from the description

Schema format:
{
  "title": "string",
  "description": "string",
  "fields": [
    {
      "name": "string",
      "label": "string",
      "type": "text|email|password|number|textarea|select|checkbox|radio|date",
      "required": true,
      "options": ["only if type is select/radio"]
    }
  ]
}

User's form description:
"${userPrompt}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: systemPrompt,
    });

    let text = response.text;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty response. Try rephrasing your prompt." },
        { status: 502 }
      );
    }

    // Strip markdown code fences if Gemini adds them anyway
    text = text.replace(/```json\s*|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI returned invalid JSON. Try rephrasing your prompt." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}