import type { ToolKey } from "@/db/app-schema";
import type { Template } from "@/lib/templates";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DotColor, DotShape } from "./dotLooks";

export type DotDraft = {
  templateKey: string | null;
  name: string;
  shape: DotShape;
  color: DotColor;
  instructions: string;
  tools: ToolKey[];
};

const BLANK: DotDraft = {
  templateKey: null,
  name: "",
  shape: "blob",
  color: "blue",
  instructions: "",
  tools: ["treg_research", "web_browser"],
};

type Value = {
  draft: DotDraft;
  update: (patch: Partial<DotDraft>) => void;
  startFromScratch: () => void;
  startFromTemplate: (template: Template) => void;
  toggleTool: (key: ToolKey) => void;
  reset: () => void;
};

const DotDraftContext = createContext<Value | null>(null);

/** Carries the in-progress Dot across the four creation steps. */
export function DotDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DotDraft>(BLANK);

  const value = useMemo<Value>(
    () => ({
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      startFromScratch: () => setDraft({ ...BLANK, name: "Dot" }),
      startFromTemplate: (template) =>
        setDraft({
          templateKey: template.key,
          name: template.name,
          shape: template.shape,
          color: template.color,
          instructions: template.instructions,
          tools: [...template.tools],
        }),
      toggleTool: (key) =>
        setDraft((d) => ({
          ...d,
          tools: d.tools.includes(key)
            ? d.tools.filter((t) => t !== key)
            : [...d.tools, key],
        })),
      reset: () => setDraft(BLANK),
    }),
    [draft],
  );

  return <DotDraftContext.Provider value={value}>{children}</DotDraftContext.Provider>;
}

export function useDotDraft() {
  const value = useContext(DotDraftContext);
  if (!value) throw new Error("useDotDraft must be used inside DotDraftProvider");
  return value;
}
