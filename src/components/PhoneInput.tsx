"use client";
import { useState } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center rounded-xl border bg-white/5 transition-all duration-200 ${
          focused ? "border-red-500 ring-2 ring-red-500/20" : error ? "border-red-400" : "border-white/20"
        }`}
      >
        {/* Country prefix badge */}
        <div className="flex h-12 items-center gap-1.5 border-r border-white/10 px-3 shrink-0">
          <span className="text-base">🇱🇰</span>
          <span className="text-sm text-gray-400 font-mono">+94</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="71 234 5678"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className="h-12 flex-1 bg-transparent px-3 text-base text-white placeholder:text-gray-500 outline-none disabled:opacity-50"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-gray-500">Enter local number (e.g. 077 123 4567) or include country code (+94...)</p>
    </div>
  );
}
