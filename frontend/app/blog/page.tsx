import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

const posts = [
  {
    slug: "buddh-purnima-2026-puja-guide",
    title: "Buddh Purnima 2026: Shanti Puja Guide & Samagri List",
    description: "Shanti, sadgi aur bhakti ka din — Buddha Purnima. Everything you need for a peaceful and complete Shanti Puja on 1 May 2026, delivered fresh in Faridabad.",
    date: "2026-05-01",
    displayDate: "1 May 2026",
    category: "Festival Guide",
    image: "/images/Festivals/23April-Update/FestivalPlan1.jpeg",
    imageAspect: "1122 / 1402" as const,
    reversed: true,
  },
  {
    slug: "apara-ekadashi-2026-puja-guide",
    title: "Apara Ekadashi 2026: Complete Puja Guide & Bhakti Samagri List",
    description: "Ekadashi ke din bhakti me shuddhta sabse zaruri hoti hai. Everything you need — fresh tulsi, flowers & ready puja setup — delivered in Faridabad on 13 May 2026.",
    date: "2026-05-13",
    displayDate: "13 May 2026",
    category: "Festival Guide",
    image: "/images/Festivals/23April-Update/FestivalPlan2.jpeg",
    imageAspect: "1149 / 1369" as const,
    reversed: false,
  },
  {
    slug: "shani-jayanti-2026-puja-guide",
    title: "Shani Jayanti 2026: Complete Puja Guide & Samagri List",
    description: "Everything you need for Shani Dev puja on 16 May 2026 — samagri list, step-by-step guide, and how to get your Shani Puja Kit delivered in Faridabad.",
    date: "2026-05-16",
    displayDate: "16 May 2026",
    category: "Festival Guide",
    image: "/images/Festivals/23April-Update/FestivalPlan4.jpeg",
    imageAspect: "1149 / 1369" as const,
    reversed: true,
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-surface">
      <Navigation />
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold tracking-[0.2em] text-xs uppercase">Bloomme Blog</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
            Puja Guides & Festival Tips
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Flower guides, festival samagri lists, and daily ritual tips for devotees in Faridabad.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary-container/20 flex ${post.reversed ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="relative shrink-0 bg-[#0d0a06] overflow-hidden" style={{ width: "200px", aspectRatio: post.imageAspect }}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="200px"
                  priority
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">{post.category}</span>
                <h2 className="text-xl font-bold mt-2 mb-3 text-on-surface group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{post.description}</p>
                <p className="text-xs text-outline">{post.displayDate}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
