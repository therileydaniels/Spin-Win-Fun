import { useEffect, useState, useCallback, useMemo } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { WheelLegend } from "@/components/WheelLegend";
import { shouldUseLegend } from "@/lib/wheelTextLayout";
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
import { ChangelogCard } from "@/components/ChangelogCard";
import { CHANGELOG_VERSION } from "@/lib/changelog";
import { decodeWheelFromUrl, encodeWheelToUrl } from "@/lib/localWheelStorage";
import { useWheelStorage } from "@/hooks/useWheelStorage";
import { SupportPrompt } from "@/components/SupportPrompt";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, ChevronLeft, Mail, Download } from "lucide-react";

// Off-screen render size for the SVG export. Larger than the on-screen wheel so
// dense/legend-mode wheels still export with sharp, readable full labels.
const EXPORT_WHEEL_SIZE = 1200;

// Matches the two known wheel-cap messages: server's 409 ("Wheel limit
// reached (N)") and the anonymous local-storage cap ("You can save up to N
// wheels...").
function isWheelCapError(error?: string): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return lower.includes("wheel limit reached") || lower.includes("save up to");
}

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
    weights,
    addSegment,
    removeSegment,
    renameSegment,
    recolorSegment,
    applyColorPalette,
    setWeight,
    resetWeights,
    resetToDefault,
    canAdd,
    maxSegments,
    canRemove,
    currentWheelId,
    currentWheelName,
    hasUnsavedChanges,
    getWheelData,
    markSaved,
    loadWheel,
    quickFill,
  } = useCustomSegments();

  const { toast } = useToast();
  const storage = useWheelStorage();
  const queryClient = useQueryClient();

  const [presentationMode, setPresentationMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [spinHistory, setSpinHistory] = useState<Array<{ label: string; color: string; timestamp: Date }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [removeWinnerMode, setRemoveWinnerMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noRepeatEnabled, setNoRepeatEnabled] = useState(false);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [showChangelog, setShowChangelog] = useState(false);

  // Dense wheels (a label too long to render legibly in-slice) switch to
  // numbered slices decoded by the on-screen legend.
  const legendMode = useMemo(() => shouldUseLegend(segments), [segments]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wheelParam = params.get("wheel");

    if (wheelParam) {
      const decoded = decodeWheelFromUrl(wheelParam);
      if (decoded && decoded.segments.length >= 2) {
        const data = {
          segments: decoded.segments.map(s => ({ id: s.id, label: s.label, color: s.color })),
          weights: decoded.segments.map(s => s.weight),
        };
        loadWheel("shared", decoded.name, data);
        window.history.replaceState({}, "", "/app/");
        toast({
          title: "Wheel loaded!",
          description: `"${decoded.name}" has been loaded from shared link.`,
        });
      }
    }
    setIsLoading(false);

    const seenVersion = localStorage.getItem("quickwheel-seen-version");
    if (seenVersion !== CHANGELOG_VERSION) {
      setShowChangelog(true);
    }
  }, []);

  const handleSaveWheel = async () => {
    if (!currentWheelId || saveAsMode) {
      setSaveAsMode(false);
      setSaveModalOpen(true);
      return;
    }

    const wheelData = getWheelData();
    const segmentsWithWeight = wheelData.segments.map((seg, idx) => ({
      id: seg.id,
      label: seg.label,
      color: seg.color,
      weight: wheelData.weights[idx],
    }));
    const name = currentWheelName || "My Wheel";

    const result = await storage.update(currentWheelId, {
      name,
      segments: segmentsWithWeight,
    });
    if (result.success && result.wheel) {
      queryClient.invalidateQueries({ queryKey: ["wheels"] });
      markSaved(result.wheel.id, result.wheel.name);
      setSettingsOpen(false);
      toast({
        title: "Wheel updated!",
        description: `"${result.wheel.name}" has been saved.`,
      });
      return;
    }

    // The wheel we think we're editing isn't in the active backend — e.g. it
    // was saved to the cloud and we're now signed out (or vice-versa), or it
    // was deleted elsewhere. The persisted currentWheelId points at the wrong
    // store. Reconcile by saving it fresh in the active backend.
    if (result.error?.toLowerCase().includes("not found")) {
      const created = await storage.save({ name, segments: segmentsWithWeight });
      if (created.success && created.wheel) {
        queryClient.invalidateQueries({ queryKey: ["wheels"] });
        markSaved(created.wheel.id, created.wheel.name);
        setSettingsOpen(false);
        toast({
          title: "Wheel saved!",
          description: `"${created.wheel.name}" has been saved.`,
        });
        return;
      }
      if (isWheelCapError(created.error)) {
        toast({
          title: "Wheel limit reached",
          description: created.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: created.error || "Failed to save wheel.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Error",
      description: result.error || "Failed to update wheel.",
      variant: "destructive",
    });
  };

  const handleSaveNew = async (name: string) => {
    const wheelData = getWheelData();
    const segmentsWithWeight = wheelData.segments.map((seg, idx) => ({
      id: seg.id,
      label: seg.label,
      color: seg.color,
      weight: wheelData.weights[idx],
    }));
    const result = await storage.save({
      name,
      segments: segmentsWithWeight,
    });
    if (result.success && result.wheel) {
      queryClient.invalidateQueries({ queryKey: ["wheels"] });
      markSaved(result.wheel.id, result.wheel.name);
      setSaveModalOpen(false);
      setSettingsOpen(false);
      toast({
        title: "Wheel saved!",
        description: `"${result.wheel.name}" has been saved.`,
      });
    } else if (isWheelCapError(result.error)) {
      setSaveModalOpen(false);
      toast({
        title: "Wheel limit reached",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save wheel.",
        variant: "destructive",
      });
      // Throw so SaveWheelModal keeps the dialog open and preserves the typed
      // name instead of closing on a failed save.
      throw new Error(result.error || "Failed to save wheel.");
    }
  };

  const exitPresentationMode = useCallback(() => {
    setPresentationMode(false);
  }, []);

  const handleShare = useCallback(async () => {
    const data = getWheelData();
    const wheel = {
      id: "share",
      name: currentWheelName || "My Wheel",
      segments: data.segments.map((s, i) => ({ ...s, weight: data.weights[i] })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const encoded = encodeWheelToUrl(wheel);
    const url = `${window.location.origin}/app/?wheel=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Share link copied!" });
    } catch {
      toast({ title: "Here's your share link", description: url });
    }
  }, [getWheelData, currentWheelName, toast]);

  const handleOBSEmbed = useCallback(async () => {
    const data = getWheelData();
    const wheel = {
      id: "obs",
      name: currentWheelName || "My Wheel",
      segments: data.segments.map((s, i) => ({ ...s, weight: data.weights[i] })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const encoded = encodeWheelToUrl(wheel);
    const url = `${window.location.origin}/app/embed?wheel=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "OBS link copied!", description: "Paste as browser source in OBS" });
    } catch {
      toast({ title: "Here's your OBS link", description: url });
    }
  }, [getWheelData, currentWheelName, toast]);

  const handleDownloadSvg = useCallback(() => {
    // Read from the hidden, upright, full-label export wheel (rendered large so
    // even dense/legend-mode wheels export with readable labels), not the
    // on-screen wheel — which may be spun and showing numbers.
    const exportRoot = document.querySelector<HTMLElement>('[data-export-wheel]');
    const wheelSvgEl = exportRoot?.querySelector<SVGSVGElement>('[data-testid="wheel-svg"]');
    const pointerEl = exportRoot?.querySelector<HTMLElement>('[data-testid="wheel-pointer"]');
    if (!wheelSvgEl || !pointerEl) {
      toast({ title: "Couldn't save the image", description: "Try again in a moment.", variant: "destructive" });
      return;
    }

    const pointerSvgEl = pointerEl.querySelector<SVGSVGElement>("svg");
    if (!pointerSvgEl) {
      toast({ title: "Couldn't save the image", description: "Try again in a moment.", variant: "destructive" });
      return;
    }

    const wheelRect = wheelSvgEl.getBoundingClientRect();
    const pointerRect = pointerEl.getBoundingClientRect();

    const minX = Math.min(wheelRect.left, pointerRect.left);
    const minY = Math.min(wheelRect.top, pointerRect.top);
    const totalW = Math.max(wheelRect.right, pointerRect.right) - minX;
    const totalH = Math.max(wheelRect.bottom, pointerRect.bottom) - minY;

    // Scale each SVG from its own viewBox coords into the shared CSS-pixel space
    const wheelScale = wheelRect.width / 500;   // wheel viewBox is 500×500
    const pointerScale = pointerRect.width / 40; // pointer viewBox is 40×52

    const combined = [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">`,
      `<g transform="translate(${wheelRect.left - minX},${wheelRect.top - minY}) scale(${wheelScale})">`,
      wheelSvgEl.innerHTML,
      `</g>`,
      `<g transform="translate(${pointerRect.left - minX},${pointerRect.top - minY}) scale(${pointerScale})">`,
      pointerSvgEl.innerHTML,
      `</g>`,
      `</svg>`,
    ].join("\n");

    const blob = new Blob([combined], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentWheelName || "wheel"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Saved as SVG", description: "Check your downloads folder." });
  }, [currentWheelName, toast]);

  useEffect(() => {
    if (showResult && winner) {
      fireCenterBurst();
      const cleanupConfetti = fireWinConfetti();
      playWinSound();

      setSpinHistory(prev => [
        { label: winner.label, color: winner.color, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);

      if (noRepeatEnabled) {
        setClaimedIds(prev => {
          const updated = [...prev, winner.id];
          if (updated.length >= segments.length) {
            toast({ title: "All prizes claimed!", description: "Reset prizes in the customize panel to spin again." });
          }
          return updated;
        });
      }

      if (removeWinnerMode) {
        if (segments.length > 2) {
          removeSegment(winner.id);
        } else {
          toast({ title: "Can't remove the last winner", description: "A wheel needs at least 2 options to spin." });
        }
      }

      return cleanupConfetti;
    }
  }, [showResult, winner, playWinSound, noRepeatEnabled, removeWinnerMode, segments.length, removeSegment]);

  const handleSpin = useCallback(() => {
    const excludedIndices = noRepeatEnabled
      ? segments.reduce<number[]>((acc, seg, i) => {
          if (claimedIds.includes(seg.id)) acc.push(i);
          return acc;
        }, [])
      : [];
    spin(weights, segments, excludedIndices);
  }, [spin, weights, segments, noRepeatEnabled, claimedIds]);

  const allClaimed = noRepeatEnabled && claimedIds.length >= segments.length;
  const canSpin = !isSpinning && !allClaimed;

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

      {!presentationMode && settingsOpen && (
        <div className="relative z-10 px-4 pt-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card/80 backdrop-blur-xl border border-border text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              Having an issue? Reach out to Riley, the creator, at{" "}
              <a href="mailto:BookRD@protonmail.com" className="font-medium text-foreground hover:underline">
                BookRD@protonmail.com
              </a>
            </span>
            <a href="mailto:BookRD@protonmail.com" className="sm:hidden font-medium text-foreground hover:underline">
              Contact Riley
            </a>
          </div>
        </div>
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

      <main className={`relative z-10 flex-1 flex flex-col ${presentationMode ? "" : settingsOpen ? "md:flex-row" : ""} items-center justify-center gap-6 p-4 sm:p-6`}>
        <div className={`flex flex-col items-center gap-6 ${settingsOpen ? "hidden md:flex" : ""}`}>
          <div className="sr-only" role="status" aria-live="assertive">
            {isSpinning
              ? "Spinning…"
              : showResult && winner
                ? `Winner: ${winner.label}`
                : ""}
          </div>
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
                  claimedIds={noRepeatEnabled ? claimedIds : []}
                />
              </div>
            )}
          </div>

          {!isLoading && legendMode && (
            <div className="w-full max-w-[340px]">
              <WheelLegend
                segments={segments}
                claimedIds={noRepeatEnabled ? claimedIds : []}
                compact={presentationMode}
              />
            </div>
          )}

          <SpinButton
            onClick={handleSpin}
            disabled={!canSpin || isLoading}
            isSpinning={isSpinning}
          />

          {!presentationMode && !isLoading && !isSpinning && allClaimed && (
            <p className="text-xs text-amber-400 text-center max-w-[280px]" data-testid="text-spin-disabled-reason">
              Every prize has been claimed. Open Customize to reset and spin again.
            </p>
          )}

          {!presentationMode && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadSvg}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              title="Download wheel as SVG"
            >
              <Download className="w-3.5 h-3.5" />
              Save as SVG
            </Button>
          )}


          {!presentationMode && spinHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(v => !v)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle prize history"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {spinHistory.length} prize{spinHistory.length !== 1 ? "s" : ""} won
            </button>
          )}

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
          <div className="relative animate-slide-in-right w-full md:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(false)}
              className="absolute -left-2 top-2 z-10 text-muted-foreground hover:text-foreground md:block hidden"
              data-testid="button-collapse-settings"
              aria-label="Collapse settings"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <ProbabilityPanel
              segments={segments}
              weights={weights}
              onWeightChange={setWeight}
              onRename={renameSegment}
              onRecolor={recolorSegment}
              onApplyColorPalette={applyColorPalette}
              onAdd={addSegment}
              onRemove={removeSegment}
              onResetWeights={resetWeights}
              onNewWheel={resetToDefault}
              onSaveWheel={handleSaveWheel}
              onShare={handleShare}
              onOBSEmbed={handleOBSEmbed}
              maxSegments={maxSegments}
              canAdd={canAdd}
              canRemove={canRemove}
              currentWheelName={currentWheelName}
              hasUnsavedChanges={hasUnsavedChanges}
              onClose={() => setSettingsOpen(false)}
              noRepeatEnabled={noRepeatEnabled}
              onNoRepeatToggle={() => setNoRepeatEnabled(v => !v)}
              claimedIds={claimedIds}
              onResetClaimed={() => setClaimedIds([])}
              onQuickFill={(labels) => { quickFill(labels); setClaimedIds([]); }}
            />
          </div>
        )}
      </main>

      {!presentationMode && showHistory && (
        <HistoryPanel entries={spinHistory} onClose={() => setShowHistory(false)} onClear={() => setSpinHistory([])} />
      )}

      {!presentationMode && <Footer />}

      <ChangelogCard
        open={showChangelog && !showResult}
        onClose={() => {
          localStorage.setItem("quickwheel-seen-version", CHANGELOG_VERSION);
          setShowChangelog(false);
        }}
      />

      <WinnerModal
        isOpen={showResult}
        onClose={closeResult}
        winner={winner}
        onSpinAgain={canSpin ? handleSpin : undefined}
      />
      <SupportPrompt spinResultOpen={showResult} />
      <SaveWheelModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        onSave={handleSaveNew}
        defaultName={currentWheelName || "My Wheel"}
      />

      {/*
        Hidden, upright, full-label wheel rendered large solely as the source for
        the SVG export (handleDownloadSvg reads its inner SVGs). forceLabels keeps
        real labels even when the visible wheel is in numbered/legend mode.
      */}
      <div
        data-export-wheel
        aria-hidden
        className="pointer-events-none"
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          width: EXPORT_WHEEL_SIZE,
          height: EXPORT_WHEEL_SIZE,
          opacity: 0,
          overflow: "hidden",
        }}
      >
        <SpinWheel
          segments={segments}
          rotation={0}
          isSpinning={false}
          spinDuration={0}
          size={EXPORT_WHEEL_SIZE}
          forceLabels
        />
      </div>
    </div>
  );
}
