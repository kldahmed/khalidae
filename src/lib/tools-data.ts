import type { Tool } from "@/types";

export const tools: Tool[] = [
  {
    slug: "link-analyzer",
    name: "Link Analyzer",
    tagline: "Inspect any URL — headers, redirects, status codes.",
    description:
      "Analyze the technical properties of any public URL. View HTTP headers, redirect chains, response status codes, and basic performance indicators. Useful for debugging, SEO auditing, and link validation.",
    category: "link",
    available: true,
    icon: "🔗",
  },
  {
    slug: "metadata-viewer",
    name: "Metadata Viewer",
    tagline: "Extract open graph, Twitter card, and page metadata.",
    description:
      "Paste any public URL to extract page metadata including Open Graph tags, Twitter Card data, canonical URLs, and structured title/description. Ideal for auditing how a page presents itself across platforms.",
    category: "link",
    available: true,
    icon: "🔍",
  },
  {
    slug: "text-utilities",
    name: "Text Utilities",
    tagline: "Transform, clean, and analyze text in seconds.",
    description:
      "A suite of text processing utilities: word count, character count, case conversion, whitespace normalization, line deduplication, JSON formatting, and base64 encoding/decoding. No data leaves your browser.",
    category: "text",
    available: true,
    icon: "✏️",
  },
  {
    slug: "card-generator",
    name: "Profile Card Generator",
    tagline: "Generate shareable identity cards from your profile data.",
    description:
      "Create clean, visually polished profile cards from your data. Enter a name, bio, and links — get a styled card optimized for sharing. Exported as downloadable image or clipboard-ready HTML embed.",
    category: "profile",
    available: true,
    icon: "🪪",
  },
  {
    slug: "image-utilities",
    name: "Image Utilities",
    tagline: "Inspect image metadata, dimensions, and color data.",
    description:
      "Upload or link to an image to inspect its dimensions, color palette, EXIF metadata (where available), and format properties. All processing happens client-side — no image data is stored or transmitted.",
    category: "image",
    available: false,
    comingSoon: true,
    icon: "🖼️",
  },
  {
    slug: "media-utility-center",
    name: "Media Utility Center",
    tagline: "Compliant media link inspection and embed preview.",
    description:
      "A lawful media utility for inspecting publicly shared links, previewing embeds, extracting metadata where permitted, and managing your own authorized content workflows. This tool operates fully within platform terms and applicable law.",
    category: "media",
    available: false,
    comingSoon: true,
    icon: "📡",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export const toolCategories: { value: Tool["category"]; label: string }[] = [
  { value: "link", label: "Link & URL" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "file", label: "File" },
  { value: "productivity", label: "Productivity" },
  { value: "media", label: "Media Utilities" },
  { value: "profile", label: "Profile & Identity" },
];
