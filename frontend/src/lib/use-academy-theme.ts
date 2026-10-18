import { useSyncExternalStore } from "react";

// The shell writes the theme to <html data-academy-theme>. Portaled pieces
// (the account menu, the Shift console) live outside .academy-bg, so they
// read it from there and re-render when it changes. A plain read during render
// goes stale: the compiler memoizes it, and nothing re-renders on a toggle.
const subscribe = (onChange: () => void) => {
  const watch = new MutationObserver(onChange);
  watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-academy-theme"] });
  return () => watch.disconnect();
};

/** The academy's current theme, live. "light" on the server. */
export function useAcademyTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.academyTheme === "dark" ? "dark" : "light"),
    () => "light"
  );
}
