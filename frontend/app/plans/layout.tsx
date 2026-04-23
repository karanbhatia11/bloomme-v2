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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bloomme.co.in" },
    { "@type": "ListItem", position: 2, name: "Subscription Plans", item: "https://bloomme.co.in/plans" },
  ],
};

const productListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Traditional Plan",
        description: "Daily puja essentials — loose marigolds and jasmine",
        image: "https://bloomme.co.in/images/Traditional_Updated.jpg",
        url: "https://bloomme.co.in/plans",
        brand: { "@type": "Brand", name: "Bloomme" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "124",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "Offer",
          price: "59",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://bloomme.co.in/plans",
          seller: { "@type": "Organization", name: "Bloomme" },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            merchantReturnDays: 0,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN", addressRegion: "HR" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
            },
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Divine Plan",
        description: "Comprehensive ritual coverage with malas and seasonal flowers",
        image: "https://bloomme.co.in/images/Divine_Updated.jpg",
        url: "https://bloomme.co.in/plans",
        brand: { "@type": "Brand", name: "Bloomme" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "98",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "Offer",
          price: "89",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://bloomme.co.in/plans",
          seller: { "@type": "Organization", name: "Bloomme" },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            merchantReturnDays: 0,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN", addressRegion: "HR" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
            },
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Celestial Plan",
        description: "The complete florist's atelier — premium arrangements daily",
        image: "https://bloomme.co.in/images/Celestial_Updated.jpg",
        url: "https://bloomme.co.in/plans",
        brand: { "@type": "Brand", name: "Bloomme" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "67",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "Offer",
          price: "179",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://bloomme.co.in/plans",
          seller: { "@type": "Organization", name: "Bloomme" },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            merchantReturnDays: 0,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN", addressRegion: "HR" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
            },
          },
        },
      },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }} />
      {children}
    </>
  );
}
