"use client";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center border-b border-zinc-200 bg-white px-[max(1rem,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-lg active:bg-zinc-100">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/30 md:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[80vw] border-r border-zinc-200 bg-white transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      />
    </>
  );
}
