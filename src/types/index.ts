export type ToolCategory =
  | "text"
  | "link"
  | "image"
  | "file"
  | "productivity"
  | "media"
  | "profile";

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  available: boolean;
  comingSoon?: boolean;
  icon: string;
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  year: string;
  status: "active" | "archived" | "experimental";
  url?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
