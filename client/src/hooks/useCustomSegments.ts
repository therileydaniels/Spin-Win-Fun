import { useState, useEffect, useCallback } from "react";
import { CustomSegment, MIN_SEGMENTS, MAX_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import { DEFAULT_SEGMENTS, getNextColor } from "@/lib/wheelSegments";

const SEGMENTS_STORAGE_KEY = "wheel-segments";
const PROBABILITIES_STORAGE_KEY = "wheel-probabilities";

export interface UseCustomSegmentsReturn {
  segments: CustomSegment[];
  probabilities: number[];
  addSegment: () => void;
  removeSegment: (id: string) => void;
  renameSegment: (id: string, label: string) => void;
  recolorSegment: (id: string, color: string) => void;
  setProbability: (index: number, value: number) => void;
  resetProbabilities: () => void;
  resetToDefault: () => void;
  canAdd: boolean;
  canRemove: boolean;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useCustomSegments(): UseCustomSegmentsReturn {
  const [segments, setSegments] = useState<CustomSegment[]>(() => {
    try {
      const saved = localStorage.getItem(SEGMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= MIN_SEGMENTS && parsed.length <= MAX_SEGMENTS) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SEGMENTS;
  });

  const [probabilities, setProbabilities] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(PROBABILITIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SEGMENTS.map(() => 0);
  });

  useEffect(() => {
    if (probabilities.length !== segments.length) {
      setProbabilities((prev) => {
        if (prev.length < segments.length) {
          return [...prev, ...Array(segments.length - prev.length).fill(0)];
        } else {
          return prev.slice(0, segments.length);
        }
      });
    }
  }, [segments.length, probabilities.length]);

  useEffect(() => {
    localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(PROBABILITIES_STORAGE_KEY, JSON.stringify(probabilities));
  }, [probabilities]);

  const addSegment = useCallback(() => {
    if (segments.length >= MAX_SEGMENTS) return;
    
    const existingColors = segments.map((s) => s.color);
    const newSegment: CustomSegment = {
      id: generateId(),
      label: `Prize ${segments.length + 1}`,
      color: getNextColor(existingColors),
    };
    setSegments((prev) => [...prev, newSegment]);
  }, [segments]);

  const removeSegment = useCallback((id: string) => {
    if (segments.length <= MIN_SEGMENTS) return;
    
    const index = segments.findIndex((s) => s.id === id);
    if (index === -1) return;
    
    setSegments((prev) => prev.filter((s) => s.id !== id));
    setProbabilities((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, [segments]);

  const renameSegment = useCallback((id: string, label: string) => {
    const trimmed = label.slice(0, MAX_LABEL_LENGTH);
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: trimmed } : s))
    );
  }, []);

  const recolorSegment = useCallback((id: string, color: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, color } : s))
    );
  }, []);

  const setProbability = useCallback((index: number, value: number) => {
    setProbabilities((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, Math.min(100, Math.floor(value) || 0));
      return next;
    });
  }, []);

  const resetProbabilities = useCallback(() => {
    setProbabilities(segments.map(() => 0));
  }, [segments]);

  const resetToDefault = useCallback(() => {
    setSegments(DEFAULT_SEGMENTS);
    setProbabilities(DEFAULT_SEGMENTS.map(() => 0));
  }, []);

  const canAdd = segments.length < MAX_SEGMENTS;
  const canRemove = segments.length > MIN_SEGMENTS;
  const total = probabilities.reduce((a, b) => a + b, 0);
  const isEqualOdds = total === 0;
  const isValid = total === 100 || isEqualOdds;

  return {
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
  };
}
