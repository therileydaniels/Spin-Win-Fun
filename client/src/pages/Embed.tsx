import { useEffect, useCallback, useMemo } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { useWheelSpin } from "@/hooks/useWheelSpin";
import { useCustomSegments } from "@/hooks/useCustomSegments";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";
import { decodeWheelFromUrl } from "@/lib/localWheelStorage";

export default function Embed() {
  const {
    isSpinning,
    rotation,
    winner,
    showResult,
    spin,
    closeResult,
    spinDuration,
  } = useWheelSpin();

  const {
    segments,
    probabilities,
    isValid,
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

  // Load wheel from URL parameter on mount
  useEffect(() => {
    const wheelParam = params.get("wheel");
    if (wheelParam) {
      const decoded = decodeWheelFromUrl(wheelParam);
      if (decoded && decoded.segments.length >= 2) {
        const data = {
          segments: decoded.segments.map((s) => ({ id: s.id, label: s.label, color: s.color })),
          probabilities: decoded.segments.map((s) => s.probability),
        };
        loadWheel("embed", decoded.name, data);
      }
    }
  }, []);

  const canSpin = isValid && !isSpinning;

  const handleSpin = useCallback(() => {
    if (!canSpin || segments.length < 2) return;
    spin(probabilities, segments);
  }, [canSpin, spin, probabilities, segments]);

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
      fireCenterBurst();
      const cleanupConfetti = fireWinConfetti();
      const dismissTimer = setTimeout(() => closeResult(), 3000);

      return () => {
        cleanupConfetti();
        clearTimeout(dismissTimer);
      };
    }
  }, [showResult, winner, closeResult]);

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
