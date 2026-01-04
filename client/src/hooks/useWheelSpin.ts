import { useState, useCallback, useRef, useEffect } from "react";
import {
  WHEEL_SEGMENTS,
  WheelSegment,
  calculateRotationForWinner,
} from "@/lib/wheelSegments";
import { apiRequest } from "@/lib/queryClient";
import { SpinResponse } from "@shared/schema";

export interface UseWheelSpinReturn {
  isSpinning: boolean;
  rotation: number;
  winner: WheelSegment | null;
  showResult: boolean;
  spin: (probabilities: number[]) => void;
  closeResult: () => void;
  spinDuration: number;
  error: string | null;
}

export function useWheelSpin(): UseWheelSpinReturn {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelSegment | null>(null);
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

  const spin = useCallback(async (probabilities: number[]) => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/spin", { probabilities });
      const data: SpinResponse = await response.json();
      const winnerIndex = data.winnerIndex;
      const selectedWinner = WHEEL_SEGMENTS[winnerIndex];

      const duration = 4 + Math.random() * 1;
      setSpinDuration(duration);

      const newRotation = calculateRotationForWinner(
        winnerIndex,
        WHEEL_SEGMENTS.length,
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

  return {
    isSpinning,
    rotation,
    winner,
    showResult,
    spin,
    closeResult,
    spinDuration,
    error,
  };
}
