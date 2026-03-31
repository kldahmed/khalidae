export type Platform = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  href: string;
  status: 'live' | 'offline';
};

export const platforms: Platform[] = [
  {
    id: 'news',
    titleAr: 'منصة الأخبار الذكية',
    titleEn: 'AI News Platform',
    descriptionAr: 'منصة خارجية لرصد الأخبار وتحليلها وعرضها بشكل ذكي ومباشر.',
    descriptionEn: 'External AI-powered news platform for smart monitoring and analysis.',
    href: 'https://war-dashboardbykar.vercel.app/news',
    status: 'live',
  },
];
