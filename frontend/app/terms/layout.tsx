import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Bloomme",
  description:
    "Read Bloomme's terms of service governing your use of our puja flower subscription delivery service.",
  alternates: { canonical: "https://bloomme.co.in/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
