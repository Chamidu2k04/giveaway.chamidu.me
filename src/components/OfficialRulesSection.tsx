import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Gift,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';

interface OfficialRulesSectionProps {
  startDate?: Date | string;
  endDate?: Date | string;
  timeZone?: string;
  prizeDescription?: string;
  approximateRetailValue?: string;
  eligibilityCriteria?: string;
}

export function OfficialRulesSection({
  startDate,
  endDate,
  timeZone = 'Asia/Colombo',
  prizeDescription,
  approximateRetailValue,
  eligibilityCriteria,
}: OfficialRulesSectionProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('en-LK', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(d);
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#161616] p-5 space-y-5 text-gray-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-red-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-outfit">
            Official Contest Rules
          </h2>
        </div>
        <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
          No Purchase Necessary
        </span>
      </div>

      {/* Primary Disclosures Grid */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-gray-200">
            <Gift className="h-3.5 w-3.5 text-red-400" />
            Prize & Retail Value
          </div>
          <p className="text-gray-400">
            {prizeDescription || 'Official featured prize as revealed in the video.'}
          </p>
          {approximateRetailValue && (
            <p className="text-gray-300">
              <span className="text-gray-500">Approx. Retail Value (ARV):</span>{' '}
              {approximateRetailValue}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-gray-200">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            Eligibility
          </div>
          <p className="text-gray-400">
            {eligibilityCriteria || 'Open to residents of Sri Lanka aged 18+ (or with parental consent).'}
          </p>
        </div>

        {(formattedStart || formattedEnd) && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 font-semibold text-gray-200">
              <Calendar className="h-3.5 w-3.5 text-yellow-400" />
              Contest Period ({timeZone})
            </div>
            <p className="text-gray-400">
              {formattedStart ? `Starts: ${formattedStart}` : 'Open now'}
              {formattedEnd ? ` • Ends: ${formattedEnd}` : ' • Ends as announced in the video'}
            </p>
          </div>
        )}
      </div>

      {/* Standard Rules List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Terms & Entry Mechanics
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm">
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">Free Method of Entry:</strong> No purchase, payment, or commercial transaction is required to enter or win. A purchase will not improve your chance of winning.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">Entry Limit:</strong> Maximum one entry per person per giveaway (enforced via phone number and YouTube handle verification).
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">Winner Selection:</strong> Winners are chosen via an impartial, verifiable random draw process and announced publicly on the platform and YouTube.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">Winner Notification:</strong> Selected winners are contacted directly via their registered WhatsApp contact. Delivery details will be coordinated privately.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">Content Ownership:</strong> Participants retain full ownership rights to any content, answers, or handles submitted during the contest.
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-400" />
            <span>
              <strong className="text-white">YouTube Guidelines:</strong> Entries must follow the{' '}
              <a
                href="https://www.youtube.com/howyoutubeworks/policies/community-guidelines/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white inline-flex items-center gap-0.5 text-red-400"
              >
                YouTube Community Guidelines
                <ExternalLink className="h-3 w-3 inline" />
              </a>
              . Non-compliant entries will be disqualified.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
