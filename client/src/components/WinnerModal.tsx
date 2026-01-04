import { WheelSegment } from "@/lib/wheelSegments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: WheelSegment | null;
}

export function WinnerModal({ isOpen, onClose, winner }: WinnerModalProps) {
  if (!winner) return null;

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
              background: `linear-gradient(135deg, ${winner.gradientStart}, ${winner.gradientEnd})`,
              boxShadow: `0 0 30px ${winner.gradientStart}50`
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
              background: `linear-gradient(135deg, ${winner.gradientStart}, ${winner.gradientEnd})`,
              color: winner.textColor,
              animationDelay: "0.1s",
              boxShadow: `0 10px 40px ${winner.gradientStart}40`
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
