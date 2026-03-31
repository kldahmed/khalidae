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
  name_ar?: string;
  tagline: string;
  tagline_ar?: string;
  description: string;
  description_ar?: string;
  category: ToolCategory;
  available: boolean;
  comingSoon?: boolean;
  icon: string;
  featured?: boolean;
}

export interface Project {
  slug: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  tags: string[];
  year: string;
  status: "active" | "archived" | "experimental";
  url?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
