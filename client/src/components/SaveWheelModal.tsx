import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

type NameFormValues = z.infer<typeof nameSchema>;

interface SaveWheelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void | Promise<void>;
  defaultName?: string;
  title?: string;
  buttonText?: string;
}

export function SaveWheelModal({
  open,
  onOpenChange,
  onSave,
  defaultName = "My Wheel",
  title = "Save Wheel",
  buttonText = "Save",
}: SaveWheelModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  const handleSubmit = async (values: NameFormValues) => {
    setIsSaving(true);
    try {
      await onSave(values.name);
      onOpenChange(false);
      form.reset({ name: "My Wheel" });
    } catch {
      // Error display is handled by the caller via toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-save-wheel">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wheel Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a name for your wheel"
                      data-testid="input-wheel-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-save"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-testid="button-confirm-save"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  buttonText
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
