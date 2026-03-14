import { useEffect, useState, useCallback } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { SpinButton } from "@/components/SpinButton";
import { WinnerModal } from "@/components/WinnerModal";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { SaveWheelModal } from "@/components/SaveWheelModal";
import { WheelHeader } from "@/components/WheelHeader";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Button } from "@/components/ui/button";
import { useWheelSpin } from "@/hooks/useWheelSpin";
import { useSound } from "@/hooks/useSound";
import { useCustomSegments } from "@/hooks/useCustomSegments";
import { useToast } from "@/hooks/use-toast";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";
import { Footer } from "@/components/Footer";
import { saveWheelToLocal, updateLocalWheel, decodeWheelFromUrl } from "@/lib/localWheelStorage";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, ChevronLeft } from "lucide-react";

export default function Home() {
  const {
    isSpinning,
    rotation,
    winner,
    showResult,
    spin,
    closeResult,
    spinDuration,
    error: spinError,
    clearError: clearSpinError,
  } = useWheelSpin();
  const { isMuted, toggleMute, playWinSound } = useSound();
  const {
    segments,
    probabilities,
    addSegment,
    removeSegment,
    renameSegment,
    recolorSegment,
    applyColorPalette,
    setProbability,
    resetProbabilities,
    resetToDefault,
    canAdd,
    canRemove,
    total,
    isValid,
    isEqualOdds,
    currentWheelId,
    currentWheelName,
    hasUnsavedChanges,
    getWheelData,
    markSaved,
    loadWheel,
  } = useCustomSegments();

  const { toast } = useToast();

  const [presentationMode, setPresentationMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [spinHistory, setSpinHistory] = useState<Array<{ label: string; color: string; timestamp: Date }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [removeWinnerMode, setRemoveWinnerMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wheelParam = params.get("wheel");

    if (wheelParam) {
      const decoded = decodeWheelFromUrl(wheelParam);
      if (decoded && decoded.segments.length >= 2) {
        const data = {
          segments: decoded.segments.map(s => ({ id: s.id, label: s.label, color: s.color })),
          probabilities: decoded.segments.map(s => s.probability),
        };
        loadWheel("shared", decoded.name, data);
        window.history.replaceState({}, "", "/");
        toast({
          title: "Wheel loaded!",
          description: `"${decoded.name}" has been loaded from shared link.`,
        });
      }
    }
    setIsLoading(false);
  }, []);

  const handleSaveWheel = () => {
    if (currentWheelId && !saveAsMode) {
      const wheelData = getWheelData();
      const segmentsWithProb = wheelData.segments.map((seg, idx) => ({
        id: seg.id,
        label: seg.label,
        color: seg.color,
        probability: wheelData.probabilities[idx],
      }));
      const result = updateLocalWheel(currentWheelId, {
        name: currentWheelName || "My Wheel",
        segments: segmentsWithProb,
      });
      if (result.success && result.wheel) {
        markSaved(result.wheel.id, result.wheel.name);
        setSettingsOpen(false);
        toast({
          title: "Wheel updated!",
          description: `"${result.wheel.name}" has been saved.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update wheel.",
          variant: "destructive",
        });
      }
    } else {
      setSaveAsMode(false);
      setSaveModalOpen(true);
    }
  };

  const handleSaveNew = (name: string) => {
    const wheelData = getWheelData();
    const segmentsWithProb = wheelData.segments.map((seg, idx) => ({
      id: seg.id,
      label: seg.label,
      color: seg.color,
      probability: wheelData.probabilities[idx],
    }));
    const result = saveWheelToLocal({
      name,
      segments: segmentsWithProb,
    });
    if (result.success && result.wheel) {
      markSaved(result.wheel.id, result.wheel.name);
      setSaveModalOpen(false);
      setSettingsOpen(false);
      toast({
        title: "Wheel saved!",
        description: `"${result.wheel.name}" has been saved.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save wheel.",
        variant: "destructive",
      });
    }
  };

  const exitPresentationMode = useCallback(() => {
    setPresentationMode(false);
  }, []);

  useEffect(() => {
    if (showResult && winner) {
      fireCenterBurst();
      const cleanupConfetti = fireWinConfetti();
      playWinSound();

      setSpinHistory(prev => [
        { label: winner.label, color: winner.color, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);

      if (removeWinnerMode && segments.length > 2) {
        removeSegment(winner.id);
      }

      return cleanupConfetti;
    }
  }, [showResult, winner, playWinSound, removeWinnerMode, segments.length, removeSegment]);

  const handleSpin = useCallback(() => {
    spin(probabilities, segments);
  }, [spin, probabilities, segments]);

  const canSpin = isValid && !isSpinning;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && presentationMode) {
        exitPresentationMode();
      }
      if (e.key === " " && canSpin && !showResult) {
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toUpperCase();
        if (tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationMode, exitPresentationMode, canSpin, showResult, handleSpin]);

  useEffect(() => {
    if (spinError) {
      toast({
        title: "Spin failed",
        description: spinError,
        variant: "destructive",
      });
      clearSpinError();
    }
  }, [spinError, toast, clearSpinError]);

  const wheelSizeClass = presentationMode
    ? "w-[300px] md:w-[400px] lg:w-[450px]"
    : settingsOpen
      ? "w-[240px] md:w-[300px] lg:w-[340px]"
      : "w-[300px] md:w-[380px] lg:w-[450px]";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 40%), radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 40%)"
        }}
      />

      {!presentationMode && (
        <WheelHeader
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen(!settingsOpen)}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          removeWinnerMode={removeWinnerMode}
          onToggleRemoveWinner={() => setRemoveWinnerMode(!removeWinnerMode)}
          onEnterPresentation={() => setPresentationMode(true)}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {presentationMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={exitPresentationMode}
          className="fixed top-4 right-4 text-muted-foreground opacity-40 hover:opacity-100 transition-opacity z-50 gap-2"
          data-testid="button-exit-presentation"
          aria-label="Exit presentation mode"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs">Settings</span>
        </Button>
      )}

      <main className={`relative z-10 flex-1 flex flex-col ${presentationMode ? "" : settingsOpen ? "lg:flex-row" : ""} items-center justify-center gap-6 p-4 sm:p-6`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-center">
            {isLoading ? (
              <div className={`aspect-square flex items-center justify-center transition-all duration-300 ${wheelSizeClass}`}>
                <Skeleton className="w-full aspect-square rounded-full" />
              </div>
            ) : (
              <div className={`transition-all duration-300 ${wheelSizeClass}`}>
                <SpinWheel
                  segments={segments}
                  rotation={rotation}
                  isSpinning={isSpinning}
                  spinDuration={spinDuration}
                />
              </div>
            )}
          </div>

          <SpinButton
            onClick={handleSpin}
            disabled={!canSpin || isLoading}
            isSpinning={isSpinning}
          />

          {winner && (
            <p
              className={`text-muted-foreground transition-opacity duration-300 ${
                presentationMode ? "text-lg" : "text-sm"
              }`}
              style={{ opacity: showResult ? 1 : 0 }}
              data-testid="text-last-winner"
            >
              Last winner: <span className="font-semibold text-foreground">{winner.label}</span>
            </p>
          )}
        </div>

        {!presentationMode && settingsOpen && (
          <div className="relative animate-slide-in-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(false)}
              className="absolute -left-2 top-2 z-10 text-muted-foreground hover:text-foreground lg:block hidden"
              data-testid="button-collapse-settings"
              aria-label="Collapse settings"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <ProbabilityPanel
              segments={segments}
              probabilities={probabilities}
              onProbabilityChange={setProbability}
              onRename={renameSegment}
              onRecolor={recolorSegment}
              onApplyColorPalette={applyColorPalette}
              onAdd={addSegment}
              onRemove={removeSegment}
              onResetProbabilities={resetProbabilities}
              onNewWheel={resetToDefault}
              onSaveWheel={handleSaveWheel}
              total={total}
              isValid={isValid}
              isEqualOdds={isEqualOdds}
              canAdd={canAdd}
              canRemove={canRemove}
              currentWheelName={currentWheelName}
              hasUnsavedChanges={hasUnsavedChanges}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        )}
      </main>

      {!presentationMode && showHistory && (
        <HistoryPanel entries={spinHistory} onClose={() => setShowHistory(false)} />
      )}

      {!presentationMode && <Footer />}

      <WinnerModal
        isOpen={showResult}
        onClose={closeResult}
        winner={winner}
        onSpinAgain={canSpin ? handleSpin : undefined}
      />
      <SaveWheelModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        onSave={handleSaveNew}
        defaultName={currentWheelName || "My Wheel"}
      />
    </div>
  );
}
