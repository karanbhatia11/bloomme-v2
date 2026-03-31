import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { LayoutClient } from "./layout-client";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloomme — Daily Puja Flowers Delivered Before Sunrise",
  description:
    "Fresh puja flowers & essentials delivered to your doorstep between 5:30–7:30 AM every day. Subscribe from ₹59/day. Serving Faridabad.",
  keywords:
    "puja flowers, daily flower delivery, flower subscription, puja essentials, Faridabad flower delivery",
  metadataBase: new URL("https://bloomme.co.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bloomme — Daily Puja Flowers Delivered Before Sunrise",
    description:
      "Fresh puja flowers delivered every morning before your prayers. Subscribe from ₹59/day.",
    url: "https://bloomme.co.in",
    siteName: "Bloomme",
    images: [
      {
        url: "https://bloomme.co.in/images/backgroundlesslogo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloomme — Daily Puja Flowers Delivered Before Sunrise",
    description:
      "Fresh puja flowers delivered every morning before your prayers. Subscribe from ₹59/day.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Service",
                  name: "Daily Puja Flower Delivery Subscription",
                  description:
                    "Fresh puja flowers delivered to your doorstep between 5:30–7:30 AM every day. Subscribe to India's trusted daily flower delivery service starting from ₹59/day.",
                  provider: { "@type": "Organization", name: "Bloomme" },
                  areaServed: { "@type": "City", name: "Faridabad" },
                  serviceType: "Flower Delivery Subscription",
                  offers: {
                    "@type": "AggregateOffer",
                    lowPrice: "59",
                    highPrice: "179",
                    priceCurrency: "INR",
                  },
                },
                {
                  "@type": "Organization",
                  name: "Bloomme",
                  url: "https://bloomme.co.in",
                  logo: "https://bloomme.co.in/images/backgroundlesslogo.png",
                  description:
                    "Daily fresh puja flower subscription delivery service in India",
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "Customer Support",
                    telephone: "+919950707995",
                    areaServed: "IN",
                  },
                  sameAs: ["https://instagram.com/bloomme"],
                },
                {
                  "@type": "LocalBusiness",
                  name: "Bloomme",
                  image:
                    "https://bloomme.co.in/images/backgroundlesslogo.png",
                  url: "https://bloomme.co.in",
                  telephone: "+919950707995",
                  priceRange: "₹59–₹179/day",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Faridabad",
                    addressRegion: "Haryana",
                    addressCountry: "IN",
                  },
                  openingHoursSpecification: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ],
                    opens: "05:30",
                    closes: "19:00",
                  },
                  areaServed: { "@type": "City", name: "Faridabad" },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    ratingCount: "3",
                    bestRating: "5",
                  },
                },
                {
                  "@type": "WebSite",
                  name: "Bloomme",
                  url: "https://bloomme.co.in",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://bloomme.co.in/faq?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-surface text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
