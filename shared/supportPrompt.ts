// Pure, no deps — portable and Vitest-testable (mirrors entitlements.ts).

export const SUPPORT_PROMPT_FLAG = "quickwheel_support_prompt_seen";

export interface SupportPromptState {
  /** The one-time localStorage flag is already set on this device. */
  seen: boolean;
  /** A first spin has completed and its result modal has closed. */
  spinSettled: boolean;
}

// Disabled for now: the old "Support QuickWheel" CTA pointed at the Pro
// upsell, which no longer exists. Re-enable once there's a new donation
// destination to point it at.
export function shouldShowSupportPrompt(_s: SupportPromptState): boolean {
  return false;
}
