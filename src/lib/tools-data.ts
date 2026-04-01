import type { Tool } from "@/types";

export const tools: Tool[] = [];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export const toolCategories: { value: Tool["category"]; label: string }[] = [];
