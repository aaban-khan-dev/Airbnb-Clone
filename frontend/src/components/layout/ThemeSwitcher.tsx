"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { type ThemeChoice, useTheme } from "@/context/ThemeContext";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

// Segmented Light / Dark / System control, used in the user menu
export function ThemeSwitcher() {
  const { choice, setChoice } = useTheme();
  return (
    <div className="flex rounded-lg bg-surface p-1" role="radiogroup" aria-label="Appearance">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          onClick={() => setChoice(value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold ${
            choice === value ? "bg-canvas shadow-pill" : "text-muted hover:text-ink"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
