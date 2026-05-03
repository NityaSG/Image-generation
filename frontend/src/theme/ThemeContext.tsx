import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface Tweaks {
  dark: boolean;
  accent: string;
  accent2: string;
  density: "compact" | "comfortable";
}

const TWEAK_DEFAULTS: Tweaks = {
  dark: false,
  accent: "#1a1714",
  accent2: "#b5905a",
  density: "comfortable",
};

interface ThemeCtxValue {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
  toggleDark: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
      setTweaks((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleDark = useCallback(() => {
    setTweaks((prev) => ({ ...prev, dark: !prev.dark }));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tweaks.dark);
    document.documentElement.style.setProperty("--c-accent", tweaks.accent);
    document.documentElement.style.setProperty("--c-accent2", tweaks.accent2);
  }, [tweaks.dark, tweaks.accent, tweaks.accent2]);

  return (
    <ThemeCtx.Provider value={{ tweaks, setTweak, toggleDark }}>{children}</ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeCtxValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
