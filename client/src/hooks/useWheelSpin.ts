import { useState, useCallback, useRef, useEffect } from "react";
import {
  WHEEL_SEGMENTS,
  WheelSegment,
  getRandomWinner,
  calculateRotationForWinner,
} from "@/lib/wheelSegments";

export interface UseWheelSpinReturn {
  isSpinning: boolean;
  rotation: number;
  winner: WheelSegment | null;
  showResult: boolean;
  spin: () => void;
  closeResult: () => void;
  spinDuration: number;
}

export function useWheelSpin(): UseWheelSpinReturn {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelSegment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinDuration, setSpinDuration] = useState(4.5);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);

    const selectedWinner = getRandomWinner(WHEEL_SEGMENTS);
    const winnerIndex = WHEEL_SEGMENTS.findIndex(
      (seg) => seg.id === selectedWinner.id
    );
    const duration = 4 + Math.random() * 1;
    setSpinDuration(duration);

    const targetRotation = calculateRotationForWinner(
      winnerIndex,
      WHEEL_SEGMENTS.length
    );
    const totalRotation = rotation + targetRotation;

    setRotation(totalRotation);
    setWinner(selectedWinner);

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      timeoutRef.current = null;
    }, duration * 1000);
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
  };
}
