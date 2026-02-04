import { useState, useCallback, useRef, useEffect } from "react";
import { CustomSegment } from "@shared/schema";
import { calculateRotationForWinner } from "@/lib/wheelSegments";
import { apiRequest } from "@/lib/queryClient";
import { SpinResponse } from "@shared/schema";

export interface UseWheelSpinReturn {
  isSpinning: boolean;
  rotation: number;
  winner: CustomSegment | null;
  showResult: boolean;
  spin: (probabilities: number[], segments: CustomSegment[]) => void;
  closeResult: () => void;
  spinDuration: number;
  error: string | null;
  clearError: () => void;
}

export function useWheelSpin(): UseWheelSpinReturn {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<CustomSegment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinDuration, setSpinDuration] = useState(4.5);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const spin = useCallback(async (probabilities: number[], segments: CustomSegment[]) => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/spin", { probabilities });
      const data: SpinResponse = await response.json();
      const winnerIndex = data.winnerIndex;
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
    } catch (err) {
      setIsSpinning(false);
      setError(err instanceof Error ? err.message : "Failed to spin");
    }
  }, [isSpinning, rotation]);

  const closeResult = useCallback(() => {
    setShowResult(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSpinning,
    rotation,
    winner,
    showResult,
    spin,
    closeResult,
    spinDuration,
    error,
    clearError,
  };
}
