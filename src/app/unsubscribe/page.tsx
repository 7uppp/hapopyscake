import Link from "next/link";

type UnsubscribePageProps = PageProps<"/unsubscribe">;

export default async function UnsubscribePage(props: UnsubscribePageProps) {
  const searchParams = await props.searchParams;
  const email = searchParams.email;
  const token = searchParams.token;

  return (
    <div className="container-shell py-16">
      <div className="glass-card mx-auto max-w-3xl rounded-[36px] border border-white/60 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
          Email preferences
        </p>
        <h1 className="section-title mt-3 text-5xl text-[var(--color-ink)]">
          Manage your subscription
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--color-cocoa)]">
          {email && token
            ? "Click below to unsubscribe this address from future campaigns."
            : "The unsubscribe link is incomplete."}
        </p>
        {email && token ? (
          <form action="/api/unsubscribe" method="POST" className="mt-8">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-full bg-[var(--color-berry)] px-6 py-3 font-bold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5"
            >
              Unsubscribe me
            </button>
          </form>
        ) : (
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full border border-[var(--color-blush)] px-6 py-3 font-bold text-[var(--color-berry)]"
          >
            Back home
          </Link>
        )}
      </div>
    </div>
  );
}
