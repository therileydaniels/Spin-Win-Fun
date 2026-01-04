import { CustomSegment, MAX_SEGMENTS, MIN_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle, Scale, RotateCcw, Trash2, Plus } from "lucide-react";
import { ColorPicker } from "./ColorPicker";

interface ProbabilityPanelProps {
  segments: CustomSegment[];
  probabilities: number[];
  onProbabilityChange: (index: number, value: number) => void;
  onRename: (id: string, label: string) => void;
  onRecolor: (id: string, color: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
  canAdd: boolean;
  canRemove: boolean;
}

export function ProbabilityPanel({
  segments,
  probabilities,
  onProbabilityChange,
  onRename,
  onRecolor,
  onAdd,
  onRemove,
  onReset,
  total,
  isValid,
  isEqualOdds,
  canAdd,
  canRemove,
}: ProbabilityPanelProps) {
  return (
    <Card className="w-full max-w-sm border-white/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">Wheel Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="text-muted-foreground"
            data-testid="button-reset-wheel"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {segments.length}/{MAX_SEGMENTS} segments
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="flex items-center gap-2"
              data-testid={`segment-row-${index}`}
            >
              <ColorPicker
                color={segment.color}
                onChange={(color) => onRecolor(segment.id, color)}
              />
              <Input
                type="text"
                value={segment.label}
                onChange={(e) => onRename(segment.id, e.target.value)}
                maxLength={MAX_LABEL_LENGTH}
                className="flex-1 h-8 text-sm bg-background/50 border-white/10"
                data-testid={`input-segment-name-${index}`}
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={probabilities[index] ?? 0}
                  onChange={(e) =>
                    onProbabilityChange(index, parseInt(e.target.value) || 0)
                  }
                  className="w-14 h-8 text-center text-sm bg-background/50 border-white/10"
                  data-testid={`input-probability-${index}`}
                />
                <span className="text-xs text-muted-foreground w-3">%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(segment.id)}
                disabled={!canRemove}
                className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                data-testid={`button-delete-segment-${index}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={!canAdd}
          className="w-full mt-2 border-white/10"
          data-testid="button-add-segment"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Segment
        </Button>

        <div className="pt-3 border-t border-white/10">
          {isEqualOdds ? (
            <div className="flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Equal odds</span>
              <span className="text-muted-foreground text-xs">
                ({(100 / segments.length).toFixed(1)}% each)
              </span>
            </div>
          ) : isValid ? (
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Total: {total}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium">Total: {total}%</span>
              <span className="text-muted-foreground text-xs">
                {total < 100
                  ? `(need ${100 - total}% more)`
                  : `(${total - 100}% over)`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
