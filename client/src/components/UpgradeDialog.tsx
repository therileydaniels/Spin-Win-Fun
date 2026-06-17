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

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function UpgradeDialog({ open, onOpenChange, feature }: UpgradeDialogProps) {
  const [, setLocation] = useLocation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogAction onClick={() => setLocation("/pricing")} data-testid="button-go-pricing">
            See Pro plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
