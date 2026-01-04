export interface WheelSegment {
  id: number;
  label: string;
  color: string;
  textColor: string;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 1, label: "Prize 1", color: "#C9A9A6", textColor: "#2D2926" },
  { id: 2, label: "Prize 2", color: "#7D8B74", textColor: "#FFFFFF" },
  { id: 3, label: "Prize 3", color: "#3D5A6C", textColor: "#FFFFFF" },
  { id: 4, label: "Prize 4", color: "#C4956A", textColor: "#2D2926" },
  { id: 5, label: "Prize 5", color: "#B8A99A", textColor: "#2D2926" },
  { id: 6, label: "Prize 6", color: "#6B7B8C", textColor: "#FFFFFF" },
];

export const WHEEL_COLORS = [
  "#C9A9A6",
  "#7D8B74",
  "#3D5A6C",
  "#C4956A",
  "#B8A99A",
  "#6B7B8C",
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
