import { describe, it, expect } from "vitest";
import {
  isReferralStatus,
  isDocumentType,
  isDocumentStatus,
} from "@/lib/types";

describe("isReferralStatus", () => {
  it.each(["pending", "in_review", "eligible", "ineligible", "placed"])(
    'returns true for valid status "%s"',
    (status) => {
      expect(isReferralStatus(status)).toBe(true);
    },
  );

  it.each(["", "unknown", "PENDING", "active", "deleted", "draft"])(
    'returns false for invalid status "%s"',
    (status) => {
      expect(isReferralStatus(status)).toBe(false);
    },
  );
});

describe("isDocumentType", () => {
  it.each(["lrc_base", "qsi", "support_plan", "other"])(
    'returns true for valid document type "%s"',
    (type) => {
      expect(isDocumentType(type)).toBe(true);
    },
  );

  it.each(["", "pdf", "LRC_BASE", "unknown", "attachment"])(
    'returns false for invalid document type "%s"',
    (type) => {
      expect(isDocumentType(type)).toBe(false);
    },
  );
});

describe("isDocumentStatus", () => {
  it.each(["pending", "processing", "complete", "error"])(
    'returns true for valid document status "%s"',
    (status) => {
      expect(isDocumentStatus(status)).toBe(true);
    },
  );

  it.each(["", "done", "PENDING", "uploaded", "failed"])(
    'returns false for invalid document status "%s"',
    (status) => {
      expect(isDocumentStatus(status)).toBe(false);
    },
  );
});
