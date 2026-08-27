import { describe, it, expect } from "vitest";
import { canSaveWheel, isSegmentCountAllowed, ENTITLEMENTS } from "./entitlements";

describe("ENTITLEMENTS", () => {
  it("defines the flat app-wide caps", () => {
    expect(ENTITLEMENTS.maxWheels).toBe(10);
    expect(ENTITLEMENTS.maxSegments).toBe(20);
    expect(ENTITLEMENTS.export).toBe(true);
    expect(ENTITLEMENTS.obs).toBe(true);
    expect(ENTITLEMENTS.presentation).toBe(true);
    expect(ENTITLEMENTS.customColors).toBe(true);
    expect(ENTITLEMENTS.branding).toBe(false);
  });
});

describe("canSaveWheel", () => {
  it("allows saving below the cap", () => {
    expect(canSaveWheel(9)).toBe(true);
  });
  it("blocks saving at or above the cap", () => {
    expect(canSaveWheel(10)).toBe(false);
    expect(canSaveWheel(11)).toBe(false); // over-cap legacy user
  });
});

describe("isSegmentCountAllowed", () => {
  it("respects the max", () => {
    expect(isSegmentCountAllowed(20)).toBe(true);
    expect(isSegmentCountAllowed(21)).toBe(false);
  });
});
