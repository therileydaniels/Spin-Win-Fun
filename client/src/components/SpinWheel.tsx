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
  maxFontSize: number = 28
): number {
  const segmentAngleRad = (2 * Math.PI) / segmentCount;
  
  // For wide segments (2-4), position text further out and use more space
  const textRadiusFactor = segmentCount <= 4 ? 0.58 : 0.55;
  const textRadialPosition = radius * textRadiusFactor;
  const arcLength = textRadialPosition * segmentAngleRad;
  
  // Wide segments can use more of the arc, narrow segments need more margin
  const arcUsageFactor = segmentCount <= 4 ? 0.85 : 0.75;
  const availableWidth = arcLength * arcUsageFactor;
  
  const avgCharWidth = 0.55;
  const textLength = text.length;
  
  let fontSize = availableWidth / (textLength * avgCharWidth);
  
  // For wide segments with short text, allow larger fonts
  if (segmentCount <= 4 && textLength <= 10) {
    maxFontSize = 32;
  }
  
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

// Split long text into multiple lines for wide segments
function splitTextForWideSegment(text: string, segmentCount: number): string[] {
  // Only split for wide segments (2-4 segments)
  if (segmentCount > 4) return [text];
  
  // Short text doesn't need splitting
  if (text.length <= 12) return [text];
  
  // Try to split at a space near the middle
  const words = text.split(' ');
  if (words.length === 1) {
    // No spaces - don't split single words
    return [text];
  }
  
  // Find the best split point (closest to middle)
  const midpoint = text.length / 2;
  let bestSplitIndex = 0;
  let bestDistance = text.length;
  let charCount = 0;
  
  for (let i = 0; i < words.length - 1; i++) {
    charCount += words[i].length + 1; // +1 for space
    const distance = Math.abs(charCount - midpoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSplitIndex = i;
    }
  }
  
  const line1 = words.slice(0, bestSplitIndex + 1).join(' ');
  const line2 = words.slice(bestSplitIndex + 1).join(' ');
  
  return [line1, line2];
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

  function getTextPosition(index: number, segmentCount: number) {
    const angle = index * segmentAngle + segmentAngle / 2;
    // For wide segments (2-4), position text further from center to use more space
    const textRadiusFactor = segmentCount <= 4 ? 0.58 : 0.65;
    const textRadius = radius * textRadiusFactor;
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
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="25%" stopColor="#9CA3AF" />
            <stop offset="50%" stopColor="#F3F4F6" />
            <stop offset="75%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
          <filter id="rimShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 10}
          fill="none"
          stroke="url(#rimGradient)"
          strokeWidth="6"
          filter="url(#rimShadow)"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 5}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 2}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
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
          const textPos = getTextPosition(index, segments.length);
          const displayLabel = truncateLabel(segment.label);
          const textLines = splitTextForWideSegment(displayLabel, segments.length);
          // Recalculate font size based on longest line
          const longestLine = textLines.reduce((a, b) => a.length > b.length ? a : b, '');
          const fontSize = calculateOptimalFontSize(longestLine, segments.length, radius);
          const textColor = getContrastColor(segment.color);
          const isLightText = textColor === '#FFFFFF';
          const lineHeight = fontSize * 1.2;
          const totalTextHeight = lineHeight * textLines.length;
          const startY = textPos.y - (totalTextHeight / 2) + (lineHeight / 2);

          return (
            <g key={segment.id}>
              <path
                d={path}
                fill={`url(#segmentGradient-${segment.id})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
              {textLines.map((line, lineIndex) => (
                <text
                  key={lineIndex}
                  x={textPos.x}
                  y={startY + (lineIndex * lineHeight)}
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
                  {line}
                </text>
              ))}
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
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20"
        data-testid="wheel-pointer"
      >
        <svg width="40" height="52" viewBox="0 0 40 52">
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#F9FAFB" />
              <stop offset="60%" stopColor="#E5E7EB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
            <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
            </filter>
            <filter id="pointerGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feFlood floodColor="#A855F7" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="20,48 5,10 35,10"
            fill="url(#pointerGradient)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
            filter="url(#pointerShadow)"
          />
          <polygon
            points="20,42 10,14 30,14"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
