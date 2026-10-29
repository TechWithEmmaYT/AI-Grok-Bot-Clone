import type { DotColor, DotShape } from "@/components/dots/dotLooks";
import type { ToolKey } from "@/db/app-schema";

export type Template = {
  key: string;
  name: string;
  description: string;
  instructions: string;
  shape: DotShape;
  color: DotColor;
  tools: ToolKey[];
};

/**
 * "Popular templates" from dot-creation-flow-1.
 *
 * Local for now so the flow can be built and seen. The plan has these as
 * seeded `template` rows — when that lands, this module becomes the seed
 * source and the screens fetch instead, with no change to their shape.
 */
export const TEMPLATES: Template[] = [
  {
    key: "research_scout",
    name: "Research Scout",
    description: "Research topics, find sources and give detailed summaries.",
    instructions:
      "You are a research agent that finds accurate and up-to-date information on any topic. Use the web to search, analyze sources and provide clear, structured summaries with links.",
    shape: "blob",
    color: "blue",
    tools: ["treg_research", "web_browser"],
  },
  {
    key: "inbox_manager",
    name: "Inbox Manager",
    description: "Sort your email, draft replies and keep you organized.",
    instructions:
      "You help manage an inbox. Triage incoming mail, summarize what needs attention, and draft replies in the user's voice. Always show a draft for approval before sending anything.",
    shape: "cloud",
    color: "green",
    tools: ["gmail"],
  },
  {
    key: "job_hunter",
    name: "Job Hunter",
    description: "Find matching jobs and track applications.",
    instructions:
      "You find roles that match the user's experience and preferences. Search job boards and company sites, summarize each match with its requirements, and keep track of what has been applied to.",
    shape: "blob",
    color: "orange",
    tools: ["treg_research", "web_browser"],
  },
  {
    key: "content_researcher",
    name: "Content Researcher",
    description: "Research ideas, analyze trends and create outlines.",
    instructions:
      "You research content ideas. Identify what is being discussed on a topic right now, find credible sources, and turn the findings into a structured outline with angles worth covering.",
    shape: "cloud",
    color: "pink",
    tools: ["treg_research"],
  },
  {
    key: "executive_assistant",
    name: "Executive Assistant",
    description: "Manage your schedule, notes and important tasks.",
    instructions:
      "You act as an executive assistant. Keep the calendar coherent, surface what matters each day, and prepare briefs ahead of meetings. Confirm before creating or moving anything.",
    shape: "capsule",
    color: "purple",
    tools: ["calendar", "gmail"],
  },
];

export const templateByKey = (key: string | null | undefined) =>
  TEMPLATES.find((t) => t.key === key);
