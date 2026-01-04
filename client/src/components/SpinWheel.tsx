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
      <div 
        className="absolute inset-0 rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)"
        }}
      />
      
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full relative z-10"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : "none",
          filter: "drop-shadow(0 0 30px rgba(139,92,246,0.3))",
        }}
        data-testid="wheel-svg"
      >
        <defs>
          {segments.map((segment, index) => (
            <linearGradient
              key={`gradient-${segment.id}`}
              id={`segmentGradient-${segment.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={segment.gradientStart} />
              <stop offset="100%" stopColor={segment.gradientEnd} />
            </linearGradient>
          ))}
          <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 6}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          className="dark:stroke-white/20"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 3}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
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
                fill={`url(#segmentGradient-${segment.id})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                fill={segment.textColor}
                fontSize="15"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                className="pointer-events-none select-none"
                style={{ 
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontFamily: "Inter, system-ui, sans-serif"
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
          fill="url(#centerGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />
        <defs>
          <radialGradient id="centerGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </radialGradient>
        </defs>
        <circle cx={centerX} cy={centerY} r="10" fill="#111827" />
        <circle cx={centerX} cy={centerY} r="4" fill="rgba(255,255,255,0.3)" />
      </svg>

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20"
        data-testid="wheel-pointer"
      >
        <svg width="36" height="48" viewBox="0 0 36 48">
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E5E7EB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
            <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>
          <polygon
            points="18,44 4,8 32,8"
            fill="url(#pointerGradient)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            filter="url(#pointerShadow)"
          />
        </svg>
      </div>
    </div>
  );
}
