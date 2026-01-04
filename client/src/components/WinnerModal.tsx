import { WheelSegment } from "@/lib/wheelSegments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

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
        className="sm:max-w-md border-none"
        data-testid="modal-winner"
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg animate-bounce-in">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
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
            className="min-w-[120px]"
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
