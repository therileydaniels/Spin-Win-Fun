import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { useCustomSegments } from "@/hooks/useCustomSegments";
import { fireWinConfetti, fireCenterBurst } from "@/lib/confetti";
import { decodeWheelFromUrl } from "@/lib/localWheelStorage";
import { calculateRotationForWinner } from "@/lib/wheelSegments";
import { CustomSegment } from "@shared/schema";

function selectWeightedWinner(probabilities: number[]): number {
  const total = probabilities.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return Math.floor(Math.random() * probabilities.length);
  }
  const random = Math.random() * total;
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (random < cumulative) {
      return i;
    }
  }
  return probabilities.length - 1;
}

export default function Embed() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<CustomSegment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinDuration, setSpinDuration] = useState(4.5);
  const timeoutRef = useRef<number | null>(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const canSpin = isValid && !isSpinning;

  const handleSpin = useCallback(() => {
    if (!canSpin || segments.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);

    const winnerIndex = selectWeightedWinner(probabilities);
    const selectedWinner = segments[winnerIndex];

    const duration = 4 + Math.random() * 1;
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
  }, [canSpin, segments, probabilities, rotation]);

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
      const dismissTimer = setTimeout(() => setShowResult(false), 3000);

      return () => {
        cleanupConfetti();
        clearTimeout(dismissTimer);
      };
    }
  }, [showResult, winner]);

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
