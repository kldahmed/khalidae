import type { Metadata } from "next";
import { ProjectsContent } from "@/app/projects/ProjectsContent";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Technical experiments, platform initiatives, and infrastructure projects from Khalidae.",
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
