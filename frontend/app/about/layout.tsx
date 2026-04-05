import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Bloomme | Our Story and Mission",
  description:
    "How Bloomme is bringing daily fresh puja flower delivery to devotees in Faridabad. Learn our mission to make every morning ritual effortless.",
  alternates: { canonical: "https://bloomme.co.in/about" },
  openGraph: {
    title: "About Bloomme | Our Story and Mission",
    description:
      "How Bloomme is bringing daily fresh puja flowers to devotees. Meet the team and learn our mission to connect homes to the divine.",
    url: "https://bloomme.co.in/about",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Bloomme | Our Story and Mission",
    description: "How Bloomme is bringing daily fresh puja flowers to devotees.",
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
