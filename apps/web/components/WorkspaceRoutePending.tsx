interface WorkspaceRoutePendingProps {
  title: string;
  detail: string;
}

export function WorkspaceRoutePending({ title, detail }: WorkspaceRoutePendingProps) {
  return (
    <div className="finance-shell min-h-screen text-foreground">
      <main className="mx-auto flex min-h-screen max-w-[1440px] items-center px-6 py-10">
        <div className="w-full rounded-[32px] border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur dark:bg-[rgba(16,22,30,0.9)]">
          <div className="section-label">Preparing workspace</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-3xl border border-border/60 bg-background/70" />
            <div className="h-28 animate-pulse rounded-3xl border border-border/60 bg-background/70" />
            <div className="h-28 animate-pulse rounded-3xl border border-border/60 bg-background/70" />
          </div>
        </div>
      </main>
    </div>
  );
}
