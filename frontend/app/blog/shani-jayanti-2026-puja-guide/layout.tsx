import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shani Jayanti 2026 Puja Guide & Samagri List — Bloomme Faridabad",
  description: "Complete Shani Jayanti 2026 guide for Faridabad devotees: Shani Dev puja samagri list (kala til, blue flowers, diya), step-by-step ritual, and online puja kit delivery before 7:30 AM.",
  keywords: "Shani Jayanti 2026, Shani Dev puja samagri, Shani Jayanti puja vidhi, online puja kit delivery Faridabad, pooja samagri delivery Faridabad, kala til puja, Shani puja kit",
  alternates: { canonical: "https://bloomme.co.in/blog/shani-jayanti-2026-puja-guide" },
  openGraph: {
    title: "Shani Jayanti 2026 Puja Guide & Samagri List — Bloomme Faridabad",
    description: "Complete samagri list and puja guide for Shani Jayanti 16 May 2026. Get your Shani Puja Kit delivered in Faridabad before sunrise.",
    url: "https://bloomme.co.in/blog/shani-jayanti-2026-puja-guide",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shani Jayanti 2026 Puja Guide — Bloomme Faridabad",
    description: "Shani Dev puja samagri list + online puja kit delivery in Faridabad before 7:30 AM.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Shani Jayanti 2026: Complete Puja Guide & Samagri List for Faridabad Devotees",
    description: "Complete guide for Shani Dev puja on Shani Jayanti 2026 — samagri list, vidhi, and online puja kit delivery in Faridabad.",
    datePublished: "2026-04-24",
    dateModified: "2026-04-24",
    author: { "@type": "Organization", name: "Bloomme", url: "https://bloomme.co.in" },
    publisher: {
      "@type": "Organization",
      name: "Bloomme",
      url: "https://bloomme.co.in",
      logo: { "@type": "ImageObject", url: "https://bloomme.co.in/images/backgroundlesslogo.png" },
    },
    url: "https://bloomme.co.in/blog/shani-jayanti-2026-puja-guide",
    image: "https://bloomme.co.in/images/backgroundlesslogo.png",
    keywords: "Shani Jayanti 2026, Shani Dev puja, puja samagri, online pooja delivery Faridabad",
    inLanguage: "en-IN",
    about: { "@type": "Thing", name: "Shani Jayanti", description: "Hindu festival celebrating the birth of Lord Shani Dev" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When is Shani Jayanti 2026?",
        acceptedAnswer: { "@type": "Answer", text: "Shani Jayanti 2026 falls on 16 May 2026 (Saturday). It is one of the most auspicious days to worship Lord Shani Dev." },
      },
      {
        "@type": "Question",
        name: "What samagri is needed for Shani Dev puja?",
        acceptedAnswer: { "@type": "Answer", text: "Shani Dev puja samagri includes: kala til (black sesame), blue or dark flowers (neelkamal, nilotpala), diya and batti, roli and chawal, incense (agarbatti), and optionally sarson ka tel (mustard oil) for anointing." },
      },
      {
        "@type": "Question",
        name: "Can I get Shani puja samagri delivered in Faridabad?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Bloomme delivers Shani Puja Kits in Faridabad before 7:30 AM on Shani Jayanti 2026. The kit includes all essential samagri so your puja is complete and correct." },
      },
      {
        "@type": "Question",
        name: "Why should I not do incomplete puja on Shani Jayanti?",
        acceptedAnswer: { "@type": "Answer", text: "Shani Jayanti is one of the most powerful days in the Hindu calendar. According to tradition, an incomplete or incorrect puja on this day can displease Shani Dev rather than propitiate him. All prescribed samagri — especially kala til — must be present for the puja to be considered complete." },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://bloomme.co.in/blog" },
      { "@type": "ListItem", position: 3, name: "Shani Jayanti 2026 Puja Guide", item: "https://bloomme.co.in/blog/shani-jayanti-2026-puja-guide" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
