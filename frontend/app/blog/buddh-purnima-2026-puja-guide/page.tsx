import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function BuddhPurnimaPage() {
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
          <span className="text-on-surface">Buddh Purnima 2026</span>
        </nav>

        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Festival Guide</span>
          <span className="text-outline-variant">•</span>
          <span className="text-xs text-outline">1 May 2026</span>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight mb-6">
          Buddh Purnima 2026: Complete Shanti Puja Guide & Samagri List for Faridabad Devotees
        </h1>

        {/* Intro */}
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8 border-l-4 border-primary/30 pl-4">
          Buddh Purnima — the most sacred Purnima in the Hindu-Buddhist calendar — falls on <strong>1 May 2026 (Friday)</strong>. This day marks the birth, enlightenment, and mahaparinirvana of Gautama Buddha. <em>"Shanti, sadgi aur bhakti ka din — Buddha Purnima."</em> On this pavitra din, a simple and pure puja performed with the right samagri is the most meaningful offering you can make.
        </p>

        {/* Hero image */}
        <div className="w-full rounded-2xl overflow-hidden mb-10 bg-[#f5f0e8]">
          <Image
            src="/images/Festivals/23April-Update/FestivalPlan1.jpeg"
            alt="Bloomme Shanti Puja Kit for Buddh Purnima 2026"
            width={1122}
            height={1402}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </div>

        {/* Section 1 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">What is Buddh Purnima?</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Buddh Purnima (also called Buddha Jayanti or Vesak) is celebrated on the full moon day of Vaishakha month. It is considered the holiest day in the Buddhist calendar and one of the most auspicious Purnimas in the Hindu tradition as well — because it coincides with the full moon of Vaishakha, which is sacred to Vishnu and associated with the Sattvic qualities of peace, wisdom, and purification.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          In 2026, Buddh Purnima falls on Friday, 1 May — a particularly auspicious combination, as Friday is associated with Lakshmi and peace. Performing a Shanti Puja on this day with fresh white flowers and pure samagri is believed to bring clarity, calm, and blessings into the home.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">Why Simplicity is the Heart of This Puja</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Unlike the intense, prescribed pujas of Shani Jayanti or Navratri, Buddh Purnima calls for sadgi — simplicity and sincerity. <em>"Is pavitra din par, ek simple aur shuddh puja sabse mahatvapurn hoti hai."</em> The Buddha himself taught that elaborate rituals without inner intention carry less weight than a quiet, focused offering made with a clean heart.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          That said, the purity of your samagri matters deeply. Fresh white flowers — not wilted, not artificial — carry the right energy. A clean, fragrant incense and a steady diya flame complete the atmosphere. This is where Bloomme's Shanti Puja Kit makes all the difference: every item is fresh, pre-selected, and delivered before your puja begins.
        </p>

        {/* Section 3 - Samagri List */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Buddh Purnima Shanti Puja Samagri List</h2>

        <div className="bg-surface-container rounded-2xl p-6 mb-8 space-y-4">
          {[
            { emoji: "🌸", item: "White Flowers", note: "Jasmine (chameli) or white rose — fresh only. The most important offering on this day. Represents purity and shanti.", star: true },
            { emoji: "🕯️", item: "Diya + Cotton Batti", note: "A clay diya with cotton batti. Keep it lit throughout the puja. Symbolises enlightenment.", star: true },
            { emoji: "🌿", item: "Incense Sticks (Mild Fragrance)", note: "Choose soft, sattvic fragrances — sandalwood, jasmine, or chameli. Avoid strong or musky scents.", star: true },
            { emoji: "🔴", item: "Roli + Chawal", note: "For tilak and offering. Standard in all Hindu pujas.", star: true },
            { emoji: "🍬", item: "Mishri / Fruits", note: "Optional but recommended. Rock candy (mishri) or seasonal fruits as prasad — reflects the simplicity of Buddhist offering traditions.", star: false },
            { emoji: "🎁", item: "Special Bloomme Launch Gift", note: "Included exclusively in Bloomme's Buddh Purnima Kit. A surprise addition to make this puja extra memorable.", star: false },
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
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">How to Perform Shanti Puja on Buddh Purnima — Step by Step</h2>
        <ol className="space-y-4 mb-8">
          {[
            { step: "1. Clean your puja space at sunrise", detail: "Wipe the altar with a clean cloth. Sprinkle a few drops of gangajal or clean water. White is auspicious — use a white or light-coloured cloth if possible." },
            { step: "2. Arrange the samagri", detail: "Place white flowers at the centre. Keep the diya and incense to the right. Keep roli-chawal, mishri, and fruits to the left." },
            { step: "3. Light the diya and incense", detail: "Light the diya first, then the incense. Let the fragrance fill the room before you begin your chanting." },
            { step: "4. Offer white flowers", detail: "Hold the white flowers in both hands and offer them with the sankalpa: 'I offer these flowers for the peace and wellbeing of my home and family.' Even a quiet mental offering counts." },
            { step: "5. Chant a shanti mantra", detail: "'Om Shanti Shanti Shanti' — recited 3 or 21 times. Or the Buddh mantra: 'Om Mani Padme Hum' — 108 times. Both are appropriate and effective." },
            { step: "6. Offer mishri or fruits", detail: "Place mishri or fruits as prasad. This is the sattvic offering — simple, pure, sweet." },
            { step: "7. Close with aarti and silence", detail: "Perform a brief aarti. Then sit in 2–3 minutes of silence. This is the most important part of Shanti Puja — the stillness after the ritual is where peace actually enters." },
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
            Get Your Shanti Puja Kit Delivered in Faridabad
          </h3>
          <p className="text-on-primary-container/80 text-sm mb-6 max-w-md mx-auto">
            Bloomme delivers complete Shanti Puja Kits — fresh jasmine, white roses, diya, mild incense, roli-chawal, and a special launch gift — to your doorstep in Faridabad on Buddh Purnima 2026. <strong>No last-minute runs. Puja ready when you wake up.</strong>
          </p>
          <Link
            href="/checkout/addons"
            className="inline-block bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Order Shanti Puja Kit
          </Link>
          <p className="text-xs text-on-primary-container/60 mt-3">Delivery in Faridabad • Before 7:30 AM • 1 May 2026</p>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {[
            {
              q: "When is Buddh Purnima 2026?",
              a: "Buddh Purnima 2026 falls on Friday, 1 May 2026. It is the full moon day of Vaishakha month — considered the most auspicious Purnima of the year.",
            },
            {
              q: "Why are white flowers used in Buddh Purnima puja?",
              a: "White represents purity, peace, and wisdom — the qualities associated with the Buddha and the Sattvic energy of this Purnima. Jasmine and white roses carry a gentle fragrance that elevates the puja atmosphere. Avoid strong or dark-coloured flowers for Shanti puja.",
            },
            {
              q: "Can I get Shanti Puja samagri delivered in Faridabad on Buddh Purnima?",
              a: "Yes. Bloomme delivers Shanti Puja Kits in Faridabad before 7:30 AM on 1 May 2026. The kit includes fresh white flowers, diya, mild incense, roli-chawal, and a special launch gift.",
            },
            {
              q: "What time should Buddh Purnima puja be performed?",
              a: "Sunrise is the most auspicious time — roughly 5:30 AM to 7:00 AM in Faridabad on 1 May. The full moon energy is strongest near sunrise on Purnima, making this the ideal window for Shanti Puja.",
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
            Ready for Buddh Purnima 2026? Subscribe to Bloomme and never miss a puja.
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
          <span className="text-2xl flex-shrink-0">🌸</span>
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
