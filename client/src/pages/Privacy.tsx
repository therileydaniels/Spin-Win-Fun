import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-xl font-bold tracking-tight text-gradient-brand">
            Privacy Policy
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
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect the following types of information when you use QuickWheel:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li><strong>Account Information:</strong> Email address, name (optional), and password (stored securely using industry-standard hashing)</li>
              <li><strong>Wheel Data:</strong> Your saved wheel configurations, including segment names, colors, and probability settings</li>
              <li><strong>Usage Data:</strong> Basic analytics such as page visits and feature usage to help us improve the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>Provide, maintain, and improve the Service</li>
              <li>Save and sync your wheel configurations across sessions</li>
              <li>Communicate important updates about the Service</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Ensure the security and integrity of the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take the security of your data seriously:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>Passwords are hashed using bcrypt and never stored in plain text</li>
              <li>Data is stored securely in our database with encryption at rest</li>
              <li>We use secure, httpOnly session cookies to protect your login</li>
              <li>All data transmission is encrypted using HTTPS</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use session cookies to keep you logged in and remember your preferences. These cookies are essential 
              for the Service to function properly.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We do not use third-party tracking cookies. If we add analytics or advertising in the future, 
              we will update this policy accordingly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We respect your privacy and do NOT sell your personal data to third parties.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may share information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>When required by law, such as in response to a valid legal request</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>With service providers who help us operate the Service (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li><strong>Access:</strong> You can view your account information and saved wheels at any time</li>
              <li><strong>Deletion:</strong> You can delete your account and all associated data</li>
              <li><strong>Export:</strong> Data export functionality may be available in future updates</li>
              <li><strong>Correction:</strong> You can update your account information at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise these rights, please contact us at BookRD@protonmail.com.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If we become aware that we have collected data from a child under 13, 
              we will take steps to delete that information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we make significant changes, we will notify 
              users through the Service or via email. The updated policy will be posted on this page with a new 
              revision date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy or how we handle your data, 
              please contact us at BookRD@protonmail.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
