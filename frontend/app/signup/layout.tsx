import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Start Your Bloomme Subscription",
  description:
    "Join Bloomme and get fresh puja flowers delivered to your doorstep every morning from ₹59/day. Serving Faridabad, Haryana.",
  alternates: { canonical: "https://bloomme.co.in/signup" },
  openGraph: {
    title: "Sign Up — Start Your Bloomme Subscription",
    description:
      "Join Bloomme and get fresh puja flowers delivered to your doorstep every morning from ₹59/day.",
    url: "https://bloomme.co.in/signup",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
