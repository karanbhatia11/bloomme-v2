import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloomme Blog — Puja Flowers, Festivals & Daily Rituals | Faridabad",
  description: "Tips on daily puja rituals, festival flower guides, and pooja samagri for Faridabad devotees. Expert advice from Bloomme — Faridabad's online pooja flower delivery service.",
  alternates: { canonical: "https://bloomme.co.in/blog" },
  openGraph: {
    title: "Bloomme Blog — Puja Flowers, Festivals & Daily Rituals",
    description: "Puja guides, festival flower tips, and pooja samagri lists from Bloomme Faridabad.",
    url: "https://bloomme.co.in/blog",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Bloomme Blog",
    description: "Puja flower guides, festival rituals, and pooja samagri tips for Faridabad devotees.",
    url: "https://bloomme.co.in/blog",
    publisher: { "@type": "Organization", name: "Bloomme", url: "https://bloomme.co.in" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
