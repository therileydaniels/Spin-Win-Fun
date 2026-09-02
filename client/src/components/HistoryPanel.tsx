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
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 z-40 w-full sm:w-64 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto rounded-t-2xl sm:rounded-lg border border-border bg-card/95 backdrop-blur-xl shadow-xl p-4">
      <div className="sm:hidden w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
