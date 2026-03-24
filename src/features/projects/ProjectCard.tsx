import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";

const statusStyles: Record<Project["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  experimental: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  archived: "bg-zinc-800 text-zinc-500 border-zinc-700",
};

const statusLabels: Record<Project["status"], string> = {
  active: "Active",
  experimental: "Experimental",
  archived: "Archived",
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card hover className="p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-600 mb-1 font-medium tracking-wide">
            {project.year}
          </p>
          <h3 className="text-zinc-100 font-semibold text-base">
            {project.name}
          </h3>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-medium tracking-wide rounded-md border ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      <p className="text-zinc-500 text-sm leading-relaxed">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="muted">
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
