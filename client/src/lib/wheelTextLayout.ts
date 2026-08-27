import { CustomSegment } from "@shared/schema";

// Wheel geometry constants (mirrors SpinWheel's 500×500 viewBox, radius 200).
export const WHEEL_RADIUS = 200;

// A label is considered legible in-slice only if it lays out at or above this
// font size, in a single column (or two), without being truncated. Below this,
// the wheel flips to numbered/legend mode instead. Tunable by feel — see the
// plan's "threshold tuning" risk.
const FIT_MIN_FONT = 13;
const FIT_MAX_COLUMNS = 2;

// Past this slice count the wedges are too narrow for side-by-side columns to
// help, so we only try a single radial spoke line (uses the full radius).
const SINGLE_LINE_SEGMENT_THRESHOLD = 14;

export interface RadialLayout {
  columns: string[];
  fontSize: number;
  /** True if the label lays out legibly in-slice; false means it was forced
   *  down to a tiny font / truncated and the wheel should use legend mode. */
  fits: boolean;
}

export function truncateLabel(label: string, maxLen: number = 20): string {
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 2) + "...";
}

/**
 * Lay out text as one or more radial "columns" (each column is a single text
 * string rotated 90° so its characters run along the slice from rim to center).
 *
 * Constraints:
 *   - Each column's character count × charWidth must fit the radial space.
 *   - All columns placed side-by-side must fit within the slice arc width.
 *
 * Also reports whether the resulting layout is legible in-slice (`fits`), which
 * the caller uses to decide whether the whole wheel should switch to legend
 * (numbered) mode.
 */
export function getRadialColumns(
  label: string,
  segmentCount: number,
  radius: number = WHEEL_RADIUS
): RadialLayout {
  // Text starts 4 px inside the slice's outer path edge and runs toward the hub.
  const rimStart = radius - 4;
  const hubEdge = radius * 0.16;
  const availableRadial = rimStart - hubEdge; // ~164 px for radius=200

  const textMidRadius = (rimStart + hubEdge) / 2;
  const segmentAngle = (2 * Math.PI) / segmentCount;
  const arcWidth = 2 * textMidRadius * Math.sin(segmentAngle / 2) * 0.8;

  const charWidthFactor = 0.6;
  const minFont = 9;
  const maxFont = 26;

  const words = label.split(" ");

  // Candidate column groupings — fewest columns first (prefer bigger font).
  const candidates: string[][] = [[label]];
  // Only try multi-column wrapping while wedges are wide enough for it to help.
  if (segmentCount <= SINGLE_LINE_SEGMENT_THRESHOLD) {
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      candidates.push([words.slice(0, mid).join(" "), words.slice(mid).join(" ")]);
    }
    if (words.length >= 3) {
      const a = Math.ceil(words.length / 3);
      const b = Math.ceil((words.length * 2) / 3);
      candidates.push([
        words.slice(0, a).join(" "),
        words.slice(a, b).join(" "),
        words.slice(b).join(" "),
      ]);
    }
  }

  for (let fs = maxFont; fs >= minFont; fs--) {
    const colStep = fs * 1.3;
    const maxCharsPerCol = Math.floor(availableRadial / (fs * charWidthFactor));

    for (const columns of candidates) {
      const longestCol = Math.max(...columns.map((c) => c.length));
      if (longestCol > maxCharsPerCol) continue;

      const totalWidth = (columns.length - 1) * colStep + fs;
      if (totalWidth <= arcWidth) {
        const fits = fs >= FIT_MIN_FONT && columns.length <= FIT_MAX_COLUMNS;
        return { columns, fontSize: fs, fits };
      }
    }
  }

  // Fallback: one truncated column at minimum font — never counts as fitting.
  const maxChars = Math.max(3, Math.floor(availableRadial / (minFont * charWidthFactor)));
  return { columns: [label.slice(0, maxChars)], fontSize: minFont, fits: false };
}

/**
 * True when at least one segment's label can't be shown legibly in-slice at the
 * current slice count, meaning the wheel should render numbers + a legend
 * rather than cramped text. All-or-nothing: one overflowing label flips them all.
 */
export function shouldUseLegend(
  segments: CustomSegment[],
  radius: number = WHEEL_RADIUS
): boolean {
  const count = segments.length;
  return segments.some((s) => !getRadialColumns(s.label, count, radius).fits);
}
