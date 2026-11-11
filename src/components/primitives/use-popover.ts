import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

/** The button that opens what floats: the one in the wrapper saying whether it's open. */
function triggerIn(wrapper: HTMLElement | null) {
  return wrapper?.querySelector<HTMLElement>("[aria-expanded]") ?? null;
}

/** What the arrow keys move between: every button and link in the list that isn't disabled. */
function itemsIn(list: HTMLElement | null) {
  return Array.from(list?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]") ?? []);
}

/**
 * The arrow keys, Home and End move focus between a menu's or listbox's
 * items. Put it on the list's `onKeyDown`.
 */
export function moveFocusByArrows(e: KeyboardEvent<HTMLElement>) {
  const items = itemsIn(e.currentTarget);
  if (items.length === 0) return;
  const at = items.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === "ArrowDown"
      ? (at + 1) % items.length
      : e.key === "ArrowUp"
        ? (at - 1 + items.length) % items.length
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? items.length - 1
            : -1;
  if (next === -1) return;
  e.preventDefault();
  items[next].focus();
}

/**
 * Closes something that floats while it's open: a click outside the element
 * the returned ref is on, or Escape, calls `onDismiss`. Escape from inside it
 * puts focus back on its trigger. Put the ref on the wrapper that holds both
 * the trigger and what it opens, so clicking the trigger toggles rather than
 * closing and reopening.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(open: boolean, onDismiss: () => void) {
  const ref = useRef<T>(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) dismiss.current();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (ref.current?.contains(document.activeElement)) triggerIn(ref.current)?.focus();
      dismiss.current();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return ref;
}

/**
 * Open state for a menu, picker or popover that closes on a click outside or
 * Escape. Spread nothing: put `ref` on the wrapper, toggle from the trigger.
 *
 * A menu or listbox also spreads `menu` on its list, for the keyboard of the
 * WAI-ARIA menu button pattern: opening it focuses its chosen item (or its
 * first), the arrow keys move between items, and Tab or Shift+Tab closes it
 * and moves on from the trigger. Choosing an item calls `choose`, which
 * closes it and puts focus back on the trigger.
 */
export function usePopover<T extends HTMLElement = HTMLDivElement>(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useDismiss<T>(open, () => setOpen(false));
  const list = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(open);

  // Only when it opens, not when a story starts it open.
  useEffect(() => {
    if (open && !wasOpen.current) {
      const items = itemsIn(list.current);
      (items.find((item) => item.getAttribute("aria-selected") === "true") ?? items[0])?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  const choose = () => {
    triggerIn(ref.current)?.focus();
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Tab") {
      // Tab carries on from the trigger, Shift+Tab lands on it.
      if (e.shiftKey) e.preventDefault();
      choose();
      return;
    }
    moveFocusByArrows(e);
  };

  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o),
    close: () => setOpen(false),
    choose,
    ref,
    menu: { ref: list, onKeyDown },
  };
}
