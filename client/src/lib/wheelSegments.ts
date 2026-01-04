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
  const segmentMiddle = segmentAngle / 2;
  const winnerAngle = winnerIndex * segmentAngle + segmentMiddle;
  const baseRotation = 360 * 5;
  const finalRotation = baseRotation + (360 - winnerAngle) + 90;
  return finalRotation;
}
