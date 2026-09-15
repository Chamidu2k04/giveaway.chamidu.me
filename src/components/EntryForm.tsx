"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube } from "@/components/YoutubeIcon";
import { Loader2, CheckCircle2, AlertCircle, User, } from "lucide-react";

import { PhoneInput } from "@/components/PhoneInput";

const schema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[\p{L}\s'-]+$/u, "Name contains invalid characters"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
  youtubeUsername: z
    .string()
    .min(1, "YouTube username is required")
    .max(100, "Too long")
    .regex(/^@?[\w.-]+$/, "Invalid YouTube username format"),
});

type FormData = z.infer<typeof schema>;

export function EntryForm({ slugId }: { slugId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", youtubeUsername: "" },
  });

  const phoneValue = watch("phone");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch(`/api/giveaways/${slugId}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Something went wrong. Please try again.");
        return;
      }

      router.push(`/giveaway/${slugId}/thank-you`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
          <User className="h-4 w-4 text-red-400" />
          Full Name
        </label>
        <input
          {...register("fullName")}
          type="text"
          placeholder="e.g. Chamidu Herath"
          autoComplete="name"
          disabled={isSubmitting}
          className={`h-12 w-full rounded-xl border bg-white/5 px-4 text-base text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50 ${
            errors.fullName
              ? "border-red-400 focus:border-red-400 focus:ring-red-500/20"
              : "border-white/20 focus:border-red-500 focus:ring-red-500/20"
          }`}
        />
        {errors.fullName && (
          <p className="text-xs text-red-400">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
          📱 WhatsApp Number
        </label>
        <PhoneInput
          value={phoneValue}
          onChange={(v) => setValue("phone", v, { shouldValidate: true })}
          error={errors.phone?.message}
          disabled={isSubmitting}
        />
      </div>

      {/* YouTube Username */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
          <Youtube className="h-4 w-4 text-red-400" />
          YouTube Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base select-none">@</span>
          <input
            {...register("youtubeUsername")}
            type="text"
            placeholder="YourYouTubeHandle"
            autoComplete="off"
            disabled={isSubmitting}
            className={`h-12 w-full rounded-xl border bg-white/5 pl-8 pr-4 text-base text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50 ${
              errors.youtubeUsername
                ? "border-red-400 focus:border-red-400 focus:ring-red-500/20"
                : "border-white/20 focus:border-red-500 focus:ring-red-500/20"
            }`}
          />
        </div>
        {errors.youtubeUsername && (
          <p className="text-xs text-red-400">{errors.youtubeUsername.message}</p>
        )}
        <p className="text-xs text-gray-500">Your YouTube channel handle (find it at youtube.com/handle)</p>
      </div>

      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-red-400 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting Entry...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <CheckCircle2 className="h-5 w-5" />
            Enter Giveaway
          </span>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        By entering, you confirm you agree to the Official Contest Rules and Privacy Policy. No purchase necessary.
      </p>
    </form>
  );
}
