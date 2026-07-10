import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { useCustomSegments } from "@/hooks/useCustomSegments";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";
import { decodeWheelFromUrl } from "@/lib/localWheelStorage";
import { calculateRotationForWinner } from "@/lib/wheelSegments";
import { selectWeightedIndex } from "@/lib/weightedProbability";
import { CustomSegment } from "@shared/schema";

export default function Embed() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<CustomSegment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinDuration, setSpinDuration] = useState(4.5);
  const timeoutRef = useRef<number | null>(null);

  const {
    segments,
    weights,
    loadWheel,
  } = useCustomSegments();

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const background = useMemo(() => {
    const bg = params.get("bg");
    if (bg === "dark") return "#0f0f23";
    if (bg === "light") return "#ffffff";
    return "transparent";
  }, [params]);

  const size = useMemo(() => {
    const raw = params.get("size");
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > 0) return n;
    }
    return 400;
  }, [params]);

  const showBranding = useMemo(() => params.get("nb") !== "1", [params]);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Load wheel from URL parameter on mount
  useEffect(() => {
    const wheelParam = params.get("wheel");
    if (wheelParam) {
      const decoded = decodeWheelFromUrl(wheelParam);
      if (decoded && decoded.segments.length >= 2) {
        const data = {
          segments: decoded.segments.map((s) => ({ id: s.id, label: s.label, color: s.color })),
          weights: decoded.segments.map((s) => s.weight),
        };
        loadWheel("embed", decoded.name, data);
      }
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const canSpin = !isSpinning;

  const handleSpin = useCallback(() => {
    if (!canSpin || segments.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);

    const winnerIndex = selectWeightedIndex(weights);
    const selectedWinner = segments[winnerIndex];

    const duration = prefersReducedMotion ? 0.001 : 4 + Math.random() * 1;
    setSpinDuration(duration);

    const newRotation = calculateRotationForWinner(
      winnerIndex,
      segments.length,
      rotation
    );

    setRotation(newRotation);
    setWinner(selectedWinner);

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      timeoutRef.current = null;
    }, duration * 1000);
  }, [canSpin, segments, weights, rotation, prefersReducedMotion]);

  // Spacebar and click to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && canSpin && !showResult) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSpin, showResult, handleSpin]);

  // Confetti + auto-dismiss winner
  useEffect(() => {
    if (showResult && winner) {
      if (prefersReducedMotion) {
        const dismissTimer = setTimeout(() => setShowResult(false), 3000);
        return () => clearTimeout(dismissTimer);
      }

      fireCenterBurst();
      const cleanupConfetti = fireWinConfetti();
      const dismissTimer = setTimeout(() => setShowResult(false), 3000);

      return () => {
        cleanupConfetti();
        clearTimeout(dismissTimer);
      };
    }
  }, [showResult, winner, prefersReducedMotion]);

  return (
    <div
      onClick={handleSpin}
      style={{
        background,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ width: size, height: size }}>
        <SpinWheel
          segments={segments}
          rotation={rotation}
          isSpinning={isSpinning}
          spinDuration={spinDuration}
          size={size}
          showBranding={showBranding}
        />
      </div>

      {showResult && winner && (
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: Math.max(18, size / 12),
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {winner.label}
        </div>
      )}
    </div>
  );
}
