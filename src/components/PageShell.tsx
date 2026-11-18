export default function PageShell({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main className="flex-1 px-6 py-8 md:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      <div className="mt-6">{children}</div>
    </main>
  );
}
