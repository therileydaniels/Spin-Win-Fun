import { ENTITLEMENTS, type Entitlements } from "@shared/entitlements";

export type UseEntitlements = Entitlements;

export function useEntitlements(): UseEntitlements {
  return ENTITLEMENTS;
}
