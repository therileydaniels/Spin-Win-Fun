import { useEffect } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { SpinButton } from "@/components/SpinButton";
import { WinnerModal } from "@/components/WinnerModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { useWheelSpin } from "@/hooks/useWheelSpin";
import { useSound } from "@/hooks/useSound";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";

export default function Home() {
  const {
    isSpinning,
    rotation,
    winner,
    showResult,
    spin,
    closeResult,
    spinDuration,
  } = useWheelSpin();
  const { isMuted, toggleMute, playWinSound } = useSound();

  useEffect(() => {
    if (showResult && winner) {
      fireCenterBurst();
      fireWinConfetti();
      playWinSound();
    }
  }, [showResult, winner, playWinSound]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Wheel Spinner
        </h1>
        <div className="flex items-center gap-1">
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-4 sm:p-8">
        <div className="w-full max-w-[400px] sm:max-w-[500px]">
          <SpinWheel
            rotation={rotation}
            isSpinning={isSpinning}
            spinDuration={spinDuration}
          />
        </div>

        <SpinButton
          onClick={spin}
          disabled={isSpinning}
          isSpinning={isSpinning}
        />

        {winner && (
          <p
            className="text-sm text-muted-foreground transition-opacity duration-300"
            style={{ opacity: showResult ? 1 : 0 }}
            data-testid="text-last-winner"
          >
            Last winner: <span className="font-semibold">{winner.label}</span>
          </p>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        <p>For entertainment purposes only</p>
      </footer>

      <WinnerModal isOpen={showResult} onClose={closeResult} winner={winner} />
    </div>
  );
}
