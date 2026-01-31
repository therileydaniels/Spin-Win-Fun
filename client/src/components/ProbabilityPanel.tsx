import { useState } from "react";
import { CustomSegment, MAX_SEGMENTS, MIN_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, AlertTriangle, Scale, Percent, FilePlus2, Trash2, Plus, Save } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProbabilityPanelProps {
  segments: CustomSegment[];
  probabilities: number[];
  onProbabilityChange: (index: number, value: number) => void;
  onRename: (id: string, label: string) => void;
  onRecolor: (id: string, color: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onResetProbabilities: () => void;
  onNewWheel: () => void;
  onSaveWheel: () => void;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
  canAdd: boolean;
  canRemove: boolean;
  currentWheelName: string | null;
  hasUnsavedChanges: boolean;
}

export function ProbabilityPanel({
  segments,
  probabilities,
  onProbabilityChange,
  onRename,
  onRecolor,
  onAdd,
  onRemove,
  onResetProbabilities,
  onNewWheel,
  onSaveWheel,
  total,
  isValid,
  isEqualOdds,
  canAdd,
  canRemove,
  currentWheelName,
  hasUnsavedChanges,
}: ProbabilityPanelProps) {
  const [showNewWheelDialog, setShowNewWheelDialog] = useState(false);

  const handleNewWheelConfirm = () => {
    onNewWheel();
    setShowNewWheelDialog(false);
  };

  return (
    <>
      <Card className="w-full max-w-sm border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="truncate">
                  {currentWheelName || "Wheel Settings"}
                </span>
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-400 shrink-0">*</span>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {segments.length}/{MAX_SEGMENTS} segments
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSaveWheel}
                    className="text-muted-foreground"
                    data-testid="button-save-wheel"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save wheel</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onResetProbabilities}
                    className="text-muted-foreground"
                    data-testid="button-reset-probability"
                  >
                    <Percent className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset probabilities to equal odds</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewWheelDialog(true)}
                    className="border-border"
                    data-testid="button-new-wheel"
                  >
                    <FilePlus2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start a new wheel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-2">
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="flex items-center gap-2 py-0.5"
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
                className="flex-1 h-8 text-sm bg-background/50 border-border"
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
                  className="w-16 h-8 text-center text-sm bg-background/50 border-border"
                  data-testid={`input-probability-${index}`}
                />
                <span className="text-xs text-muted-foreground w-3">%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(segment.id)}
                disabled={!canRemove}
                className="text-muted-foreground hover:text-destructive shrink-0"
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
          className="w-full mt-2 border-border"
          data-testid="button-add-segment"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Segment
        </Button>

        <div className="pt-3 border-t border-border">
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

      <AlertDialog open={showNewWheelDialog} onOpenChange={setShowNewWheelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new wheel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your current segments and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-new-wheel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewWheelConfirm} data-testid="button-confirm-new-wheel">
              New Wheel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
