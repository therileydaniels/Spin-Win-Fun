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

    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('').slice(0, 6);
    }

    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }

    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return '#FFFFFF';
    }

    const rRaw = parseInt(hex.substring(0, 2), 16) / 255;
    const gRaw = parseInt(hex.substring(2, 4), 16) / 255;
    const bRaw = parseInt(hex.substring(4, 6), 16) / 255;

    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    const r = toLinear(rRaw);
    const g = toLinear(gRaw);
    const b = toLinear(bRaw);

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const contrastWithWhite = (1.0 + 0.05) / (luminance + 0.05);
    const contrastWithBlack = (luminance + 0.05) / (0.0 + 0.05);

    return contrastWithBlack > contrastWithWhite ? '#1a1a1a' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

function truncateLabel(label: string, maxLen: number = 20): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 2) + "...";
}

/**
 * Lay out text as one or more radial "columns" (each column is a single text string
 * that will be rotated 90° so its characters run along the slice from rim to center).
 *
 * Constraints:
 *   - Each column's character count × charWidth must fit in the available radial space.
 *   - All columns placed side-by-side must fit within the slice arc width.
 */
function getRadialColumns(
  label: string,
  segmentCount: number,
  radius: number
): { columns: string[]; fontSize: number; textRadius: number } {
  // Center each column at 54 % of radius — balanced between hub (~28 px) and rim (200 px).
  const textRadius = radius * 0.54;
  const segmentAngle = (2 * Math.PI) / segmentCount;
  // Usable arc width at textRadius (leave 20 % margin on each side of the slice).
  const arcWidth = 2 * textRadius * Math.sin(segmentAngle / 2) * 0.80;
  // Max radial span (character string length after rotation).
  // Text can safely extend ±58 px from textRadius before hitting rim or hub.
  const availableRadial = Math.min(radius * 0.70, 2 * (radius * 0.92 - textRadius));

  const charWidthFactor = 0.60;
  const minFont = 9;
  const maxFont = 26;

  const words = label.split(' ');

  // Candidate column groupings — fewest columns tried first so we prefer bigger text.
  const candidates: string[][] = [
    [label], // one column — all text in one rotated string
  ];
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    candidates.push([words.slice(0, mid).join(' '), words.slice(mid).join(' ')]);
  }
  if (words.length >= 3) {
    const a = Math.ceil(words.length / 3);
    const b = Math.ceil(words.length * 2 / 3);
    candidates.push([words.slice(0, a).join(' '), words.slice(a, b).join(' '), words.slice(b).join(' ')]);
  }

  for (let fs = maxFont; fs >= minFont; fs--) {
    // After rotation, one column occupies `fs` px in the across-slice direction.
    const colStep = fs * 1.3; // center-to-center distance between columns
    const maxCharsPerCol = Math.floor(availableRadial / (fs * charWidthFactor));

    for (const columns of candidates) {
      const longestCol = Math.max(...columns.map(c => c.length));
      if (longestCol > maxCharsPerCol) continue;

      // Total across-slice width: N columns each fs wide, gaps between them.
      const totalWidth = (columns.length - 1) * colStep + fs;
      if (totalWidth <= arcWidth) {
        return { columns, fontSize: fs, textRadius };
      }
    }
  }

  // Fallback: one truncated column at minimum font.
  const maxChars = Math.max(3, Math.floor(availableRadial / (minFont * charWidthFactor)));
  return { columns: [label.slice(0, maxChars)], fontSize: minFont, textRadius };
}

export function SpinWheel({ segments, rotation, isSpinning, spinDuration, size }: SpinWheelProps) {
  const segmentAngle = 360 / segments.length;
  const viewBoxSize = 500;
  const radius = 200;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  function polarToCartesian(cx: number, cy: number, r: number, angleDegrees: number) {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians),
    };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", cx, cy, "L", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
  }

  return (
    <div
      className="relative aspect-square mx-auto"
      style={{ width: size ? `${size}px` : '100%', maxWidth: size ? `${size}px` : '100%' }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.15) 50%, transparent 70%)"
        }}
      />

      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        role="img"
        aria-label={`Prize wheel with ${segments.length} segments: ${segments.map(s => s.label).join(', ')}`}
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
              <stop offset="10%" stopColor={adjustColor(segment.color, 10)} />
              <stop offset="100%" stopColor={adjustColor(segment.color, -30)} />
            </linearGradient>
          ))}
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="25%" stopColor="#1F2937" />
            <stop offset="50%" stopColor="#4B5563" />
            <stop offset="75%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
          <filter id="rimShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        <circle cx={centerX} cy={centerY} r={radius + 10} fill="none" stroke="url(#rimGradient)" strokeWidth="6" filter="url(#rimShadow)" />
        <circle cx={centerX} cy={centerY} r={radius + 5} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={radius + 2} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />

        {segments.map((segment, index) => {
          const startAngle = index * segmentAngle;
          const endAngle = startAngle + segmentAngle;
          const midAngle = startAngle + segmentAngle / 2;
          const path = describeArc(centerX, centerY, radius, startAngle, endAngle);

          const displayLabel = truncateLabel(segment.label);
          const { columns, fontSize, textRadius } = getRadialColumns(displayLabel, segments.length, radius);
          const textColor = getContrastColor(segment.color);
          const isLightText = textColor === '#FFFFFF';
          const colStep = fontSize * 1.3;

          return (
            <g key={segment.id}>
              <path d={path} fill={`url(#segmentGradient-${segment.id})`} stroke="rgba(0,0,0,0.3)" strokeWidth="1">
                <title>{segment.label}</title>
              </path>

              {/*
                Outer group: aligns the slice's bisector with the -Y axis in local space.
                Each column is then rotated 90° CW so its characters run along the radius
                (first char toward rim, last char toward center).
                When the wheel counter-rotates to bring this slice to the top pointer,
                the net outer-group rotation is 0 — text reads straight down the slice.
              */}
              <g transform={`rotate(${midAngle}, ${centerX}, ${centerY})`}>
                {columns.map((col, colIndex) => {
                  const xOffset = (colIndex - (columns.length - 1) / 2) * colStep;
                  const tx = centerX + xOffset;
                  const ty = centerY - textRadius;
                  return (
                    <text
                      key={colIndex}
                      x={tx}
                      y={ty}
                      transform={`rotate(90, ${tx}, ${ty})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={fontSize}
                      fontWeight="700"
                      fill={textColor}
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: isLightText
                          ? "0 2px 4px rgba(0,0,0,0.4)"
                          : "0 1px 2px rgba(255,255,255,0.4)",
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}
                    >
                      {col}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}

        <circle cx={centerX} cy={centerY} r="28" fill="url(#centerGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <defs>
          <radialGradient id="centerGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>
        </defs>
        <circle cx={centerX} cy={centerY} r="10" fill="#111827" />
        <circle cx={centerX} cy={centerY} r="4" fill="rgba(255,255,255,0.15)" />
      </svg>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20" data-testid="wheel-pointer">
        <svg width="40" height="52" viewBox="0 0 40 52">
          <defs>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <filter id="pointerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
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
          <polygon points="20,48 5,10 35,10" fill="url(#pointerGradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#pointerShadow)" />
          <polygon points="20,42 10,14 30,14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
