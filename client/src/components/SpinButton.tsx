import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function SpinButton({ onClick, disabled, isSpinning }: SpinButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isIdle = !disabled && !isSpinning && !isPressed && !isHovered;

  const getScale = () => {
    if (isPressed && !disabled) return "scale(0.95)";
    if (isHovered && !disabled && !isSpinning) return "scale(1.03)";
    return undefined;
  };

  const getBoxShadow = () => {
    if (isSpinning) {
      return "0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(99,102,241,0.4), 0 10px 40px rgba(99,102,241,0.3)";
    }
    if (isHovered && !disabled) {
      return "0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(99,102,241,0.3), 0 8px 30px rgba(99,102,241,0.3)";
    }
    return "0 4px 20px rgba(139,92,246,0.4), 0 8px 30px rgba(99,102,241,0.2)";
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsPressed(false); setIsHovered(false); }}
      className={`relative min-w-[220px] min-h-[60px] text-lg font-bold tracking-wider text-white border-none shadow-2xl transition-all duration-200 ease-out disabled:opacity-70 disabled:cursor-not-allowed overflow-visible ${!disabled && !isSpinning ? 'animate-pulse-glow' : ''} ${isIdle ? 'animate-idle-breathe' : ''}`}
      style={{
        background: "linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #0EA5E9 100%)",
        boxShadow: getBoxShadow(),
        ...(getScale() ? { transform: getScale() } : {}),
      }}
      data-testid="button-spin"
    >
      {isSpinning ? (
        <span className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          SPINNING...
        </span>
      ) : (
        <span className="flex items-center gap-2 uppercase">
          Spin the Wheel
        </span>
      )}
    </Button>
  );
}
