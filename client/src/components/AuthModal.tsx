import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: "signin" | "signup"
  onSuccess: () => void
}

function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: AuthFormData) => {
    setServerError(null)
    const result = mode === "signin"
      ? await signIn(data.email, data.password)
      : await signUp(data.email, data.password)

    if (result.error) {
      setServerError(result.error)
    } else {
      onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Loading…"
            : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </Form>
  )
}

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to QuickWheel</DialogTitle>
          <DialogDescription className="sr-only">Sign in or create a new account</DialogDescription>
        </DialogHeader>
        <Tabs key={open ? "open" : "closed"} defaultValue="signin">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <AuthForm mode="signin" onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <AuthForm mode="signup" onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
