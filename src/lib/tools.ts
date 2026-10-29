import type { ToolKey } from "@/db/app-schema";
import { Calendar, GitBranch, Globe, Mail, Search, type LucideIcon } from "lucide-react-native";

export type ToolMeta = {
  key: ToolKey;
  label: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  tile: string;
  /** Needs an account connected on the Connections tab before it can be used. */
  requiresConnection: boolean;
};

/** The catalogue shown on "Set up your Dot". Order matches the design. */
export const TOOLS: ToolMeta[] = [
  {
    key: "treg_research",
    label: "Treg Research",
    description: "Search and get real-time data",
    Icon: Search,
    color: "#13d1db",
    tile: "bg-[#e0f8fa]",
    requiresConnection: false,
  },
  {
    key: "web_browser",
    label: "Web Browser",
    description: "Browse websites and take actions",
    Icon: Globe,
    color: "#0268fe",
    tile: "bg-secondary",
    requiresConnection: false,
  },
  {
    key: "gmail",
    label: "Gmail",
    description: "Read and send emails",
    Icon: Mail,
    color: "#ea4335",
    tile: "bg-[#fdeceb]",
    requiresConnection: true,
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "Manage your schedule",
    Icon: Calendar,
    color: "#0268fe",
    tile: "bg-secondary",
    requiresConnection: true,
  },
  {
    key: "github",
    label: "GitHub",
    description: "Read repositories and create issues",
    // lucide dropped brand logos; a real GitHub mark can join the Google and
    // Apple ones in provider-button.tsx when the connection is wired.
    Icon: GitBranch,
    color: "#111111",
    tile: "bg-muted",
    requiresConnection: true,
  },
];

export const toolLabel = (key: ToolKey) =>
  TOOLS.find((t) => t.key === key)?.label ?? key;
