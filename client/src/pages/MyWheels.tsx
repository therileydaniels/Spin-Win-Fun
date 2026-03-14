import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomSegments, SavedWheelData } from "@/hooks/useCustomSegments";
import { useToast } from "@/hooks/use-toast";
import { getLocalWheels, deleteLocalWheel, duplicateLocalWheel, encodeWheelToUrl, LocalWheel } from "@/lib/localWheelStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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
import { Footer } from "@/components/Footer";
import { ArrowLeft, Trash2, Play, CircleDot, AlertTriangle, Copy, Share2 } from "lucide-react";

export default function MyWheels() {
  const [, setLocation] = useLocation();
  const { loadWheel, hasUnsavedChanges } = useCustomSegments();
  const { toast } = useToast();

  const [wheels, setWheels] = useState<LocalWheel[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadId, setLoadId] = useState<string | null>(null);
  const [pendingLoad, setPendingLoad] = useState<LocalWheel | null>(null);

  useEffect(() => {
    setWheels(getLocalWheels());
  }, []);

  const handleDelete = (id: string) => {
    const result = deleteLocalWheel(id);
    if (result.success) {
      setWheels(getLocalWheels());
      toast({
        title: "Wheel deleted",
        description: "Your wheel has been deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete wheel.",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handleDuplicate = (id: string) => {
    const result = duplicateLocalWheel(id);
    if (result.success && result.wheel) {
      setWheels(getLocalWheels());
      toast({
        title: "Wheel duplicated",
        description: `"${result.wheel.name}" has been created.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to duplicate wheel.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (wheel: LocalWheel) => {
    const encoded = encodeWheelToUrl(wheel);
    const shareUrl = `${window.location.origin}/?wheel=${encoded}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link to let others use your wheel.",
      });
    } catch {
      toast({
        title: "Share link",
        description: shareUrl,
      });
    }
  };

  const handleLoadClick = (wheel: LocalWheel) => {
    if (hasUnsavedChanges) {
      setPendingLoad(wheel);
      setLoadId(wheel.id);
    } else {
      performLoad(wheel);
    }
  };

  const performLoad = (wheel: LocalWheel) => {
    const data: SavedWheelData = {
      segments: wheel.segments.map(s => ({ id: s.id, label: s.label, color: s.color })),
      probabilities: wheel.segments.map(s => s.probability),
    };
    loadWheel(wheel.id, wheel.name, data);
    setLocation("/");
    toast({
      title: "Wheel loaded",
      description: `"${wheel.name}" is now active.`,
    });
  };

  const confirmLoad = () => {
    if (pendingLoad) {
      performLoad(pendingLoad);
    }
    setLoadId(null);
    setPendingLoad(null);
  };

  const wheelCount = wheels.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.1) 0%, transparent 40%)"
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-gradient-brand">
            My Wheels
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {wheelCount}/10 saved
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Wheels are saved locally in your browser. Clearing browser data will delete them.</span>
          </div>
        </div>

        {wheels.length === 0 ? (
          <Card className="max-w-md mx-auto text-center border-border bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-6">
              <CircleDot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">No saved wheels yet</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Create a wheel and save it to see it here!
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-create-wheel">
                Create a Wheel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {wheels.map((wheel) => (
              <Card
                key={wheel.id}
                className="border-border bg-card/80 backdrop-blur-sm"
                data-testid={`card-wheel-${wheel.id}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium truncate">
                    {wheel.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {wheel.segments.length} segments
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {wheel.segments.slice(0, 5).map((seg, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full"
                        style={{ background: seg.color }}
                        title={seg.label}
                      />
                    ))}
                    {wheel.segments.length > 5 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{wheel.segments.length - 5}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Updated {new Date(wheel.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleLoadClick(wheel)}
                      data-testid={`button-load-wheel-${wheel.id}`}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Load
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(wheel.id)}
                      className="flex-1 border-border"
                      data-testid={`button-duplicate-wheel-${wheel.id}`}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(wheel)}
                      className="border-border"
                      data-testid={`button-share-wheel-${wheel.id}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(wheel.id)}
                      className="border-border"
                      data-testid={`button-delete-wheel-${wheel.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this wheel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The wheel will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={loadId !== null} onOpenChange={() => { setLoadId(null); setPendingLoad(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load this wheel?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to your current wheel. Loading a new wheel will discard those changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-load">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLoad} data-testid="button-confirm-load">
              Load Wheel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
