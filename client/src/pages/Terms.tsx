import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.1) 0%, transparent 40%)"
        }}
      />

      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-extrabold tracking-tight text-gradient-brand">
            Terms of Service
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-sm text-muted-foreground">
            Last updated: January 2025
          </p>

          <p className="text-sm text-muted-foreground italic">
            Note: This document is a template. Please consult a legal professional for advice specific to your situation.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using QuickWheel ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              QuickWheel is a customizable wheel spinner application designed for entertainment and decision-making purposes. 
              Users can create custom wheels, set segment names, colors, and adjust probability weights.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Important:</strong> Probability weighting is an intentional feature of the Service, not a bug. 
              Users can configure weights to influence outcomes as part of the intended functionality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One account per person. Sharing accounts is not permitted.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              <li>You must provide accurate information when creating an account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is intended for entertainment purposes only. You agree NOT to use the Service for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>Gambling or any activities involving real money stakes</li>
              <li>Making financial, legal, or medical decisions</li>
              <li>Any illegal, harmful, or abusive purposes</li>
              <li>Automated access, scraping, or data extraction</li>
              <li>Attempting to reverse-engineer or exploit the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              QuickWheel, including its design, code, and branding, is owned by us and protected by intellectual property laws. 
              You may not copy, modify, or distribute any part of the Service without permission.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any wheel configurations you create. By using the Service, you grant us 
              a license to store and display your configurations as needed to provide the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
              We do not guarantee that the Service will be uninterrupted, error-free, or available at all times.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are not responsible for any decisions made based on wheel spin results. 
              The Service is for entertainment purposes only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, QuickWheel and its operators shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page 
              with an updated revision date. Your continued use of the Service after changes are posted constitutes 
              acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at BookRD@protonmail.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
