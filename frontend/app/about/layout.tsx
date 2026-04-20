import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Bloomme — Puja Flower Delivery in Faridabad | Our Story",
  description:
    "Bloomme delivers fresh puja flowers every morning in Faridabad before sunrise. Learn how we're replacing unreliable local vendors with a guaranteed subscription service from ₹59/day.",
  alternates: { canonical: "https://bloomme.co.in/about" },
  openGraph: {
    title: "About Bloomme — Puja Flower Delivery in Faridabad | Our Story",
    description:
      "Bloomme delivers fresh puja flowers every morning in Faridabad before sunrise. Learn how we're replacing unreliable vendors with guaranteed subscription delivery.",
    url: "https://bloomme.co.in/about",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Bloomme — Puja Flower Delivery in Faridabad | Our Story",
    description: "How Bloomme is replacing unreliable vendors with guaranteed daily puja flower delivery in Faridabad.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About Bloomme",
        url: "https://bloomme.co.in/about",
        description:
          "How Bloomme is bringing daily fresh puja flowers to devotees in Faridabad, Haryana.",
        isPartOf: { "@type": "WebSite", url: "https://bloomme.co.in" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
          { "@type": "ListItem", position: 2, name: "About", item: "https://bloomme.co.in/about" },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
