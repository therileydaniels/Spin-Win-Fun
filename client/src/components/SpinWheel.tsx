import { CustomSegment } from "@shared/schema";
import { adjustColor } from "@/lib/colorUtils";

interface SpinWheelProps {
  segments: CustomSegment[];
  rotation: number;
  isSpinning: boolean;
  spinDuration: number;
  size?: number;
}

function getContrastColor(hexColor: string): string {
  try {
    let hex = hexColor.replace('#', '');
    
    // Handle shorthand (#RGB or #RGBA) by expanding to full form
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('').slice(0, 6);
    }
    
    // Strip alpha channel if present (#RRGGBBAA)
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    
    // Validate we have exactly 6 hex digits
    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return '#FFFFFF'; // Default to white text on invalid input
    }
    
    // Parse RGB components
    const rRaw = parseInt(hex.substring(0, 2), 16) / 255;
    const gRaw = parseInt(hex.substring(2, 4), 16) / 255;
    const bRaw = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Convert sRGB to linear RGB (WCAG 2.1 compliant)
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    const r = toLinear(rRaw);
    const g = toLinear(gRaw);
    const b = toLinear(bRaw);
    
    // Calculate relative luminance (WCAG formula)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Calculate contrast ratios against white and black
    const contrastWithWhite = (1.0 + 0.05) / (luminance + 0.05);
    const contrastWithBlack = (luminance + 0.05) / (0.0 + 0.05);
    
    // Return the color with better contrast
    return contrastWithBlack > contrastWithWhite ? '#1a1a1a' : '#FFFFFF';
  } catch {
    return '#FFFFFF'; // Fallback to white text on any error
  }
}

function calculateOptimalFontSize(
  text: string,
  segmentCount: number,
  radius: number,
  minFontSize: number = 10,
  maxFontSize: number = 24
): number {
  const segmentAngleRad = (2 * Math.PI) / segmentCount;
  
  const textRadialPosition = radius * 0.55;
  const arcLength = textRadialPosition * segmentAngleRad;
  const availableWidth = arcLength * 0.75;
  
  const avgCharWidth = 0.55;
  const textLength = text.length;
  
  let fontSize = availableWidth / (textLength * avgCharWidth);
  
  if (textLength <= 3) {
    fontSize = Math.min(fontSize, maxFontSize);
  }
  
  fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
  
  return Math.round(fontSize);
}

function truncateLabel(label: string, maxLen: number = 20): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 2) + "...";
}

export function SpinWheel({ segments, rotation, isSpinning, spinDuration, size }: SpinWheelProps) {
  const segmentAngle = 360 / segments.length;
  const viewBoxSize = 500;
  const radius = 200;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

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
    <div 
      className="relative aspect-square mx-auto"
      style={{ width: size ? `${size}px` : '100%', maxWidth: size ? `${size}px` : '100%' }}
    >
      <div 
        className="absolute inset-0 rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)"
        }}
      />
      
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
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
          {segments.map((segment) => (
            <linearGradient
              key={`gradient-${segment.id}`}
              id={`segmentGradient-${segment.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={segment.color} />
              <stop offset="100%" stopColor={adjustColor(segment.color, -30)} />
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
          const fontSize = calculateOptimalFontSize(segment.label, segments.length, radius);
          const displayLabel = truncateLabel(segment.label);
          const textColor = getContrastColor(segment.color);
          const isLightText = textColor === '#FFFFFF';

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
                fill={textColor}
                fontSize={fontSize}
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                style={{ 
                  textShadow: isLightText 
                    ? "0 2px 4px rgba(0,0,0,0.3)" 
                    : "0 1px 2px rgba(255,255,255,0.3)",
                  fontFamily: "Inter, system-ui, sans-serif"
                }}
              >
                {displayLabel}
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
