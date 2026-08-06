import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Eye, AlertTriangle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Chamidu Herath ICT Giveaway Platform — how we collect, store, and protect your data.",
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-red-400">{icon}</div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="text-gray-300 text-sm leading-relaxed space-y-2 pl-7">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-400" />
            <h1 className="text-2xl font-black text-white font-outfit">Privacy Policy</h1>
          </div>
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* YouTube Disclaimer — prominent */}
        <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-300 text-sm mb-1">YouTube Disclaimer</p>
              <p className="text-sm text-yellow-200/80 leading-relaxed">
                This giveaway is in no way sponsored, endorsed, administered by, or associated with YouTube LLC.
                By entering any giveaway on this platform, participants acknowledge that YouTube is completely
                released from all liability related to this contest. All giveaways are independently organized
                by Chamidu Herath ICT.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Section title="Information We Collect" icon={<Eye className="h-5 w-5" />}>
            <p>When you enter a giveaway, we collect the following information:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-200">Full Name</strong> — to identify and announce winners</li>
              <li><strong className="text-gray-200">WhatsApp Mobile Number</strong> — to contact winners privately</li>
              <li><strong className="text-gray-200">YouTube Username</strong> — to verify channel subscription</li>
            </ul>
            <p>We also collect your IP address for rate limiting and fraud prevention purposes only.</p>
          </Section>

          <Section title="How We Use Your Data" icon={<Lock className="h-5 w-5" />}>
            <p>Your personal data is used exclusively for:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Verifying your eligibility to enter the giveaway</li>
              <li>Preventing duplicate entries (same phone or YouTube handle per giveaway)</li>
              <li>Contacting winners to arrange prize delivery</li>
              <li>Announcing winners publicly with <strong className="text-gray-200">partially masked phone numbers</strong> (e.g., +9477****123) to protect your privacy</li>
            </ul>
          </Section>

          <Section title="Phone Number Privacy" icon={<Shield className="h-5 w-5" />}>
            <p>
              Your full phone number is <strong className="text-gray-200">stored securely in our database</strong> and is
              only accessible to the channel administrator. When displaying winners publicly, we mask the middle
              digits of your phone number (e.g., <code className="bg-white/10 px-1 rounded text-xs">+9477****123</code>)
              so only you and the administrator know your full number.
            </p>
            <p>Your phone number is <strong className="text-gray-200">never sold, shared, or disclosed</strong> to any third party under any circumstances.</p>
          </Section>

          <Section title="Data Retention" icon={<Lock className="h-5 w-5" />}>
            <p>
              Participant data is retained for the duration of the giveaway and a reasonable period thereafter
              to resolve any disputes. Giveaway records (including winner announcements with masked phone numbers)
              are kept permanently for transparency.
            </p>
          </Section>

          <Section title="Your Rights" icon={<Eye className="h-5 w-5" />}>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Request access to your personal data</li>
              <li>Request deletion of your entry (before winners are selected)</li>
              <li>Contact us with any privacy concerns</li>
            </ul>
          </Section>

          <Section title="Contact" icon={<Mail className="h-5 w-5" />}>
            <p>
              For privacy-related requests or concerns, please contact us via the
              YouTube channel community tab or comments section at{" "}
              <a
                href="https://www.youtube.com/@ChamiduHerathICT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 underline underline-offset-2"
              >
                youtube.com/@ChamiduHerathICT
              </a>.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
