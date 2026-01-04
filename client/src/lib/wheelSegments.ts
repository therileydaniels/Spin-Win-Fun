export interface WheelSegment {
  id: number;
  label: string;
  gradientStart: string;
  gradientEnd: string;
  textColor: string;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 1, label: "Prize 1", gradientStart: "#A855F7", gradientEnd: "#7C3AED", textColor: "#FFFFFF" },
  { id: 2, label: "Prize 2", gradientStart: "#6366F1", gradientEnd: "#4F46E5", textColor: "#FFFFFF" },
  { id: 3, label: "Prize 3", gradientStart: "#0EA5E9", gradientEnd: "#0284C7", textColor: "#FFFFFF" },
  { id: 4, label: "Prize 4", gradientStart: "#14B8A6", gradientEnd: "#0D9488", textColor: "#FFFFFF" },
  { id: 5, label: "Prize 5", gradientStart: "#EC4899", gradientEnd: "#DB2777", textColor: "#FFFFFF" },
  { id: 6, label: "Prize 6", gradientStart: "#F472B6", gradientEnd: "#A855F7", textColor: "#FFFFFF" },
];

export const GRADIENT_COLORS = [
  "#A855F7", "#7C3AED", "#6366F1", "#4F46E5", 
  "#0EA5E9", "#0284C7", "#14B8A6", "#0D9488",
  "#EC4899", "#DB2777", "#F472B6"
];

export function getRandomWinner(segments: WheelSegment[]): WheelSegment {
  const randomIndex = Math.floor(Math.random() * segments.length);
  return segments[randomIndex];
}

export function calculateRotationForWinner(
  winnerIndex: number,
  totalSegments: number
): number {
  const segmentAngle = 360 / totalSegments;
  const segmentStart = winnerIndex * segmentAngle;
  const segmentCenter = segmentStart + segmentAngle / 2;
  
  const safeZonePercent = 0.8;
  const safeZoneAngle = segmentAngle * safeZonePercent;
  const safeZoneStart = segmentCenter - safeZoneAngle / 2;
  const randomOffsetWithinSafeZone = Math.random() * safeZoneAngle;
  const targetAngle = safeZoneStart + randomOffsetWithinSafeZone;
  
  const baseRotation = 360 * 5;
  const angleToTop = 360 - targetAngle;
  const finalRotation = baseRotation + angleToTop;
  
  return finalRotation;
}
