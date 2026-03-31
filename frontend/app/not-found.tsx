import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Bloomme",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <span className="material-symbols-outlined text-[120px] text-primary opacity-30">
          local_florist
        </span>
      </div>
      <h1 className="text-6xl font-bold text-on-background mb-4">404</h1>
      <h2 className="text-2xl font-display text-on-surface-variant mb-4">
        This page has bloomed away
      </h2>
      <p className="text-on-surface-variant max-w-md mb-10">
        The page you are looking for could not be found. It may have moved or
        never existed. Let us guide you back home.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
        <Link
          href="/plans"
          className="border border-outline text-on-surface px-8 py-3 rounded-xl font-semibold hover:bg-surface-container transition-colors"
        >
          View Plans
        </Link>
        <Link
          href="/faq"
          className="border border-outline text-on-surface px-8 py-3 rounded-xl font-semibold hover:bg-surface-container transition-colors"
        >
          FAQ
        </Link>
      </div>
    </main>
  );
}
