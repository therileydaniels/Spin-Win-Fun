import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHANGELOG_VERSION, CHANGELOG_ENTRIES } from "@/lib/changelog";

interface ChangelogCardProps {
  open: boolean;
  onClose: () => void;
}

export function ChangelogCard({ open, onClose }: ChangelogCardProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -40, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-4 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          <div className="flex items-start justify-between gap-3 p-4 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-sm text-foreground leading-tight">What's New</h3>
                <p className="text-xs text-muted-foreground">Update {CHANGELOG_VERSION}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 h-7 w-7 shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <ul className="px-4 pb-3 space-y-2">
            {CHANGELOG_ENTRIES.map((entry, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary font-bold mt-px shrink-0">·</span>
                <span>{entry}</span>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-4">
            <Button onClick={onClose} size="sm" className="w-full h-8 text-xs">
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
