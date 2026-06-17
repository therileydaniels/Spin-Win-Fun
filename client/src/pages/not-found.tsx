import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-2xl font-extrabold tracking-tight text-gradient-brand">
              404 Page Not Found
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>

          <Button asChild className="mt-6" data-testid="button-back-quickwheel">
            <Link href="/">Back to QuickWheel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
