import { useLocation } from "wouter";
import { PricingTable } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

// Clerk's widget can't resolve our `hsl(var(--token))` CSS variables (it renders
// outside the .dark scope where the vars are defined), so it fell back to its
// light default and rendered light cards on our dark stage. Pass literal
// theme-aware colors from the committed palette instead — works regardless of
// how Clerk scopes its styles, and follows the theme toggle.
//
// NOTE: these MUST use Clerk's current appearance-variable names (v5/6 renamed
// them). Old names like `colorText` are silently ignored, which left dark text
// on the dark stage = unreadable. Current names:
//   colorForeground (text), colorMutedForeground (secondary text),
//   colorInput (input bg), colorInputForeground (input text).
const CLERK_THEME = {
  dark: {
    colorPrimary: "#7C3AED",
    colorBackground: "#171717",
    colorForeground: "#FAFAFA",
    colorMutedForeground: "#A6A6A6",
    colorInput: "#0F172A",
    colorInputForeground: "#FAFAFA",
    borderRadius: "0.5rem",
  },
  light: {
    colorPrimary: "#7C3AED",
    colorBackground: "#FAFAFA",
    colorForeground: "#171717",
    colorMutedForeground: "#595959",
    colorInput: "#F9F9FC",
    colorInputForeground: "#171717",
    borderRadius: "0.5rem",
  },
} as const;

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
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
        <p className="text-foreground text-center mb-2 max-w-2xl mx-auto">
          Unlock OBS overlays, presentation mode, custom colors, exports, no watermark, and up to 50 wheels.
        </p>
        <p className="text-muted-foreground text-sm text-center mb-6 max-w-2xl mx-auto">
          Use the <span className="font-semibold text-foreground">"Billed annually"</span> toggle on the Pro plan to switch between monthly and annual pricing — annual saves you money.
        </p>
        <div className="overflow-x-auto">
          <PricingTable
            appearance={{
              variables: isDark ? CLERK_THEME.dark : CLERK_THEME.light,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
