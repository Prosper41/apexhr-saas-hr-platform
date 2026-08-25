"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, Search } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type ResponsiveSelectProps = {
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
  disabled?: boolean;
};

export function ResponsiveSelect({
  placeholder = "Select an option",
  options,
  value,
  onChange,
  searchable = false,
  disabled = false,
}: ResponsiveSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, search, searchable]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    } else if (searchable) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  React.useEffect(() => {
    if (open && searchable) {
      inputRef.current?.focus();
    }
  }, [filteredOptions, open, searchable]);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
    >
      {/* Trigger */}
      <SelectPrimitive.Trigger
        disabled={disabled}
        className="border-input bg-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      {/* Dropdown */}
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          className="bg-popover z-50 w-[var(--radix-select-trigger-width)] min-w-[200px] overflow-hidden rounded-md border shadow-md"
          onCloseAutoFocus={(e) => {
            if (searchable) e.preventDefault();
          }}
        >
          {searchable && (
            <div className="border-b p-1.5">
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring h-8 w-full rounded-sm border pr-2 pl-7 text-sm outline-none focus:ring-1"
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </div>
          )}

          <SelectPrimitive.Viewport className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground px-2 py-4 text-center text-sm">
                No results found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="hover:bg-accent focus:bg-accent relative flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none select-none"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>

                  <SelectPrimitive.ItemIndicator className="absolute right-2">
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
