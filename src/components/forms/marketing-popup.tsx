"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "happy-cake-marketing-popup";
const DISMISS_DAYS = 7;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

type PopupState = {
  dismissedUntil?: number;
  registeredAt?: number;
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

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const state = readPopupState();
    const now = Date.now();

    if (state.registeredAt) {
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
  }

  function goToRegister() {
    window.location.href = "/register";
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
            Create an account and get a free cookie with your first cake order!
          </h2>
          <p className="mt-4 max-w-lg text-base leading-8 text-[var(--color-cocoa)]">
            Save your details for easier ordering, birthday reminders, and sweet
            little treats for your fur baby.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={goToRegister}
            className="w-full rounded-[22px] bg-[var(--color-butter)] px-5 py-4 text-lg font-extrabold uppercase tracking-[0.18em] text-[var(--color-ink)] shadow-lg shadow-yellow-200/60 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            Create account
          </button>

          <button
            type="button"
            onClick={dismissForSevenDays}
            className="w-full text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-cocoa)] transition hover:text-[var(--color-berry)]"
          >
            No, thanks
          </button>

          <p className="rounded-[20px] bg-white/85 px-4 py-3 text-sm text-[var(--color-cocoa)]">
            Already have an account? Log in and this popup will stay tucked away.
          </p>
        </div>
      </div>
    </div>
  );
}
