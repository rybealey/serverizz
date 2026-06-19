"use client";

import * as React from "react";
import { Sun, Monitor, Moon } from "lucide-react";

type Theme = "light" | "system" | "dark";

function resolve(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", resolve(theme));
}

/* A tiny external store so the toggle reflects the persisted theme without
   calling setState inside an effect (and stays hydration-safe). */
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (getSnapshot() === "system") applyTheme("system");
  };
  mq.addEventListener("change", onMedia);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
    mq.removeEventListener("change", onMedia);
  };
}
function getSnapshot(): Theme {
  try {
    return (localStorage.getItem("szz-theme") as Theme | null) || "system";
  } catch {
    return "system";
  }
}
function getServerSnapshot(): Theme {
  return "system";
}

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "system", label: "System theme", Icon: Monitor },
  { value: "dark", label: "Dark mode", Icon: Moon },
];

export function ThemeToggle() {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function select(next: Theme) {
    try {
      localStorage.setItem("szz-theme", next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    emit();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: "1px solid var(--szz-border)",
        borderRadius: 999,
        padding: 3,
        marginLeft: 4,
      }}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              background: active ? "var(--accent-fill)" : "transparent",
              color: active ? "var(--szz-accent-blue)" : "var(--szz-text-dim)",
            }}
          >
            <Icon size={15} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
