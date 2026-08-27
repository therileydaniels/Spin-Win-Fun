import { CustomSegment } from "@shared/schema";

interface WheelLegendProps {
  segments: CustomSegment[];
  /** Ids of claimed (no-repeat) segments — dimmed to match the wheel. */
  claimedIds?: string[];
  /** Tighter type/spacing for full-screen presentation mode. */
  compact?: boolean;
}

/**
 * Numbered key for a dense wheel. Row N maps the slice numbered N (1-based,
 * matching SpinWheel's index+1) to its full label and colour. Shown beside the
 * wheel on desktop and below it on mobile; never rendered in the OBS embed.
 */
export function WheelLegend({ segments, claimedIds = [], compact = false }: WheelLegendProps) {
  return (
    <div
      className={`rounded-xl bg-card/80 backdrop-blur-xl border border-border ${
        compact ? "p-2.5" : "p-3 sm:p-4"
      }`}
      data-testid="wheel-legend"
    >
      <ol
        className={`grid gap-x-4 gap-y-1.5 ${
          compact
            ? "grid-cols-2 text-xs"
            : "grid-cols-2 sm:grid-cols-1 text-sm max-h-[60vh] overflow-y-auto pr-1"
        }`}
      >
        {segments.map((segment, index) => {
          const isClaimed = claimedIds.includes(segment.id);
          return (
            <li
              key={segment.id}
              className={`flex items-center gap-2 transition-opacity ${
                isClaimed ? "opacity-35 line-through" : ""
              }`}
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center rounded-full font-bold tabular-nums text-foreground/70 ${
                  compact ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"
                }`}
              >
                {index + 1}
              </span>
              <span
                className="shrink-0 rounded-sm border border-black/20"
                style={{
                  backgroundColor: segment.color,
                  width: compact ? 10 : 12,
                  height: compact ? 10 : 12,
                }}
                aria-hidden
              />
              <span className="truncate font-medium text-foreground" title={segment.label}>
                {segment.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
