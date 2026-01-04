import { useEffect } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { SpinButton } from "@/components/SpinButton";
import { WinnerModal } from "@/components/WinnerModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { useWheelSpin } from "@/hooks/useWheelSpin";
import { useSound } from "@/hooks/useSound";
import { useCustomSegments } from "@/hooks/useCustomSegments";
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
  const {
    segments,
    probabilities,
    addSegment,
    removeSegment,
    renameSegment,
    recolorSegment,
    setProbability,
    resetProbabilities,
    resetToDefault,
    canAdd,
    canRemove,
    total,
    isValid,
    isEqualOdds,
  } = useCustomSegments();

  useEffect(() => {
    if (showResult && winner) {
      fireCenterBurst();
      fireWinConfetti();
      playWinSound();
    }
  }, [showResult, winner, playWinSound]);

  const handleSpin = () => {
    spin(probabilities, segments);
  };

  const canSpin = isValid && !isSpinning;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.1) 0%, transparent 40%)"
        }}
      />
      
      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10">
        <h1 
          className="text-xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Wheel Spinner
        </h1>
        <div className="flex items-center gap-1">
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-4 sm:p-8">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full max-w-[340px] sm:max-w-[420px]">
            <SpinWheel
              segments={segments}
              rotation={rotation}
              isSpinning={isSpinning}
              spinDuration={spinDuration}
            />
          </div>

          <SpinButton
            onClick={handleSpin}
            disabled={!canSpin}
            isSpinning={isSpinning}
          />

          {winner && (
            <p
              className="text-sm text-muted-foreground transition-opacity duration-300"
              style={{ opacity: showResult ? 1 : 0 }}
              data-testid="text-last-winner"
            >
              Last winner: <span className="font-semibold text-foreground">{winner.label}</span>
            </p>
          )}
        </div>

        <ProbabilityPanel
          segments={segments}
          probabilities={probabilities}
          onProbabilityChange={setProbability}
          onRename={renameSegment}
          onRecolor={recolorSegment}
          onAdd={addSegment}
          onRemove={removeSegment}
          onResetProbabilities={resetProbabilities}
          onNewWheel={resetToDefault}
          total={total}
          isValid={isValid}
          isEqualOdds={isEqualOdds}
          canAdd={canAdd}
          canRemove={canRemove}
        />
      </main>

      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground border-t border-white/5">
        <p>For entertainment purposes only</p>
      </footer>

      <WinnerModal isOpen={showResult} onClose={closeResult} winner={winner} />
    </div>
  );
}
