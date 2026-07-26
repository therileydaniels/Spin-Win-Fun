import { describe, it, expect } from "vitest";
import { shouldShowSupportPrompt, SUPPORT_PROMPT_FLAG } from "./supportPrompt";

describe("shouldShowSupportPrompt", () => {
  it("is disabled pending a new donation destination", () => {
    expect(shouldShowSupportPrompt({ seen: false, spinSettled: true })).toBe(false);
    expect(shouldShowSupportPrompt({ seen: true, spinSettled: true })).toBe(false);
    expect(shouldShowSupportPrompt({ seen: false, spinSettled: false })).toBe(false);
  });
  it("exposes the localStorage flag key", () => {
    expect(SUPPORT_PROMPT_FLAG).toBe("quickwheel_support_prompt_seen");
  });
});
