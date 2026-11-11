import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import Surface from "./Surface";
import { usePopover } from "./use-popover";
import NavItem from "./NavItem";
import Badge from "./Badge";

export interface PickerOption {
  id: string;
  label: string;
  /** Shown on the trigger instead of `label` when this option is selected. */
  shortLabel?: string;
  /** Secondary line under the label, e.g. "Brandon Jackson · 20 Oct 2026". */
  description?: string;
  /** Small tag before the label, e.g. a version number. */
  badge?: { label: string; tone?: "green" | "gray" };
  /** Overrides the picker's icon for this option, e.g. a lock for main. */
  icon?: LucideIcon;
  /** Short tag after the label, shown on the trigger too, e.g. "Read only". */
  tag?: string;
  /** Options sharing a group are listed under a heading with this name. */
  group?: string;
}

interface Props {
  /** Icon shown before the selected label, e.g. a folder for projects. */
  icon?: LucideIcon;
  options: PickerOption[];
  /** ID of the selected option. */
  value: string;
  onChange?: (id: string) => void;
  /** Accessible name for the trigger and menu, e.g. "Switch project". */
  ariaLabel: string;
  /** Optional link-style action pinned below the options, e.g. "View all". */
  footerAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  /** Caps the trigger width so long labels truncate. */
  maxWidthClass?: string;
  /** Width of the open menu. */
  menuWidthClass?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
  /** Tints the trigger yellow, e.g. while viewing an older version. */
  highlight?: boolean;
  /**
   * Draws the trigger's content in place of the chip, e.g. a title, as plain
   * text with a hover background. Given the selected option.
   */
  trigger?: (selected: PickerOption | undefined) => ReactNode;
}

/**
 * Select-style chip that opens a dropdown on click. Used for the project,
 * sandbox and version switchers in the project top bar and the workflow
 * editor. Options can carry a badge and a description, and be grouped under
 * headings (e.g. "Version history"). With `trigger`, the menu opens from
 * custom content instead of the chip, e.g. the editor's workflow title.
 */
export default function Picker({
  icon: Icon,
  options,
  value,
  onChange,
  ariaLabel,
  footerAction,
  maxWidthClass = "max-w-xs",
  menuWidthClass = "w-72",
  defaultOpen = false,
  highlight = false,
  trigger,
}: Props) {
  const { open, setOpen, choose, ref, menu } = usePopover(defaultOpen);
  const selected = options.find((o) => o.id === value);
  const id = useId();
  // Options next to each other with the same `group` are listed under its heading.
  const groups = options.reduce<{ name?: string; options: PickerOption[] }[]>((all, option) => {
    const last = all[all.length - 1];
    if (last && last.name === option.group) last.options.push(option);
    else all.push({ name: option.group, options: [option] });
    return all;
  }, []);

  const TriggerIcon = selected?.icon ?? Icon;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={
          trigger
            ? `inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm ${maxWidthClass} ${
                open ? "bg-gray-100" : "hover:bg-gray-100"
              }`
            : `inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm transition-colors ${maxWidthClass} ${
                highlight
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : open
                    ? "border-gray-300 bg-gray-50 text-gray-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`
        }
      >
        {trigger ? (
          trigger(selected)
        ) : (
          <>
            {TriggerIcon && <TriggerIcon size={14} className="flex-shrink-0 text-gray-500" />}
            <span className="truncate font-medium">{selected?.shortLabel ?? selected?.label ?? value}</span>
            {selected?.tag && <Badge label={selected.tag} shape="tag" />}
            <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
          </>
        )}
      </button>

      {open && (
        <Surface variant="popover" {...menu} className={`absolute left-0 top-full z-50 mt-1 ${menuWidthClass} p-1.5`}>
          <div role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto">
            {groups.map((group, g) => {
              const items = group.options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <NavItem
                    key={option.id}
                    variant="menu"
                    role="option"
                    active={isSelected}
                    label={option.label}
                    description={option.description}
                    icon={option.icon ?? Icon}
                    leading={option.badge && <Badge label={option.badge.label} tone={option.badge.tone} shape="tag" />}
                    trailing={
                      (option.tag || isSelected) && (
                        <>
                          {option.tag && <Badge label={option.tag} shape="tag" />}
                          {isSelected && <Check size={14} className="text-indigo-600" />}
                        </>
                      )
                    }
                    onClick={() => {
                      choose();
                      onChange?.(option.id);
                    }}
                  />
                );
              });
              if (!group.name) return items;
              return (
                <div key={`${g}-${group.name}`} role="group" aria-labelledby={`${id}-${g}`}>
                  <div id={`${id}-${g}`} className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    {group.name}
                  </div>
                  {items}
                </div>
              );
            })}
          </div>
          {footerAction && (
            <>
              <div className="my-1.5 border-t border-gray-200" />
              <NavItem
                variant="menu"
                role={null}
                label={footerAction.label}
                icon={footerAction.icon}
                onClick={() => {
                  choose();
                  footerAction.onClick();
                }}
              />
            </>
          )}
        </Surface>
      )}
    </div>
  );
}
