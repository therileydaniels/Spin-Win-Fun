import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useWheelStorage } from "@/hooks/useWheelStorage";
import {
  getLocalWheels,
  deleteLocalWheel,
  type LocalWheel,
} from "@/lib/localWheelStorage";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FLAG_KEY = "quickwheel_cloud_migration_done";

export function MigrationPrompt() {
  const { isSignedIn } = useUser();
  const storage = useWheelStorage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [localWheels, setLocalWheels] = useState<LocalWheel[]>([]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (localStorage.getItem(FLAG_KEY) === "true") return;
    const found = getLocalWheels();
    if (found.length === 0) {
      // Nothing to migrate yet — don't burn the one-time flag. If the user
      // later builds local wheels (e.g. while signed out) and signs back in,
      // they should still get the prompt. The flag is only set after an actual
      // import or an explicit skip.
      return;
    }
    setLocalWheels(found);
    setOpen(true);
  }, [isSignedIn]);

  const handleImport = async () => {
    setImporting(true);
    let imported = 0;
    let failed = 0;
    for (const w of localWheels) {
      const result = await storage.save({ name: w.name, segments: w.segments });
      if (result.success) {
        deleteLocalWheel(w.id);
        imported++;
      } else {
        failed++;
      }
    }
    setImporting(false);
    localStorage.setItem(FLAG_KEY, "true");
    setOpen(false);

    if (failed === 0) {
      toast({ title: `Imported ${imported} wheels to your account.` });
    } else {
      toast({
        title: `Imported ${imported} of ${imported + failed}. ${failed} still saved locally.`,
      });
    }
  };

  const handleSkip = () => {
    localStorage.setItem(FLAG_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import your local wheels?</DialogTitle>
          <DialogDescription>
            You have {localWheels.length} {localWheels.length === 1 ? "wheel" : "wheels"} saved on this device.
            Import them to your account so they sync across devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={importing}>
            Skip
          </Button>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? "Importing..." : `Import ${localWheels.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
