import Link from "next/link";
import { Section, Container } from "@/components/ui/Layout";
import { ToolCard } from "@/features/tools/ToolCard";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { tools } from "@/lib/tools-data";
import { projects } from "@/lib/projects-data";

const featuredTools = tools.filter((t) => t.available).slice(0, 3);
const featuredProjects = projects.slice(0, 3);

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-40 pb-28 px-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.04),transparent)] pointer-events-none"
        />
        <Container size="narrow">
          <p className="text-xs font-semibold tracking-[0.25em] text-zinc-600 uppercase mb-6">
            Personal Digital Lab
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-100 tracking-tight leading-[1.05] mb-8">
            Khalidae<span className="text-zinc-600">.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 font-light leading-relaxed max-w-2xl mb-4">
            A personal digital platform built for deep work, precision tooling,
            and long-term technical ownership.
          </p>
          <p className="text-zinc-600 text-base leading-relaxed max-w-xl mb-12">
            Not a portfolio. Not a blog. A living digital property — part lab,
            part infrastructure, part identity.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-950 hover:bg-white px-7 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-colors duration-200"
            >
              Explore Tools
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 px-7 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-colors duration-200"
            >
              Get in Touch
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Tools */}
      <Section className="border-t border-zinc-800/60">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-3">
                Utilities
              </p>
              <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
                Featured Tools
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200 hidden sm:block"
            >
              All tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/tools"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              All tools →
            </Link>
          </div>
        </Container>
      </Section>

      {/* Featured Projects */}
      <Section className="border-t border-zinc-800/60">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-3">
                Work
              </p>
              <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
                Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200 hidden sm:block"
            >
              All projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="border-t border-zinc-800/60">
        <Container size="narrow">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-4">
              Collaborate
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight mb-6">
              Build something together.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Open to serious collaborations, platform partnerships, and
              interesting technical work.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-950 hover:bg-white px-8 py-4 rounded-xl text-sm font-semibold tracking-wide transition-colors duration-200"
            >
              Start a Conversation
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
