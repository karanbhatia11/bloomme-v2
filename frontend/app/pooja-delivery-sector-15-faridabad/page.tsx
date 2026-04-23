import Link from "next/link";
import { Metadata } from "next";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Online Pooja Flower Delivery in Sector 15 Faridabad — Bloomme",
  description: "Fresh puja flowers delivered in Sector 15 Faridabad before 7:30 AM daily. Marigolds, jasmine, malas & puja essentials. Subscribe from ₹59/day — no daily ordering.",
  keywords: "pooja flower delivery Sector 15 Faridabad, puja flowers Sector 15, online pooja delivery Faridabad Sector 15, flower subscription Faridabad",
  alternates: { canonical: "https://bloomme.co.in/pooja-delivery-sector-15-faridabad" },
  openGraph: {
    title: "Online Pooja Flower Delivery in Sector 15 Faridabad — Bloomme",
    description: "Fresh puja flowers in Sector 15 Faridabad before 7:30 AM. Subscribe from ₹59/day.",
    url: "https://bloomme.co.in/pooja-delivery-sector-15-faridabad",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function Sector15Page() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">

        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <span className="text-on-surface">Pooja Delivery — Sector 15 Faridabad</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">
          Online Pooja Flower Delivery in Sector 15, Faridabad
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
          Bloomme brings fresh puja flowers — genda, mogra, rose petals, and malas — to homes in Sector 15 Faridabad every morning before your pooja starts. Subscribe once and your daily pooja ke phool arrive automatically, sourced fresh that morning, packed in eco-friendly packaging.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "📍", title: "Delivery Area", detail: "Sector 15, Sector 15A, Sector 15B, Faridabad and surrounding areas" },
            { icon: "⏰", title: "Delivery Time", detail: "Early morning before your pooja starts — flowers ready when you wake up" },
            { icon: "💰", title: "From ₹59/day", detail: "Monthly subscription — choose your days, pause anytime" },
          ].map(({ icon, title, detail }) => (
            <div key={title} className="bg-surface-container-lowest rounded-xl p-6 text-center">
              <span className="text-3xl mb-3 block">{icon}</span>
              <p className="font-semibold text-on-surface mb-1">{title}</p>
              <p className="text-on-surface-variant text-sm">{detail}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-4">Pooja Flowers Delivered in Sector 15</h2>
        <ul className="space-y-2 mb-8">
          {["Marigolds (genda phool) — loose, fresh-picked", "Jasmine (mogra/chameli)", "Rose petals (100g)", "Flower malas — normal and larger size", "Lotus flowers (add-on)", "Festival special flower arrangements"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-on-surface-variant">
              <span className="text-primary text-lg">✓</span> {item}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-on-surface mb-4">Bloomme vs Your Local Phool Wala — Sector 15</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-4 text-left font-semibold text-on-surface-variant">Feature</th>
                <th className="p-4 text-left font-semibold text-primary">Bloomme</th>
                <th className="p-4 text-left font-semibold text-on-surface-variant">Local Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {[
                ["Delivery time", "Early morning, before your pooja", "Unpredictable"],
                ["Flower freshness", "Same-day sourced", "Often day-old"],
                ["Flower variety", "Rotating weekly", "Same every day"],
                ["Skip/pause", "Yes, anytime", "Not possible"],
                ["Festival coverage", "Always on time", "Often skips"],
                ["Packaging", "Eco-friendly paper", "Plastic bags"],
              ].map(([feature, bloomme, vendor]) => (
                <tr key={feature}>
                  <td className="p-4 text-on-surface-variant">{feature}</td>
                  <td className="p-4 text-on-surface font-medium">{bloomme}</td>
                  <td className="p-4 text-on-surface-variant">{vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-primary-container rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-on-primary-container mb-2">Subscribe for Daily Pooja Flowers in Sector 15, Faridabad</h3>
          <p className="text-on-primary-container/80 text-sm mb-6">Plans from ₹59/day • Delivered before your pooja starts • Pause anytime</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plans" className="bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              View Plans
            </Link>
            <Link href="/signup" className="bg-surface-container text-primary px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
