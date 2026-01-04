import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export function SoundToggle({ isMuted, onToggle }: SoundToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="rounded-full"
      data-testid="button-sound-toggle"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-muted-foreground" />
      )}
      <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
    </Button>
  );
}
