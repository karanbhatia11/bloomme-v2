import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Bloomme Puja Flower Delivery",
  description:
    "Answers to common questions about Bloomme's puja flower subscription: delivery times, pausing, freshness, and pricing.",
  alternates: { canonical: "https://bloomme.co.in/faq" },
  openGraph: {
    title: "FAQ — Bloomme Puja Flower Delivery",
    description:
      "Answers to common questions about Bloomme's puja flower subscription: delivery times, pausing, freshness, and pricing.",
    url: "https://bloomme.co.in/faq",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Bloomme Puja Flower Delivery",
    description: "Common questions about Bloomme's puja flower subscription, delivery times, and pricing.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: "https://bloomme.co.in/faq" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
