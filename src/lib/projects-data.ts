import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "khalidae-platform",
    name: "Khalidae Platform",
    description:
      "The personal digital lab and tools platform you are currently on. Built from scratch with Next.js, Tailwind CSS, and a modular architecture designed for long-term extensibility.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    year: "2026",
    status: "active",
    url: "https://khalidae.com",
  },
  {
    slug: "link-intelligence",
    name: "Link Intelligence Engine",
    description:
      "A server-side URL analysis engine capable of following redirect chains, inspecting HTTP headers, and scoring link health. Powers the Link Analyzer tool.",
    tags: ["TypeScript", "Node.js", "HTTP Analysis"],
    year: "2026",
    status: "active",
  },
  {
    slug: "metadata-pipeline",
    name: "Metadata Pipeline",
    description:
      "A structured metadata extraction system for public URLs. Parses Open Graph, JSON-LD, Twitter Cards, and raw meta tags into a normalized schema.",
    tags: ["TypeScript", "Web Scraping", "Structured Data"],
    year: "2026",
    status: "experimental",
  },
  {
    slug: "design-system",
    name: "Khalidae Design System",
    description:
      "The internal design system and component library behind this platform. Dark-first, premium tokens, and a strict visual language built for long-term consistency.",
    tags: ["Design System", "Tailwind", "Tokens"],
    year: "2026",
    status: "experimental",
  },
];
