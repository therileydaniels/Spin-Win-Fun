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
import { saveWheelToLocal, updateLocalWheel, decodeWheelFromUrl } from "@/lib/localWheelStorage";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Settings, FolderOpen, ChevronLeft, History, Trash2 } from "lucide-react";

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
    loadWheel,
  } = useCustomSegments();

  const { user } = useAuth();
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
      fireWinConfetti();
      playWinSound();
      
      setSpinHistory(prev => [
        { label: winner.label, color: winner.color, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
      
      if (removeWinnerMode && segments.length > 2) {
        removeSegment(winner.id);
      }
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
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={settingsOpen ? "secondary" : "default"}
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  data-testid="button-open-settings"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{settingsOpen ? "Close settings" : "Open settings"}</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="hidden sm:flex items-center gap-1 px-1 py-1 rounded-lg bg-muted/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation("/my-wheels")}
                    className="text-muted-foreground h-8 w-8"
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
                    variant={showHistory ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-muted-foreground h-8 w-8"
                    data-testid="button-toggle-history"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showHistory ? "Hide history" : "Show history"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={removeWinnerMode ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setRemoveWinnerMode(!removeWinnerMode)}
                    className="text-muted-foreground h-8 w-8"
                    data-testid="button-toggle-remove-winner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{removeWinnerMode ? "Remove winner: ON" : "Remove winner: OFF"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPresentationMode(true)}
                    className="text-muted-foreground h-8 w-8"
                    data-testid="button-enter-presentation"
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter presentation mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-1">
              <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
              <ThemeToggle />
              <InstallPrompt />
            </div>
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
          <div className="w-full flex items-center justify-center">
            {isLoading ? (
              <div 
                className={`aspect-square flex items-center justify-center transition-all duration-300 ${
                  presentationMode
                    ? "w-[320px] md:w-[500px] lg:w-[600px]"
                    : settingsOpen
                      ? "w-[280px] md:w-[380px] lg:w-[420px]"
                      : "w-[320px] md:w-[450px] lg:w-[600px]"
                }`}
              >
                <Skeleton className="w-full aspect-square rounded-full" />
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ${
                  presentationMode
                    ? "w-[320px] md:w-[500px] lg:w-[600px]"
                    : settingsOpen
                      ? "w-[280px] md:w-[380px] lg:w-[420px]"
                      : "w-[320px] md:w-[450px] lg:w-[600px]"
                }`}
              >
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

      {!presentationMode && showHistory && (
        <div className="fixed right-4 top-20 z-40 w-64 max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-card/95 backdrop-blur-xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Spin History</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(false)}
              className="h-6 w-6 text-muted-foreground"
              data-testid="button-close-history"
            >
              <span className="text-lg">&times;</span>
            </Button>
          </div>
          {spinHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No spins yet. Spin the wheel to see history!
            </p>
          ) : (
            <div className="space-y-2">
              {spinHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                  data-testid={`history-entry-${idx}`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: entry.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
