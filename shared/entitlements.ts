// Single source of truth for tier capabilities. Pure + dependency-free so both
// the React client and the Express server import the exact same rules. To port
// monetization to another Clerk app, copy this file and adjust the values.

export interface Entitlements {
  /** Max saved wheels (cloud for signed-in, localStorage for anonymous). */
  maxWheels: number;
  /** Max segments allowed when saving/editing a wheel. */
  maxSegments: number;
  /** SVG export of the wheel. */
  export: boolean;
  /** Generate the OBS browser-source overlay link. */
  obs: boolean;
  /** Full-screen presentation mode. */
  presentation: boolean;
  /** Per-segment custom color picker (vs. preset palettes only). */
  customColors: boolean;
  /** Show the "Made with QuickWheel" watermark (true = shown, free tier). */
  branding: boolean;
}

export const FREE: Entitlements = {
  maxWheels: 3,
  maxSegments: 8,
  export: false,
  obs: false,
  presentation: false,
  customColors: false,
  branding: true,
};

export const PRO: Entitlements = {
  maxWheels: 50,
  maxSegments: 20,
  export: true,
  obs: true,
  presentation: true,
  customColors: true,
  branding: false,
};

/** Clerk Billing plan slug. The ONLY place provider coupling is named. */
export const PRO_PLAN = "pro";

export function entitlementsFor(isPro: boolean): Entitlements {
  return isPro ? PRO : FREE;
}

/** True if a user with `currentCount` saved wheels may create one more. */
export function canSaveWheel(currentCount: number, e: Entitlements): boolean {
  return currentCount < e.maxWheels;
}

/** True if a wheel with `count` segments is allowed for this tier. */
export function isSegmentCountAllowed(count: number, e: Entitlements): boolean {
  return count <= e.maxSegments;
}
