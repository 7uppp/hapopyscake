export default function SuccessPage() {
  return (
    <div className="container-shell py-16">
      <div className="glass-card mx-auto max-w-3xl rounded-[36px] border border-white/60 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Payment successful
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          Your order is officially in the oven
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          We have sent a confirmation email to the buyer and an order summary to the
          shop inbox.
        </p>
      </div>
    </div>
  );
}
