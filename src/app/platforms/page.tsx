"use client";

import { platforms } from '@/lib/platforms/config';
import { PlatformCard } from '@/components/platforms/PlatformCard';

export default function PlatformsPage() {
  // اللغة الافتراضية عربية
  const lang = typeof window !== 'undefined' ? (document.documentElement.lang || 'ar') : 'ar';
  const platform = platforms[0];

  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 text-center">
        {lang === 'ar' ? 'المنصات' : 'Platforms'}
      </h1>
      <PlatformCard
        title={lang === 'ar' ? platform.titleAr : platform.titleEn}
        description={lang === 'ar' ? platform.descriptionAr : platform.descriptionEn}
        href={platform.href}
        badge={platform.status.toUpperCase()}
      />
    </main>
  );
}
