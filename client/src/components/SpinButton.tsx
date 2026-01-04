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
      className="relative min-w-[180px] min-h-[52px] text-base font-semibold tracking-widest uppercase bg-gradient-to-b from-[#2D2926] to-[#1A1816] border border-[#D4AF37]/30 text-[#F5E6A3] shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        boxShadow: disabled 
          ? "0 4px 12px rgba(0,0,0,0.15)"
          : "0 4px 20px rgba(212,175,55,0.25), 0 2px 8px rgba(0,0,0,0.2)",
      }}
      data-testid="button-spin"
    >
      {isSpinning ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Spinning...
        </span>
      ) : (
        <span>Spin</span>
      )}
    </Button>
  );
}
