import { createSiteManagerCompletion } from "./openai-client";

export async function executeSiteTask(
  task: string,
  context: string = ""
): Promise<string> {

  const messages = [
    {
      role: "system",
      content: "You are an intelligent site manager that analyzes tasks and returns structured actions."
    },
    {
      role: "user",
      content: `${task}\n\n${context}`
    }
  ];

  return createSiteManagerCompletion(messages, "gpt-4-1106-preview");
}
import { createSiteManagerCompletion } from "./openai-client";

export async function executeSiteTask(
  task: string,
  context: string = ""
): Promise<string> {

  const messages = [
    {
      role: "system",
      content: "You are an intelligent site manager that analyzes tasks and returns structured actions."
    },
    {
      role: "user",
      content: `${task}\n\n${context}`
    }
  ];

  return createSiteManagerCompletion(messages, "gpt-4-1106-preview");
}