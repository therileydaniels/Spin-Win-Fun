import { useLocation } from "wouter";
import { PricingTable } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Pricing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2" data-testid="button-back-home">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-extrabold tracking-tight text-gradient-brand">QuickWheel Pro</h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <p className="text-foreground text-center mb-6 max-w-2xl mx-auto">
          Unlock OBS overlays, presentation mode, custom colors, exports, no watermark, and up to 50 wheels.
        </p>
        <div className="overflow-x-auto">
          <PricingTable
            appearance={{
              variables: {
                colorPrimary: "hsl(var(--primary))",
                colorBackground: "hsl(var(--card))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                colorInputBackground: "hsl(var(--background))",
                colorInputText: "hsl(var(--foreground))",
                borderRadius: "0.5rem",
              },
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
