"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const socialItems = [
  {
    id: "instagram",
    label: "Instagram",
    qrSrc: "/Social/ins_barcode.png",
    iconSrc: "/Social/ins.png",
    iconAlt: "Instagram",
    pageUrl:
      "https://www.instagram.com/happyscake_petbakery?igsh=a2lubGp6cTcxb3F1&utm_source=qr",
  },
  {
    id: "rednote",
    label: "小红书",
    qrSrc: "/Social/rednote_barcode.jpg",
    iconSrc: "/Social/rednote.png",
    iconAlt: "小红书",
    pageUrl: "https://xhslink.com/m/4GRDzeOCogy",
  },
  {
    id: "wechat",
    label: "微信",
    qrSrc: "/Social/wechat_barcode.jpg",
    iconSrc: "/Social/wechat.png",
    iconAlt: "微信",
  },
] as const;

type SocialItem = (typeof socialItems)[number];

export function SocialQrModal() {
  const [activeSocial, setActiveSocial] = useState<SocialItem | null>(null);

  return (
    <>
      <div className="flex gap-3">
        {socialItems.map((social) => (
          <button
            key={social.id}
            type="button"
            onClick={() => setActiveSocial(social)}
            aria-label={`Show ${social.label} QR code`}
            className="relative flex size-12 items-center justify-center transition hover:-translate-y-0.5 hover:scale-105"
          >
            <Image
              src={social.iconSrc}
              alt={social.iconAlt}
              fill
              sizes="48px"
              unoptimized
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {activeSocial
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] grid h-dvh w-dvw place-items-center overflow-y-auto bg-[#4f2f23]/45 px-4 py-8 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={`${activeSocial.label} QR code`}
              onClick={() => setActiveSocial(null)}
            >
              <div
                className="relative w-full max-w-md rounded-[32px] border-4 border-white bg-[#fffaf1] p-5 text-center shadow-[0_24px_70px_rgba(79,47,35,0.22)]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveSocial(null)}
                  aria-label="Close social QR modal"
                  className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white text-[var(--color-cocoa)] shadow-sm transition hover:bg-[var(--color-blush)]"
                >
                  <X size={18} />
                </button>

                <p className="font-display text-2xl font-black text-[var(--color-cocoa)]">
                  Follow us on {activeSocial.label}
                </p>
                <p className="mt-2 text-sm text-[var(--color-cocoa)]/80">
                  Scan the QR code to connect with Happy&apos;s Cake.
                </p>

                <div className="mt-6 flex aspect-square items-center justify-center rounded-[26px] bg-white p-3 shadow-inner">
                  <Image
                    src={activeSocial.qrSrc}
                    alt={`${activeSocial.label} QR code`}
                    width={420}
                    height={420}
                    unoptimized
                    className="max-h-full max-w-full rounded-[18px] object-contain"
                  />
                </div>

                {"pageUrl" in activeSocial ? (
                  <a
                    href={activeSocial.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-berry)] px-7 font-display text-sm font-black uppercase tracking-[0.04em] text-white shadow-[0_10px_18px_rgba(236,127,169,0.22)] transition hover:-translate-y-0.5"
                  >
                    Visit page
                  </a>
                ) : null}
              </div>
            </div>,
          document.body,
        )
        : null}
    </>
  );
}
