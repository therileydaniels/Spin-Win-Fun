import { useMemo } from "react";
import { CustomSegment } from "@shared/schema";
import { adjustColor } from "@/lib/colorUtils";
import { getRadialColumns } from "@/lib/wheelTextLayout";

interface SpinWheelProps {
  segments: CustomSegment[];
  rotation: number;
  isSpinning: boolean;
  spinDuration: number;
  size?: number;
  /** Render full labels even when a dense wheel would otherwise switch to
   *  numbered/legend mode. Used by the SVG export and the OBS embed, which have
   *  no legend to decode numbers against. */
  forceLabels?: boolean;
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

export function SpinWheel({ segments, rotation, isSpinning, spinDuration, size, forceLabels = false }: SpinWheelProps) {
  const segmentAngle = 360 / segments.length;
  const viewBoxSize = 500;
  const radius = 200;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;

  // Memoize the per-segment radial-column layout (an unmemoized nested loop in
  // getRadialColumns otherwise reruns for every segment on every parent
  // re-render, e.g. on each spin tick). Recompute only when the labels or the
  // segment count change, since those are the only inputs to the layout.
  const segmentCount = segments.length;
  const columnsById = useMemo(() => {
    const map: Record<string, { columns: string[]; fontSize: number; fits: boolean }> = {};
    for (const segment of segments) {
      map[segment.id] = getRadialColumns(segment.label, segmentCount, radius);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments.map(s => `${s.id}:${s.label}`).join("|"), segmentCount, radius]);

  // All-or-nothing: if any label can't render legibly in-slice, the whole wheel
  // switches to numbers (decoded via the on-screen legend). `forceLabels` opts
  // out — the export and OBS embed always show real labels since they have no
  // legend to pair numbers with.
  const legendMode = !forceLabels && Object.values(columnsById).some(c => !c.fits);
  const numberFontSize = segmentCount > 16 ? 18 : 22;

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

          const { columns, fontSize } = columnsById[segment.id];
          const textColor = getContrastColor(segment.color);
          const isLightText = textColor === '#FFFFFF';
          const colStep = fontSize * 1.3;
          // Anchor point: 4 px inside the slice's outer path edge.
          // Fixed pixel offset so the text always visually starts at the rim
          // regardless of font size.
          const rimAnchorY = centerY - (radius - 4);

          return (
            <g key={segment.id}>
              <path d={path} fill={`url(#segmentGradient-${segment.id})`} stroke="rgba(0,0,0,0.3)" strokeWidth="1">
                <title>{segment.label}</title>
              </path>

              {/*
                Outer group: rotates the local frame so this slice's bisector
                points straight up (-Y).
              */}
              <g transform={`rotate(${midAngle}, ${centerX}, ${centerY})`}>
                {legendMode ? (
                  // Dense wheel: show the slice number (upright in the rotated
                  // frame) near the rim; the legend decodes it to a full label.
                  <text
                    x={centerX}
                    y={centerY - radius * 0.78}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={numberFontSize}
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
                    {index + 1}
                  </text>
                ) : (
                  // Inner rotate(90) tips each column 90° CW so it runs
                  // rim→center. textAnchor="start" anchors the first character
                  // at rimAnchorY.
                  columns.map((col, colIndex) => {
                    const xOffset = (colIndex - (columns.length - 1) / 2) * colStep;
                    const tx = centerX + xOffset;
                    const ty = rimAnchorY;
                    return (
                      <text
                        key={colIndex}
                        x={tx}
                        y={ty}
                        transform={`rotate(90, ${tx}, ${ty})`}
                        textAnchor="start"
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
                  })
                )}
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
