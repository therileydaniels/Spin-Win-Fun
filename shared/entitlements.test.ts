import { describe, it, expect } from "vitest";
import {
  entitlementsFor,
  canSaveWheel,
  isSegmentCountAllowed,
  FREE,
  PRO,
  PRO_PLAN,
} from "./entitlements";

describe("entitlementsFor", () => {
  it("returns FREE caps for a non-pro user", () => {
    expect(entitlementsFor(false)).toEqual(FREE);
    expect(FREE.maxWheels).toBe(3);
    expect(FREE.maxSegments).toBe(8);
    expect(FREE.export).toBe(false);
    expect(FREE.obs).toBe(false);
    expect(FREE.presentation).toBe(false);
    expect(FREE.customColors).toBe(false);
    expect(FREE.branding).toBe(true);
  });

  it("returns PRO caps for a pro user", () => {
    expect(entitlementsFor(true)).toEqual(PRO);
    expect(PRO.maxWheels).toBe(50);
    expect(PRO.maxSegments).toBe(20);
    expect(PRO.export).toBe(true);
    expect(PRO.obs).toBe(true);
    expect(PRO.presentation).toBe(true);
    expect(PRO.customColors).toBe(true);
    expect(PRO.branding).toBe(false);
  });
});

describe("canSaveWheel", () => {
  it("allows saving below the cap", () => {
    expect(canSaveWheel(2, FREE)).toBe(true);
  });
  it("blocks saving at or above the cap", () => {
    expect(canSaveWheel(3, FREE)).toBe(false);
    expect(canSaveWheel(4, FREE)).toBe(false); // over-cap legacy user
    expect(canSaveWheel(50, PRO)).toBe(false);
  });
});

describe("isSegmentCountAllowed", () => {
  it("respects the per-tier max", () => {
    expect(isSegmentCountAllowed(8, FREE)).toBe(true);
    expect(isSegmentCountAllowed(9, FREE)).toBe(false);
    expect(isSegmentCountAllowed(20, PRO)).toBe(true);
    expect(isSegmentCountAllowed(21, PRO)).toBe(false);
  });
});

it("exposes the Clerk plan slug", () => {
  expect(PRO_PLAN).toBe("pro");
});
