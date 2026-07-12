type LegalPageProps = {
  title: string;
  body: string;
};

export function LegalPage({ title, body }: LegalPageProps) {
  return (
    <div className="container-shell py-16">
      <div className="glass-card mx-auto max-w-4xl rounded-[36px] border border-white/60 p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Legal
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-[var(--color-cocoa)]">{body}</p>
      </div>
    </div>
  );
}
