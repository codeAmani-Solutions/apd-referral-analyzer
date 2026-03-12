import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock pdfjs-dist ─────────────────────────────────────────────────────
// vi.hoisted ensures these are available inside the vi.mock factory
const { mockGetDocument, mockGetPage, mockGetTextContent } = vi.hoisted(
  () => ({
    mockGetDocument: vi.fn(),
    mockGetPage: vi.fn(),
    mockGetTextContent: vi.fn(),
  }),
);

vi.mock("pdfjs-dist", () => ({
  getDocument: mockGetDocument,
  GlobalWorkerOptions: { workerSrc: "" },
}));

import { extractTextFromPDF, detectDocumentType } from "@/lib/pdf";

// ─────────────────────────────────────────────────────────────────────────
// detectDocumentType — pure function, no mocks needed
// ─────────────────────────────────────────────────────────────────────────
describe("detectDocumentType", () => {
  it('returns "lrc_base" when text contains both LRC and BASE', () => {
    expect(detectDocumentType("This is an LRC BASE referral form")).toBe(
      "lrc_base",
    );
  });

  it('returns "qsi" when text contains QSI and QUESTIONNAIRE', () => {
    expect(
      detectDocumentType("QSI - Questionnaire for Situational Information"),
    ).toBe("qsi");
  });

  it('returns "support_plan" when text contains SUPPORT PLAN', () => {
    expect(detectDocumentType("Individual Support Plan for client")).toBe(
      "support_plan",
    );
  });

  it('returns "other" when text matches no known document type', () => {
    expect(detectDocumentType("Some random document text")).toBe("other");
  });

  it("is case-insensitive", () => {
    expect(detectDocumentType("lrc base form")).toBe("lrc_base");
    expect(detectDocumentType("qsi questionnaire")).toBe("qsi");
    expect(detectDocumentType("support plan")).toBe("support_plan");
  });

  it('returns "other" for empty string', () => {
    expect(detectDocumentType("")).toBe("other");
  });

  it("prioritizes lrc_base over other matches when both patterns exist", () => {
    // LRC + BASE pattern is checked first in the function
    expect(detectDocumentType("LRC BASE with SUPPORT PLAN")).toBe("lrc_base");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// extractTextFromPDF — requires mocking the pdfjs-dist chain
// ─────────────────────────────────────────────────────────────────────────
describe("extractTextFromPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Helper: create a File-like object with a mock arrayBuffer method */
  function createMockFile(name = "test.pdf"): File {
    const blob = new Blob(["fake-pdf-bytes"], { type: "application/pdf" });
    return new File([blob], name, { type: "application/pdf" });
  }

  /** Helper: set up the mock chain for a given number of pages */
  function setupPDFMock(pages: Array<{ str: string }[]>) {
    mockGetTextContent.mockImplementation(() =>
      Promise.resolve({
        items: pages[mockGetPage.mock.calls.length - 1].map((p) => ({
          str: p.str,
        })),
      }),
    );

    mockGetPage.mockImplementation(() =>
      Promise.resolve({
        getTextContent: mockGetTextContent,
      }),
    );

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: pages.length,
        getPage: mockGetPage,
      }),
    });
  }

  it("extracts text from a single-page PDF", async () => {
    setupPDFMock([[{ str: "Hello" }, { str: "World" }]]);

    const result = await extractTextFromPDF(createMockFile());
    expect(result).toBe("Hello World");
  });

  it("joins multiple pages with newlines", async () => {
    setupPDFMock([
      [{ str: "Page 1 text" }],
      [{ str: "Page 2 text" }],
      [{ str: "Page 3 text" }],
    ]);

    const result = await extractTextFromPDF(createMockFile());
    expect(result).toBe("Page 1 text\nPage 2 text\nPage 3 text");
  });

  it("returns empty string for a PDF with no text items", async () => {
    setupPDFMock([[]]);

    const result = await extractTextFromPDF(createMockFile());
    expect(result).toBe("");
  });

  it("filters out items without str property", async () => {
    // getTextContent can return items without `str` (e.g., marked content)
    mockGetTextContent.mockResolvedValue({
      items: [
        { str: "Keep this" },
        { width: 100 }, // no str — should be filtered
        { str: "And this" },
      ],
    });

    mockGetPage.mockResolvedValue({
      getTextContent: mockGetTextContent,
    });

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: mockGetPage,
      }),
    });

    const result = await extractTextFromPDF(createMockFile());
    expect(result).toBe("Keep this And this");
  });

  it("calls getDocument with the file's ArrayBuffer", async () => {
    setupPDFMock([[{ str: "test" }]]);

    const file = createMockFile();
    await extractTextFromPDF(file);

    expect(mockGetDocument).toHaveBeenCalledOnce();
    // The argument should be an object with a `data` property (ArrayBuffer)
    const callArg = mockGetDocument.mock.calls[0][0];
    expect(callArg).toHaveProperty("data");
    expect(callArg.data).toBeInstanceOf(ArrayBuffer);
  });
});
