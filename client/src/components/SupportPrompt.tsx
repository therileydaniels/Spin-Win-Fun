import { useEffect, useRef, useState } from "react";
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

// Currently disabled — see shouldShowSupportPrompt in shared/supportPrompt.ts.
// Left in place (markup + wiring) so it's easy to re-enable with a new
// donation destination later.
export function SupportPrompt({ spinResultOpen }: SupportPromptProps) {
  const [open, setOpen] = useState(false);
  // True once a spin's result modal has been shown at least once.
  const sawResultRef = useRef(false);
  // True once we've decided to open (don't re-trigger this session).
  const handledRef = useRef(false);

  useEffect(() => {
    if (spinResultOpen) {
      sawResultRef.current = true;
      return;
    }
    // WinnerModal just closed (or was never open).
    if (!sawResultRef.current || handledRef.current) return;

    const seen = hasSeenSupportPrompt();
    if (!shouldShowSupportPrompt({ seen, spinSettled: true })) {
      return;
    }
    handledRef.current = true;
    const t = window.setTimeout(() => {
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [spinResultOpen]);

  const handleLater = () => {
    markSupportPromptSeen();
    setOpen(false);
  };

  const handleSupport = () => {
    markSupportPromptSeen();
    setOpen(false);
  };

  // Escape / overlay-click closes for THIS session only — it must NOT burn the
  // one-time flag. Only the two buttons call markSupportPromptSeen().
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QuickWheel is free — and staying that way</DialogTitle>
          <DialogDescription>
            All the core features are free forever. Thanks for spinning! 🎡
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
            Thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
