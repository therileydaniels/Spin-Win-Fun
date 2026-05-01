import { useState, useMemo } from "react";
import { MAX_SEGMENTS, MIN_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (labels: string[]) => void;
}

export function QuickAddDialog({ open, onOpenChange, onSubmit }: QuickAddDialogProps) {
  const [text, setText] = useState("");

  const lines = useMemo(() => {
    return text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);
  }, [text]);

  const tooMany = lines.length > MAX_SEGMENTS;
  const tooFew = lines.length > 0 && lines.length < MIN_SEGMENTS;
  const validCount = Math.min(lines.length, MAX_SEGMENTS);
  const canSubmit = validCount >= MIN_SEGMENTS;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(lines.slice(0, MAX_SEGMENTS));
    setText("");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setText("");
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Prizes</DialogTitle>
          <DialogDescription>
            Type or paste one prize per line. This will{" "}
            <span className="font-semibold text-foreground">replace</span> your current wheel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            className="w-full h-52 rounded-md border border-border bg-background/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground font-mono"
            placeholder={"Grand Prize\nRunner Up\nConsolation Prize\n..."}
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />

          <div className="flex items-start gap-2 min-h-[1.5rem]">
            {tooMany ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">
                  {lines.length} prizes detected — only the first {MAX_SEGMENTS} will be added.
                </p>
              </>
            ) : tooFew ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">
                  Add at least {MIN_SEGMENTS} prizes.
                </p>
              </>
            ) : lines.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {lines.length} {lines.length === 1 ? "prize" : "prizes"} detected
                {lines.some(l => l.length > MAX_LABEL_LENGTH) && (
                  <span className="text-amber-400">
                    {" "}— labels over {MAX_LABEL_LENGTH} characters will be trimmed
                  </span>
                )}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add {canSubmit ? validCount : ""} Prizes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
