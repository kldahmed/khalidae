import { platforms } from '@/lib/platforms/config';
import { PlatformCard } from '@/components/platforms/PlatformCard';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function PlatformsPage() {
  // Detect language (fallback to 'ar' if not found)
  let lang = 'ar';
  if (typeof window !== 'undefined') {
    lang = document.documentElement.lang || 'ar';
  }

  // Only one platform for now
  const platform = platforms[0];

  // Tracking function
  const handleClick = () => {
    if (typeof window !== 'undefined' && window?.gtag) {
      window.gtag('event', 'platform_news_clicked');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 text-center">
        {lang === 'ar' ? 'المنصات' : 'Platforms'}
      </h1>
      <PlatformCard
        title={lang === 'ar' ? platform.titleAr : platform.titleEn}
        description={lang === 'ar' ? platform.descriptionAr : platform.descriptionEn}
        href={platform.href}
        status={platform.status}
        onClick={handleClick}
      />
    </main>
  );
}
