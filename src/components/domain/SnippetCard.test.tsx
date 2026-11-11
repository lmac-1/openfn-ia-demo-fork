import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SnippetCard from "./SnippetCard";
import type { Snippet } from "../../model/adaptor-reference";

const snippet: Snippet = { id: "send-sms", title: "Send SMS", description: "Sends a text message.", code: "sendSMS({ to: $.data.phone });" };

describe("SnippetCard", () => {
  it("inserts from its Insert button, and its code is a keyboard stop of its own", () => {
    const onInsert = vi.fn();
    render(<SnippetCard snippet={snippet} onInsert={onInsert} />);
    fireEvent.click(screen.getByRole("button", { name: `Insert ${snippet.title}` }));
    expect(onInsert).toHaveBeenCalledWith(snippet);
    expect(screen.getByRole("region", { name: snippet.title }).tabIndex).toBe(0);
  });

  it("offers no Insert button when the step can't be edited, but its code still scrolls from the keyboard", () => {
    render(<SnippetCard snippet={snippet} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("region", { name: snippet.title }).tabIndex).toBe(0);
  });
});
