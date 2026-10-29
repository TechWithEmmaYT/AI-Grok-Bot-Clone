import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Draft = { name: string; email: string };

type Value = {
  draft: Draft;
  setIdentity: (next: Draft) => void;
  reset: () => void;
};

const EMPTY: Draft = { name: "", email: "" };
const SignUpDraftContext = createContext<Value | null>(null);

/**
 * Carries step one's answers to step two.
 *
 * Deliberately not route params: an email in the URL ends up in navigation
 * state and deep links. The password is never stored here at all — step two
 * holds it locally and submits directly.
 */
export function SignUpDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const value = useMemo<Value>(
    () => ({
      draft,
      setIdentity: setDraft,
      reset: () => setDraft(EMPTY),
    }),
    [draft],
  );

  return (
    <SignUpDraftContext.Provider value={value}>{children}</SignUpDraftContext.Provider>
  );
}

export function useSignUpDraft() {
  const value = useContext(SignUpDraftContext);
  if (!value) {
    throw new Error("useSignUpDraft must be used inside SignUpDraftProvider");
  }
  return value;
}
