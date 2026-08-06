"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Youtube } from "@/components/YoutubeIcon";
import { Heart, Home, Trophy } from "lucide-react";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ConfettiEffect trigger={true} mode="celebration" />

      <main className="mx-auto max-w-lg px-4 py-16 text-center space-y-8">
        {/* Animated trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl shadow-yellow-500/30">
            <Trophy className="h-14 w-14 text-white" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-black text-white font-outfit">
            You&apos;re in! 🎉
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Your entry has been successfully recorded. Thank you so much for participating in our giveaway
            and for supporting the <strong className="text-white">Chamidu Herath ICT</strong> community!
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Winners will be announced on the YouTube channel. Make sure you&apos;re subscribed so you don&apos;t
            miss the announcement — you could be next! 🌟
          </p>
        </motion.div>

        {/* Hearts decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-2"
        >
          {["🇱🇰", "📚", "💻", "❤️", "🎉"].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <a
            href="https://www.youtube.com/@ChamiduHerathICT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Youtube className="h-5 w-5" />
            Subscribe to the Channel
          </a>

          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 text-sm font-semibold text-gray-300 transition-all hover:border-white/40 hover:text-white"
          >
            <Home className="h-4 w-4" />
            View All Giveaways
          </Link>
        </motion.div>

        {/* Community message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-red-400">
            <Heart className="h-4 w-4" fill="currentColor" />
            <span className="text-sm font-semibold">Thank you for supporting our community!</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every view, like, comment, and share helps us create more free ICT education content for
            Sri Lankan students. We truly appreciate your support! 🇱🇰❤️
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
