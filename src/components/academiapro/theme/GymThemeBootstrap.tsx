import { useLayoutEffect, useRef } from "react";

import { useGymTheme } from "@/hooks/useGymTheme";

type PrevVar = { hadInline: boolean; inlineValue: string };

const THEME_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
];

/**
 * Mount this only inside /academiapro routes.
 * It loads + applies the gym theme immediately and keeps it scoped via body.gym-mode.
 */
export function GymThemeBootstrap() {
  // Side-effect: loads from localStorage + fetches active theme and applies to CSS vars.
  useGymTheme();

  const prev = useRef<Record<string, PrevVar>>({});

  useLayoutEffect(() => {
    const root = document.documentElement;

    THEME_VARS.forEach((key) => {
      const inlineValue = root.style.getPropertyValue(key);
      prev.current[key] = {
        hadInline: inlineValue !== "",
        inlineValue,
      };
    });

    document.body.classList.add("gym-mode");

    return () => {
      document.body.classList.remove("gym-mode");

      THEME_VARS.forEach((key) => {
        const saved = prev.current[key];
        if (!saved) return;

        if (saved.hadInline) {
          root.style.setProperty(key, saved.inlineValue);
        } else {
          root.style.removeProperty(key);
        }
      });
    };
  }, []);

  return null;
}
