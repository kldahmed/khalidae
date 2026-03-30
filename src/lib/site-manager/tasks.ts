import {
  createSiteManagerCompletion,
  type SiteManagerMessage,
} from "./openai-client";

export async function executeSiteTask(
  task: string,
  context: string = "",
): Promise<string> {
  const messages: SiteManagerMessage[] = [
    {
      role: "system",
      content:
        "You are an intelligent site manager that analyzes tasks and returns structured actions.",
    },
    {
      role: "user",
      content: `${task}\n\n${context}`,
    },
  ];

  const result = await createSiteManagerCompletion(
    messages,
    "gpt-4-1106-preview",
  );

  return result;
}