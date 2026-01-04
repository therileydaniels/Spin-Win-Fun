import { useState, useEffect, useCallback } from "react";
import { WHEEL_SEGMENTS } from "@/lib/wheelSegments";

const STORAGE_KEY = "wheel-probabilities";

export interface UseProbabilitiesReturn {
  probabilities: number[];
  setProbability: (index: number, value: number) => void;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
  resetToEqual: () => void;
}

export function useProbabilities(): UseProbabilitiesReturn {
  const [probabilities, setProbabilities] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === WHEEL_SEGMENTS.length) {
          return parsed;
        }
      }
    } catch {}
    return WHEEL_SEGMENTS.map(() => 0);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(probabilities));
  }, [probabilities]);

  const setProbability = useCallback((index: number, value: number) => {
    setProbabilities((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, Math.min(100, Math.floor(value) || 0));
      return next;
    });
  }, []);

  const resetToEqual = useCallback(() => {
    setProbabilities(WHEEL_SEGMENTS.map(() => 0));
  }, []);

  const total = probabilities.reduce((a, b) => a + b, 0);
  const isEqualOdds = total === 0;
  const isValid = total === 100 || isEqualOdds;

  return {
    probabilities,
    setProbability,
    total,
    isValid,
    isEqualOdds,
    resetToEqual,
  };
}
