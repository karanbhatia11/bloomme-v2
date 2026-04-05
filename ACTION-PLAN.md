# Bloomme — SEO Action Plan
**Generated:** March 31, 2026 | **Current Score: 72/100** | **Target: 88/100**

---

## Priority 1 — Fix Now (1–2 hours total, high impact)

### FIX 1: Remove hardcoded canonical from root layout `<head>` (Critical)

**File:** `/frontend/app/layout.tsx`

The root layout has a manual `<link rel="canonical" href="https://bloomme.co.in/" />` hardcoded in the JSX `<head>` block. This fires on EVERY page and conflicts with the correct per-page canonicals emitted by Next.js metadata. Remove the hardcoded line — the Next.js `alternates.canonical` in each page/layout metadata handles this correctly.

Also remove the manually added `<meta charSet="utf-8" />` and `<meta name="viewport" .../>` from the JSX `<head>` — Next.js adds these automatically from the metadata system, causing duplicates.

**What to remove from `layout.tsx`:**
```tsx
// REMOVE these 3 lines from the JSX <head> block:
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="canonical" href="https://bloomme.co.in/" />
```

**Expected impact:** Fixes duplicate canonical on all pages, fixes duplicate viewport/charSet, eliminates wrong canonical bleeding onto /plans, /about, /faq, /contact. +5 points.

---

### FIX 2: Add `og:image` to all inner-page layouts (High)

**Files:** `/frontend/app/about/layout.tsx`, `/frontend/app/plans/layout.tsx`, `/frontend/app/faq/layout.tsx`, `/frontend/app/contact/layout.tsx`

All four page layouts are missing `og:image`. Social shares from Facebook, WhatsApp, and LinkedIn will render as blank-image cards. Add the image to each layout's openGraph object. Either reuse the site-wide OG image or create page-specific ones.

**Add to each layout's `openGraph` object:**
```ts
images: [
  {
    url: "https://bloomme.co.in/images/backgroundlesslogo.png",
    width: 1200,
    height: 630,
    alt: "Bloomme — Daily Puja Flower Subscription",
  },
],
type: "website",
siteName: "Bloomme",
locale: "en_IN",
```

**Expected impact:** Social shares of /plans, /about, /faq, /contact now show an image card. +3 points.

---

### FIX 3: Add Twitter Card overrides to inner-page layouts (High)

**Files:** Same 4 layout files above.

Currently all inner pages inherit the root layout's Twitter Card data (homepage title + description). Add per-page Twitter metadata.

**Add to each layout's metadata export:**
```ts
twitter: {
  card: "summary_large_image",
  title: "<page-specific title>",
  description: "<page-specific description>",
  images: ["https://bloomme.co.in/images/backgroundlesslogo.png"],
},
```

**Expected impact:** Twitter/X shares of inner pages show correct messaging. +2 points.

---

## Priority 2 — Fix This Week (2–3 hours, medium impact)

### FIX 4: Add keyword-rich static H1 fallbacks to About, FAQ, and Contact pages (Medium)

**Problem:** When the CMS API returns no content, H1s fall back to generic non-keyword phrases:
- About: "More than just arrangements."
- FAQ: "How can we assist you today?"
- Contact: "Let's create something beautiful together."

**Fix options:**
1. Hardcode keyword-rich fallbacks in the default values
2. Or: Move the H1 to a server-rendered outer component that uses the page title

**Recommended fallbacks:**
- About H1 default: `"About Bloomme — Our Story & Mission"`
- FAQ H1 default: `"Frequently Asked Questions"`
- Contact H1 default: `"Contact Bloomme"`

**File:** Each respective `page.tsx` — update the fallback string in the ternary/OR expression.

**Expected impact:** Pages have keyword-relevant H1 even when CMS is down. +3 points.

---

### FIX 5: Upgrade Plans page H1 (Low-Medium)

**File:** `/frontend/app/plans/page.tsx` line 97

Current H1: `Subscription Plans`
Better H1: `Puja Flower Subscription Plans`

A one-word change that adds the primary keyword phrase.

**Expected impact:** +1 point.

---

### FIX 6: Add `<lastmod>` to sitemap.xml (Low)

**File:** `/frontend/public/sitemap.xml`

Google uses `lastmod` for recrawl prioritization. Add the current date (or a realistic last-modified date) to each URL.

**Format:**
```xml
<url>
  <loc>https://bloomme.co.in/</loc>
  <lastmod>2026-03-31</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
```

**Expected impact:** Slightly faster recrawling of updated pages. +1 point.

---

### FIX 7: Fix alt texts on About and Plans page images (Low)

**File:** `/frontend/app/about/page.tsx`

Current → Better:
- `alt="About Bloomme"` → `alt="Bloomme founder curating puja flower arrangements in Faridabad"`
- `alt="Flowers"` → `alt="Fresh marigold and jasmine puja flowers — Bloomme daily delivery"`
- `alt="Community"` → `alt="Bloomme devotee community receiving daily puja flower subscription"`

**File:** Plan card images in homepage and plans page:
- `alt="Traditional"` → `alt="Traditional puja flower arrangement — daily essentials plan"`
- `alt="Divine"` → `alt="Divine puja flower arrangement — comprehensive ritual coverage plan"`
- `alt="Celestial"` → `alt="Celestial puja flower arrangement — complete florist's atelier plan"`

**Expected impact:** Better image search visibility, improved accessibility. +1 point.

---

## Priority 3 — This Month (nice-to-have, compound value)

### FIX 8: Create a proper 1200x630 OG social share image (Medium)

The current `og:image` is the Bloomme logo on a transparent background. This renders poorly in social previews. Create a 1200x630 image designed for social sharing:
- Background: floral pattern or puja setup photo
- Overlay: Bloomme logo + tagline "Daily Puja Flowers Before Sunrise"
- Save as `/public/images/og-image.png`
- Update all page layouts to use this new URL

**Expected impact:** Higher CTR from social media shares. +2 points.

---

### FIX 9: Add BreadcrumbList schema to inner pages (Low)

Add BreadcrumbList JSON-LD to /plans, /about, /faq, /contact. This creates breadcrumb display in Google SERPs.

**Example for /plans:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bloomme.co.in" },
    { "@type": "ListItem", "position": 2, "name": "Subscription Plans", "item": "https://bloomme.co.in/plans" }
  ]
}
```

**Expected impact:** Rich breadcrumb results in SERP for branded searches. +2 points.

---

### FIX 10: Add AboutPage and ContactPage schema types (Low)

**File:** `/frontend/app/about/page.tsx` and `/frontend/app/contact/page.tsx`

Add a `<script type="application/ld+json">` with `@type: "AboutPage"` and `@type: "ContactPage"` respectively. Include `url`, `name`, `description`, and link to the `Organization`.

**Expected impact:** Clearer page-type signals to Google. +1 point.

---

### FIX 11: Add `<lastmod>` automation to sitemap (Low)

Instead of a static sitemap.xml, generate it programmatically using Next.js `app/sitemap.ts`. This allows automatic `lastmod` based on file modification time.

**File to create:** `/frontend/app/sitemap.ts`
```ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://bloomme.co.in", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://bloomme.co.in/plans", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    // ...
  ];
}
```

Then delete `/public/sitemap.xml` so the dynamic one takes over.

**Expected impact:** Always-fresh lastmod, easier to maintain. +1 point.

---

### FIX 12: Increase ratingCount in LocalBusiness schema (Low)

Current: `"ratingCount": "3"` — too low for Google to display star ratings in SERP.

Two approaches:
1. Wait for real reviews to accumulate and update this number organically
2. Link aggregateRating to an actual review platform (Google Business Profile)

Do NOT inflate this number artificially — Google cross-checks it.

**Expected impact:** Star ratings in branded SERP results once ratingCount reaches ~5+.

---

### FIX 13: Create `/llms-full.txt` for extended AI context (Low)

Create a more detailed version for AI crawlers. Include:
- Full list of plan contents (what flowers are in each plan)
- Delivery schedule details
- Freshness guarantee language
- FAQ content
- Service area expansion roadmap

**File:** `/frontend/public/llms-full.txt`

**Expected impact:** Better citation quality in AI search responses. +1 point.

---

## Projected Score After Priority 1 Fixes

| Fix | Points Gained |
|-----|--------------|
| Remove duplicate canonical + viewport from root layout | +5 |
| Add og:image to inner pages | +3 |
| Add Twitter Card to inner pages | +2 |
| **Subtotal after Priority 1** | **+10 → ~82/100** |

## Projected Score After All Fixes

| Priority | Points Gained |
|----------|--------------|
| Priority 1 (fixes 1–3) | +10 |
| Priority 2 (fixes 4–7) | +6 |
| Priority 3 (fixes 8–13) | +7 |
| **Total projected** | **+23 → ~88–90/100** |

---

## Score Tracking

| Date | Score | Notes |
|------|-------|-------|
| (Initial audit) | 41/100 | Missing robots, sitemap, schema, OG |
| March 31, 2026 | 72/100 | Infrastructure complete, bugs remain |
| After Priority 1 | ~82/100 | Canonical, OG image, Twitter fixed |
| After All Fixes | ~88/100 | Full optimization |
