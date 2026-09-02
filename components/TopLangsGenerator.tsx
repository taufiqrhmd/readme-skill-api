'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, PieChart, Code2 } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

const COMMON_EXCLUDES = ['html', 'css', 'jupyter notebook', 'shell', 'dockerfile', 'scss', 'makefile'];

export default function TopLangsGenerator() {
  const [langsUser, setLangsUser] = useState('torvalds');
  const [theme, setTheme] = useState('default');
  const [showBorder, setShowBorder] = useState(true);
  const [hideTitle, setHideTitle] = useState(false);
  const [includePrivate, setIncludePrivate] = useState(true);
  const [langsCount, setLangsCount] = useState(6);
  const [exclude, setExclude] = useState('');

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedDual, setCopiedDual] = useState(false);

  const mdRef = useRef<HTMLTextAreaElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const toggleQuickExclude = (lang: string) => {
    const list = exclude.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (list.includes(lang)) {
      setExclude(list.filter(item => item !== lang).join(', '));
    } else {
      setExclude([...list, lang].join(', '));
    }
  };

  const excludeParam = exclude.trim() ? `&exclude=${encodeURIComponent(exclude.trim())}` : '';
  const queryParams = `user=${encodeURIComponent(langsUser)}&theme=${theme}&hide_border=${!showBorder}&hide_title=${hideTitle}&include_private=${includePrivate}&langs_count=${langsCount}${excludeParam}&v=2`;
  const langsSvgUrl = `/api/top-langs?${queryParams}`;
  const langsAbsoluteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${langsSvgUrl}`;

  const darkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/top-langs?user=${encodeURIComponent(langsUser)}&theme=dark&hide_border=${!showBorder}&hide_title=${hideTitle}&include_private=${includePrivate}&langs_count=${langsCount}${excludeParam}`;
  const lightUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/top-langs?user=${encodeURIComponent(langsUser)}&theme=default&hide_border=${!showBorder}&hide_title=${hideTitle}&include_private=${includePrivate}&langs_count=${langsCount}${excludeParam}`;

  const markdownCode = `![Top Languages](${langsAbsoluteUrl})`;
  const htmlCode = `<a href="https://github.com/${langsUser}">\n  <img src="${langsAbsoluteUrl}" alt="Top Languages" />\n</a>`;
  const dualThemeCode = `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${darkUrl}" />\n  <source media="(prefers-color-scheme: light)" srcset="${lightUrl}" />\n  <img src="${darkUrl}" alt="Top Languages" />\n</picture>`;

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
            value={langsUser}
            onChange={(e) => setLangsUser(e.target.value)}
            className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-semibold">2. Configuration</h2>
          
          <div className="space-y-4">
            <ThemeSelector value={theme} onChange={setTheme} />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-secondary">Languages Count</span>
                <span className="text-text-primary font-semibold">{langsCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={langsCount}
                onChange={(e) => setLangsCount(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

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
                <label className="text-sm font-medium text-text-primary">Hide Card Title</label>
                <button
                  onClick={() => setHideTitle(!hideTitle)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hideTitle ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hideTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-bg-base border border-border rounded-xl">
                <label className="text-sm font-medium text-text-primary">Include Private Repos</label>
                <button
                  onClick={() => setIncludePrivate(!includePrivate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includePrivate ? 'bg-brand-500' : 'bg-bg-surface border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includePrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Exclude Languages */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-text-secondary">Exclude Languages (comma-separated):</label>
              <input
                type="text"
                placeholder="e.g. html, css, jupyter notebook"
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_EXCLUDES.map(lang => {
                  const isExcluded = exclude.toLowerCase().includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => toggleQuickExclude(lang)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${isExcluded ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-bg-base text-text-secondary border-border hover:border-brand-500'}`}
                    >
                      {isExcluded ? `✕ ${lang}` : `+ ${lang}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-100 text-sm mt-8 space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Accurate Repository Language Weights
          </p>
          <p className="opacity-80">
            Kalkulasi distribusi bahasa di seluruh repository non-fork (termasuk private repos jika diizinkan token).
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

          <div className="bg-bg-base p-8 rounded-2xl border border-border overflow-auto flex justify-center min-h-[200px] items-center">
            {langsUser ? (
              <img src={langsSvgUrl} alt="Top Languages Preview" className="w-full max-w-[360px] h-auto drop-shadow-sm" />
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
