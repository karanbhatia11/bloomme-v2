import Link from "next/link";
import { Navigation } from "@/components/common/Navigation";
import { Footer } from "@/components/sections/Footer";

const posts = [
  {
    slug: "shani-jayanti-2026-puja-guide",
    title: "Shani Jayanti 2026: Complete Puja Guide & Samagri List",
    description: "Everything you need for Shani Dev puja on 16 May 2026 — samagri list, step-by-step guide, and how to get your Shani Puja Kit delivered in Faridabad.",
    date: "2026-05-16",
    displayDate: "16 May 2026",
    category: "Festival Guide",
    emoji: "⚫",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary-container/20"
            >
              <div className="h-48 bg-surface-container flex items-center justify-center text-7xl">
                {post.emoji}
              </div>
              <div className="p-8">
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
