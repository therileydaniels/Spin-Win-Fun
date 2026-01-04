import { CustomSegment } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: CustomSegment | null;
}

export function WinnerModal({ isOpen, onClose, winner }: WinnerModalProps) {
  if (!winner) return null;

  const gradientEnd = adjustColor(winner.color, -30);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md border border-white/10 bg-card/95 backdrop-blur-xl"
        data-testid="modal-winner"
      >
        <DialogHeader className="text-center">
          <div 
            className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl animate-bounce-in"
            style={{
              background: `linear-gradient(135deg, ${winner.color}, ${gradientEnd})`,
              boxShadow: `0 0 30px ${winner.color}50`
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Congratulations!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            The wheel has chosen a winner
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div
            className="px-8 py-4 rounded-xl text-center shadow-2xl animate-bounce-in"
            style={{
              background: `linear-gradient(135deg, ${winner.color}, ${gradientEnd})`,
              color: "#FFFFFF",
              animationDelay: "0.1s",
              boxShadow: `0 10px 40px ${winner.color}40`
            }}
          >
            <p className="text-sm font-medium opacity-80 mb-1">Winner</p>
            <p className="text-2xl font-bold" data-testid="text-winner-label">
              {winner.label}
            </p>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="min-w-[120px] border-white/20"
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
