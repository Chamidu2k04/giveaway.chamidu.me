import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";
import { Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] px-4 py-10 mt-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
                <Youtube className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Chamidu Herath</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sri Lanka&apos;s premier YouTube channel for tech gadgets and reviews. Bringing you the latest tech, unboxings, and giveaways.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">All Giveaways</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li>
                <a
                  href="https://www.youtube.com/@ChamiduHerathICT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Shield className="inline h-3 w-3 mr-1" />
              Legal
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              This giveaway platform is not sponsored, endorsed, or administered by YouTube LLC.
              YouTube is completely released from all liability related to this contest.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Chamidu Herath. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            <a href="https://www.chamidu.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              Made with <Heart className="h-3 w-3 text-red-500" fill="currentColor" /> in Sri Lanka
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
