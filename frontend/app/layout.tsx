import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Bloomme | Daily Fresh Puja Flowers & Essentials Delivered Before Sunrise",
  description:
    "Bloomme delivers hand-picked, fresh puja flowers and spiritual essentials to your doorstep every morning. Subscribe for a daily start.",
  keywords:
    "puja flowers, daily flower delivery, spiritual essentials, fresh flowers, Hindu rituals, Bloomme subscription",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-surface text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}
