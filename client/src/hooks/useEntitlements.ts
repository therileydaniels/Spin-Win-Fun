import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { entitlementsFor, PRO_PLAN, type Entitlements } from "@shared/entitlements";

export interface UseEntitlements extends Entitlements {
  isPro: boolean;
  isLoaded: boolean;
}

export function useEntitlements(): UseEntitlements {
  const { isLoaded, has } = useAuth();
  // While Clerk is loading, treat as free (fail-closed: never flash Pro features).
  const isPro = isLoaded && typeof has === "function" ? has({ plan: PRO_PLAN }) : false;
  return useMemo(
    () => ({ ...entitlementsFor(isPro), isPro, isLoaded }),
    [isPro, isLoaded]
  );
}
