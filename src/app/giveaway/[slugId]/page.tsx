import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EntryForm } from "@/components/EntryForm";
import { YouTubeDisclaimer } from "@/components/YouTubeDisclaimer";
import { ProgressBar } from "@/components/ProgressBar";
import { Trophy, Users, ExternalLink, CheckCircle2 } from "lucide-react";

export const revalidate = 30;

interface Props {
  params: Promise<{ slugId: string }>;
}

async function getGiveaway(slugId: string) {
  await connectDB();
  const giveaway = await Giveaway.findOne({ slugId }).lean();
  if (!giveaway) return null;
  const participantCount = await Participant.countDocuments({ giveawayId: giveaway._id });
  return { ...giveaway, participantCount };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugId } = await params;
  const giveaway = await getGiveaway(slugId);
  if (!giveaway) return { title: "Giveaway Not Found" };

  return {
    title: giveaway.title,
    description: `Enter the ${giveaway.title} giveaway by Chamidu Herath ICT. Open to all Sri Lankan viewers!`,
    openGraph: {
      title: `${giveaway.title} | Chamidu Herath ICT Giveaway`,
      description: `Enter the ${giveaway.title} giveaway and win amazing prizes!`,
      images: [
        {
          url: giveaway.thumbnailUrl,
          width: 1280,
          height: 720,
          alt: giveaway.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${giveaway.title} | Chamidu Herath ICT Giveaway`,
      description: `Enter the ${giveaway.title} giveaway!`,
      images: [giveaway.thumbnailUrl],
    },
  };
}

const rules = [
  "Must be subscribed to the Chamidu Herath ICT YouTube channel",
  "One entry per person per giveaway (verified by phone & YouTube handle)",
  "Must provide a valid Sri Lankan WhatsApp number",
  "Winners will be announced on the YouTube channel",
  "Prize delivery will be coordinated via WhatsApp",
  "This giveaway is open to residents of Sri Lanka only",
];

export default async function GiveawayEntryPage({ params }: Props) {
  const { slugId } = await params;
  const giveaway = await getGiveaway(slugId);

  if (!giveaway) notFound();

  const isClosed = giveaway.status !== "ACTIVE";
  const isFull =
    giveaway.maxParticipants && giveaway.participantCount >= giveaway.maxParticipants;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={giveaway.thumbnailUrl}
            alt={giveaway.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* YouTube link overlay */}
          <a
            href={giveaway.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-red-500 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Watch Video
          </a>
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
              🔴 LIVE GIVEAWAY
            </span>
          </div>
        </div>

        {/* Title + stats */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white font-outfit leading-tight">{giveaway.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{giveaway.participantCount.toLocaleString()} entered</span>
            </div>
            {giveaway.maxParticipants && (
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>{giveaway.maxParticipants.toLocaleString()} max</span>
              </div>
            )}
          </div>
          {giveaway.maxParticipants && (
            <ProgressBar current={giveaway.participantCount} max={giveaway.maxParticipants} />
          )}
        </div>

        {/* Closed state */}
        {(isClosed || isFull) && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center space-y-2">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">
              {giveaway.status === "COMPLETED" ? "Giveaway Ended" : isFull ? "Giveaway Full" : "Not Open Yet"}
            </h2>
            <p className="text-sm text-gray-400">
              {giveaway.status === "COMPLETED"
                ? "This giveaway has concluded. Check the home page for upcoming giveaways!"
                : isFull
                ? "This giveaway has reached its maximum number of participants."
                : "This giveaway is not yet open for entries. Subscribe to be notified!"}
            </p>
          </div>
        )}

        {/* Entry form */}
        {!isClosed && !isFull && (
          <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Enter the Giveaway</h2>
              <p className="text-sm text-gray-400">Fill in your details below to participate.</p>
            </div>

            <EntryForm slugId={slugId} />
          </div>
        )}

        {/* Rules */}
        <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Giveaway Rules</h2>
          <ul className="space-y-2">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* YouTube Disclaimer */}
        <YouTubeDisclaimer />
      </main>

      <Footer />
    </div>
  );
}
