'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function StatsGenerator() {
  const [statsUser, setStatsUser] = useState('torvalds');
  const [theme, setTheme] = useState('default');
  const [showBorder, setShowBorder] = useState(true);
  const [includeAllCommits, setIncludeAllCommits] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [hideRank, setHideRank] = useState(false);
  const [hideItems, setHideItems] = useState<string[]>([]);
  const [customWidth, setCustomWidth] = useState<string>('');

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedDual, setCopiedDual] = useState(false);

  const mdRef = useRef<HTMLTextAreaElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const toggleHideItem = (item: string) => {
    if (hideItems.includes(item)) {
      setHideItems(hideItems.filter(i => i !== item));
    } else {
      setHideItems([...hideItems, item]);
    }
  };

  const hideParam = hideItems.length > 0 ? `&hide=${hideItems.join(',')}` : '';
  const widthParam = customWidth ? `&width=${customWidth}` : '';
  const queryParams = `user=${encodeURIComponent(statsUser)}&theme=${theme}&hide_border=${!showBorder}&include_all_commits=${includeAllCommits}&show_icons=${showIcons}&hide_rank=${hideRank}${hideParam}${widthParam}&v=2`;
  const statsSvgUrl = `/api/stats?${queryParams}`;
  const statsAbsoluteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${statsSvgUrl}`;

  const darkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stats?user=${encodeURIComponent(statsUser)}&theme=dark&hide_border=${!showBorder}&include_all_commits=${includeAllCommits}&show_icons=${showIcons}&hide_rank=${hideRank}${hideParam}${widthParam}`;
  const lightUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stats?user=${encodeURIComponent(statsUser)}&theme=default&hide_border=${!showBorder}&include_all_commits=${includeAllCommits}&show_icons=${showIcons}&hide_rank=${hideRank}${hideParam}${widthParam}`;

  const markdownCode = `![${statsUser}'s GitHub Stats](${statsAbsoluteUrl})`;
  const htmlCode = `<a href="https://github.com/${statsUser}">\n  <img src="${statsAbsoluteUrl}" alt="${statsUser}'s GitHub Stats" />\n</a>`;
  const dualThemeCode = `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${darkUrl}" />\n  <source media="(prefers-color-scheme: light)" srcset="${lightUrl}" />\n  <img src="${darkUrl}" alt="${statsUser}'s GitHub Stats" />\n</picture>`;

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

  const copyDual = () => {
    navigator.clipboard.writeText(dualThemeCode);
    setCopiedDual(true);
    setTimeout(() => setCopiedDual(false), 2000);
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
            value={statsUser}
            onChange={(e) => setStatsUser(e.target.value)}
            className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-semibold">2. Configuration</h2>
          
          <div className="space-y-4">
            <ThemeSelector value={theme} onChange={setTheme} />

            {/* Toggle options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-bg-base border border-border rounded-xl">
                <label className="text-sm font-medium text-text-primary">Show Border</label>
                <button
                  onClick={() => setShowBorder(!showBorder)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showBorder ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBorder ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-base border border-border rounded-xl">
                <label className="text-sm font-medium text-text-primary">Lifetime Commits</label>
                <button
                  onClick={() => setIncludeAllCommits(!includeAllCommits)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeAllCommits ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeAllCommits ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-base border border-border rounded-xl">
                <label className="text-sm font-medium text-text-primary">Show Icons</label>
                <button
                  onClick={() => setShowIcons(!showIcons)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showIcons ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showIcons ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-base border border-border rounded-xl">
                <label className="text-sm font-medium text-text-primary">Hide Rank Ring</label>
                <button
                  onClick={() => setHideRank(!hideRank)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hideRank ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hideRank ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Optional Hide Specific Items */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary">Hide Specific Metrics:</label>
                <span className="text-xs text-text-secondary">Click to toggle</span>
              </div>
              
              <div className="flex flex-wrap gap-2.5 pt-1">
                {[
                  { id: 'stars', label: 'Stars' },
                  { id: 'contributions', label: 'Total Contributions' },
                  { id: 'commits', label: 'Commits' },
                  { id: 'prs', label: 'PRs' },
                  { id: 'issues', label: 'Issues' },
                  { id: 'contribs', label: 'Contributed To' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleHideItem(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      hideItems.includes(item.id)
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
                        : 'bg-bg-base text-text-secondary border-border hover:border-brand-500 hover:text-text-primary'
                    }`}
                  >
                    {hideItems.includes(item.id) ? `✕ Hidden: ${item.label}` : `Show: ${item.label}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary">Custom Card Width (Optional)</label>
              </div>
              <input
                type="number"
                placeholder="e.g. 400"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-100 text-sm mt-8 space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" /> Real-time GraphQL (Public & Private Support)
          </p>
          <p className="opacity-80">
            Mencakup total stars repositori, commit multi-tahun, PRs, issues, serta level grade developer. Kontribusi private repo terhitung otomatis jika diaktifkan pada profil GitHub Anda.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="w-full space-y-8">
        <div className="p-6 bg-bg-surface border border-border rounded-3xl shadow-xl space-y-6 sticky top-8 overflow-hidden">
          <h2 className="text-xl font-semibold flex items-center justify-between">
            Preview
            <span className="text-xs font-normal text-text-secondary px-2 py-1 bg-bg-base rounded-md border border-border">Live</span>
          </h2>

          <div className="bg-bg-base p-8 rounded-2xl border border-border overflow-auto flex justify-center min-h-[210px] items-center">
            {statsUser ? (
              <img src={statsSvgUrl} alt="GitHub Stats Preview" width={425} height={210} className="w-full max-w-[425px] h-auto drop-shadow-sm" style={{ aspectRatio: '425/210' }} />
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

            <div className="pt-2">
              <button
                onClick={copyDual}
                className="w-full py-2.5 px-4 bg-bg-base border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-500 flex items-center justify-center gap-2 transition-colors"
              >
                {copiedDual ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                Copy Dual-Theme Tag (Auto Dark/Light for GitHub)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
