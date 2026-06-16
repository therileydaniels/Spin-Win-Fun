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
import { Check, AlertTriangle, Scale, Percent, FilePlus2, Trash2, Plus, Save, X, Share2, Monitor, RotateCcw, CheckCircle2, ListPlus, MoreHorizontal } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { QuickAddDialog } from "./QuickAddDialog";
import { COLOR_PALETTES } from "@/lib/colorPalettes";

interface ProbabilityPanelProps {
  segments: CustomSegment[];
  probabilities: number[];
  onProbabilityChange: (index: number, value: number) => void;
  onRename: (id: string, label: string) => void;
  onRecolor: (id: string, color: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onResetProbabilities: () => void;
  onApplyColorPalette: (colors: string[]) => void;
  onNewWheel: () => void;
  onSaveWheel: () => void;
  onShare: () => void;
  onOBSEmbed: () => void;
  total: number;
  isValid: boolean;
  isEqualOdds: boolean;
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
  probabilities,
  onProbabilityChange,
  onRename,
  onRecolor,
  onAdd,
  onRemove,
  onApplyColorPalette,
  onResetProbabilities,
  onNewWheel,
  onSaveWheel,
  onShare,
  onOBSEmbed,
  total,
  isValid,
  isEqualOdds,
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
      <Card className="w-full sm:max-w-sm border border-white/5 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/20">
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
                {segments.length}/{MAX_SEGMENTS} segments
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
                  <DropdownMenuItem onClick={onResetProbabilities} data-testid="button-reset-probability">
                    <Percent className="w-4 h-4 mr-2" />Reset probabilities
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
                  <Button variant="ghost" size="icon" onClick={onOBSEmbed} className="text-muted-foreground" data-testid="button-obs-embed">
                    <Monitor className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy OBS embed link</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onResetProbabilities} className="text-muted-foreground" data-testid="button-reset-probability">
                    <Percent className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Reset probabilities to equal odds</p></TooltipContent>
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
          <p className="text-xs text-muted-foreground mb-3">Leave the odds at 0 for equal chances.</p>
          <div className="max-h-[45vh] sm:max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {segments.map((segment, index) => {
            const isClaimed = claimedIds.includes(segment.id);
            return (
            <div
              key={segment.id}
              className={`flex items-center gap-2 py-0.5 transition-opacity ${isClaimed ? "opacity-50" : ""}`}
              data-testid={`segment-row-${index}`}
            >
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
                className={`flex-1 h-8 text-sm bg-background/50 border-border ${isClaimed ? "line-through text-muted-foreground" : ""}`}
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
                className="flex flex-col items-center gap-1 shrink-0 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                data-testid={`palette-${palette.name.toLowerCase()}`}
              >
                <div className="flex gap-0.5">
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

        <div className="pt-1 border-t border-border">
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
