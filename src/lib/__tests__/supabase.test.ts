import { describe, it, expect } from "vitest";
import { supabase } from "@/lib/supabase";

describe("Supabase client", () => {
  it("exports a defined supabase client", () => {
    expect(supabase).toBeDefined();
  });

  it("has an auth property", () => {
    expect(supabase.auth).toBeDefined();
  });

  it("has a from method for table queries", () => {
    expect(typeof supabase.from).toBe("function");
  });

  it("has a storage property for bucket operations", () => {
    expect(supabase.storage).toBeDefined();
  });
});
