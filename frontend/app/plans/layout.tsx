import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Puja Flower Subscription Plans — Bloomme",
  description:
    "Choose a daily puja flower subscription from ₹59/day. Traditional, Divine, and Celestial plans with morning delivery in Faridabad.",
  alternates: { canonical: "https://bloomme.co.in/plans" },
  openGraph: {
    title: "Puja Flower Subscription Plans — Bloomme",
    description:
      "Choose a daily puja flower subscription from ₹59/day. Traditional, Divine, and Celestial plans with morning delivery in Faridabad.",
    url: "https://bloomme.co.in/plans",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puja Flower Subscription Plans — Bloomme",
    description: "Daily puja flower subscription from ₹59/day. Morning delivery in Faridabad.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
      { "@type": "ListItem", position: 2, name: "Subscription Plans", item: "https://bloomme.co.in/plans" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
