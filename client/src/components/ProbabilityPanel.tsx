import { useState } from "react";
import { CustomSegment, MAX_LABEL_LENGTH } from "@shared/schema";
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
import { Percent, FilePlus2, Trash2, Plus, Save, X, Share2, Monitor, RotateCcw, CheckCircle2, ListPlus, MoreHorizontal } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { QuickAddDialog } from "./QuickAddDialog";
import { COLOR_PALETTES } from "@/lib/colorPalettes";

interface ProbabilityPanelProps {
  segments: CustomSegment[];
  weights: number[];
  onWeightChange: (index: number, value: number) => void;
  onRename: (id: string, label: string) => void;
  onRecolor: (id: string, color: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onResetWeights: () => void;
  onApplyColorPalette: (colors: string[]) => void;
  onNewWheel: () => void;
  onSaveWheel: () => void;
  onShare: () => void;
  onOBSEmbed: () => void;
  maxSegments: number;
  canAdd: boolean;
  canRemove: boolean;
  currentWheelName: string | null;
  hasUnsavedChanges: boolean;
  onClose?: () => void;
  noRepeatEnabled: boolean;
  onNoRepeatToggle: () => void;
  claimedIds: string[];
  onResetClaimed: () => void;
  onQuickFill: (labels: string[]) => void;
}

export function ProbabilityPanel({
  segments,
  weights,
  onWeightChange,
  onRename,
  onRecolor,
  onAdd,
  onRemove,
  onApplyColorPalette,
  onResetWeights,
  onNewWheel,
  onSaveWheel,
  onShare,
  onOBSEmbed,
  maxSegments,
  canAdd,
  canRemove,
  currentWheelName,
  hasUnsavedChanges,
  onClose,
  noRepeatEnabled,
  onNoRepeatToggle,
  claimedIds,
  onResetClaimed,
  onQuickFill,
}: ProbabilityPanelProps) {
  const [showNewWheelDialog, setShowNewWheelDialog] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleNewWheelConfirm = () => {
    onNewWheel();
    setShowNewWheelDialog(false);
  };

  return (
    <>
      <Card className="w-full sm:max-w-sm border border-border bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="truncate">
                  {currentWheelName || "Wheel Settings"}
                </span>
                {hasUnsavedChanges && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-amber-400 shrink-0 cursor-default" aria-label="Unsaved changes">*</span>
                    </TooltipTrigger>
                    <TooltipContent><p>Unsaved changes</p></TooltipContent>
                  </Tooltip>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {segments.length}/{maxSegments} segments
              </p>
            </div>
            {/* Mobile header: Save + overflow menu + Close */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={onSaveWheel} className="text-muted-foreground" data-testid="button-save-wheel" aria-label="Save wheel">
                <Save className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="More options">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={onShare} data-testid="button-share-wheel">
                    <Share2 className="w-4 h-4 mr-2" />Copy share link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOBSEmbed} data-testid="button-obs-embed">
                    <Monitor className="w-4 h-4 mr-2" />Copy OBS link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onResetWeights} data-testid="button-reset-weights">
                    <Percent className="w-4 h-4 mr-2" />Reset to equal odds
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowQuickAdd(true)} data-testid="button-quick-add">
                    <ListPlus className="w-4 h-4 mr-2" />Quick add prizes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowNewWheelDialog(true)} data-testid="button-new-wheel">
                    <FilePlus2 className="w-4 h-4 mr-2" />New wheel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground" data-testid="button-close-settings-mobile" aria-label="Close settings">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Desktop header: full button row */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onSaveWheel} className="text-muted-foreground" data-testid="button-save-wheel">
                    <Save className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Save wheel</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onShare} className="text-muted-foreground" data-testid="button-share-wheel">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy share link</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onOBSEmbed} className="text-muted-foreground relative" data-testid="button-obs-embed">
                    <Monitor className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy OBS embed link</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onResetWeights} className="text-muted-foreground" data-testid="button-reset-weights">
                    <Percent className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Reset to equal odds</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowQuickAdd(true)} className="text-muted-foreground" data-testid="button-quick-add">
                    <ListPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Quick add prizes</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowNewWheelDialog(true)} className="border-border" data-testid="button-new-wheel">
                    <FilePlus2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Start a new wheel</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="font-semibold text-sm text-foreground tracking-wide uppercase mb-1">Segments</p>
          <p className="text-xs text-muted-foreground mb-3">Drag to set each prize's odds — the rest rebalance automatically.</p>
          <div className="max-h-[45vh] sm:max-h-[320px] overflow-y-auto space-y-3 pr-1">
          {segments.map((segment, index) => {
            const isClaimed = claimedIds.includes(segment.id);
            return (
            <div
              key={segment.id}
              className={`flex flex-col gap-1.5 py-0.5 transition-opacity ${isClaimed ? "opacity-50" : ""}`}
              data-testid={`segment-row-${index}`}
            >
              <div className="flex items-center gap-2">
                {noRepeatEnabled && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${isClaimed ? "text-emerald-400" : "text-muted-foreground/30"}`}
                  />
                )}
                <ColorPicker
                  color={segment.color}
                  onChange={(color) => onRecolor(segment.id, color)}
                />
                <Input
                  type="text"
                  value={segment.label}
                  onChange={(e) => onRename(segment.id, e.target.value)}
                  maxLength={MAX_LABEL_LENGTH}
                  aria-label={`Segment ${index + 1} name`}
                  className={`flex-1 h-8 text-sm bg-background/50 border-border ${isClaimed ? "line-through text-muted-foreground" : ""}`}
                  data-testid={`input-segment-name-${index}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(segment.id)}
                  disabled={!canRemove}
                  aria-label={`Delete ${segment.label || `segment ${index + 1}`}`}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  data-testid={`button-delete-segment-${index}`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={weights[index] ?? 0}
                  onChange={(e) => onWeightChange(index, parseFloat(e.target.value))}
                  aria-label={`Win odds (percent) for ${segment.label || `segment ${index + 1}`}`}
                  className="flex-1 h-1.5 accent-primary cursor-pointer"
                  data-testid={`input-weight-${index}`}
                />
                <span className="text-xs text-muted-foreground w-12 text-right tabular-nums shrink-0" aria-hidden="true">
                  {(weights[index] ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
            );
          })}
        </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={!canAdd}
            className="w-full mt-3 border-border"
            data-testid="button-add-segment"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Segment
          </Button>
        </div>

        <div className="pt-1 border-t border-border space-y-2">
          <p className="font-semibold text-sm text-foreground tracking-wide uppercase">Color Themes</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.name}
                onClick={() => onApplyColorPalette(palette.colors)}
                aria-label={`Apply ${palette.name} color theme`}
                className="flex flex-col items-center gap-1 shrink-0 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                data-testid={`palette-${palette.name.toLowerCase()}`}
              >
                <div className="flex gap-0.5" aria-hidden="true">
                  {palette.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{palette.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1 border-t border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">No repeat</p>
              <p className="text-xs text-muted-foreground">Each prize can only be won once</p>
            </div>
            <Switch
              checked={noRepeatEnabled}
              onCheckedChange={onNoRepeatToggle}
              aria-label="Toggle no repeat mode"
            />
          </div>
          {noRepeatEnabled && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {claimedIds.length === 0
                  ? "No prizes claimed yet"
                  : claimedIds.length === segments.length
                    ? "All prizes claimed!"
                    : `${claimedIds.length} of ${segments.length} claimed`}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetClaimed}
                disabled={claimedIds.length === 0}
                className="h-7 px-2 text-xs border-border gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      </Card>

      <QuickAddDialog
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onSubmit={onQuickFill}
      />

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
