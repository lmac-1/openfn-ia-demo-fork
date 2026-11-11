import { Lock, Plus } from "lucide-react";
import type { Snippet } from "../../model/adaptor-reference";

interface Props {
  snippet: Snippet;
  /** Inserts the snippet at the cursor in the open step; without it the card is disabled. */
  onInsert?: (snippet: Snippet) => void;
}

/**
 * One adaptor operation as a block you can drop into the code: its name and
 * what it does over the code itself, in full and on a light background so it
 * reads like the editor. When the step can be edited, its "Insert" button puts
 * it at the cursor. When it can't be, the card is greyed out and Insert is
 * locked. The code is its own stop for the keyboard, so a long line can be
 * scrolled.
 */
export default function SnippetCard({ snippet, onInsert }: Props) {
  return (
    <div
      title={onInsert ? undefined : "Read-only. Edit in a sandbox to insert snippets."}
      className={`overflow-hidden rounded-lg border bg-white ${onInsert ? "border-gray-200" : "cursor-not-allowed border-dashed border-gray-200 opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-3 px-3 pt-2.5 pb-2">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-gray-900">{snippet.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-gray-500">{snippet.description}</p>
        </div>
        {onInsert ? (
          <button
            type="button"
            title="Insert at the cursor"
            aria-label={`Insert ${snippet.title}`}
            onClick={() => onInsert(snippet)}
            className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-md border border-indigo-200 px-1.5 py-0.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <Plus size={12} /> Insert
          </button>
        ) : (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-400">
            <Lock size={12} /> Insert
          </span>
        )}
      </div>
      <pre
        tabIndex={0}
        role="region"
        aria-label={snippet.title}
        className="overflow-x-auto border-t border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs leading-relaxed text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-200">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
