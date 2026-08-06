import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Home, Gift } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-24 text-center space-y-6">
        <p className="text-6xl font-black text-white/10">404</p>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-gray-400">The giveaway or page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-6 font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/#active"
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <Gift className="h-4 w-4" />
            Active Giveaways
          </Link>
        </div>
      </main>
    </div>
  );
}
