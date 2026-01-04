import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function SpinButton({ onClick, disabled, isSpinning }: SpinButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="relative min-w-[200px] min-h-[56px] text-lg font-semibold tracking-wide bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      data-testid="button-spin"
    >
      {isSpinning ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Spinning...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          SPIN
        </span>
      )}
    </Button>
  );
}
