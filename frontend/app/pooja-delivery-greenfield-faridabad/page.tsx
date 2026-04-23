import Link from "next/link";
import { Metadata } from "next";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Online Pooja Flower Delivery in Greenfield Colony Faridabad — Bloomme",
  description: "Fresh puja flowers delivered in Greenfield Colony, Faridabad before 7:30 AM. Marigolds, jasmine, rose petals & malas on subscription from ₹59/day.",
  keywords: "pooja delivery Greenfield Colony Faridabad, puja flowers Greenfield Faridabad, online flower delivery Greenfield Colony, flower subscription Faridabad",
  alternates: { canonical: "https://bloomme.co.in/pooja-delivery-greenfield-faridabad" },
  openGraph: {
    title: "Pooja Flower Delivery in Greenfield Colony Faridabad — Bloomme",
    description: "Fresh puja flowers in Greenfield Colony Faridabad before 7:30 AM. From ₹59/day.",
    url: "https://bloomme.co.in/pooja-delivery-greenfield-faridabad",
    siteName: "Bloomme",
    images: [{ url: "https://bloomme.co.in/images/backgroundlesslogo.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function GreenfieldPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">

        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <span className="text-on-surface">Pooja Delivery — Greenfield Colony Faridabad</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-4">
          Online Pooja Flower Delivery in Greenfield Colony, Faridabad
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
          Bloomme delivers fresh puja flowers to homes in Greenfield Colony, Faridabad every morning before your daily puja begins. Marigolds, jasmine, rose petals, and seasonal pooja ke phool — sourced fresh that morning from local Haryana growers — at your door when you need them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "🌿", title: "Greenfield Coverage", detail: "Greenfield Colony, Greenfield sector, and adjoining areas in Faridabad" },
            { icon: "🌅", title: "Before Your Pooja", detail: "Delivered early morning so your altar is ready before your prayers begin" },
            { icon: "📦", title: "Eco Packaging", detail: "Paper bags, zero plastic — environmentally responsible delivery" },
          ].map(({ icon, title, detail }) => (
            <div key={title} className="bg-surface-container-lowest rounded-xl p-6 text-center">
              <span className="text-3xl mb-3 block">{icon}</span>
              <p className="font-semibold text-on-surface mb-1">{title}</p>
              <p className="text-on-surface-variant text-sm">{detail}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-4">Subscription Plans for Greenfield Colony</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { name: "Traditional", price: "₹59/day", desc: "Loose marigolds & jasmine, 80–100g, eco paper packaging" },
            { name: "Divine", price: "₹89/day", desc: "Seasonal flower mix with malas, 120–150g, premium packaging", highlight: true },
            { name: "Celestial", price: "₹179/day", desc: "Premium arrangements with exotic varieties, 200g" },
          ].map(({ name, price, desc, highlight }) => (
            <div key={name} className={`rounded-xl p-6 ${highlight ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>
              <p className="font-bold text-lg mb-1">{name}</p>
              <p className={`text-2xl font-black mb-2 ${highlight ? "text-on-primary" : "text-primary"}`}>{price}</p>
              <p className={`text-sm ${highlight ? "text-on-primary/80" : "text-on-surface-variant"}`}>{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-on-surface-variant text-sm mb-10">
          All plans include free delivery to Greenfield Colony, Faridabad. Choose your delivery days — daily, weekdays, weekends, or custom. Pause or skip anytime with 24 hours notice.
        </p>

        <div className="bg-primary-container rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-on-primary-container mb-2">Start Your Daily Pooja Flower Delivery in Greenfield Colony</h3>
          <p className="text-on-primary-container/80 text-sm mb-6">Join families in Greenfield Colony who receive fresh puja flowers every morning</p>
          <Link href="/plans" className="inline-block bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            Choose Your Plan
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
