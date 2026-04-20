import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Puja Flower Subscription Faridabad — From ₹59/day | Bloomme",
  description:
    "Subscribe to daily puja flower delivery in Faridabad from ₹59/day. Choose from Traditional, Divine, or Celestial plans. Flowers at your door by 7:30 AM.",
  alternates: { canonical: "https://bloomme.co.in/plans" },
  openGraph: {
    title: "Puja Flower Subscription Faridabad — From ₹59/day | Bloomme",
    description:
      "Daily puja flowers in Faridabad from ₹59/day. Traditional, Divine, and Celestial plans. Delivered before 7:30 AM every morning.",
    url: "https://bloomme.co.in/plans",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puja Flower Subscription Faridabad — From ₹59/day | Bloomme",
    description: "Daily puja flower subscription from ₹59/day. Delivered by 7:30 AM in Faridabad.",
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
