import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useCustomSegments, SavedWheelData } from "@/hooks/useCustomSegments";
import { useToast } from "@/hooks/use-toast";
import { WHEEL_TEMPLATES, TEMPLATE_CATEGORIES, WheelTemplate } from "@/lib/wheelTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Play } from "lucide-react";
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

const CATEGORY_LABELS: Record<string, string> = {
  games: "Games",
  decisions: "Decisions",
  giveaways: "Giveaways",
  fun: "Fun",
};

export default function Templates() {
  const [, setLocation] = useLocation();
  const { loadWheel, hasUnsavedChanges } = useCustomSegments();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<WheelTemplate | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory
        ? WHEEL_TEMPLATES.filter((t) => t.category === activeCategory)
        : WHEEL_TEMPLATES,
    [activeCategory],
  );

  const performLoad = (template: WheelTemplate) => {
    const data: SavedWheelData = {
      segments: template.segments.map((s) => ({ id: s.id, label: s.label, color: s.color })),
      probabilities: template.segments.map((s) => s.probability),
    };
    loadWheel(`template-${template.id}`, template.name, data);
    setLocation("/");
    toast({
      title: "Template loaded",
      description: `"${template.name}" is ready to spin!`,
    });
  };

  const handleUseTemplate = (template: WheelTemplate) => {
    if (hasUnsavedChanges) {
      setPendingTemplate(template);
    } else {
      performLoad(template);
    }
  };

  const confirmLoad = () => {
    if (pendingTemplate) {
      performLoad(pendingTemplate);
    }
    setPendingTemplate(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.1) 0%, transparent 40%)",
        }}
      />

      <header className="relative z-10 flex items-center gap-4 px-4 py-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
          aria-label="Back to wheel"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-extrabold tracking-tight text-gradient-brand">Wheel Templates</h1>
      </header>

      <main className="relative z-10 flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <Card
              key={template.id}
              className="border-border bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {template.segments.map((seg) => (
                    <div
                      key={seg.id}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="truncate max-w-[80px]">{seg.label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={() => handleUseTemplate(template)}
                  data-testid={`button-use-${template.id}`}
                >
                  <Play className="w-4 h-4" />
                  Use This Wheel
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />

      <AlertDialog
        open={!!pendingTemplate}
        onOpenChange={(open) => !open && setPendingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to your current wheel. Loading a template will replace them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLoad}>Load template</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
