"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Youtube } from "@/components/YoutubeIcon";
import { ArrowLeft, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const schema = z.object({
  slugId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Slug: letters, numbers, hyphens, underscores only'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  youtubeUrl: z.string().url('Must be a valid URL'),
  maxParticipants: z.string().optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']),
  prizeDescription: z.string().max(500).optional(),
  approximateRetailValue: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eligibilityCriteria: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewGiveawayPage() {
  const router = useRouter();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'UPCOMING' },
  });

  const youtubeUrl = watch('youtubeUrl');

  // Auto-extract thumbnail on YouTube URL change
  const handleYoutubeBlur = () => {
    if (!youtubeUrl) return;
    const vid = extractYouTubeVideoId(youtubeUrl);
    if (vid) {
      setThumbnailPreview(`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`);
    } else {
      setThumbnailPreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/admin/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants, 10) : undefined,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || 'Failed to create giveaway');
        return;
      }
      router.push('/admin/giveaways');
      router.refresh();
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  const inputClass = (hasError?: boolean) =>
    `h-11 w-full rounded-xl border bg-white/5 px-4 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:ring-red-500/20'
        : 'border-white/20 focus:border-red-500 focus:ring-red-500/20'
    }`;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3">
          <Link href="/admin/giveaways" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Giveaways
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm font-semibold text-white">New Giveaway</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-5">
              {/* YouTube URL */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
                  <Youtube className="h-4 w-4 text-red-400" />
                  YouTube URL *
                </label>
                <input
                  {...register('youtubeUrl')}
                  type="url"
                  placeholder="https://youtu.be/..."
                  onBlur={handleYoutubeBlur}
                  disabled={isSubmitting}
                  className={inputClass(!!errors.youtubeUrl)}
                />
                {errors.youtubeUrl && <p className="text-xs text-red-400">{errors.youtubeUrl.message}</p>}
                <p className="text-xs text-gray-500">Thumbnail is auto-extracted from this URL.</p>
              </div>

              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl overflow-hidden border border-white/10 aspect-video relative"
                >
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-xs text-white">
                    <ImageIcon className="h-3 w-3" />
                    Thumbnail auto-detected
                  </div>
                </motion.div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-200">Giveaway Title *</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. New Year Giveaway 2025"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.title)}
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-200">Description (optional)</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Brief description of the giveaway..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Slug ID */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-200">Slug ID *</label>
                <div className="flex items-center gap-0">
                  <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-white/20 bg-white/5 px-3 text-sm text-gray-400">/</span>
                  <input
                    {...register('slugId')}
                    type="text"
                    placeholder="1"
                    disabled={isSubmitting}
                    className={`h-11 flex-1 rounded-r-xl border bg-white/5 px-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:ring-2 ${
                      errors.slugId ? 'border-red-400 focus:ring-red-500/20' : 'border-white/20 focus:border-red-500 focus:ring-red-500/20'
                    }`}
                  />
                </div>
                {errors.slugId && <p className="text-xs text-red-400">{errors.slugId.message}</p>}
                <p className="text-xs text-gray-500">giveaway.chamidu.me/giveaway/<strong className="text-gray-300">{'{slug}'}</strong></p>
              </div>

              {/* Max Participants */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-200">Max Participants (optional)</label>
                <input
                  {...register('maxParticipants')}
                  type="number"
                  min={1}
                  placeholder="Leave blank for unlimited"
                  disabled={isSubmitting}
                  className={inputClass()}
                />
                <p className="text-xs text-gray-500">Set a cap to control entry volume.</p>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-200">Initial Status *</label>
                <select
                  {...register('status')}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-white/20 bg-[#0a0a0a] px-4 text-sm text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="UPCOMING">UPCOMING — Not open yet</option>
                  <option value="ACTIVE">ACTIVE — Open for entries now</option>
                </select>
              </div>

              {/* Info box */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-300 space-y-1">
                <p className="font-semibold">Auto-extraction</p>
                <p>The YouTube thumbnail is automatically pulled from the video URL at max resolution (1280×720). No manual upload needed.</p>
              </div>
            </div>
          </div>

          {/* YouTube Contest Compliance & Official Rules */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Official Rules & Compliance (YouTube Contest Policy)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Disclose transparent prize, eligibility, and timeline details to meet YouTube contest standards.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Prize Details</label>
                <input
                  {...register('prizeDescription')}
                  type="text"
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.prizeDescription)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Approx. Retail Value (ARV)</label>
                <input
                  {...register('approximateRetailValue')}
                  type="text"
                  placeholder="e.g. LKR 125,000"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.approximateRetailValue)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Start Date & Time</label>
                <input
                  {...register('startDate')}
                  type="datetime-local"
                  disabled={isSubmitting}
                  className={inputClass()}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">End Date & Time</label>
                <input
                  {...register('endDate')}
                  type="datetime-local"
                  disabled={isSubmitting}
                  className={inputClass()}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-300">Eligibility Criteria</label>
                <input
                  {...register('eligibilityCriteria')}
                  type="text"
                  placeholder="e.g. Residents of Sri Lanka aged 18+ (or with parental consent)"
                  disabled={isSubmitting}
                  className={inputClass(!!errors.eligibilityCriteria)}
                />
              </div>
            </div>
          </div>

          {serverError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/giveaways"
              className="flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 items-center gap-2 rounded-xl bg-red-500 px-6 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSubmitting ? 'Creating...' : 'Create Giveaway'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
