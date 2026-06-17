import { useState, useEffect, useCallback } from "react";
import { CustomSegment, MIN_SEGMENTS, MAX_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import { DEFAULT_SEGMENTS, getNextColor, PRESET_COLORS } from "@/lib/wheelSegments";
import { useEntitlements } from "@/hooks/useEntitlements";

const SEGMENTS_STORAGE_KEY = "wheel-segments";
const PROBABILITIES_STORAGE_KEY = "wheel-probabilities";
const CURRENT_WHEEL_KEY = "current-wheel-id";
const CURRENT_WHEEL_NAME_KEY = "current-wheel-name";

export interface SavedWheelData {
  segments: CustomSegment[];
  probabilities: number[];
}

export interface UseCustomSegmentsReturn {
  segments: CustomSegment[];
  probabilities: number[];
  addSegment: () => void;
  removeSegment: (id: string) => void;
  renameSegment: (id: string, label: string) => void;
  recolorSegment: (id: string, color: string) => void;
  applyColorPalette: (colors: string[]) => void;
  setProbability: (index: number, value: number) => void;
  resetProbabilities: () => void;
  resetToDefault: () => void;
  canAdd: boolean;
  maxSegments: number;
  canRemove: boolean;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
  currentWheelId: string | null;
  currentWheelName: string | null;
  hasUnsavedChanges: boolean;
  loadWheel: (id: string, name: string, data: SavedWheelData) => void;
  clearCurrentWheel: () => void;
  markSaved: (id: string, name: string) => void;
  getWheelData: () => SavedWheelData;
  quickFill: (labels: string[]) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useCustomSegments(): UseCustomSegmentsReturn {
  const { maxSegments } = useEntitlements();
  const [segments, setSegments] = useState<CustomSegment[]>(() => {
    try {
      const saved = localStorage.getItem(SEGMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length >= MIN_SEGMENTS &&
          parsed.length <= MAX_SEGMENTS &&
          parsed.every(
            (s: unknown) =>
              typeof s === "object" &&
              s !== null &&
              typeof (s as Record<string, unknown>).id === "string" &&
              typeof (s as Record<string, unknown>).label === "string" &&
              typeof (s as Record<string, unknown>).color === "string"
          )
        ) {
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

  const [currentWheelId, setCurrentWheelId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_WHEEL_KEY);
      return saved || null;
    } catch {}
    return null;
  });

  const [currentWheelName, setCurrentWheelName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENT_WHEEL_NAME_KEY);
    } catch {}
    return null;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string | null>(null);

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

  useEffect(() => {
    if (currentWheelId !== null) {
      localStorage.setItem(CURRENT_WHEEL_KEY, String(currentWheelId));
    } else {
      localStorage.removeItem(CURRENT_WHEEL_KEY);
    }
  }, [currentWheelId]);

  useEffect(() => {
    if (currentWheelName !== null) {
      localStorage.setItem(CURRENT_WHEEL_NAME_KEY, currentWheelName);
    } else {
      localStorage.removeItem(CURRENT_WHEEL_NAME_KEY);
    }
  }, [currentWheelName]);

  useEffect(() => {
    if (lastSavedState !== null) {
      const currentState = JSON.stringify({ segments, probabilities });
      setHasUnsavedChanges(currentState !== lastSavedState);
    }
  }, [segments, probabilities, lastSavedState]);

  const addSegment = useCallback(() => {
    if (segments.length >= maxSegments) return;

    const existingColors = segments.map((s) => s.color);
    const newSegment: CustomSegment = {
      id: generateId(),
      label: `Prize ${segments.length + 1}`,
      color: getNextColor(existingColors),
    };
    setSegments((prev) => [...prev, newSegment]);
  }, [segments, maxSegments]);

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

  const applyColorPalette = useCallback((colors: string[]) => {
    setSegments((prev) =>
      prev.map((s, idx) => ({ ...s, color: colors[idx % colors.length] }))
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
    setCurrentWheelId(null);
    setCurrentWheelName(null);
    setLastSavedState(null);
    setHasUnsavedChanges(false);
  }, []);

  const loadWheel = useCallback((id: string, name: string, data: SavedWheelData) => {
    localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify(data.segments));
    localStorage.setItem(PROBABILITIES_STORAGE_KEY, JSON.stringify(data.probabilities));
    localStorage.setItem(CURRENT_WHEEL_KEY, id);
    localStorage.setItem(CURRENT_WHEEL_NAME_KEY, name);
    
    setSegments(data.segments);
    setProbabilities(data.probabilities);
    setCurrentWheelId(id);
    setCurrentWheelName(name);
    const savedState = JSON.stringify({ segments: data.segments, probabilities: data.probabilities });
    setLastSavedState(savedState);
    setHasUnsavedChanges(false);
  }, []);

  const clearCurrentWheel = useCallback(() => {
    setCurrentWheelId(null);
    setCurrentWheelName(null);
    setLastSavedState(null);
    setHasUnsavedChanges(false);
  }, []);

  const markSaved = useCallback((id: string, name: string) => {
    setCurrentWheelId(id);
    setCurrentWheelName(name);
    localStorage.setItem(CURRENT_WHEEL_KEY, id);
    localStorage.setItem(CURRENT_WHEEL_NAME_KEY, name);
    const savedState = JSON.stringify({ segments, probabilities });
    setLastSavedState(savedState);
    setHasUnsavedChanges(false);
  }, [segments, probabilities]);

  const getWheelData = useCallback((): SavedWheelData => {
    return { segments, probabilities };
  }, [segments, probabilities]);

  const quickFill = useCallback((labels: string[]) => {
    // Cap at the tier limit (not the absolute MAX_SEGMENTS) so Quick Add can't
    // bypass the free segment gate that addSegment/canAdd enforce.
    const capped = labels.slice(0, maxSegments);
    const newSegments: CustomSegment[] = capped.map((label, i) => ({
      id: generateId(),
      label: label.slice(0, MAX_LABEL_LENGTH),
      color: PRESET_COLORS[i % PRESET_COLORS.length],
    }));
    setSegments(newSegments);
    setProbabilities(newSegments.map(() => 0));
    setCurrentWheelId(null);
    setCurrentWheelName(null);
    setLastSavedState(null);
    setHasUnsavedChanges(false);
  }, [maxSegments]);

  const canAdd = segments.length < maxSegments;
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
    applyColorPalette,
    setProbability,
    resetProbabilities,
    resetToDefault,
    canAdd,
    maxSegments,
    canRemove,
    total,
    isValid,
    isEqualOdds,
    currentWheelId,
    currentWheelName,
    hasUnsavedChanges,
    loadWheel,
    clearCurrentWheel,
    markSaved,
    getWheelData,
    quickFill,
  };
}
