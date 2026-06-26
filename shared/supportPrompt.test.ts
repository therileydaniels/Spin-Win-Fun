import { describe, it, expect } from "vitest";
import { shouldShowSupportPrompt, SUPPORT_PROMPT_FLAG } from "./supportPrompt";

const base = { isLoaded: true, isPro: false, seen: false, spinSettled: true };

describe("shouldShowSupportPrompt", () => {
  it("shows for a loaded, free, unseen user after a spin settles", () => {
    expect(shouldShowSupportPrompt(base)).toBe(true);
  });
  it("hides while Clerk is still loading", () => {
    expect(shouldShowSupportPrompt({ ...base, isLoaded: false })).toBe(false);
  });
  it("hides for Pro users", () => {
    expect(shouldShowSupportPrompt({ ...base, isPro: true })).toBe(false);
  });
  it("hides once already seen", () => {
    expect(shouldShowSupportPrompt({ ...base, seen: true })).toBe(false);
  });
  it("hides before any spin has settled", () => {
    expect(shouldShowSupportPrompt({ ...base, spinSettled: false })).toBe(false);
  });
  it("exposes the localStorage flag key", () => {
    expect(SUPPORT_PROMPT_FLAG).toBe("quickwheel_support_prompt_seen");
  });
});
