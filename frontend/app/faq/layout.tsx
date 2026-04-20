import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Puja Flower Delivery FAQ — Bloomme Faridabad",
  description:
    "Common questions about Bloomme's daily puja flower subscription in Faridabad: delivery times (5:30–7:30 AM), how to pause, freshness guarantee, and pricing from ₹59/day.",
  alternates: { canonical: "https://bloomme.co.in/faq" },
  openGraph: {
    title: "Puja Flower Delivery FAQ — Bloomme Faridabad",
    description:
      "Common questions about Bloomme's daily puja flower subscription in Faridabad: delivery times, pausing, freshness, and pricing from ₹59/day.",
    url: "https://bloomme.co.in/faq",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puja Flower Delivery FAQ — Bloomme Faridabad",
    description: "Common questions about puja flower delivery in Faridabad: times, pausing, freshness, pricing.",
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
