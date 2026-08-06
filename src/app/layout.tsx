import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://giveaway.chamidu.me"),
  title: {
    default: "Chamidu Herath ICT Giveaways",
    template: "%s | Chamidu Herath ICT Giveaways",
  },
  description:
    "Enter exclusive giveaways by Chamidu Herath ICT — Sri Lanka's trusted ICT education YouTube channel. Win prizes, support education!",
  keywords: ["giveaway", "chamidu herath", "ict", "sri lanka", "youtube", "competition", "prize"],
  authors: [{ name: "Chamidu Herath" }],
  creator: "Chamidu Herath ICT",
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: "Chamidu Herath ICT Giveaways",
    title: "Chamidu Herath ICT Giveaways",
    description: "Enter exclusive giveaways from Sri Lanka's trusted ICT education channel.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Chamidu Herath ICT Giveaways",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chamidu Herath ICT Giveaways",
    description: "Enter exclusive giveaways from Sri Lanka's trusted ICT education channel.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(outfit.variable, inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen bg-[#0f0f0f] font-inter text-white antialiased">
        {children}
      </body>
    </html>
  );
}
