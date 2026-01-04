import { CustomSegment } from "@shared/schema";

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
}

export const PRESET_COLORS = [
  "#A855F7", // Purple
  "#7C3AED", // Violet
  "#6366F1", // Indigo
  "#4F46E5", // Deep indigo
  "#0EA5E9", // Sky blue
  "#0284C7", // Deep blue
  "#14B8A6", // Teal
  "#0D9488", // Deep teal
  "#EC4899", // Pink
  "#DB2777", // Deep pink
  "#F472B6", // Light pink
  "#8B5CF6", // Light purple
];

export const DEFAULT_SEGMENTS: CustomSegment[] = [
  { id: "1", label: "Prize 1", color: "#A855F7" },
  { id: "2", label: "Prize 2", color: "#6366F1" },
  { id: "3", label: "Prize 3", color: "#0EA5E9" },
  { id: "4", label: "Prize 4", color: "#14B8A6" },
  { id: "5", label: "Prize 5", color: "#EC4899" },
  { id: "6", label: "Prize 6", color: "#F472B6" },
];

export function getNextColor(existingColors: string[]): string {
  for (const color of PRESET_COLORS) {
    if (!existingColors.includes(color)) {
      return color;
    }
  }
  return PRESET_COLORS[existingColors.length % PRESET_COLORS.length];
}

export function getRandomWinner(segments: WheelSegment[]): WheelSegment {
  const randomIndex = Math.floor(Math.random() * segments.length);
  return segments[randomIndex];
}

export function calculateRotationForWinner(
  winnerIndex: number,
  totalSegments: number,
  currentRotation: number
): number {
  const segmentAngle = 360 / totalSegments;
  const segmentStart = winnerIndex * segmentAngle;
  const segmentCenter = segmentStart + segmentAngle / 2;
  
  const safeZonePercent = 0.8;
  const safeZoneAngle = segmentAngle * safeZonePercent;
  const safeZoneStart = segmentCenter - safeZoneAngle / 2;
  const randomOffsetWithinSafeZone = Math.random() * safeZoneAngle;
  const targetAngle = safeZoneStart + randomOffsetWithinSafeZone;
  
  const currentAngle = ((currentRotation % 360) + 360) % 360;
  const targetFinalAngle = (360 - targetAngle + 360) % 360;
  
  let delta = targetFinalAngle - currentAngle;
  if (delta < 0) {
    delta += 360;
  }
  
  const fullSpins = 360 * 5;
  const totalDelta = fullSpins + delta;
  
  return currentRotation + totalDelta;
}
