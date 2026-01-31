import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border py-4 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
            Terms of Service
          </Link>
          <span className="hidden sm:inline">|</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
            Privacy Policy
          </Link>
        </div>
        <span className="hidden sm:inline">|</span>
        <span>&copy; 2025 QuickWheel. All rights reserved.</span>
      </div>
    </footer>
  );
}
