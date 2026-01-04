import { WHEEL_SEGMENTS } from "@/lib/wheelSegments";

interface SpinWheelProps {
  rotation: number;
  isSpinning: boolean;
  spinDuration: number;
}

export function SpinWheel({ rotation, isSpinning, spinDuration }: SpinWheelProps) {
  const segments = WHEEL_SEGMENTS;
  const segmentAngle = 360 / segments.length;
  const radius = 200;
  const centerX = 250;
  const centerY = 250;

  function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDegrees: number
  ) {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians),
    };
  }

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      cx,
      cy,
      "L",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  }

  function getTextPosition(index: number) {
    const angle = index * segmentAngle + segmentAngle / 2;
    const textRadius = radius * 0.65;
    const pos = polarToCartesian(centerX, centerY, textRadius, angle);
    return { x: pos.x, y: pos.y, angle: angle };
  }

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : "none",
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.15))",
        }}
        data-testid="wheel-svg"
      >
        <defs>
          <linearGradient id="outerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="25%" stopColor="#F5E6A3" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#C5A028" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="innerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D2926" />
            <stop offset="50%" stopColor="#4A4543" />
            <stop offset="100%" stopColor="#2D2926" />
          </linearGradient>
          <filter id="segmentShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
          </filter>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 15}
          fill="url(#outerRingGradient)"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 8}
          fill="url(#innerRingGradient)"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 3}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
        />

        {segments.map((segment, index) => {
          const startAngle = index * segmentAngle;
          const endAngle = startAngle + segmentAngle;
          const path = describeArc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
          );
          const textPos = getTextPosition(index);

          return (
            <g key={segment.id}>
              <path
                d={path}
                fill={segment.color}
                stroke="#2D2926"
                strokeWidth="0.5"
                filter="url(#segmentShadow)"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                fill={segment.textColor}
                fontSize="15"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                className="pointer-events-none select-none"
                style={{ 
                  textShadow: segment.textColor === "#FFFFFF" 
                    ? "0 1px 2px rgba(0,0,0,0.3)" 
                    : "0 1px 1px rgba(255,255,255,0.2)" 
                }}
              >
                {segment.label}
              </text>
            </g>
          );
        })}

        <circle
          cx={centerX}
          cy={centerY}
          r="28"
          fill="url(#outerRingGradient)"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="22"
          fill="url(#innerRingGradient)"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="#D4AF37"
        />
      </svg>

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
        data-testid="wheel-pointer"
      >
        <svg width="36" height="48" viewBox="0 0 36 48">
          <defs>
            <linearGradient id="pointerGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F5E6A3" />
              <stop offset="100%" stopColor="#C5A028" />
            </linearGradient>
            <linearGradient id="pointerDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3D3835" />
              <stop offset="100%" stopColor="#2D2926" />
            </linearGradient>
            <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>
          <polygon
            points="18,46 4,8 18,14 32,8"
            fill="url(#pointerDark)"
            stroke="url(#pointerGold)"
            strokeWidth="2"
            filter="url(#pointerShadow)"
          />
          <circle cx="18" cy="8" r="6" fill="url(#pointerGold)" />
        </svg>
      </div>
    </div>
  );
}
