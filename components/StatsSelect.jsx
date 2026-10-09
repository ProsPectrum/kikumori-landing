"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function StatsSelect({ label, value, options, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      ) : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl bg-neutral-900 px-3 py-2.5 text-left text-sm text-white ring-1 ring-white/10"
      >
        <span>{selected?.label}</span>
        <span className="text-white/40" aria-hidden="true">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl bg-neutral-900 p-1 text-sm text-white shadow-xl ring-1 ring-white/15"
        >
          {options.map((option) => {
            const isActive = option.value === selected?.value;
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left text-white ${
                    isActive ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
