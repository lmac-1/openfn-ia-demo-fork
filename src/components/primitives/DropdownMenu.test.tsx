import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActionMenu from "./ActionMenu";
import MenuButton from "./MenuButton";

// The keyboard of the WAI-ARIA menu button pattern, which every DropdownMenu
// (ActionMenu, MenuButton, the editor's menus) shares.
const items = [
  { id: "edit", label: "Edit" },
  { id: "archive", label: "Archive", disabled: true },
  { id: "transfer", label: "Transfer" },
  { id: "delete", label: "Delete", tone: "danger" as const },
];

const focused = () => document.activeElement;
const press = (key: string, shiftKey = false) => fireEvent.keyDown(focused()!, { key, shiftKey });

function drawActionMenu(onSelect = vi.fn()) {
  render(<ActionMenu label="Actions for DHIS2" items={items} onSelect={onSelect} />);
  const trigger = screen.getByRole("button", { name: "Actions for DHIS2" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe("DropdownMenu", () => {
  it("opens on its focused first item, in a menu named by its trigger", () => {
    const trigger = drawActionMenu();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menu", { name: "Actions for DHIS2" })).toBeTruthy();
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Edit" }));
  });

  it("moves between items with the arrow keys, Home and End, skipping a disabled one and wrapping round", () => {
    drawActionMenu();
    press("ArrowDown");
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Transfer" }));
    press("ArrowDown");
    press("ArrowDown");
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Edit" }));
    press("ArrowUp");
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Delete" }));
    press("Home");
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Edit" }));
    press("End");
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Delete" }));
  });

  it("closes on Escape and puts focus back on the trigger", () => {
    const trigger = drawActionMenu();
    press("ArrowDown");
    press("Escape");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("closes on Tab or Shift+Tab, from the trigger", () => {
    const trigger = drawActionMenu();
    press("Tab");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(focused()).toBe(trigger);

    fireEvent.click(trigger);
    press("Tab", true);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("keeps its items out of the Tab order, so the menu is one stop", () => {
    drawActionMenu();
    for (const item of screen.getAllByRole("menuitem")) expect(item.tabIndex).toBe(-1);
  });

  it("chooses an item, then closes and puts focus back on the trigger", () => {
    const onSelect = vi.fn();
    const trigger = drawActionMenu(onSelect);
    fireEvent.click(screen.getByRole("menuitem", { name: "Transfer" }));
    expect(onSelect).toHaveBeenCalledWith("transfer");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(focused()).toBe(trigger);
  });

  it("works the same from a MenuButton, as a button or a link", () => {
    for (const appearance of ["button", "link"] as const) {
      const { unmount } = render(<MenuButton label="New component" appearance={appearance} items={items} onSelect={vi.fn()} />);
      const trigger = screen.getByRole("button", { name: "New component" });
      expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
      trigger.focus();
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(focused()).toBe(screen.getByRole("menuitem", { name: "Edit" }));
      press("End");
      expect(focused()).toBe(screen.getByRole("menuitem", { name: "Delete" }));
      press("Escape");
      expect(focused()).toBe(trigger);
      unmount();
    }
  });

  it("marks ticked and picked items as checkbox and radio items", () => {
    render(
      <ActionMenu
        label="Layout"
        defaultOpen
        onSelect={vi.fn()}
        items={[
          { id: "panel", label: "Bottom panel", checked: true },
          { id: "details", label: "Right panel", checked: false },
          { id: "main", label: "main", selected: true },
        ]}
      />,
    );
    expect(screen.getByRole("menuitemcheckbox", { name: "Bottom panel" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Right panel" }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("menuitemradio", { name: "main" }).getAttribute("aria-checked")).toBe("true");
  });
});
