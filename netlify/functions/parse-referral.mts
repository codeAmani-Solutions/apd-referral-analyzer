import type { Context } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";

// ──────────────────────────────────────────────────────────────────────────
// POST /api/parse-referral
//
// Receives extracted PDF text + document type from the client and calls the
// Claude API to produce structured JSON matching our TypeScript interfaces.
// The ANTHROPIC_API_KEY is server-side only (set in Netlify dashboard).
// ──────────────────────────────────────────────────────────────────────────

interface RequestBody {
  text: string;
  documentType: "lrc_base" | "qsi" | "support_plan";
}

/* ── Prompt templates ─────────────────────────────────────────────────── */

const LRC_BASE_PROMPT = `You are an expert at parsing Florida APD (Agency for Persons with Disabilities) LRC BASE forms. Extract structured data from the following document text and return ONLY valid JSON matching the schema below. Do not include any text outside the JSON object.

JSON Schema:
{
  "consumer": {
    "first_name": "string",
    "last_name": "string",
    "dob": "string (YYYY-MM-DD)",
    "age": "number or null",
    "gender": "string or null",
    "medicaid_number": "string or null",
    "region": "string or null",
    "current_residence": "string or null",
    "address": "string or null",
    "phone": "string or null",
    "legal_status": {
      "type": "string",
      "guardian": { "name": "string", "phone": "string or null", "address": "string or null" } or null,
      "guardianship_types": ["string"]
    } or null,
    "support_coordinator": { "name": "string", "id": "string", "title": "string", "region": "string", "phone": "string", "email": "string" } or null,
    "referral_coordinator": { "name": "string", "id": "string", "title": "string", "region": "string", "phone": "string", "email": "string" } or null
  },
  "referral": {
    "id": "string (iConnect referral number)",
    "status": "pending",
    "deadline": "string (YYYY-MM-DD) or null",
    "diagnoses": { "primary": "string", "secondary": "string or null" } or null,
    "services_needed": ["string"],
    "placement_considerations": ["string"]
  },
  "lrc_review": {
    "review_date": "string (YYYY-MM-DD) or null",
    "reviewer": "string or null",
    "status": "string or null",
    "notes": "string or null",
    "psych_eval_note": "string or null",
    "reshab_level": "Standard | Moderate | Extensive | Pervasive or null",
    "reshab_designation": "STD | MOD | EXT | PER or null",
    "eligibility": {
      "behavior_analysis": "boolean",
      "behavior_assistant": "boolean",
      "life_skills_3": "boolean",
      "life_skills_4": "boolean",
      "residential_hab": "boolean"
    } or null,
    "behavior_focused": {
      "eligible": "boolean",
      "reason": "string or null",
      "next_review_date": "string (YYYY-MM-DD) or null"
    } or null
  }
}

Extract all available fields. Use null for fields not found in the text. For arrays, use empty arrays [] if no items found.`;

const QSI_PROMPT = `You are an expert at parsing Florida APD QSI (Questionnaire for Situational Information) assessment forms. Extract structured data from the following document text and return ONLY valid JSON matching the schema below. Do not include any text outside the JSON object.

JSON Schema:
{
  "qsi_assessment": {
    "overall_support_level": "string or null",
    "level_rating": "number (1-4) or null",
    "functional_level": "number (1-4) or null",
    "functional_details": {
      "vision": "number (0-4)",
      "hearing": "number (0-4)",
      "eating": "number (0-4)",
      "ambulation": "number (0-4)",
      "transfers": "number (0-4)",
      "toileting": "number (0-4)",
      "hygiene": "number (0-4)",
      "dressing": "number (0-4)",
      "communications": "number (0-4)",
      "self_protection": "number (0-4)",
      "evacuation": "number (0-4)"
    } or null,
    "behavioral_level": "number (1-4) or null",
    "behavioral_details": {
      "self_injury": "number (0-4)",
      "aggression": "number (0-4)",
      "property_destruction": "number (0-4)",
      "sexual_behavior": "number (0-4)",
      "running_away": "number (0-4)",
      "other_behaviors": "number (0-4)"
    } or null,
    "physical_level": "number (1-4) or null",
    "physical_details": {
      "injury_from_sib": "number (0-4)",
      "injury_from_aggression": "number (0-4)",
      "mechanical_restraint": "number (0-4)",
      "chemical_restraint": "number (0-4)",
      "psychotropic_meds": "number (0-4)",
      "gastrointestinal": "number (0-4)",
      "seizures": "number (0-4)",
      "skin_breakdown": "number (0-4)",
      "bowel_function": "number (0-4)",
      "nutrition": "number (0-4)",
      "chronic_health": "number (0-4)",
      "injuries": "number (0-4)",
      "falls": "number (0-4)",
      "physician_visits": "number (0-4)",
      "er_visits": "number (0-4)",
      "hospital_admissions": "number (0-4)",
      "missed_days": "number (0-4)"
    } or null,
    "life_change_stress": {
      "score": "number",
      "level": "string",
      "signs_and_symptoms": "boolean",
      "recent_changes": ["string"]
    } or null
  },
  "consumer": {
    "first_name": "string",
    "last_name": "string",
    "dob": "string (YYYY-MM-DD)",
    "age": "number or null"
  }
}

Extract all available fields. Scoring uses 0-4 scale (0 = independent/none, 4 = total/extreme). Use null for fields not found. Use 0 as default for individual scores when a section exists but specific scores are unclear.`;

const SUPPORT_PLAN_PROMPT = `You are an expert at parsing Florida APD Support Plan documents. Extract structured data from the following document text and return ONLY valid JSON matching the schema below. Do not include any text outside the JSON object.

JSON Schema:
{
  "consumer": {
    "first_name": "string",
    "last_name": "string",
    "dob": "string (YYYY-MM-DD)",
    "age": "number or null",
    "gender": "string or null",
    "medicaid_number": "string or null",
    "region": "string or null",
    "current_residence": "string or null",
    "address": "string or null",
    "phone": "string or null",
    "legal_status": {
      "type": "string",
      "guardian": { "name": "string", "phone": "string or null", "address": "string or null" } or null,
      "guardianship_types": ["string"]
    } or null,
    "support_coordinator": { "name": "string", "id": "string", "title": "string", "region": "string", "phone": "string", "email": "string" } or null
  },
  "referral": {
    "diagnoses": { "primary": "string", "secondary": "string or null" } or null,
    "behavioral_notes": {
      "self_injury": "string or null",
      "other_behaviors": "string or null",
      "triggers": "string or null",
      "interventions": "string or null"
    } or null,
    "functional_notes": {
      "community": "string or null",
      "independence": "string or null",
      "hygiene": "string or null",
      "dressing": "string or null",
      "self_protection": "string or null",
      "evacuation": "string or null"
    } or null,
    "services_needed": ["string"],
    "placement_considerations": ["string"]
  }
}

Extract all available fields. Use null for fields not found. For arrays, use empty arrays [] if no items found. Focus on behavioral observations, functional capabilities, and service recommendations.`;

function getPromptForDocumentType(documentType: RequestBody["documentType"]): string {
  switch (documentType) {
    case "lrc_base":
      return LRC_BASE_PROMPT;
    case "qsi":
      return QSI_PROMPT;
    case "support_plan":
      return SUPPORT_PLAN_PROMPT;
  }
}

/* ── Handler ──────────────────────────────────────────────────────────── */

export default async function handler(req: Request, _context: Context) {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured on the server" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Parse and validate request body
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { text, documentType } = body;

  if (!text || typeof text !== "string") {
    return new Response(
      JSON.stringify({ error: "Missing or invalid 'text' field" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!documentType || !["lrc_base", "qsi", "support_plan"].includes(documentType)) {
    return new Response(
      JSON.stringify({
        error: "Missing or invalid 'documentType' field. Must be one of: lrc_base, qsi, support_plan",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Call Claude API
  const client = new Anthropic({ apiKey });
  const systemPrompt = getPromptForDocumentType(documentType);

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Here is the extracted text from an APD ${documentType.replace(/_/g, " ").toUpperCase()} document:\n\n---\n${text}\n---\n\nParse this document and return the structured JSON.`,
        },
      ],
      system: systemPrompt,
    });

    // Extract text content from Claude response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Parse the JSON from Claude's response
    // Claude may wrap JSON in markdown code blocks, so strip those if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse Claude's response as JSON",
          raw_response: responseText,
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentType,
        data: parsed,
        usage: {
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error calling Claude API";

    return new Response(
      JSON.stringify({ error: `Claude API error: ${errorMessage}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
