// Single source of truth for app-wide capability limits. Pure + dependency-free
// so both the React client and the Express server import the exact same rules.

export interface Entitlements {
  /** Max saved wheels (localStorage). */
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
  /** Show the "Made with QuickWheel" watermark. */
  branding: boolean;
}

export const ENTITLEMENTS: Entitlements = {
  maxWheels: 10,
  maxSegments: 12,
  export: true,
  obs: true,
  presentation: true,
  customColors: true,
  branding: false,
};

/** True if a user with `currentCount` saved wheels may create one more. */
export function canSaveWheel(currentCount: number, e: Entitlements = ENTITLEMENTS): boolean {
  return currentCount < e.maxWheels;
}

/** True if a wheel with `count` segments is allowed. */
export function isSegmentCountAllowed(count: number, e: Entitlements = ENTITLEMENTS): boolean {
  return count <= e.maxSegments;
}
