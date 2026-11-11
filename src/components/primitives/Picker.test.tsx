import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Picker from "./Picker";

const options = [
  { id: "main", label: "main" },
  { id: "v3", label: "Version 3", group: "Version history" },
  { id: "v2", label: "Version 2", group: "Version history" },
];

const focused = () => document.activeElement;
const press = (key: string, shiftKey = false) => fireEvent.keyDown(focused()!, { key, shiftKey });

function draw(onChange = vi.fn(), footerAction?: { label: string; onClick: () => void }) {
  render(<Picker ariaLabel="Switch version" options={options} value="v3" onChange={onChange} footerAction={footerAction} />);
  const trigger = screen.getByRole("button", { name: "Version 3, Switch version" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe("Picker", () => {
  it("opens a listbox on the chosen option, its groups named by their headings", () => {
    const trigger = draw();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox", { name: "Switch version" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Version history" })).toBeTruthy();
    expect(focused()).toBe(screen.getByRole("option", { name: "Version 3" }));
  });

  it("moves between options with the arrow keys, on to its footer action", () => {
    draw(vi.fn(), { label: "View all", onClick: vi.fn() });
    press("ArrowDown");
    expect(focused()).toBe(screen.getByRole("option", { name: "Version 2" }));
    press("ArrowDown");
    expect(focused()).toBe(screen.getByRole("button", { name: "View all" }));
    press("ArrowDown");
    expect(focused()).toBe(screen.getByRole("option", { name: "main" }));
    press("ArrowUp");
    expect(focused()).toBe(screen.getByRole("button", { name: "View all" }));
  });

  it("closes on Escape or Tab and puts focus back on the trigger", () => {
    const trigger = draw();
    press("Escape");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(focused()).toBe(trigger);

    fireEvent.click(trigger);
    press("Tab", true);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("picks an option, then closes and puts focus back on the trigger", () => {
    const onChange = vi.fn();
    const trigger = draw(onChange);
    press("ArrowDown");
    fireEvent.click(focused()!);
    expect(onChange).toHaveBeenCalledWith("v2");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(focused()).toBe(trigger);
  });
});
