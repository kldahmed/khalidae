import PlatformCard from "@/components/platforms/PlatformCard";
import { PLATFORMS } from "@/lib/platforms/config";

export const metadata = {
  title: "المنصات | khalidae",
  description: "بوابة المنصات الخارجية داخل khalidae",
};

export default function PlatformsPage() {
  return (
    <main className="min-h-screen bg-[#060816] text-white">
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-12 max-w-3xl">
          <span className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium tracking-wide text-cyan-300">
            PLATFORMS
          </span>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
            المنصات الخارجية
          </h1>

          <p className="text-base leading-8 text-white/70 md:text-lg">
            نقطة وصول مباشرة إلى المشاريع الخارجية المرتبطة بالموقع. اختر
            المنصة التي تريدها وادخل إليها فورًا.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.id}
              title={platform.titleAr}
              description={platform.descriptionAr}
              href={platform.href}
              badge={platform.status.toUpperCase()}
            />
          ))}
        </div>
      </section>
    </main>
  );
}