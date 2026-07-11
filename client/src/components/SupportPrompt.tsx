import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useEntitlements } from "@/hooks/useEntitlements";
import { shouldShowSupportPrompt } from "@shared/supportPrompt";
import {
  hasSeenSupportPrompt,
  markSupportPromptSeen,
} from "@/lib/supportPromptStorage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SupportPromptProps {
  /** Mirrors useWheelSpin().showResult — true while the WinnerModal is open. */
  spinResultOpen: boolean;
}

// Small delay after the winner modal closes so the popup doesn't collide with
// the win celebration.
const OPEN_DELAY_MS = 1000;

export function SupportPrompt({ spinResultOpen }: SupportPromptProps) {
  const { isPro, isLoaded } = useEntitlements();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  // True once a spin's result modal has been shown at least once.
  const sawResultRef = useRef(false);
  // True once we've decided to open (don't re-trigger this session).
  const handledRef = useRef(false);
  // Latest isPro, read inside the delayed open so a late Clerk plan upgrade
  // (stale false → true within the open delay) can still suppress the popup.
  const isProRef = useRef(isPro);
  useEffect(() => {
    isProRef.current = isPro;
  }, [isPro]);

  useEffect(() => {
    if (spinResultOpen) {
      sawResultRef.current = true;
      return;
    }
    // WinnerModal just closed (or was never open).
    if (!sawResultRef.current || handledRef.current) return;

    const seen = hasSeenSupportPrompt();
    if (!shouldShowSupportPrompt({ isLoaded, isPro, seen, spinSettled: true })) {
      // Not eligible yet (e.g. Clerk still loading). The effect re-runs when
      // isLoaded/isPro change, so a late-loading Pro flag is still respected.
      return;
    }
    handledRef.current = true;
    const t = window.setTimeout(() => {
      // Re-check Pro at fire time — Clerk may have corrected a stale false.
      if (!isProRef.current) setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [spinResultOpen, isLoaded, isPro]);

  const handleLater = () => {
    markSupportPromptSeen();
    setOpen(false);
  };

  const handleSupport = () => {
    markSupportPromptSeen();
    setOpen(false);
    setLocation("/pricing?src=support_prompt");
  };

  // Escape / overlay-click closes for THIS session only — it must NOT burn the
  // one-time flag. Only the two buttons call markSupportPromptSeen().
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QuickWheel is free — and staying that way</DialogTitle>
          <DialogDescription>
            All the core features are free forever. If you'd like to support the
            app, you can upgrade to Pro — it helps me cover hosting costs and
            build more free tools like this one. Either way, thanks for spinning! 🎡
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleLater}
            data-testid="button-support-later"
          >
            Maybe later
          </Button>
          <Button onClick={handleSupport} data-testid="button-support-pro">
            Support QuickWheel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
