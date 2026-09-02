'use client';

import React from 'react';
import { Palette } from 'lucide-react';

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  accent: string;
}

export const AVAILABLE_THEMES: ThemeOption[] = [
  { id: 'dark', name: 'Dark', bg: '#151515', accent: '#FB8C00' },
  { id: 'default', name: 'Default (Light)', bg: '#FFFEFE', accent: '#FB8C00' },
  { id: 'tokyonight', name: 'Tokyo Night', bg: '#1A1B27', accent: '#70A5FD' },
  { id: 'dracula', name: 'Dracula', bg: '#282A36', accent: '#FF6E96' },
  { id: 'monokai', name: 'Monokai', bg: '#272822', accent: '#EB1F6A' },
  { id: 'radical', name: 'Radical', bg: '#141321', accent: '#FE428E' },
  { id: 'transparent', name: 'Transparent', bg: '#000000', accent: '#006AFF' },
];

interface ThemeSelectorProps {
  value: string;
  onChange: (theme: string) => void;
  label?: string;
}

export default function ThemeSelector({
  value,
  onChange,
  label = 'Theme',
}: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-brand-500" />
          {label}
        </label>
        <span className="text-xs text-text-secondary font-mono capitalize">
          Current: <span className="text-brand-100 font-semibold">{value}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {AVAILABLE_THEMES.map((t) => {
          const isSelected = value === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/20 text-brand-100 shadow-md shadow-brand-500/10 ring-1 ring-brand-500'
                  : 'border-border bg-bg-base text-text-secondary hover:border-brand-500/50 hover:text-text-primary hover:bg-bg-surface-hover'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                style={{ backgroundColor: t.accent }}
              />
              <span className="truncate">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
