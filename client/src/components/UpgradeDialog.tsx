import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trackEvent } from "@/lib/analytics";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  /** GA4 event value identifying which gate triggered this dialog. */
  gate: string;
}

export function UpgradeDialog({ open, onOpenChange, feature, gate }: UpgradeDialogProps) {
  const [, setLocation] = useLocation();
  // Distinguishes "closed via upgrade click" from "closed via cancel/esc/overlay"
  // so onOpenChange(false) doesn't double-fire a dismissed event after upgrade_clicked.
  const upgradeClickedRef = useRef(false);

  useEffect(() => {
    if (open) trackEvent("upgrade_dialog_shown", { gate });
  }, [open, gate]);

  const handleOpenChange = (next: boolean) => {
    if (!next && !upgradeClickedRef.current) {
      trackEvent("upgrade_dialog_dismissed", { gate });
    }
    upgradeClickedRef.current = false;
    onOpenChange(next);
  };

  const handleUpgradeClick = () => {
    upgradeClickedRef.current = true;
    trackEvent("upgrade_dialog_upgrade_clicked", { gate });
    setLocation("/pricing?src=dialog");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Upgrade to Pro
          </AlertDialogTitle>
          <AlertDialogDescription>
            {feature
              ? `${feature} is a Pro feature.`
              : "This is a Pro feature."}{" "}
            Pro unlocks OBS overlays, presentation mode, custom colors, exports,
            no watermark, and up to 50 wheels with 20 segments each.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-upgrade">Not now</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgradeClick} data-testid="button-go-pricing">
            See Pro plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
