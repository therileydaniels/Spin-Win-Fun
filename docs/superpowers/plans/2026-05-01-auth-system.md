# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase email/password auth so users can sign in and have their session persist across devices, unlocking wheel save/load in a future phase.

**Architecture:** Pure client-side Supabase Auth. An `AuthContext` wraps the app and provides user state and auth actions. `AuthModal` handles sign in/sign up. `WheelHeader` shows a Sign In button (logged out) or `UserMenu` dropdown (logged in). Express backend is untouched.

**Tech Stack:** `@supabase/supabase-js`, React Context, `react-hook-form`, `zod`, shadcn/ui Dialog + Tabs + DropdownMenu

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `client/src/lib/supabase.ts` | Supabase client singleton |
| Create | `client/src/context/AuthContext.tsx` | Auth state + signIn/signUp/signOut actions |
| Create | `client/src/components/AuthModal.tsx` | Sign In / Sign Up modal |
| Create | `client/src/components/UserMenu.tsx` | Logged-in user dropdown |
| Modify | `client/src/components/WheelHeader.tsx` | Add Sign In button or UserMenu |
| Modify | `client/src/App.tsx` | Wrap app in AuthProvider |
| Create | `.env` | Supabase URL + anon key |

---

## Task 1: Disable email confirmation in Supabase

Email confirmation must be turned off so users are logged in immediately after sign-up.

- [ ] **Step 1: Open Supabase dashboard**

Go to: https://supabase.com/dashboard/project/ucdnmipkodqdcwkwlxod/auth/providers

- [ ] **Step 2: Disable email confirmation**

Under **Email**, uncheck **"Confirm email"** and save.

---

## Task 2: Create the wheels table with RLS

- [ ] **Step 1: Apply the migration via Supabase MCP**

Use the `mcp__supabase__apply_migration` tool with the following SQL:

```sql
CREATE TABLE public.wheels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  segments JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.wheels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_wheels" ON public.wheels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_wheels" ON public.wheels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_wheels" ON public.wheels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_wheels" ON public.wheels
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wheels_updated_at
  BEFORE UPDATE ON public.wheels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

- [ ] **Step 2: Verify table exists**

Use `mcp__supabase__list_tables` with `schemas: ["public"]` and confirm `wheels` appears.

---

## Task 3: Install @supabase/supabase-js and create .env

- [ ] **Step 1: Install the package**

```bash
npm install @supabase/supabase-js
```

Expected output: `added 1 package` (or similar, no errors)

- [ ] **Step 2: Create .env file**

Create `.env` in the project root:

```
VITE_SUPABASE_URL=https://ucdnmipkodqdcwkwlxod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZG5taXBrb2RxZGN3a3dseG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjEyMDcsImV4cCI6MjA5MzIzNzIwN30.HX_7uTVeYECcfqN8GIvaO3Rqqs-7wHiY2eICzQaaW3Q
```

Note: `.env` is already in `.gitignore`. The anon key is safe to use client-side — it's Supabase's public key.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Install @supabase/supabase-js"
```

---

## Task 4: Create Supabase client singleton

**Files:**
- Create: `client/src/lib/supabase.ts`

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/supabase.ts
git commit -m "Add Supabase client singleton"
```

---

## Task 5: Create AuthContext

**Files:**
- Create: `client/src/context/AuthContext.tsx`

- [ ] **Step 1: Create the directory and file**

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? 'Invalid email or password' : null }
  }

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? 'Could not create account' : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/context/AuthContext.tsx
git commit -m "Add AuthContext with Supabase session management"
```

---

## Task 6: Create AuthModal

**Files:**
- Create: `client/src/components/AuthModal.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const authSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess: () => void
}

function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: AuthFormData) => {
    setServerError(null)
    const result = mode === 'signin'
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
            ? 'Loading…'
            : mode === 'signin' ? 'Sign In' : 'Create Account'}
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
        </DialogHeader>
        <Tabs defaultValue="signin">
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
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/AuthModal.tsx
git commit -m "Add AuthModal with sign in and sign up tabs"
```

---

## Task 7: Create UserMenu

**Files:**
- Create: `client/src/components/UserMenu.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="User menu">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="font-normal text-muted-foreground truncate">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/UserMenu.tsx
git commit -m "Add UserMenu dropdown for logged-in state"
```

---

## Task 8: Update WheelHeader

**Files:**
- Modify: `client/src/components/WheelHeader.tsx`

- [ ] **Step 1: Add imports**

At the top of `WheelHeader.tsx`, add these imports after the existing ones:

```typescript
import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { UserMenu } from '@/components/UserMenu'
```

- [ ] **Step 2: Add auth state inside the component**

Inside `WheelHeader` (after the `useLocation` line), add:

```typescript
const { user } = useAuth()
const [authModalOpen, setAuthModalOpen] = useState(false)
```

- [ ] **Step 3: Update the right-side button group**

Replace the existing `<div className="flex items-center gap-1">` block (the one containing SoundToggle, ThemeToggle, InstallPrompt) with:

```tsx
<div className="flex items-center gap-1">
  {user ? (
    <UserMenu />
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAuthModalOpen(true)}
          className="h-9 w-9"
          aria-label="Sign in"
        >
          <LogIn className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Sign in</p>
      </TooltipContent>
    </Tooltip>
  )}
  <SoundToggle isMuted={isMuted} onToggle={onToggleMute} />
  <ThemeToggle />
  <InstallPrompt />
</div>
```

- [ ] **Step 4: Add AuthModal at the end of the return, before the closing `</header>` tag**

```tsx
<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/WheelHeader.tsx
git commit -m "Add sign in button and user menu to header"
```

---

## Task 9: Update App.tsx

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Add AuthProvider import**

Add this import to `App.tsx`:

```typescript
import { AuthProvider } from '@/context/AuthContext'
```

- [ ] **Step 2: Wrap app in AuthProvider**

Replace the `App` function body with:

```tsx
function App() {
  return (
    <Router base="/app">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/App.tsx
git commit -m "Wrap app in AuthProvider"
```

---

## Task 10: Verify end-to-end

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify logged-out state**

Open http://localhost:5000/app — the header should show a LogIn icon button on the right side.

- [ ] **Step 3: Verify modal opens**

Click the LogIn icon — the AuthModal should open with Sign In and Sign Up tabs.

- [ ] **Step 4: Sign up a new account**

Switch to Sign Up tab, enter an email and password (min 8 chars), click Create Account. The modal should close and the header should now show a User icon button.

- [ ] **Step 5: Verify UserMenu**

Click the User icon — the dropdown should show the email (greyed out) and a Sign Out option.

- [ ] **Step 6: Verify sign out**

Click Sign Out — the User icon should revert to the LogIn icon.

- [ ] **Step 7: Verify sign in**

Click Sign In, enter the credentials from Step 4 — modal should close and User icon should appear again.

- [ ] **Step 8: Verify session persists**

Refresh the page — the User icon (not the LogIn icon) should still be shown.

- [ ] **Step 9: Verify wheel works without login**

Sign out. Spin the wheel — it should work normally with no errors.
