import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buddh Purnima 2026 Puja Guide & Shanti Samagri List — Bloomme Faridabad",
  description: "Complete Buddh Purnima 2026 guide for Faridabad devotees: Shanti Puja samagri list (white flowers, jasmine, diya), step-by-step ritual, and online puja kit delivery before 7:30 AM on 1 May.",
  keywords: "Buddh Purnima 2026, Buddha Purnima puja samagri, Shanti Puja Kit, puja samagri delivery Faridabad, white flowers puja, jasmine puja, Buddha Jayanti 2026 Faridabad",
  alternates: { canonical: "https://bloomme.co.in/blog/buddh-purnima-2026-puja-guide" },
  openGraph: {
    title: "Buddh Purnima 2026 Puja Guide & Shanti Samagri List — Bloomme Faridabad",
    description: "Complete samagri list and puja guide for Buddh Purnima 1 May 2026. Get your Shanti Puja Kit delivered in Faridabad before sunrise.",
    url: "https://bloomme.co.in/blog/buddh-purnima-2026-puja-guide",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan1.jpeg", width: 1122, height: 1402 }],
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buddh Purnima 2026 Puja Guide — Bloomme Faridabad",
    description: "Shanti Puja samagri list + online puja kit delivery in Faridabad before 7:30 AM on 1 May 2026.",
    images: ["https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan1.jpeg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Buddh Purnima 2026: Complete Shanti Puja Guide & Samagri List for Faridabad Devotees",
    description: "Complete guide for Shanti Puja on Buddh Purnima 2026 — samagri list, vidhi, and online puja kit delivery in Faridabad.",
    datePublished: "2026-04-24",
    dateModified: "2026-04-24",
    author: { "@type": "Organization", name: "Bloomme", url: "https://bloomme.co.in" },
    publisher: {
      "@type": "Organization",
      name: "Bloomme",
      url: "https://bloomme.co.in",
      logo: { "@type": "ImageObject", url: "https://bloomme.co.in/images/backgroundlesslogo.png" },
    },
    url: "https://bloomme.co.in/blog/buddh-purnima-2026-puja-guide",
    image: "https://bloomme.co.in/images/Festivals/23April-Update/FestivalPlan1.jpeg",
    keywords: "Buddh Purnima 2026, Buddha Purnima puja, shanti puja samagri, online pooja delivery Faridabad",
    inLanguage: "en-IN",
    about: { "@type": "Thing", name: "Buddh Purnima", description: "Hindu-Buddhist festival celebrating the birth, enlightenment, and nirvana of Gautama Buddha" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When is Buddh Purnima 2026?",
        acceptedAnswer: { "@type": "Answer", text: "Buddh Purnima 2026 falls on 1 May 2026 (Friday). It is celebrated on the full moon day of Vaishakha month — considered the most auspicious of all Purnimas." },
      },
      {
        "@type": "Question",
        name: "What samagri is needed for Buddh Purnima puja?",
        acceptedAnswer: { "@type": "Answer", text: "Buddh Purnima Shanti Puja samagri includes: white flowers (jasmine, white rose), mild fragrance incense sticks, diya and cotton batti, roli and chawal, mishri or fruits (optional), and a special Bloomme launch gift included in the kit." },
      },
      {
        "@type": "Question",
        name: "Can I get Shanti Puja samagri delivered in Faridabad on Buddh Purnima?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Bloomme delivers Shanti Puja Kits in Faridabad before 7:30 AM on Buddh Purnima 2026 (1 May). The kit includes fresh white flowers, diya, incense, and all essential samagri." },
      },
      {
        "@type": "Question",
        name: "Why are white flowers used in Buddh Purnima puja?",
        acceptedAnswer: { "@type": "Answer", text: "White is the colour of purity, peace, and wisdom — qualities most associated with the Buddha and this auspicious Purnima. Jasmine and white roses carry a gentle, sattvic fragrance that elevates the puja atmosphere. Avoid strong or dark-coloured flowers for Shanti puja on this day." },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://bloomme.co.in/blog" },
      { "@type": "ListItem", position: 3, name: "Buddh Purnima 2026 Puja Guide", item: "https://bloomme.co.in/blog/buddh-purnima-2026-puja-guide" },
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
