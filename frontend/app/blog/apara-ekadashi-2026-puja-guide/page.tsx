import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

export default function AparaEkadashiPage() {
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
          <span className="text-on-surface">Apara Ekadashi 2026</span>
        </nav>

        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Festival Guide</span>
          <span className="text-outline-variant">•</span>
          <span className="text-xs text-outline">13 May 2026</span>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight mb-6">
          Apara Ekadashi 2026: Complete Puja Guide & Bhakti Samagri List for Faridabad Devotees
        </h1>

        {/* Intro */}
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8 border-l-4 border-primary/30 pl-4">
          Apara Ekadashi falls on <strong>13 May 2026 (Wednesday)</strong> — the eleventh day of the Krishna Paksha of Jyeshtha month, and one of the most powerful Ekadashis in the Vaishnava calendar. <em>"Ekadashi ke din bhakti me shuddhta sabse zaruri hoti hai."</em> On this sacred day, the purity of your offering matters as much as the intent — and the single most important item in your Ekadashi samagri is fresh tulsi.
        </p>

        {/* Hero image */}
        <div className="w-full rounded-2xl overflow-hidden mb-10 bg-[#0d1a0a]">
          <Image
            src="/images/Festivals/23April-Update/FestivalPlan2.jpeg"
            alt="Bloomme Ekadashi Bhakti Kit for Apara Ekadashi 2026"
            width={1149}
            height={1369}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </div>

        {/* Section 1 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">What is Apara Ekadashi?</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          Apara Ekadashi — also known as Achala Ekadashi — is one of the 24 Ekadashis observed across the Hindu calendar year. It falls on the Ekadashi tithi of the Krishna Paksha (dark fortnight) of Jyeshtha month. According to the Brahma Vaivarta Purana, observing this Ekadashi destroys sins accumulated over many births and brings moksha (liberation) to sincere devotees.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          Lord Vishnu is the presiding deity of all Ekadashis, and Apara Ekadashi is dedicated entirely to His worship. Devotees observe a fast from sunrise, perform puja with tulsi and fresh flowers, and break their fast (parana) the next morning after sunrise on Dwadashi.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">Why Tulsi is the Heart of Every Ekadashi Puja</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          <em>"Sabse bada challenge hota hai sahi samagri ka milna"</em> — and for Ekadashi, the hardest item to source is fresh tulsi. Not dried, not wilted. Fresh tulsi leaves picked the same morning, before the puja begins.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          The Padma Purana states: <em>"Tulsi dala vinaa Vishnu puja nahi hoti"</em> — without tulsi leaves, the worship of Lord Vishnu is considered incomplete. On any Ekadashi — and especially on Apara Ekadashi — offering fresh tulsi to Vishnu carries merit equivalent to offering all other flowers, fruits, and samagri combined.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          Note: You should not pluck tulsi on Ekadashi day itself — it is considered inauspicious. The leaves should be picked the day before (Dashami) and kept fresh. This is why early-morning delivery of pre-arranged samagri is the most practical solution for most households.
        </p>

        {/* Section 3 - Samagri List */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Apara Ekadashi Bhakti Kit — Complete Samagri List</h2>

        <div className="bg-surface-container rounded-2xl p-6 mb-8 space-y-4">
          {[
            { emoji: "🌿", item: "Tulsi Leaves", note: "The most important item. Must be fresh — plucked on Dashami (day before). Without tulsi, Ekadashi puja is considered incomplete. Cannot be substituted.", star: true },
            { emoji: "🌸", item: "Fresh Flowers", note: "Yellow or white flowers preferred for Vishnu puja — marigold, yellow chrysanthemum, or white lotus. Avoid red or dark flowers.", star: true },
            { emoji: "🪔", item: "Diya + Cotton Batti", note: "A lit clay diya kept burning throughout the puja and ideally through the night. Represents Vishnu's light.", star: true },
            { emoji: "🔴", item: "Roli + Chawal", note: "For tilak on the Vishnu idol or Shaligram and as an offering during puja.", star: true },
            { emoji: "🌿", item: "Incense Sticks", note: "Choose sattvic fragrances — sandalwood, champa, or tulsi-scented agarbatti. Avoid synthetic or heavy musky fragrances.", star: true },
            { emoji: "🍬", item: "Mishri (Rock Candy)", note: "Offered as prasad and used in panchamrit abhishek. Sweet prasad on Ekadashi is considered especially auspicious.", star: false },
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
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">How to Perform Apara Ekadashi Puja — Step by Step</h2>
        <ol className="space-y-4 mb-8">
          {[
            { step: "1. Wake up before sunrise and bathe", detail: "Ekadashi puja begins with a bath before sunrise. Wear clean, preferably light-coloured clothes. The fast begins from this moment." },
            { step: "2. Clean and prepare the altar", detail: "Wipe the puja space with gangajal or clean water. Place a yellow or white cloth on the altar. Set up the Vishnu idol or Shaligram at the centre." },
            { step: "3. Arrange tulsi and flowers", detail: "Place fresh tulsi leaves and flowers at the feet of the Vishnu idol. Tulsi should be at the centre of the offering — this is the most important step." },
            { step: "4. Light the diya and incense", detail: "Light the clay diya first, then incense. Let the fragrance fill the room. On Ekadashi, the diya is kept burning through the day and ideally through the night." },
            { step: "5. Offer roli-chawal and mishri", detail: "Apply roli tilak on the idol with chawal. Offer mishri as prasad — it is considered the sweetness of Vishnu's blessings." },
            { step: "6. Recite Vishnu Sahasranama or Ekadashi Katha", detail: "Recite Vishnu Sahasranama, or read the Apara Ekadashi Katha from a Vrat Katha book. Even a sincere 'Om Namo Bhagavate Vasudevaya' chanted 108 times is effective." },
            { step: "7. Complete with aarti", detail: "Perform Vishnu aarti. Distribute mishri as prasad. Fast continues until the next morning (Dwadashi parana time)." },
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
            Get Your Ekadashi Bhakti Kit Delivered in Faridabad
          </h3>
          <p className="text-on-primary-container/80 text-sm mb-6 max-w-md mx-auto">
            Bloomme ensures <strong>fresh tulsi availability</strong>, fresh flowers, and a complete ready puja setup — delivered to your doorstep in Faridabad before sunrise on Apara Ekadashi 2026. <strong>No last-minute runs. Tulsi guaranteed fresh.</strong>
          </p>
          <Link
            href="/checkout/addons"
            className="inline-block bg-on-primary-container text-surface px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Order Ekadashi Bhakti Kit
          </Link>
          <p className="text-xs text-on-primary-container/60 mt-3">Delivery in Faridabad • Before 7:30 AM • 13 May 2026</p>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-on-surface mt-10 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {[
            {
              q: "When is Apara Ekadashi 2026?",
              a: "Apara Ekadashi 2026 falls on Wednesday, 13 May 2026. It is the Ekadashi tithi of the Krishna Paksha of Jyeshtha month — one of the most powerful Ekadashis in the Vaishnava calendar.",
            },
            {
              q: "Why is tulsi so important on Ekadashi?",
              a: "Tulsi is the most beloved offering to Lord Vishnu. The Padma Purana states that Vishnu puja without tulsi is incomplete. On Ekadashi — Vishnu's most sacred day — fresh tulsi carries the merit of all other samagri combined.",
            },
            {
              q: "Can tulsi be plucked on Ekadashi day?",
              a: "No. It is considered inauspicious to pluck tulsi on Ekadashi. Leaves should be plucked on Dashami (the day before) and kept fresh overnight. This is why pre-arranged early-morning delivery is the most reliable option for most households.",
            },
            {
              q: "Can I get fresh tulsi and Ekadashi samagri delivered in Faridabad?",
              a: "Yes. Bloomme delivers Ekadashi Bhakti Kits in Faridabad before 7:30 AM on 13 May 2026 — including fresh tulsi leaves (plucked on Dashami), flowers, diya, incense, roli-chawal, and mishri. Fresh tulsi availability is guaranteed.",
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
            Ready for Apara Ekadashi 2026? Subscribe to Bloomme and never miss a puja.
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
          <span className="text-2xl flex-shrink-0">🌿</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#7c4a00] text-sm leading-snug">Festival Puja Kits — Coming Soon</p>
            <p className="text-[#a0621a] text-xs mt-0.5 hidden sm:block">Fresh tulsi, flowers &amp; samagri delivered in Faridabad before sunrise.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: "#f6c94e", color: "#5c3300" }}>Launching Soon</span>
        </div>
      </div>
    </main>
  );
}
