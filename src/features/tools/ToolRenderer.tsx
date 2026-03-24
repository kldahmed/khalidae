"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const LinkAnalyzerTool = dynamic(
  () =>
    import("@/features/tools/LinkAnalyzerTool").then(
      (m) => m.LinkAnalyzerTool
    ),
  { ssr: false }
);
const MetadataViewerTool = dynamic(
  () =>
    import("@/features/tools/MetadataViewerTool").then(
      (m) => m.MetadataViewerTool
    ),
  { ssr: false }
);
const TextUtilitiesTool = dynamic(
  () =>
    import("@/features/tools/TextUtilitiesTool").then(
      (m) => m.TextUtilitiesTool
    ),
  { ssr: false }
);
const CardGeneratorTool = dynamic(
  () =>
    import("@/features/tools/CardGeneratorTool").then(
      (m) => m.CardGeneratorTool
    ),
  { ssr: false }
);

const toolComponents: Record<string, ComponentType> = {
  "link-analyzer": LinkAnalyzerTool,
  "metadata-viewer": MetadataViewerTool,
  "text-utilities": TextUtilitiesTool,
  "card-generator": CardGeneratorTool,
};

interface ToolRendererProps {
  slug: string;
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <div className="border border-zinc-800/60 rounded-xl p-8 bg-zinc-900/40 text-center">
        <p className="text-zinc-500 text-sm">
          This tool does not have an interactive implementation yet.
        </p>
      </div>
    );
  }

  return <Component />;
}
