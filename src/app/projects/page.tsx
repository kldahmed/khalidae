import type { Metadata } from "next";
import { ProjectsContent } from "@/app/projects/ProjectsContent";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Projects — ${siteConfig.name}`,
  description:
    "Technical experiments, platform initiatives, and infrastructure projects from Khalidae.",
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
