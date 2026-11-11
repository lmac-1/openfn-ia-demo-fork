import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FilterChip, { FilterOptions } from "./FilterChip";

const options = [
  { id: "any", label: "Any" },
  { id: "intake", label: "Patient intake" },
  { id: "sync", label: "Nightly sync" },
];

const focused = () => document.activeElement;

describe("FilterChip", () => {
  it("lists its options with one Tab stop, the arrow keys moving between them, and Escape back to the chip", () => {
    render(
      <FilterChip name="Workflow" label="Workflow is Patient intake">
        {() => <FilterOptions label="Workflow" options={options} value="intake" onChange={vi.fn()} />}
      </FilterChip>,
    );
    const chip = screen.getByRole("button", { name: "Workflow is Patient intake" });
    chip.focus();
    fireEvent.click(chip);

    const listbox = screen.getByRole("listbox", { name: "Workflow" });
    expect(screen.getAllByRole("option").map((o) => o.tabIndex)).toEqual([-1, 0, -1]);

    screen.getByRole("option", { name: "Patient intake" }).focus();
    fireEvent.keyDown(focused()!, { key: "ArrowDown" });
    expect(focused()).toBe(screen.getByRole("option", { name: "Nightly sync" }));
    fireEvent.keyDown(focused()!, { key: "ArrowDown" });
    expect(focused()).toBe(screen.getByRole("option", { name: "Any" }));

    fireEvent.keyDown(focused()!, { key: "Escape" });
    expect(listbox.isConnected).toBe(false);
    expect(focused()).toBe(chip);
  });
});
