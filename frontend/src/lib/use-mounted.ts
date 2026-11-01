import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once the page is running in the browser, false while it renders on the
 * server. Same answer as a mounted flag set in an effect, without the extra
 * render that flag costs and that the effect lint rule flags.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
