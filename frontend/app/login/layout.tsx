import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Bloomme",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
