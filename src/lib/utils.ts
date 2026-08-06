import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a phone number to E.164 format.
 * Defaults to Sri Lanka (+94) if no country code is provided.
 */
export function normalizePhone(raw: string): string | null {
  try {
    // Try with LK as default country for local numbers
    if (isValidPhoneNumber(raw, 'LK')) {
      return parsePhoneNumber(raw, 'LK').number;
    }
    // Try as-is (international format with +)
    if (isValidPhoneNumber(raw)) {
      return parsePhoneNumber(raw).number;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Masks a phone number for public display.
 * +94771234567 → +9477****567
 */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return '****';
  const prefix = phone.slice(0, Math.ceil(phone.length * 0.4));
  const suffix = phone.slice(-3);
  const masked = '*'.repeat(phone.length - prefix.length - 3);
  return `${prefix}${masked}${suffix}`;
}

/**
 * Extracts YouTube Video ID from any YouTube URL format.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Gets the highest-resolution YouTube thumbnail URL for a given video ID.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Formats a number with commas.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
