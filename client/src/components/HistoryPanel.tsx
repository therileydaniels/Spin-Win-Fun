import { memo } from "react";
import { Button } from "@/components/ui/button";

interface HistoryEntry {
  label: string;
  color: string;
  timestamp: Date;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
}

export const HistoryPanel = memo(function HistoryPanel({ entries, onClose, onClear }: HistoryPanelProps) {
  return (
    <div className="fixed right-4 top-20 z-40 w-48 sm:w-64 max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-card/95 backdrop-blur-xl shadow-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Prizes Won</h3>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              data-testid="button-clear-history"
              aria-label="Clear history"
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-muted-foreground"
            data-testid="button-close-history"
            aria-label="Close history"
          >
            <span className="text-lg">&times;</span>
          </Button>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No spins yet. Spin the wheel to see history!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
              data-testid={`history-entry-${idx}`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.label}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
