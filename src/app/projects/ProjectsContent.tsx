"use client";

import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { projects } from "@/lib/projects-data";

export function ProjectsContent() {
  const { t } = useLocale();

  return (
    <main className="pt-24">
      <Section>
        <Container>
          <SectionHeader
            label={t("projects.label")}
            heading={t("projects.title")}
            subheading={t("projects.description")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <div className="mt-16 border-t border-zinc-800/60 pt-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-3">
              {t("projects.direction")}
            </p>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              {t("projects.directionDescription")}
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}