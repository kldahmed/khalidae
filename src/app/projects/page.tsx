import type { Metadata } from "next";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { projects } from "@/lib/projects-data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Projects — ${siteConfig.name}`,
  description:
    "Technical experiments, platform initiatives, and infrastructure projects from Khalidae.",
};

export default function ProjectsPage() {
  return (
    <main className="pt-24">
      <Section>
        <Container>
          <SectionHeader
            label="Work"
            heading="Projects"
            subheading="Technical experiments, platform initiatives, and infrastructure built under the Khalidae banner. Built to last."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <div className="mt-16 border-t border-zinc-800/60 pt-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-3">
              Direction
            </p>
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              Every project here is a module in a larger system. The platform,
              the tools, the design system — they compound. New experiments get
              added as they reach a state worth sharing.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
