'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Activity } from 'lucide-react';

export default function StreakGenerator() {
  const [streakUser, setStreakUser] = useState('torvalds');
  const [theme, setTheme] = useState('default');
  const [showBorder, setShowBorder] = useState(true);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const mdRef = useRef<HTMLTextAreaElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const streakSvgUrl = `/api/streaks?user=${streakUser}&theme=${theme}&hide_border=${!showBorder}&v=3`;
  const streakAbsoluteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${streakSvgUrl}`;

  const markdownCode = `![${streakUser}'s GitHub Streaks](${streakAbsoluteUrl})`;
  const htmlCode = `<a href="https://github.com/${streakUser}">\n  <img src="${streakAbsoluteUrl}" alt="${streakUser}'s GitHub Streaks" />\n</a>`;

  useEffect(() => {
    if (mdRef.current) {
      mdRef.current.style.height = 'auto';
      mdRef.current.style.height = `${mdRef.current.scrollHeight}px`;
    }
    if (htmlRef.current) {
      htmlRef.current.style.height = 'auto';
      htmlRef.current.style.height = `${htmlRef.current.scrollHeight}px`;
    }
  }, [markdownCode, htmlCode]);

  const copyMd = () => {
    navigator.clipboard.writeText(markdownCode);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <div className="w-full space-y-8 p-6 bg-bg-surface border border-border rounded-3xl shadow-xl overflow-hidden h-fit">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. GitHub Username</h2>
          <input
            type="text"
            placeholder="e.g. torvalds"
            value={streakUser}
            onChange={(e) => setStreakUser(e.target.value)}
            className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-semibold">2. Configuration</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="transparent">Transparent</option>
                <option value="radical">Radical</option>
                <option value="tokyonight">Tokyo Night</option>
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-text-primary">Show Border</label>
              <button
                onClick={() => setShowBorder(!showBorder)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showBorder ? 'bg-brand-500' : 'bg-bg-base border border-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBorder ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-100 text-sm mt-8">
          <p className="font-medium mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Note about Rate Limits:
          </p>
          <p className="opacity-80">This generator uses the GitHub GraphQL API which has a rate limit of 5,000 requests per hour per token. Results are cached for 2 hours to prevent hitting limits.</p>
        </div>
      </div>

      {/* Preview */}
      <div className="w-full space-y-8">
        <div className="p-6 bg-bg-surface border border-border rounded-3xl shadow-xl space-y-6 sticky top-8 overflow-hidden">
          <h2 className="text-xl font-semibold flex items-center justify-between">
            Preview
            <span className="text-xs font-normal text-text-secondary px-2 py-1 bg-bg-base rounded-md border border-border">Live</span>
          </h2>

          <div className="bg-bg-base p-8 rounded-2xl border border-border overflow-auto flex justify-center min-h-[200px] items-center">
            {streakUser ? (
              <img src={streakSvgUrl} alt="GitHub Streaks Preview" className="w-full max-w-[550px] h-auto drop-shadow-sm" />
            ) : (
              <p className="text-sm text-text-secondary">Enter a GitHub username to see the preview.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary block">
                Markdown
              </label>
              <div className="flex relative">
                <textarea
                  ref={mdRef}
                  readOnly
                  value={markdownCode}
                  className="w-full bg-bg-base border border-border rounded-xl pl-4 pr-12 py-3 text-sm font-mono text-text-secondary focus:outline-none resize-none overflow-hidden"
                  rows={1}
                />
                <button
                  onClick={copyMd}
                  className="absolute right-2 top-2 p-2 rounded-lg bg-bg-surface hover:bg-brand-500 hover:text-white transition-colors text-text-secondary"
                  title="Copy Markdown"
                >
                  {copiedMd ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary block">
                HTML
              </label>
              <div className="flex relative">
                <textarea
                  ref={htmlRef}
                  readOnly
                  value={htmlCode}
                  className="w-full bg-bg-base border border-border rounded-xl pl-4 pr-12 py-3 text-sm font-mono text-text-secondary focus:outline-none resize-none overflow-hidden"
                  rows={1}
                />
                <button
                  onClick={copyHtml}
                  className="absolute right-2 top-2 p-2 rounded-lg bg-bg-surface hover:bg-brand-500 hover:text-white transition-colors text-text-secondary"
                  title="Copy HTML"
                >
                  {copiedHtml ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
