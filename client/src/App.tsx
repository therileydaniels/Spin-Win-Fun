import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";

const MyWheels = lazy(() => import("@/pages/MyWheels"));
const Embed = lazy(() => import("@/pages/Embed"));
const Templates = lazy(() => import("@/pages/Templates"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));

function AppRouter() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/embed" component={Embed} />
        <Route path="/my-wheels" component={MyWheels} />
        <Route path="/templates" component={Templates} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <Router base="/app">
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </MotionConfig>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
