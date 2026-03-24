"use client";

import type { ComponentType } from "react";
import { LinkAnalyzerTool } from "@/features/tools/LinkAnalyzerTool";
import { MetadataViewerTool } from "@/features/tools/MetadataViewerTool";
import { TextUtilitiesTool } from "@/features/tools/TextUtilitiesTool";
import { CardGeneratorTool } from "@/features/tools/CardGeneratorTool";

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
