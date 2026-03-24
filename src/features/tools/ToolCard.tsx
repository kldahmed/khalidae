import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const cardContent = (
    <Card hover className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-2xl" role="img" aria-label={tool.name}>
          {tool.icon}
        </span>
        {tool.comingSoon && (
          <Badge variant="muted">Soon</Badge>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-zinc-100 font-semibold text-base mb-2">
          {tool.name}
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{tool.tagline}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
        <Badge variant="muted">{tool.category}</Badge>
        {tool.available ? (
          <span className="text-xs text-zinc-400 font-medium">Open tool →</span>
        ) : (
          <span className="text-xs text-zinc-600">Coming soon</span>
        )}
      </div>
    </Card>
  );

  if (!tool.available) {
    return <div className="opacity-60 cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block group">
      {cardContent}
    </Link>
  );
}
