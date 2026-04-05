import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Bloomme",
  description:
    "Read Bloomme's privacy policy to understand how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://bloomme.co.in/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
