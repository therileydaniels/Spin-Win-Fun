import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useCustomSegments, SavedWheelData } from "@/hooks/useCustomSegments";
import { useToast } from "@/hooks/use-toast";
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
import { ArrowLeft, Trash2, Play, Loader2, CircleDot } from "lucide-react";
import type { Wheel } from "@shared/schema";

interface WheelWithSegments extends Wheel {
  segments: {
    segments: Array<{ id: string; label: string; color: string }>;
    probabilities: number[];
  };
}

export default function MyWheels() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadWheel, hasUnsavedChanges } = useCustomSegments();
  const { toast } = useToast();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loadId, setLoadId] = useState<number | null>(null);
  const [pendingLoad, setPendingLoad] = useState<WheelWithSegments | null>(null);

  const { data, isLoading } = useQuery<{ wheels: WheelWithSegments[] }>({
    queryKey: ["/api/wheels"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wheels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheels"] });
      toast({
        title: "Wheel deleted",
        description: "Your wheel has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete wheel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setDeleteId(null);
  };

  const handleLoadClick = (wheel: WheelWithSegments) => {
    if (hasUnsavedChanges) {
      setPendingLoad(wheel);
      setLoadId(wheel.id);
    } else {
      performLoad(wheel);
    }
  };

  const performLoad = (wheel: WheelWithSegments) => {
    const data: SavedWheelData = {
      segments: wheel.segments.segments,
      probabilities: wheel.segments.probabilities,
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
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
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Please sign in to view your saved wheels.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-go-signin">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const wheels = data?.wheels || [];
  const wheelCount = wheels.length;
  const isAdmin = user?.role === "admin";

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
          <h1 
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            My Wheels
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <span className="text-sm text-muted-foreground">
              {wheelCount}/2 saved
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 p-4 sm:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : wheels.length === 0 ? (
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
                    {wheel.segments.segments.length} segments
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {wheel.segments.segments.slice(0, 5).map((seg, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full"
                        style={{ background: seg.color }}
                        title={seg.label}
                      />
                    ))}
                    {wheel.segments.segments.length > 5 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{wheel.segments.segments.length - 5}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Updated {new Date(wheel.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
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
