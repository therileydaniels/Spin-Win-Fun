import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowInstall(false);
        toast({
          title: "App installed!",
          description: "QuickWheel has been added to your home screen.",
        });
      }
    } catch {
      toast({
        title: "Installation failed",
        description: "Could not install the app. Please try again.",
        variant: "destructive",
      });
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleInstall}
          className="h-9 w-9 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 hover:from-purple-500/20 hover:to-pink-500/20"
          data-testid="button-install-app"
        >
          <img 
            src="/favicon-32x32.png" 
            alt="Install QuickWheel" 
            className="h-5 w-5"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Install QuickWheel app</p>
      </TooltipContent>
    </Tooltip>
  );
}
