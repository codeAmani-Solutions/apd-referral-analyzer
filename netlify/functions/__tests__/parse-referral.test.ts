// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock @anthropic-ai/sdk ──────────────────────────────────────────────
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return { messages: { create: mockCreate } };
    }),
  };
});

// Import the handler AFTER mocks are in place
import handler from "../parse-referral.mts";

// ── Helpers ─────────────────────────────────────────────────────────────

/** Build a POST Request with a JSON body */
function makeRequest(
  body: unknown,
  method = "POST",
): Request {
  return new Request("http://localhost/.netlify/functions/parse-referral", {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

/** Dummy Netlify context — handler ignores it */
const ctx = {} as Parameters<typeof handler>[1];

/** Standard Claude API success response */
function mockClaudeSuccess(jsonData: unknown) {
  mockCreate.mockResolvedValue({
    content: [
      {
        type: "text",
        text: JSON.stringify(jsonData),
      },
    ],
    usage: { input_tokens: 100, output_tokens: 200 },
  });
}

// ─────────────────────────────────────────────────────────────────────────
describe("parse-referral handler", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set the required env var for each test
    process.env = { ...ORIGINAL_ENV, ANTHROPIC_API_KEY: "test-key-123" };
  });

  // ── 405: wrong method ────────────────────────────────────────────────
  it("returns 405 for non-POST methods", async () => {
    const req = new Request(
      "http://localhost/.netlify/functions/parse-referral",
      { method: "GET" },
    );
    const res = await handler(req, ctx);

    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe("Method not allowed");
  });

  // ── 500: missing API key ─────────────────────────────────────────────
  it("returns 500 when ANTHROPIC_API_KEY is not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const req = makeRequest({ text: "hello", documentType: "qsi" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("ANTHROPIC_API_KEY");
  });

  // ── 400: invalid JSON body ───────────────────────────────────────────
  it("returns 400 for invalid JSON body", async () => {
    const req = new Request(
      "http://localhost/.netlify/functions/parse-referral",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-valid-json{{{",
      },
    );
    const res = await handler(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid JSON");
  });

  // ── 400: missing text field ──────────────────────────────────────────
  it("returns 400 when text field is missing", async () => {
    const req = makeRequest({ documentType: "qsi" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("text");
  });

  it("returns 400 when text is empty string", async () => {
    const req = makeRequest({ text: "", documentType: "qsi" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("text");
  });

  // ── 400: invalid documentType ────────────────────────────────────────
  it("returns 400 when documentType is missing", async () => {
    const req = makeRequest({ text: "some text" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("documentType");
  });

  it("returns 400 when documentType is invalid", async () => {
    const req = makeRequest({ text: "some text", documentType: "unknown" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("documentType");
  });

  // ── 422: Claude returns unparseable JSON ─────────────────────────────
  it("returns 422 when Claude response is not valid JSON", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "I cannot parse this document" }],
      usage: { input_tokens: 50, output_tokens: 30 },
    });

    const req = makeRequest({ text: "doc text", documentType: "lrc_base" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toContain("Failed to parse");
    expect(body.raw_response).toBeDefined();
  });

  // ── 502: Claude API throws ───────────────────────────────────────────
  it("returns 502 when Claude API call throws", async () => {
    mockCreate.mockRejectedValue(new Error("Rate limit exceeded"));

    const req = makeRequest({
      text: "doc text",
      documentType: "support_plan",
    });
    const res = await handler(req, ctx);

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("Claude API error");
    expect(body.error).toContain("Rate limit exceeded");
  });

  // ── 200: successful extraction (lrc_base) ────────────────────────────
  it("returns 200 with parsed data for lrc_base document", async () => {
    const mockData = {
      consumer: { first_name: "John", last_name: "Doe" },
      referral: { id: "REF-001", status: "pending" },
      lrc_review: { status: "complete" },
    };
    mockClaudeSuccess(mockData);

    const req = makeRequest({ text: "LRC BASE form text", documentType: "lrc_base" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.documentType).toBe("lrc_base");
    expect(body.data).toEqual(mockData);
    expect(body.usage.input_tokens).toBe(100);
    expect(body.usage.output_tokens).toBe(200);
  });

  // ── 200: successful extraction (qsi) ─────────────────────────────────
  it("returns 200 with parsed data for qsi document", async () => {
    const mockData = {
      qsi_assessment: { overall_support_level: "Moderate" },
      consumer: { first_name: "Jane", last_name: "Smith" },
    };
    mockClaudeSuccess(mockData);

    const req = makeRequest({ text: "QSI assessment text", documentType: "qsi" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.documentType).toBe("qsi");
    expect(body.data).toEqual(mockData);
  });

  // ── 200: successful extraction (support_plan) ────────────────────────
  it("returns 200 with parsed data for support_plan document", async () => {
    const mockData = {
      consumer: { first_name: "Alice", last_name: "Brown" },
      referral: { services_needed: ["Residential", "Behavioral"] },
    };
    mockClaudeSuccess(mockData);

    const req = makeRequest({
      text: "Support Plan document text",
      documentType: "support_plan",
    });
    const res = await handler(req, ctx);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.documentType).toBe("support_plan");
    expect(body.data).toEqual(mockData);
  });

  // ── 200: handles JSON wrapped in markdown code blocks ────────────────
  it("strips markdown code fences from Claude response", async () => {
    const mockData = { consumer: { first_name: "Test" } };

    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: "```json\n" + JSON.stringify(mockData) + "\n```",
        },
      ],
      usage: { input_tokens: 80, output_tokens: 150 },
    });

    const req = makeRequest({ text: "doc text", documentType: "lrc_base" });
    const res = await handler(req, ctx);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
  });

  // ── Verify Claude API is called with correct parameters ──────────────
  it("calls Claude with correct model and system prompt", async () => {
    mockClaudeSuccess({ consumer: {} });

    const req = makeRequest({ text: "test text", documentType: "qsi" });
    await handler(req, ctx);

    expect(mockCreate).toHaveBeenCalledOnce();
    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg.model).toBe("claude-sonnet-4-20250514");
    expect(callArg.max_tokens).toBe(4096);
    expect(callArg.system).toContain("QSI");
    expect(callArg.messages[0].role).toBe("user");
    expect(callArg.messages[0].content).toContain("test text");
  });
});
