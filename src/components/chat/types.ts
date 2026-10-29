import type { ToolKey } from "@/db/app-schema";

export type StepStatus = "pending" | "running" | "done" | "error";

export type Step = {
  id: string;
  title: string;
  detail?: string;
  status: StepStatus;
  /** Tints the leading tile; falls back to the neutral surface. */
  tint?: string;
  color?: string;
};

export type ResultItem = {
  id: string;
  title: string;
  description: string;
  /** Short mark shown in the leading tile when there is no logo. */
  initials: string;
};

/** One rendered turn. Tool parts sit between messages, as in the designs. */
export type ChatPart =
  | { kind: "user"; id: string; text: string; sentAt: string }
  | { kind: "assistant"; id: string; text: string }
  | { kind: "steps"; id: string; label: string; steps: Step[]; collapsible?: boolean }
  | {
      kind: "result";
      id: string;
      title: string;
      subtitle: string;
      items: ResultItem[];
      sourceCount: number;
    }
  | { kind: "browser"; id: string; url: string; live: boolean; steps: Step[]; summary?: string }
  | { kind: "tool"; id: string; toolKey: ToolKey; title: string; detail?: string; status: StepStatus }
  | { kind: "connect"; id: string; toolKey: ToolKey };
