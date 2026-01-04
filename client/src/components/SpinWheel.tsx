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
        className="w-full h-full drop-shadow-2xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : "none",
        }}
        data-testid="wheel-svg"
      >
        <defs>
          <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
            <feComposite
              in="SourceGraphic"
              in2="offsetBlur"
              operator="over"
              result="composite"
            />
          </filter>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7DC6F" />
            <stop offset="50%" stopColor="#D4AC0D" />
            <stop offset="100%" stopColor="#B7950B" />
          </linearGradient>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 12}
          fill="url(#goldGradient)"
          className="drop-shadow-lg"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 4}
          fill="none"
          stroke="#1F2937"
          strokeWidth="2"
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
                stroke="#1F2937"
                strokeWidth="1"
                filter="url(#innerShadow)"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                fill={segment.textColor}
                fontSize="16"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                className="pointer-events-none select-none font-sans"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                {segment.label}
              </text>
            </g>
          );
        })}

        <circle
          cx={centerX}
          cy={centerY}
          r="25"
          fill="url(#goldGradient)"
          stroke="#1F2937"
          strokeWidth="2"
          className="drop-shadow-md"
        />
        <circle cx={centerX} cy={centerY} r="8" fill="#1F2937" />
      </svg>

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
        data-testid="wheel-pointer"
      >
        <svg width="40" height="50" viewBox="0 0 40 50">
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
            <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
          </defs>
          <polygon
            points="20,45 5,5 35,5"
            fill="url(#pointerGradient)"
            stroke="#F7DC6F"
            strokeWidth="2"
            filter="url(#pointerShadow)"
          />
        </svg>
      </div>
    </div>
  );
}
