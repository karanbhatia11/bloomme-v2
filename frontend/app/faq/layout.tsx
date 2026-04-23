import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Pooja Flower Delivery Faridabad FAQ — Bloomme",
  description:
    "Answers to common questions about online pooja / puja flower delivery in Faridabad. Delivery times (5:30–7:30 AM), pricing from ₹59/day, how to subscribe, pausing, and freshness guarantee.",
  keywords: "online pooja delivery Faridabad, pooja flower delivery, puja flowers Faridabad, daily pooja phool delivery, pooja ke phool, flower subscription Faridabad",
  alternates: { canonical: "https://bloomme.co.in/faq" },
  openGraph: {
    title: "Online Pooja Flower Delivery Faridabad FAQ — Bloomme",
    description:
      "Answers about online pooja flower delivery in Faridabad: delivery times, pricing from ₹59/day, subscriptions, and freshness.",
    url: "https://bloomme.co.in/faq",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Pooja Flower Delivery Faridabad FAQ — Bloomme",
    description: "Common questions about online pooja flower delivery in Faridabad: times, pricing, subscriptions.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://bloomme.co.in/faq" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where can I get online pooja flower delivery in Faridabad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bloomme (bloomme.co.in) is Faridabad's dedicated online pooja flower delivery service. Subscribe for daily delivery of fresh pooja flowers — marigolds, jasmine, rose petals, and malas — delivered before 7:30 AM every morning. Plans start from ₹59/day.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a daily pooja phool delivery service in Faridabad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Bloomme delivers fresh pooja phool (puja flowers) daily in Faridabad, Haryana. Choose your subscription plan, select delivery days, and receive hand-picked flowers at your doorstep between 5:30–7:30 AM. Currently serving NIT, Sector 15, Greenfield Colony, Sainik Colony, and surrounding areas.",
      },
    },
    {
      "@type": "Question",
      name: "What is Bloomme?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bloomme is an online pooja and puja flower delivery subscription service in Faridabad. We deliver fresh, hygienic flowers to your doorstep early morning before your daily prayers. Unlike local vendors, Bloomme guarantees on-time delivery, rotating flower varieties, and eco-friendly packaging — starting from ₹59/day.",
      },
    },
    {
      "@type": "Question",
      name: "What time are pooja flowers delivered?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pooja flowers are delivered between 5:30 AM – 7:30 AM daily, ensuring they are ready before morning prayers.",
      },
    },
    {
      "@type": "Question",
      name: "How much does online pooja flower delivery cost in Faridabad?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bloomme's online pooja delivery plans start from ₹59/day (Traditional plan). The Divine plan is ₹89/day and the Celestial plan is ₹179/day. All plans include free delivery.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pause my pooja flower subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can pause your subscription anytime if travelling or temporarily not requiring deliveries, and resume whenever you like with no extra charges.",
      },
    },
    {
      "@type": "Question",
      name: "Which areas in Faridabad does Bloomme deliver to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bloomme currently delivers pooja flowers in Faridabad including NIT areas, Sector 15, Sector 16, Sector 17, Greenfield Colony, Sainik Colony, and nearby localities. Coverage is expanding to more Faridabad sectors.",
      },
    },
    {
      "@type": "Question",
      name: "What pooja flowers and items does Bloomme deliver?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bloomme delivers marigolds (genda phool), jasmine (mogra/chameli), rose petals, seasonal puja flowers, and flower malas (garlands). Add-ons include lotus flowers, agarbatti (incense sticks), diya, and cotton batti.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize my pooja flowers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Bloomme allows limited customization. You can request a specific flower on a particular day, provided we receive the request at least 24 hours in advance.",
      },
    },
    {
      "@type": "Question",
      name: "Is Bloomme environmentally friendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we use eco-friendly packaging: paper bags, recyclable materials, and minimal plastic. We are also developing a flower return program for sustainable disposal.",
      },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
