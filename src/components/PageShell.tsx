import Link from "next/link";

export default function PageShell({
  title,
  back,
  children,
}: {
  title: string;
  /** Optional back link shown above the title. */
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <main className="flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 md:px-10">
      {back && (
        <Link
          href={back.href}
          className="-ml-2 mb-3 inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-zinc-600 [-webkit-tap-highlight-color:transparent] active:bg-zinc-100 md:hover:bg-zinc-100"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {back.label}
        </Link>
      )}
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
      <div className="mt-6">{children}</div>
    </main>
  );
}
