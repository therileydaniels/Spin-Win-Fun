import { useState, useEffect, useCallback } from "react";
import { CustomSegment, MIN_SEGMENTS, MAX_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import { DEFAULT_SEGMENTS, getNextColor, PRESET_COLORS } from "@/lib/wheelSegments";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  normalizeWeights,
  computeFairDefault,
  addWeightForNewSegment,
  removeWeightAtIndex,
  normalizeLoadedWeights,
} from "@/lib/weightedProbability";

const SEGMENTS_STORAGE_KEY = "wheel-segments";
const WEIGHTS_STORAGE_KEY = "wheel-weights";
// Pre weighted-probability-pattern key name — read once as a fallback so an
// in-progress (unsaved) editing session isn't silently reset by the rename.
const LEGACY_WEIGHTS_STORAGE_KEY = "wheel-probabilities";
const CURRENT_WHEEL_KEY = "current-wheel-id";
const CURRENT_WHEEL_NAME_KEY = "current-wheel-name";

export interface SavedWheelData {
  segments: CustomSegment[];
  weights: number[];
}

export interface UseCustomSegmentsReturn {
  segments: CustomSegment[];
  weights: number[];
  addSegment: () => void;
  removeSegment: (id: string) => void;
  renameSegment: (id: string, label: string) => void;
  recolorSegment: (id: string, color: string) => void;
  applyColorPalette: (colors: string[]) => void;
  setWeight: (index: number, value: number) => void;
  resetWeights: () => void;
  resetToDefault: () => void;
  canAdd: boolean;
  maxSegments: number;
  canRemove: boolean;
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

  const [weights, setWeights] = useState<number[]>(() => {
    try {
      const saved =
        localStorage.getItem(WEIGHTS_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_WEIGHTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeLoadedWeights(parsed);
        }
      }
    } catch {}
    return computeFairDefault("independent", DEFAULT_SEGMENTS.length);
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

  // Safety net only — addSegment/removeSegment keep segments and weights in
  // sync directly. This only fires if storage ever gets out of sync (e.g.
  // corrupted localStorage), and always recovers into a valid state.
  useEffect(() => {
    if (weights.length !== segments.length) {
      setWeights(computeFairDefault("independent", segments.length));
    }
  }, [segments.length, weights.length]);

  useEffect(() => {
    localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  }, [weights]);

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
      const currentState = JSON.stringify({ segments, weights });
      setHasUnsavedChanges(currentState !== lastSavedState);
    }
  }, [segments, weights, lastSavedState]);

  const addSegment = useCallback(() => {
    if (segments.length >= maxSegments) return;

    const existingColors = segments.map((s) => s.color);
    const newSegment: CustomSegment = {
      id: generateId(),
      label: `Prize ${segments.length + 1}`,
      color: getNextColor(existingColors),
    };
    setSegments((prev) => [...prev, newSegment]);
    setWeights((prev) => addWeightForNewSegment(prev));
  }, [segments, maxSegments]);

  const removeSegment = useCallback((id: string) => {
    if (segments.length <= MIN_SEGMENTS) return;

    const index = segments.findIndex((s) => s.id === id);
    if (index === -1) return;

    setSegments((prev) => prev.filter((s) => s.id !== id));
    setWeights((prev) => removeWeightAtIndex(prev, index));
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

  const setWeight = useCallback((index: number, value: number) => {
    setWeights((prev) => normalizeWeights(prev, index, value));
  }, []);

  const resetWeights = useCallback(() => {
    setWeights(computeFairDefault("independent", segments.length));
  }, [segments]);

  const resetToDefault = useCallback(() => {
    setSegments(DEFAULT_SEGMENTS);
    setWeights(computeFairDefault("independent", DEFAULT_SEGMENTS.length));
    setCurrentWheelId(null);
    setCurrentWheelName(null);
    setLastSavedState(null);
    setHasUnsavedChanges(false);
  }, []);

  const loadWheel = useCallback((id: string, name: string, data: SavedWheelData) => {
    const migratedWeights = normalizeLoadedWeights(data.weights);

    localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify(data.segments));
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(migratedWeights));
    localStorage.setItem(CURRENT_WHEEL_KEY, id);
    localStorage.setItem(CURRENT_WHEEL_NAME_KEY, name);

    setSegments(data.segments);
    setWeights(migratedWeights);
    setCurrentWheelId(id);
    setCurrentWheelName(name);
    const savedState = JSON.stringify({ segments: data.segments, weights: migratedWeights });
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
    const savedState = JSON.stringify({ segments, weights });
    setLastSavedState(savedState);
    setHasUnsavedChanges(false);
  }, [segments, weights]);

  const getWheelData = useCallback((): SavedWheelData => {
    return { segments, weights };
  }, [segments, weights]);

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
    setWeights(computeFairDefault("independent", newSegments.length));
    setCurrentWheelId(null);
    setCurrentWheelName(null);
    setLastSavedState(null);
    setHasUnsavedChanges(false);
  }, [maxSegments]);

  const canAdd = segments.length < maxSegments;
  const canRemove = segments.length > MIN_SEGMENTS;

  return {
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
    loadWheel,
    clearCurrentWheel,
    markSaved,
    getWheelData,
    quickFill,
  };
}
