'use client';

import { useState, useEffect, useRef } from 'react';
import { Hexagon, Circle, Square, Copy, Check, Plus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

const POPULAR_SKILLS = [
  'react', 'nodejs', 'vue', 'javascript', 'typescript', 'html5', 'css',
  'python', 'cplusplus', 'go', 'rust', 'docker', 'kubernetes', 'laravel', 'android',
  'google-cloud', 'vercel', 'nextjs', 'tailwindcss', 'figma',
  'git', 'github', 'postgresql', 'mongodb', 'mysql', 'redis', 'linux', 'php',
  'kotlin', 'swift', 'dart', 'flutter', 'ruby', 'elixir', 'nginx',
  'scala', 'svelte', 'astro', 'nuxt', 'supabase', 'discord'
];

type FrameType = 'hexagon' | 'circle' | 'rounded';
type AlignmentType = 'left' | 'center' | 'right';

export default function SkillBadgeGenerator() {
  const [selectedIcons, setSelectedIcons] = useState<string[]>(['react', 'nodejs', 'typescript', 'tailwindcss']);
  const [frame, setFrame] = useState<FrameType>('hexagon');
  const [theme, setTheme] = useState('default');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemSize, setItemSize] = useState(48);
  const [iconSize, setIconSize] = useState(30);
  const [perLine, setPerLine] = useState(10);
  const [alignment, setAlignment] = useState<AlignmentType>('left');

  const filteredSkills = POPULAR_SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedIcons.includes(skill)
  );

  const toggleIcon = (slug: string) => {
    if (selectedIcons.includes(slug)) {
      setSelectedIcons(selectedIcons.filter(i => i !== slug));
    } else {
      setSelectedIcons([...selectedIcons, slug]);
    }
  };

  const mdRef = useRef<HTMLTextAreaElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const svgUrl = `/api/skills?icons=${selectedIcons.join(',')}&frame=${frame}&theme=${theme}&itemSize=${itemSize}&iconSize=${iconSize}&perLine=${perLine}&v=2`;
  const absoluteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${svgUrl}`;

  let markdownCode = `![Tech Stack](${absoluteUrl})`;
  let htmlCode = `<a href="#">\n  <img src="${absoluteUrl}" alt="Tech Stack" />\n</a>`;

  if (alignment === 'center') {
    markdownCode = `<div align="center">\n  <img src="${absoluteUrl}" alt="Tech Stack" />\n</div>`;
    htmlCode = `<div align="center">\n  <a href="#">\n    <img src="${absoluteUrl}" alt="Tech Stack" />\n  </a>\n</div>`;
  } else if (alignment === 'right') {
    markdownCode = `<div align="right">\n  <img src="${absoluteUrl}" alt="Tech Stack" />\n</div>`;
    htmlCode = `<div align="right">\n  <a href="#">\n    <img src="${absoluteUrl}" alt="Tech Stack" />\n  </a>\n</div>`;
  }

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
      <div className="w-full space-y-8 p-6 bg-bg-surface border border-border rounded-3xl shadow-xl overflow-hidden">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Choose Frame</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setFrame('hexagon')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${frame === 'hexagon' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <Hexagon className="w-6 h-6" />
              <span className="text-sm font-medium">Hexagon</span>
            </button>
            <button
              onClick={() => setFrame('circle')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${frame === 'circle' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <Circle className="w-6 h-6" />
              <span className="text-sm font-medium">Circle</span>
            </button>
            <button
              onClick={() => setFrame('rounded')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${frame === 'rounded' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <Square className="w-6 h-6" rx={4} />
              <span className="text-sm font-medium">Rounded</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Choose Theme</h2>
          <ThemeSelector value={theme} onChange={setTheme} />
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">3. Output Alignment</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setAlignment('left')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${alignment === 'left' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <AlignLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Left (Default)</span>
            </button>
            <button
              onClick={() => setAlignment('center')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${alignment === 'center' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <AlignCenter className="w-5 h-5" />
              <span className="text-sm font-medium">Center</span>
            </button>
            <button
              onClick={() => setAlignment('right')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${alignment === 'right' ? 'bg-brand-500/20 border-brand-500 text-brand-100' : 'border-border hover:bg-bg-surface-hover text-text-secondary'}`}
            >
              <AlignRight className="w-5 h-5" />
              <span className="text-sm font-medium">Right</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Adjust Sizes</h2>
          <div className="space-y-4 bg-bg-base border border-border p-4 rounded-xl">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Item Size</span>
                <span className="text-text-secondary">{itemSize}px</span>
              </div>
              <input type="range" min="32" max="96" value={itemSize} onChange={(e) => setItemSize(Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Icon Size</span>
                <span className="text-text-secondary">{iconSize}px</span>
              </div>
              <input type="range" min="16" max="64" value={iconSize} onChange={(e) => setIconSize(Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Icons Per Line</span>
                <span className="text-text-secondary">{perLine}</span>
              </div>
              <input type="range" min="3" max="20" value={perLine} onChange={(e) => setPerLine(Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Select Skills</h2>
          <input
            type="text"
            placeholder="Search skills (e.g. react, python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
          />

          <div className="flex flex-wrap gap-2">
            {selectedIcons.map(slug => (
              <button
                key={slug}
                onClick={() => toggleIcon(slug)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/20 text-brand-100 rounded-lg text-sm font-medium border border-brand-500/30 hover:bg-brand-500/30 transition-colors"
              >
                {slug}
                <span className="text-brand-500 hover:text-white">&times;</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-secondary mb-3">Popular choices:</p>
            <div className="flex flex-wrap gap-2 h-48 overflow-y-scroll pr-2 pb-2 content-start">
              {filteredSkills.length > 0 ? (
                filteredSkills.map(slug => (
                  <button
                    key={slug}
                    onClick={() => toggleIcon(slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-base text-text-secondary rounded-lg text-sm border border-border hover:border-brand-500 hover:text-text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {slug}
                  </button>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                  No skills found.
                </div>
              )}
            </div>
          </div>

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
            {selectedIcons.length > 0 ? (
              <img src={svgUrl} alt="Tech Stack Preview" className="max-w-full h-auto drop-shadow-sm" />
            ) : (
              <p className="text-sm text-text-secondary">Select at least one skill to see the preview.</p>
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
