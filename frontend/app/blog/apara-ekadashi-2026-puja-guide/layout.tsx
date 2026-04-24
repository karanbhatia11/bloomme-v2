import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apara Ekadashi 2026 Puja Guide & Bhakti Samagri List — Bloomme Faridabad",
  description: "Complete Apara Ekadashi 2026 guide for Faridabad devotees: Ekadashi Bhakti Kit samagri list (tulsi leaves, fresh flowers, diya), step-by-step puja vidhi, and online samagri delivery before 7:30 AM on 13 May.",
  keywords: "Apara Ekadashi 2026, Ekadashi puja samagri, Ekadashi tulsi leaves, Bhakti Kit Faridabad, puja samagri delivery Faridabad, Ekadashi vrat samagri, fresh tulsi delivery Faridabad, Apara Ekadashi vidhi",
  alternates: { canonical: "https://bloomme.co.in/blog/apara-ekadashi-2026-puja-guide" },
  openGraph: {
    title: "Apara Ekadashi 2026 Puja Guide & Bhakti Samagri List — Bloomme Faridabad",
    description: "Complete samagri list and puja guide for Apara Ekadashi 13 May 2026. Get your Ekadashi Bhakti Kit — fresh tulsi, flowers & essentials — delivered in Faridabad before sunrise.",
    url: "https://bloomme.co.in/blog/apara-ekadashi-2026-puja-guide",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan2.jpeg", width: 1149, height: 1369 }],
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apara Ekadashi 2026 Puja Guide — Bloomme Faridabad",
    description: "Ekadashi Bhakti Kit with fresh tulsi & flowers — delivered in Faridabad before 7:30 AM on 13 May 2026.",
    images: ["https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan2.jpeg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Apara Ekadashi 2026: Complete Puja Guide & Bhakti Samagri List for Faridabad Devotees",
    description: "Complete guide for Ekadashi puja on Apara Ekadashi 2026 — samagri list with tulsi, fresh flowers, and online Bhakti Kit delivery in Faridabad.",
    datePublished: "2026-04-24",
    dateModified: "2026-04-24",
    author: { "@type": "Organization", name: "Bloomme", url: "https://bloomme.co.in" },
    publisher: {
      "@type": "Organization",
      name: "Bloomme",
      url: "https://bloomme.co.in",
      logo: { "@type": "ImageObject", url: "https://bloomme.co.in/images/backgroundlesslogo.png" },
    },
    url: "https://bloomme.co.in/blog/apara-ekadashi-2026-puja-guide",
    image: "https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan2.jpeg",
    keywords: "Apara Ekadashi 2026, Ekadashi puja samagri, tulsi leaves puja, online pooja delivery Faridabad",
    inLanguage: "en-IN",
    about: { "@type": "Thing", name: "Apara Ekadashi", description: "Hindu fasting observance on the eleventh day of the Krishna Paksha of Jyeshtha month" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When is Apara Ekadashi 2026?",
        acceptedAnswer: { "@type": "Answer", text: "Apara Ekadashi 2026 falls on Wednesday, 13 May 2026. It is observed on the eleventh day (Ekadashi tithi) of the Krishna Paksha of Jyeshtha month." },
      },
      {
        "@type": "Question",
        name: "What samagri is needed for Apara Ekadashi puja?",
        acceptedAnswer: { "@type": "Answer", text: "Apara Ekadashi Bhakti Kit samagri includes: tulsi leaves (most important), fresh flowers, diya and cotton batti, roli and chawal, incense sticks, and mishri. Tulsi is considered essential — offering Lord Vishnu without tulsi is considered incomplete on any Ekadashi." },
      },
      {
        "@type": "Question",
        name: "Why is tulsi so important on Ekadashi?",
        acceptedAnswer: { "@type": "Answer", text: "Tulsi (holy basil) is the most beloved plant of Lord Vishnu, and Ekadashi is Vishnu's most sacred day. Offering tulsi on Ekadashi is considered equivalent to offering all other flowers combined. Without tulsi, an Ekadashi puja is considered incomplete." },
      },
      {
        "@type": "Question",
        name: "Can I get fresh tulsi and Ekadashi samagri delivered in Faridabad?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Bloomme delivers Ekadashi Bhakti Kits in Faridabad before 7:30 AM on 13 May 2026 — including fresh tulsi leaves, flowers, diya, incense, roli-chawal, and mishri. Fresh tulsi is often the hardest item to source on short notice, which is why Bloomme ensures it is always available in the kit." },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://bloomme.co.in/blog" },
      { "@type": "ListItem", position: 3, name: "Apara Ekadashi 2026 Puja Guide", item: "https://bloomme.co.in/blog/apara-ekadashi-2026-puja-guide" },
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
