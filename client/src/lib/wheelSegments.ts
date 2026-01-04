export interface WheelSegment {
  id: number;
  label: string;
  color: string;
  textColor: string;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 1, label: "Prize 1", color: "#8B5CF6", textColor: "#FFFFFF" },
  { id: 2, label: "Prize 2", color: "#EC4899", textColor: "#FFFFFF" },
  { id: 3, label: "Prize 3", color: "#F59E0B", textColor: "#1F2937" },
  { id: 4, label: "Prize 4", color: "#10B981", textColor: "#FFFFFF" },
  { id: 5, label: "Prize 5", color: "#3B82F6", textColor: "#FFFFFF" },
  { id: 6, label: "Prize 6", color: "#EF4444", textColor: "#FFFFFF" },
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
