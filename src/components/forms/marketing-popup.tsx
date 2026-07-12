"use client";

import { X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const STORAGE_KEY = "happy-cake-marketing-popup";
const DISMISS_DAYS = 7;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

type PopupState = {
  dismissedUntil?: number;
  subscribedAt?: number;
};

type MarketingPopupProps = {
  enabled: boolean;
};

function readPopupState() {
  if (typeof window === "undefined") {
    return {} satisfies PopupState;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return {} satisfies PopupState;
    }

    return JSON.parse(rawValue) as PopupState;
  } catch {
    return {} satisfies PopupState;
  }
}

function savePopupState(nextState: PopupState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function MarketingPopup({ enabled }: MarketingPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const state = readPopupState();
    const now = Date.now();

    if (state.subscribedAt) {
      return;
    }

    if (state.dismissedUntil && state.dismissedUntil > now) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismissForSevenDays();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  function dismissForSevenDays() {
    const state = readPopupState();

    savePopupState({
      ...state,
      dismissedUntil: Date.now() + DISMISS_MS,
    });

    setIsOpen(false);
    setStatus("");
  }

  async function subscribe() {
    setStatus("");

    const response = await fetch("/api/marketing/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error ?? "Unable to save your signup right now.");
      return;
    }

    savePopupState({
      subscribedAt: Date.now(),
    });

    setStatus("You're in! We'll keep you posted on new treats and offers.");
    window.setTimeout(() => {
      setIsOpen(false);
      setStatus("");
    }, 1200);
  }

  if (!enabled || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,45,42,0.45)] px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(255,247,239,0.96))] p-6 shadow-[0_30px_80px_rgba(58,45,42,0.28)] md:p-8">
        <button
          type="button"
          onClick={dismissForSevenDays}
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-[var(--color-blush)] bg-white/85 text-[var(--color-berry)] transition hover:scale-105"
          aria-label="Close signup popup"
        >
          <X size={22} />
        </button>

        <div className="pointer-events-none absolute -right-8 top-14 rotate-[18deg] text-5xl opacity-20">
          🦴
        </div>
        <div className="pointer-events-none absolute right-10 top-28 text-4xl opacity-20">
          🐾
        </div>
        <div className="pointer-events-none absolute -left-4 bottom-10 text-4xl opacity-20">
          🎂
        </div>

        <div className="pr-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-cocoa)]">
            Welcome treat
          </p>
          <h2 className="section-title mt-3 text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
            Want first access to cute drops and birthday deals?
          </h2>
          <p className="mt-4 max-w-lg text-base leading-8 text-[var(--color-cocoa)]">
            Join the email list for new product launches, seasonal promos, and
            special offers for pet birthdays.
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => void subscribe());
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-[22px] border border-[var(--color-blush)] bg-white px-5 py-4 text-lg outline-none transition focus:border-[var(--color-berry)]"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-[22px] bg-[var(--color-butter)] px-5 py-4 text-lg font-extrabold uppercase tracking-[0.18em] text-[var(--color-ink)] shadow-lg shadow-yellow-200/60 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Sign me up"}
          </button>

          <button
            type="button"
            onClick={dismissForSevenDays}
            className="w-full text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-cocoa)] transition hover:text-[var(--color-berry)]"
          >
            No, thanks
          </button>

          {status ? (
            <p className="rounded-[20px] bg-white/85 px-4 py-3 text-sm text-[var(--color-cocoa)]">
              {status}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
