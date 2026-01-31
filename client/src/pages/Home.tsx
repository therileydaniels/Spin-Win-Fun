import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SpinWheel } from "@/components/SpinWheel";
import { SpinButton } from "@/components/SpinButton";
import { WinnerModal } from "@/components/WinnerModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { AuthModal } from "@/components/AuthModal";
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
import { Monitor, Settings, LogIn, LogOut, User, FolderOpen, Shield } from "lucide-react";

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

  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const { toast } = useToast();

  const [presentationMode, setPresentationMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);

  const createWheelMutation = useMutation({
    mutationFn: async (name: string) => {
      const data = getWheelData();
      const response = await apiRequest("POST", "/api/wheels", {
        name,
        segments: data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheels"] });
      markSaved(data.wheel.id, data.wheel.name);
      toast({
        title: "Wheel saved!",
        description: `"${data.wheel.name}" has been saved.`,
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to save wheel";
      if (message.includes("limit")) {
        toast({
          title: "Save limit reached",
          description: "You've reached the free limit (2 wheels). Upgrade to save unlimited wheels.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const updateWheelMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const data = getWheelData();
      const response = await apiRequest("PUT", `/api/wheels/${id}`, {
        name,
        segments: data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheels"] });
      markSaved(data.wheel.id, data.wheel.name);
      toast({
        title: "Wheel updated!",
        description: `"${data.wheel.name}" has been saved.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wheel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveWheel = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    
    if (currentWheelId && !saveAsMode) {
      updateWheelMutation.mutate({ id: currentWheelId, name: currentWheelName || "My Wheel" });
    } else {
      setSaveAsMode(false);
      setSaveModalOpen(true);
    }
  };

  const handleSaveNew = async (name: string) => {
    await createWheelMutation.mutateAsync(name);
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
            {isAuthenticated ? (
              <>
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
                {user?.role === "admin" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/admin")}
                        className="text-muted-foreground"
                        data-testid="button-admin-dashboard"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Admin Dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate" data-testid="text-user-email">
                    {user?.name || user?.email}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="text-muted-foreground"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign out</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="text-muted-foreground gap-2"
                data-testid="button-signin"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
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

      <main className={`relative z-10 flex-1 flex flex-col ${presentationMode ? "" : "lg:flex-row"} items-center justify-center gap-8 p-4 sm:p-8`}>

        <div className="flex flex-col items-center gap-8">
          <div 
            className={`w-full transition-all duration-300 ${
              presentationMode 
                ? "max-w-[500px] sm:max-w-[600px]" 
                : "max-w-[340px] sm:max-w-[420px]"
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
        </div>

        {!presentationMode && (
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
          />
        )}
      </main>

      {!presentationMode && (
        <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground border-t border-white/5">
          <p>For entertainment purposes only</p>
        </footer>
      )}

      <WinnerModal isOpen={showResult} onClose={closeResult} winner={winner} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <SaveWheelModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        onSave={handleSaveNew}
        defaultName={currentWheelName || "My Wheel"}
      />
    </div>
  );
}
