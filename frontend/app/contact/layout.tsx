import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Bloomme — Get in Touch",
  description:
    "Reach out to Bloomme for support, partnership, or feedback. We deliver daily puja flowers across Faridabad, Haryana.",
  alternates: { canonical: "https://bloomme.co.in/contact" },
  openGraph: {
    title: "Contact Bloomme — Get in Touch",
    description:
      "Reach out to Bloomme for support, partnership, or feedback. We deliver daily puja flowers across Faridabad, Haryana.",
    url: "https://bloomme.co.in/contact",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Bloomme — Get in Touch",
    description: "Reach out to Bloomme for support, partnership, or feedback.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact Bloomme",
        url: "https://bloomme.co.in/contact",
        description: "Get in touch with Bloomme for support, partnership, or feedback.",
        isPartOf: { "@type": "WebSite", url: "https://bloomme.co.in" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
          { "@type": "ListItem", position: 2, name: "Contact", item: "https://bloomme.co.in/contact" },
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
