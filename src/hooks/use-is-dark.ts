"use client";

import { useSyncExternalStore } from "react";

function subscribeToHtmlClass(callback: () => void) {
  const el = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getIsDark() {
  return document.documentElement.classList.contains("dark");
}

/**
 * Subscribes to the presence of `class="dark"` on `<html>`.
 * Server snapshot is always false (assumes light until hydrated).
 */
export function useIsDark() {
  return useSyncExternalStore(
    subscribeToHtmlClass,
    getIsDark,
    () => false,
  );
}
