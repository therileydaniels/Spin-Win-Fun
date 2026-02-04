import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SpinWheel } from "@/components/SpinWheel";
import { SpinButton } from "@/components/SpinButton";
import { WinnerModal } from "@/components/WinnerModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { SaveWheelModal } from "@/components/SaveWheelModal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWheelSpin } from "@/hooks/useWheelSpin";
import { useSound } from "@/hooks/useSound";
import { useCustomSegments } from "@/hooks/useCustomSegments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Footer } from "@/components/Footer";
import { InstallPrompt } from "@/components/InstallPrompt";
import { saveWheelToLocal, updateLocalWheel } from "@/lib/localWheelStorage";
import { Monitor, Settings, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
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
  } = useCustomSegments();

  const { user } = useAuth();
  const { toast } = useToast();

  const [presentationMode, setPresentationMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);

  const handleSaveWheel = () => {
    if (currentWheelId && !saveAsMode) {
      const wheelData = getWheelData();
      const segmentsWithProb = wheelData.segments.map((seg, idx) => ({
        id: seg.id,
        label: seg.label,
        color: seg.color,
        probability: wheelData.probabilities[idx],
      }));
      const result = updateLocalWheel(currentWheelId as unknown as string, {
        name: currentWheelName || "My Wheel",
        segments: segmentsWithProb,
      });
      if (result.success && result.wheel) {
        markSaved(result.wheel.id as unknown as number, result.wheel.name);
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
      markSaved(result.wheel.id as unknown as number, result.wheel.name);
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
      fireWinConfetti();
      playWinSound();
    }
  }, [showResult, winner, playWinSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && presentationMode) {
        exitPresentationMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationMode, exitPresentationMode]);

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
      
      {!presentationMode && (
        <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
          <a href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="QuickWheel" 
              className="h-8 sm:h-10 w-auto hidden sm:block"
              data-testid="img-logo"
            />
            <span 
              className="sm:hidden text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              QuickWheel
            </span>
          </a>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/my-wheels")}
                  className="text-muted-foreground"
                  data-testid="button-my-wheels"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>My Wheels</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPresentationMode(true)}
                  className="text-muted-foreground"
                  data-testid="button-enter-presentation"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter presentation mode</p>
              </TooltipContent>
            </Tooltip>
            <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
            <ThemeToggle />
            <InstallPrompt />
          </div>
        </header>
      )}

      {presentationMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={exitPresentationMode}
          className="fixed top-4 right-4 text-muted-foreground opacity-40 hover:opacity-100 transition-opacity z-50 gap-2"
          data-testid="button-exit-presentation"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs">Settings</span>
        </Button>
      )}

      <main className={`relative z-10 flex-1 flex flex-col ${presentationMode ? "" : settingsOpen ? "lg:flex-row" : ""} items-center justify-center gap-8 p-4 sm:p-8`}>

        <div className="flex flex-col items-center gap-8">
          <div 
            className={`w-full transition-all duration-300 ${
              presentationMode 
                ? "max-w-[500px] sm:max-w-[600px]" 
                : settingsOpen
                  ? "max-w-[340px] sm:max-w-[420px]"
                  : "max-w-[400px] sm:max-w-[500px]"
            }`}
          >
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
              className={`text-muted-foreground transition-opacity duration-300 ${
                presentationMode ? "text-lg" : "text-sm"
              }`}
              style={{ opacity: showResult ? 1 : 0 }}
              data-testid="text-last-winner"
            >
              Last winner: <span className="font-semibold text-foreground">{winner.label}</span>
            </p>
          )}

          {!presentationMode && !settingsOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="gap-2 text-muted-foreground hover:text-foreground"
              data-testid="button-open-settings"
            >
              <Settings className="w-4 h-4" />
              <span>Wheel Settings</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {!presentationMode && settingsOpen && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(false)}
              className="absolute -left-2 top-2 z-10 text-muted-foreground hover:text-foreground lg:block hidden"
              data-testid="button-collapse-settings"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
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

      {!presentationMode && <Footer />}

      <WinnerModal isOpen={showResult} onClose={closeResult} winner={winner} />
      <SaveWheelModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        onSave={handleSaveNew}
        defaultName={currentWheelName || "My Wheel"}
      />
    </div>
  );
}
