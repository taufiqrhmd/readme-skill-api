'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Square, Activity } from 'lucide-react';
import SkillBadgeGenerator from '@/components/SkillBadgeGenerator';
import StreakGenerator from '@/components/StreakGenerator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'skills' | 'streaks'>('skills');

  return (
    <div className="w-full min-h-screen px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24 max-w-[90rem] mx-auto space-y-12 md:space-y-16">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl mb-4">
          <Image src="/logo.png" alt="Tech Stack Badge Generator Logo" width={120} height={120} className="rounded-md" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          GITHUB README <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-100">Asset Generator</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Create beautiful, dynamic SVG badges and streaks for your GitHub README.
        </p>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 pt-8">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${activeTab === 'skills' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary'}`}
          >
            <Square className="w-4 h-4" />
            Tech Badges
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${activeTab === 'streaks' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary'}`}
          >
            <Activity className="w-4 h-4" />
            GitHub Streaks
          </button>
        </div>
      </header>

      {activeTab === 'skills' ? <SkillBadgeGenerator /> : <StreakGenerator />}
    </div>
  );
}