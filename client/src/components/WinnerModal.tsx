import { WheelSegment } from "@/lib/wheelSegments";
import {
  Dialog,
  DialogContent,
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
        className="sm:max-w-md border border-[#D4AF37]/20 bg-card"
        data-testid="modal-winner"
      >
        <DialogHeader className="text-center">
          <div 
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center animate-bounce-in"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #C5A028 100%)",
              boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
            }}
          >
            <Sparkles className="w-7 h-7 text-[#2D2926]" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center tracking-tight">
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div
            className="px-8 py-4 rounded-lg text-center shadow-md animate-bounce-in"
            style={{
              backgroundColor: winner.color,
              color: winner.textColor,
              animationDelay: "0.1s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <p className="text-xs font-medium opacity-70 mb-1 uppercase tracking-wider">Winner</p>
            <p className="text-xl font-bold" data-testid="text-winner-label">
              {winner.label}
            </p>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="min-w-[100px] border-border"
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
