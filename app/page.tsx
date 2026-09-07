export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fg-faint">
        Cookbook
      </p>
      <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-fg sm:text-6xl">
        Brew it <span className="text-accent">right</span>, every time.
      </h1>
      <p className="max-w-md text-balance text-fg-muted">
        V60 and AeroPress recipes from their authors, the setting for your
        grinder, and a timer that talks you through the pour. Under
        construction.
      </p>
      <p className="tabular font-mono text-sm text-fg-faint">
        phase 0 · scaffold
      </p>
    </main>
  );
}
