// Pure, no deps — portable and Vitest-testable (mirrors entitlements.ts).

export const SUPPORT_PROMPT_FLAG = "quickwheel_support_prompt_seen";

export interface SupportPromptState {
  /** Clerk auth has finished loading. */
  isLoaded: boolean;
  /** User is on the Pro plan. */
  isPro: boolean;
  /** The one-time localStorage flag is already set on this device. */
  seen: boolean;
  /** A first spin has completed and its result modal has closed. */
  spinSettled: boolean;
}

export function shouldShowSupportPrompt(s: SupportPromptState): boolean {
  return s.isLoaded && !s.isPro && !s.seen && s.spinSettled;
}
