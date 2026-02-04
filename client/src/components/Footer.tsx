import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/50 py-6 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground/70">
        <div className="flex items-center gap-6">
          <Link 
            href="/terms" 
            className="hover:text-foreground/80 transition-colors duration-200" 
            data-testid="link-terms"
          >
            Terms
          </Link>
          <Link 
            href="/privacy" 
            className="hover:text-foreground/80 transition-colors duration-200" 
            data-testid="link-privacy"
          >
            Privacy
          </Link>
        </div>
        <span className="hidden sm:inline text-muted-foreground/40">·</span>
        <span className="text-muted-foreground/50">&copy; 2025 QuickWheel</span>
      </div>
    </footer>
  );
}
