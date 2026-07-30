import type { Metadata } from "next";
import { Fredoka, Nunito, Outfit } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { defaultOgImage, siteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-title",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-menu",
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | Custom Pet Birthday Cakes Brisbane`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${siteConfig.name} | Custom Pet Birthday Cakes Brisbane`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: "/",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Happy's Cake custom pet birthday cake banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Custom Pet Birthday Cakes Brisbane`,
    description: siteConfig.description,
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${outfit.variable} ${nunito.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-[var(--color-cream)] text-[var(--color-ink)]">
        <div className="relative flex min-h-full flex-col overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(circle_at_top_left,_rgba(255,167,196,0.35),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(255,227,143,0.45),_transparent_40%),linear-gradient(180deg,_#fff7ef_0%,_#fffdfb_60%,_#fff7ef_100%)]" />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
