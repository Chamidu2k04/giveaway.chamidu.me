import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";


export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0f0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 transition-transform group-hover:scale-105">
            <Youtube className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Chamidu Herath ICT</p>
            <p className="text-xs text-gray-400">Giveaway Platform</p>
          </div>
        </Link>

        <a
          href="https://www.youtube.com/@ChamiduHerathICT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
        >
          <Youtube className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </a>
      </div>
    </nav>
  );
}
