import { memo } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MigrationPrompt } from "@/components/MigrationPrompt";
import { Menu, Monitor, Settings, FolderOpen, History, Trash2, LayoutGrid, Volume2, VolumeX, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useClerk, useUser } from "@clerk/react";

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
  const { openSignIn, openSignUp, signOut } = useClerk();
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
      <a href="/app" className="flex items-center">
        <img
          src="/app/logo.png"
          alt="QuickWheel"
          className="h-8 sm:h-10 w-auto hidden sm:block"
          data-testid="img-logo"
        />
        <span
          className="sm:hidden text-xl font-extrabold tracking-tight text-gradient-brand"
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

        {/* Mobile more menu — exposes nav actions hidden on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9" aria-label="More options">
              <Menu className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setLocation("/my-wheels")}>
              <FolderOpen className="w-4 h-4 mr-2" />My Wheels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/templates")}>
              <LayoutGrid className="w-4 h-4 mr-2" />Templates
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleHistory}>
              <History className="w-4 h-4 mr-2" />
              {showHistory ? "Hide history" : "Show history"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleRemoveWinner}>
              <Trash2 className="w-4 h-4 mr-2" />
              {removeWinnerMode ? "Remove winner: ON" : "Remove winner: OFF"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEnterPresentation}>
              <Monitor className="w-4 h-4 mr-2" />Presentation mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleMute}>
              {isMuted ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
              {isMuted ? "Sound: off" : "Sound: on"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {isDark ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Show when="signed-out">
              <DropdownMenuItem onClick={() => openSignIn()}>
                <LogIn className="w-4 h-4 mr-2" />Sign in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSignUp()}>
                <LogIn className="w-4 h-4 mr-2" />Sign up
              </DropdownMenuItem>
            </Show>
            <Show when="signed-in">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/app" })}>
                <LogOut className="w-4 h-4 mr-2" />Sign out
              </DropdownMenuItem>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>

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

        <div className="hidden sm:flex items-center gap-1">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" data-testid="button-sign-in">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" data-testid="button-sign-up">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <SoundToggle isMuted={isMuted} onToggle={onToggleMute} />
          <ThemeToggle />
          <InstallPrompt />
        </div>
      </div>
      <MigrationPrompt />
    </header>
  );
});
