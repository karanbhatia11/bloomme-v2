import Link from "next/link";
import { Metadata } from "next";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Online Pooja Flower Delivery in NIT Faridabad — Bloomme",
  description: "Get fresh puja flowers delivered to your door in NIT Faridabad every morning before 7:30 AM. Marigolds, jasmine, rose petals & malas. Subscribe from ₹59/day.",
  keywords: "pooja flower delivery NIT Faridabad, puja flowers NIT, online pooja delivery NIT Faridabad, flower subscription NIT Faridabad",
  alternates: { canonical: "https://bloomme.co.in/pooja-delivery-nit-faridabad" },
  openGraph: {
    title: "Online Pooja Flower Delivery in NIT Faridabad — Bloomme",
    description: "Fresh puja flowers delivered in NIT Faridabad before 7:30 AM. Subscribe from ₹59/day.",
    url: "https://bloomme.co.in/pooja-delivery-nit-faridabad",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function NITFaridabadPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">

        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <span className="text-on-surface">Pooja Delivery — NIT Faridabad</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">
          Online Pooja Flower Delivery in NIT Faridabad
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
          Bloomme delivers fresh puja flowers — marigolds (genda), jasmine (mogra), rose petals, and flower malas — directly to homes in NIT Faridabad every morning before your pooja starts. No market visits. No missed deliveries. Just fresh pooja ke phool at your door when you need them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "🌸", title: "Coverage Area", detail: "NIT 1, NIT 2, NIT 3, NIT 4, NIT 5 — and surrounding sectors" },
            { icon: "⏰", title: "Delivery Time", detail: "Every morning before your pooja starts — so your flowers are ready when you are" },
            { icon: "💰", title: "Starting Price", detail: "From ₹59/day — subscribe monthly, choose your delivery days" },
          ].map(({ icon, title, detail }) => (
            <div key={title} className="bg-surface-container-lowest rounded-xl p-6 text-center">
              <span className="text-3xl mb-3 block">{icon}</span>
              <p className="font-semibold text-on-surface mb-1">{title}</p>
              <p className="text-on-surface-variant text-sm">{detail}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-4">What We Deliver in NIT Faridabad</h2>
        <ul className="space-y-2 mb-8">
          {["Loose marigolds (genda phool)", "Jasmine (mogra/chameli)", "Rose petals", "Flower malas (garlands)", "Lotus flowers (add-on)", "Agarbatti, diya, cotton batti (add-on)"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-on-surface-variant">
              <span className="text-primary text-lg">✓</span> {item}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-on-surface mb-4">Why NIT Faridabad Families Choose Bloomme</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          NIT Faridabad has a large community of devotees who perform daily puja. Local flower vendors in NIT are often unreliable — they skip deliveries, bring day-old flowers, or don't show up during festivals when you need them most.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Bloomme solves this with a subscription model — subscribe once, receive fresh pooja flowers every morning you choose. Our flowers are sourced same-day from local Haryana growers and packed in eco-friendly paper, arriving at your NIT Faridabad doorstep before sunrise.
        </p>

        <div className="bg-primary-container rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-on-primary-container mb-2">Start Your Pooja Flower Subscription in NIT Faridabad</h3>
          <p className="text-on-primary-container/80 text-sm mb-6">Plans from ₹59/day • Delivered before your pooja starts • Pause anytime</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plans" className="bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              View Plans
            </Link>
            <Link href="/faq" className="bg-surface-container text-primary px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Read FAQ
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
