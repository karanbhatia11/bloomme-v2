import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Start Daily Puja Flower Delivery in Faridabad | Bloomme",
  description:
    "Subscribe to Bloomme and get fresh puja flowers delivered in Faridabad every morning from ₹59/day. Takes 2 minutes. Cancel or pause anytime.",
  alternates: { canonical: "https://bloomme.co.in/signup" },
  openGraph: {
    title: "Sign Up — Start Daily Puja Flower Delivery in Faridabad | Bloomme",
    description:
      "Subscribe to Bloomme — fresh puja flowers delivered in Faridabad every morning from ₹59/day. Quick signup, pause anytime.",
    url: "https://bloomme.co.in/signup",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up — Start Daily Puja Flower Delivery in Faridabad | Bloomme",
    description: "Fresh puja flowers in Faridabad from ₹59/day. Quick signup, pause anytime.",
    images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
