import { memo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Monitor, Settings, FolderOpen, History, Trash2, LayoutGrid } from "lucide-react";

interface WheelHeaderProps {
  settingsOpen: boolean;
  onToggleSettings: () => void;
  showHistory: boolean;
  onToggleHistory: () => void;
  removeWinnerMode: boolean;
  onToggleRemoveWinner: () => void;
  onEnterPresentation: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WheelHeader = memo(function WheelHeader({
  settingsOpen,
  onToggleSettings,
  showHistory,
  onToggleHistory,
  removeWinnerMode,
  onToggleRemoveWinner,
  onEnterPresentation,
  isMuted,
  onToggleMute,
}: WheelHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
      <a href="/" className="flex items-center">
        <img
          src="/logo.png"
          alt="QuickWheel"
          className="h-8 sm:h-10 w-auto hidden sm:block"
          data-testid="img-logo"
        />
        <span
          className="sm:hidden text-xl font-bold bg-gradient-brand bg-clip-text text-transparent"
        >
          QuickWheel
        </span>
      </a>
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={settingsOpen ? "secondary" : "default"}
              onClick={onToggleSettings}
              className="gap-2"
              data-testid="button-open-settings"
              aria-label={settingsOpen ? "Close settings" : "Open settings"}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Customize</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{settingsOpen ? "Close settings" : "Open settings"}</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden sm:flex items-center gap-1 px-1 py-1 rounded-lg bg-muted/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/my-wheels")}
                className="text-muted-foreground h-8 w-8"
                data-testid="button-my-wheels"
                aria-label="My Wheels"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>My Wheels</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/templates")}
                className="text-muted-foreground h-8 w-8"
                data-testid="button-templates"
                aria-label="Templates"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Templates</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showHistory ? "secondary" : "ghost"}
                size="icon"
                onClick={onToggleHistory}
                className="text-muted-foreground h-8 w-8"
                data-testid="button-toggle-history"
                aria-label={showHistory ? "Hide history" : "Show history"}
              >
                <History className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showHistory ? "Hide history" : "Show history"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={removeWinnerMode ? "secondary" : "ghost"}
                size="icon"
                onClick={onToggleRemoveWinner}
                className="text-muted-foreground h-8 w-8"
                data-testid="button-toggle-remove-winner"
                aria-label={removeWinnerMode ? "Remove winner: ON" : "Remove winner: OFF"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{removeWinnerMode ? "Remove winner: ON" : "Remove winner: OFF"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEnterPresentation}
                className="text-muted-foreground h-8 w-8"
                data-testid="button-enter-presentation"
                aria-label="Enter presentation mode"
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enter presentation mode</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1">
          <SoundToggle isMuted={isMuted} onToggle={onToggleMute} />
          <ThemeToggle />
          <InstallPrompt />
        </div>
      </div>
    </header>
  );
});
