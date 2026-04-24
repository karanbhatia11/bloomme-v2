import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function ShaniJayantiPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />

      <article className="pt-32 pb-20 max-w-3xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>›</span>
          <span className="text-on-surface">Shani Jayanti 2026</span>
        </nav>

        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Festival Guide</span>
          <span className="text-outline-variant">•</span>
          <span className="text-xs text-outline">16 May 2026</span>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight mb-6">
          Shani Jayanti 2026: Complete Puja Guide & Samagri List for Faridabad Devotees
        </h1>

        {/* Intro */}
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8 border-l-4 border-primary/30 pl-4">
          Shani Jayanti — the birth anniversary of Lord Shani Dev — is one of the most significant days in the Hindu calendar. In 2026, it falls on <strong>16 May (Saturday)</strong>. On this day, a correct and complete puja can bring relief from Shani dosha and seek the blessings of the most powerful of the Navagrahas. <em>"Shani dev ki puja me sahi samagri ka hona bahut zaruri hai"</em> — and this guide ensures you have everything ready.
        </p>

        {/* Hero image */}
        <div className="w-full rounded-2xl overflow-hidden mb-10 bg-[#0d0a06]">
          <Image
            src="/images/Festivals/23April-Update/FestivalPlan4.jpeg"
            alt="Bloomme Shani Puja Kit for Shani Jayanti 2026"
            width={1149}
            height={1369}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </div>

        {/* Section 1 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">What is Shani Jayanti?</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Shani Jayanti marks the birth of Lord Shani — the god of karma, discipline, and justice in Hindu tradition. He is the son of Surya Dev (the Sun) and Chhaya. Shani Dev is the ruler of the planet Saturn and one of the most powerful among the Navagrahas (nine planetary deities).
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          Devotees worship Shani Dev on this day to seek protection from Shani Sade Sati, Shani Dhaiya, and other astrological difficulties. A sincere puja performed with the correct samagri is believed to bring stability, good fortune, and relief from hardships.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">Why This Day Must Not Be Taken Lightly</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          <em>"Is din galat ya incomplete puja avoid karna chahiye."</em> Shani Jayanti is astrologically charged — the planetary alignment amplifies both the benefits of correct worship and the consequences of incomplete rituals. Every item in the samagri list has a specific purpose, and missing even one is considered inauspicious.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          This is not a day to improvise. Having all your samagri ready the night before — or better, delivered fresh to your door by 7:30 AM — ensures your puja begins on the right note.
        </p>

        {/* Section 3 - Samagri List */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Complete Shani Dev Puja Samagri List</h2>

        <div className="bg-surface-container rounded-2xl p-6 mb-8 space-y-4">
          {[
            { emoji: "⚫", item: "Kala Til (Black Sesame)", note: "Most important — offered to Shani Dev and used in tarpan. Cannot be substituted.", star: true },
            { emoji: "🌸", item: "Blue or Dark Flowers", note: "Neelkamal (blue lotus), violet, or any dark-coloured flowers. Shani Dev is associated with the colour blue/black.", star: true },
            { emoji: "🪔", item: "Diya + Batti", note: "A lit diya is essential. Use a clay diya with cotton batti.", star: true },
            { emoji: "🔴", item: "Roli + Chawal", note: "Used for tilak on the idol and offering.", star: true },
            { emoji: "🪾", item: "Agarbatti (Incense)", note: "Use dark or neutral-scented agarbatti — avoid strong floral scents for Shani puja.", star: true },
            { emoji: "🫙", item: "Sarson ka Tel (Mustard Oil)", note: "Optional — used to anoint the Shani idol or shivling. Highly recommended.", star: false },
          ].map(({ emoji, item, note, star }) => (
            <div key={item} className="flex gap-4 items-start">
              <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
              <div>
                <p className="font-semibold text-on-surface flex items-center gap-2">
                  {item}
                  {star && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Essential</span>}
                </p>
                <p className="text-on-surface-variant text-sm mt-0.5">{note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 4 - Puja Steps */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">How to Perform Shani Dev Puja — Step by Step</h2>
        <ol className="space-y-4 mb-8">
          {[
            { step: "1. Clean and prepare your puja space", detail: "Wash the puja spot with gangajal or clean water before sunrise. Place a clean black cloth on the altar." },
            { step: "2. Place the Shani idol or image", detail: "Shani Dev's idol is traditionally black or made of iron. Place it facing south-west." },
            { step: "3. Light the diya", detail: "Light a clay diya with mustard oil or ghee. Keep it burning throughout the puja." },
            { step: "4. Offer kala til", detail: "Take black sesame in your right hand and offer it to Shani Dev while chanting 'Om Sham Shanaishcharaya Namah'." },
            { step: "5. Offer blue flowers and roli-chawal", detail: "Place dark or blue flowers at the feet of the idol. Apply roli tilak and offer chawal." },
            { step: "6. Light incense and offer mustard oil", detail: "Wave the agarbatti in a clockwise circle. Anoint the idol or shivling with a few drops of sarson ka tel." },
            { step: "7. Recite Shani Chalisa or Shani Stotra", detail: "Read or listen to the Shani Chalisa. Even a simple 'Om Sham Shanaishcharaya Namah' recited 108 times is effective." },
            { step: "8. Complete with aarti", detail: "Perform aarti and distribute prasad — traditionally kala til and sesame ladoo." },
          ].map(({ step, detail }) => (
            <li key={step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mt-0.5">
                {step.split(".")[0]}
              </div>
              <div>
                <p className="font-semibold text-on-surface">{step.split(". ")[1]}</p>
                <p className="text-on-surface-variant text-sm mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA Block */}
        <div className="bg-primary-container rounded-2xl p-8 mb-10 text-center relative overflow-hidden">
          <div className="flex justify-center mb-3">
            <Image src="/images/backgroundlesslogo.png" alt="Bloomme" width={48} height={48} />
          </div>
          <h3 className="text-xl font-bold text-on-primary-container mb-2">
            Get Your Shani Puja Kit Delivered in Faridabad
          </h3>
          <p className="text-on-primary-container/80 text-sm mb-6 max-w-md mx-auto">
            Bloomme delivers complete Shani Puja Kits — kala til, dark flowers, diya, batti, roli-chawal, and agarbatti — to your doorstep in Faridabad early morning on Shani Jayanti 2026, before your pooja starts. <strong>No last-minute market runs. Puja ready when you wake up.</strong>
          </p>
          <Link
            href="/checkout/addons"
            className="inline-block bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Order Shani Puja Kit
          </Link>
          <p className="text-xs text-on-primary-container/60 mt-3">Delivery in Faridabad • Before 7:30 AM • 16 May 2026</p>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {[
            {
              q: "When is Shani Jayanti 2026?",
              a: "Shani Jayanti 2026 falls on Saturday, 16 May 2026. Saturday is already considered Shani Dev's day, making this date doubly auspicious.",
            },
            {
              q: "Can I substitute black sesame with something else?",
              a: "No. Kala til (black sesame) is the most essential offering to Shani Dev and cannot be substituted. It is the primary samagri in Shani puja.",
            },
            {
              q: "Can I get Shani puja samagri delivered in Faridabad?",
              a: "Yes. Bloomme delivers Shani Puja Kits — including dark flowers, diya, batti, roli-chawal, and agarbatti — early morning in Faridabad, before your pooja starts. Subscribe or order add-ons at bloomme.co.in.",
            },
            {
              q: "What time should Shani Jayanti puja be performed?",
              a: "The most auspicious time is during Brahma Muhurta — roughly 4:30 AM to 6:00 AM before sunrise. This is why having your samagri delivered early morning is important.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-surface-container-lowest rounded-xl p-6">
              <p className="font-semibold text-on-surface mb-2">{q}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-outline-variant/20 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-on-surface-variant text-sm">
            Ready for Shani Jayanti 2026? Subscribe to Bloomme and never miss a puja.
          </p>
          <Link
            href="/plans"
            className="flex-shrink-0 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            View Puja Plans — from ₹59/day
          </Link>
        </div>

      </article>
      <Footer />

      {/* Sticky Coming Soon Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #fff8ed 0%, #fef0c2 50%, #fde9a2 100%)", border: "1.5px solid #f6c94e", boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 12px rgba(246,180,30,0.2)" }}>
          <span className="text-2xl flex-shrink-0">🪔</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#7c4a00] text-sm leading-snug">Festival Puja Kits — Coming Soon</p>
            <p className="text-[#a0621a] text-xs mt-0.5 hidden sm:block">Fresh flowers &amp; samagri delivered in Faridabad before sunrise.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: "#f6c94e", color: "#5c3300" }}>Launching Soon</span>
        </div>
      </div>
    </main>
  );
}
