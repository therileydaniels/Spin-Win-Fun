import { SUPPORT_PROMPT_FLAG } from "@shared/supportPrompt";

export function hasSeenSupportPrompt(): boolean {
  try {
    return localStorage.getItem(SUPPORT_PROMPT_FLAG) === "true";
  } catch {
    return false;
  }
}

export function markSupportPromptSeen(): void {
  try {
    localStorage.setItem(SUPPORT_PROMPT_FLAG, "true");
  } catch {
    // private mode / storage disabled — degrade silently
  }
}
