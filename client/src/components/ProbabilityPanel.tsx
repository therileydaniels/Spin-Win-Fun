import { WHEEL_SEGMENTS } from "@/lib/wheelSegments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle, Scale, RotateCcw } from "lucide-react";

interface ProbabilityPanelProps {
  probabilities: number[];
  onProbabilityChange: (index: number, value: number) => void;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
  onReset: () => void;
}

export function ProbabilityPanel({
  probabilities,
  onProbabilityChange,
  total,
  isValid,
  isEqualOdds,
  onReset,
}: ProbabilityPanelProps) {
  const segments = WHEEL_SEGMENTS;

  return (
    <Card className="w-full max-w-sm border-white/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">Probability Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="text-muted-foreground"
            data-testid="button-reset-probabilities"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="flex items-center gap-3"
            data-testid={`probability-row-${index}`}
          >
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{
                background: `linear-gradient(135deg, ${segment.gradientStart}, ${segment.gradientEnd})`,
              }}
            />
            <span className="flex-1 text-sm font-medium truncate">
              {segment.label}
            </span>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                value={probabilities[index]}
                onChange={(e) =>
                  onProbabilityChange(index, parseInt(e.target.value) || 0)
                }
                className="w-16 h-8 text-center text-sm bg-background/50 border-white/10"
                data-testid={`input-probability-${index}`}
              />
              <span className="text-xs text-muted-foreground w-4">%</span>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-white/10">
          {isEqualOdds ? (
            <div className="flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Equal odds</span>
              <span className="text-muted-foreground">
                (each segment has {(100 / segments.length).toFixed(1)}% chance)
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
              <span className="text-muted-foreground">
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
