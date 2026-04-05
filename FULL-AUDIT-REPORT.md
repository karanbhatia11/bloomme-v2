# Bloomme Full SEO Audit Report
**Date:** March 31, 2026
**Previous Score:** 41/100
**New Score:** 72/100 (+31 points)
**Audited by:** Claude Code — Full crawl of all public-facing routes

---

## Executive Summary

Substantial improvements since the last audit. All critical infrastructure now exists: robots.txt, sitemap.xml, llms.txt, JSON-LD schema on key pages, per-route canonical tags, and Open Graph metadata. The site has moved from a failing grade to a solid B. Remaining gaps are specific and fixable: a hardcoded root-layout canonical that bleeds onto every page, missing `og:image` on inner pages, duplicate viewport/charSet meta tags, and the homepage being a client component that cannot export its own metadata.

---

## Page-by-Page Findings

---

### 1. Homepage — `https://bloomme.co.in/`

**Title:**
`Bloomme — Daily Puja Flowers Delivered Before Sunrise`
Good. Keyword-rich, branded, under 60 chars. Comes from root `layout.tsx` metadata export (the `page.tsx` is `"use client"` so cannot export metadata itself).

**Meta Description:**
`Fresh puja flowers & essentials delivered to your doorstep between 5:30–7:30 AM every day. Subscribe from ₹59/day. Serving Faridabad.`
Excellent. Includes price anchor, delivery time, and city. 136 chars (ideal length).

**H1:**
`Daily Fresh Puja Flowers & Essentials Delivered at Your Doorsteps.`
(Default value from `HeroSection.tsx` when CMS returns nothing)
Good keyword targeting. However this H1 is set client-side in a `"use client"` component — crawlers that only parse initial HTML will not see it.

**H2s found in RSC payload:**
- "Subscription Plans"
- "Add Ons"
- "Designed for Devotion"
- "Voices of Devotion"
Good content hierarchy.

**Canonical — CRITICAL BUG:**
Two canonical tags rendered simultaneously:
1. Root layout `<head>` hardcodes: `<link rel="canonical" href="https://bloomme.co.in/" />`
2. Next.js metadata system also emits: `<link rel="canonical" href="https://bloomme.co.in" />`
The values differ (trailing slash vs no trailing slash). Google will pick one arbitrarily.

**Open Graph:**
```
og:title       = "Bloomme — Daily Puja Flowers Delivered Before Sunrise"
og:description = "Fresh puja flowers delivered every morning before your prayers. Subscribe from ₹59/day."
og:url         = "https://bloomme.co.in"
og:site_name   = "Bloomme"
og:locale      = "en_IN"
og:image       = "https://bloomme.co.in/images/backgroundlesslogo.png"
og:image:width = 1200
og:image:height= 630
og:type        = "website"
```
Complete set. Note: the OG image is the logo PNG, not a proper 1200x630 social-share photo. Social previews will show a logo on white background, which produces weak click-through on social media.

**Twitter Card:**
```
twitter:card        = "summary_large_image"
twitter:title       = "Bloomme — Daily Puja Flowers Delivered Before Sunrise"
twitter:description = "Fresh puja flowers delivered every morning before your prayers. Subscribe from ₹59/day."
twitter:image       = "https://bloomme.co.in/images/backgroundlesslogo.png"
```
Present and correct format.

**Structured Data (JSON-LD) — 3 types in @graph:**
- `Organization` — name, url, logo, description, contactPoint (+91 99507 07995), sameAs (Instagram)
- `LocalBusiness` — address (Faridabad, Haryana), priceRange ₹59–₹179/day, hours 05:30–19:00, aggregateRating 4.9/5 (ratingCount: 3)
- `WebSite` — name, url
All three well-formed. Minor: `ratingCount: 3` is extremely low — Google typically requires ~5+ reviews before showing star rich results.

**Images (alt texts):**
- "Bloomme Logo" — correct
- "Traditional" — too thin; should be "Traditional puja flower arrangement — Bloomme"
- "Divine" — too thin
- "Celestial" — too thin
- "Gudi Padwa / Ugadi" — descriptive, good
- "Fresh puja flowers delivered before morning prayer — Bloomme" — excellent
- "Serene home prayer setup with fresh flowers — Bloomme flexible subscription" — excellent
- "Personalized puja ritual management with Bloomme dashboard" — excellent

**Technical issues on this page:**
- Duplicate `<meta name="viewport">` (root layout manual + Next.js system)
- Duplicate `<meta charSet="utf-8">` (same cause)
- Duplicate canonical with mismatched trailing slash
- H1 is client-side rendered; initial HTML served to crawlers has no H1
- OG image is logo, not a social photo

---

### 2. Plans Page — `https://bloomme.co.in/plans`

**Title:**
`Puja Flower Subscription Plans — Bloomme`
Good. Keyword-rich, clear intent.

**Meta Description:**
`Choose a daily puja flower subscription from ₹59/day. Traditional, Divine, and Celestial plans with morning delivery in Faridabad.`
Strong. Price, plan names, city, and action word.

**H1:**
`Subscription Plans`
Present but generic. Missing brand name or primary keyword "puja flowers". Recommended: "Puja Flower Subscription Plans".

**H2:**
`Compare our rituals`
Functional for the comparison table section.

**Canonical — BUG:**
Two canonicals rendered:
1. Root layout: `<link rel="canonical" href="https://bloomme.co.in/" />` (WRONG — points to homepage)
2. Page layout: `<link rel="canonical" href="https://bloomme.co.in/plans" />` (correct)
Google sees conflicting signals. The page-level canonical is output later and should win, but the root-layout one should not be there.

**Open Graph:**
```
og:title       = "Puja Flower Subscription Plans — Bloomme"
og:description = "Choose a daily puja flower subscription from ₹59/day..."
og:url         = "https://bloomme.co.in/plans"
```
MISSING: `og:image`, `og:type`, `og:site_name`, `og:locale`.
When this page is shared on social media, no image will appear.

**Twitter Card:**
twitter:title = "Bloomme — Daily Puja Flowers Delivered Before Sunrise" (WRONG — homepage title)
twitter:description = homepage description (WRONG)
Root layout Twitter values are not overridden in inner-page layouts.

**Structured Data:**
- Inherited: Organization + LocalBusiness + WebSite
- Page-specific: `ItemList` containing 3 `Product` items, each with an `Offer` (price, currency, availability)
Excellent. Eligible for product rich results.

**Images:**
- "Traditional", "Divine", "Celestial" — minimal; should include "puja flower arrangement" in description

---

### 3. About Page — `https://bloomme.co.in/about`

**Title:**
`About Bloomme — Our Story & Mission`
Descriptive, on-brand.

**Meta Description:**
`How Bloomme is bringing daily fresh puja flowers to devotees. Meet the team and learn our mission to connect homes to the divine.`
Good narrative approach.

**H1:**
Default fallback renders as: `More than just arrangements.`
This H1 contains no keywords — no "puja flowers", no "Bloomme", no "Faridabad". A significant missed opportunity. The H1 is CMS-driven; when the CMS returns nothing, the fallback is brand-weak.

**Canonical — BUG:**
1. Root layout: `https://bloomme.co.in/` (WRONG)
2. Page layout: `https://bloomme.co.in/about` (correct)

**Open Graph:**
og:title, og:description, og:url present and correct.
MISSING: `og:image`. Social shares will render with no image.

**Twitter Card:**
Inherits root layout homepage values — shows wrong messaging for about page shares.

**Images:**
- `alt="About Bloomme"` — vague, no descriptive context
- `alt="Flowers"` — extremely thin, not useful for SEO or accessibility
- `alt="Community"` — thin

**Structured Data:**
Root schema only. No `AboutPage` type, no `BreadcrumbList`.

---

### 4. FAQ Page — `https://bloomme.co.in/faq`

**Title:**
`FAQ — Bloomme Puja Flower Delivery`
Good.

**Meta Description:**
`Answers to common questions about Bloomme's puja flower subscription: delivery times, pausing, freshness, and pricing.`
Solid. Covers key FAQ topics.

**H1:**
`How can we assist you today?`
Friendly but zero SEO keyword value. Should be "Frequently Asked Questions — Bloomme Puja Flower Delivery" or similar.

**Canonical — BUG:**
1. Root layout: `https://bloomme.co.in/` (WRONG)
2. Page layout: `https://bloomme.co.in/faq` (correct)

**Open Graph:**
og:title, og:description, og:url present and correct.
MISSING: `og:image`.

**Twitter Card:**
Inherits root layout homepage values.

**Structured Data:**
`FAQPage` schema with 7 `Question`/`Answer` pairs. Excellent — eligible for FAQ rich results in Google SERP.

---

### 5. Contact Page — `https://bloomme.co.in/contact`

**Title:**
`Contact Bloomme — Get in Touch`
Functional.

**Meta Description:**
`Reach out to Bloomme for support, partnership, or feedback. We deliver daily puja flowers across Faridabad, Haryana.`
Good local geo signal.

**H1:**
Default fallback: `Let's create something beautiful together.`
Generic — no page-purpose keywords. Should be "Contact Bloomme" or "Get in Touch With Our Team".

**Canonical — BUG:**
1. Root layout: `https://bloomme.co.in/` (WRONG)
2. Page layout: `https://bloomme.co.in/contact` (correct)

**Open Graph:**
og:title, og:description, og:url present and correct.
MISSING: `og:image`.

**Twitter Card:**
Inherits root layout homepage values.

**Images:**
- `alt="Floral Shop Interior"` — functional, acceptable

**Structured Data:**
Root schema only. No `ContactPage` type.

---

### 6. robots.txt — `https://bloomme.co.in/robots.txt`

**Status: EXISTS — PASS**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://bloomme.co.in/sitemap.xml
```

Excellent. Blocks admin/dashboard/api. Explicitly permits all major AI crawlers. Sitemap URL referenced.

Minor: No `User-agent: Googlebot` explicit block (not needed). Missing `AhrefsBot`/`SemrushBot` (optional, only relevant for SEO tooling data).

---

### 7. sitemap.xml — `https://bloomme.co.in/sitemap.xml`

**Status: EXISTS — PASS**

8 URLs:
| URL | Priority | changefreq |
|-----|----------|-----------|
| / | 1.0 | weekly |
| /plans | 0.9 | weekly |
| /about | 0.8 | monthly |
| /faq | 0.8 | monthly |
| /contact | 0.6 | monthly |
| /signup | 0.5 | monthly |
| /privacy | 0.3 | yearly |
| /terms | 0.3 | yearly |

Issues:
- No `<lastmod>` on any URL (used by Google for recrawl scheduling)
- `/login` absent (may be intentional)
- `/signup` is indexed — consider if you want account-creation pages crawlable

---

### 8. llms.txt — `https://bloomme.co.in/llms.txt`

**Status: EXISTS — PASS**

Well-structured with service description, key page links, plan pricing, service area, and contact info. Directly useful for AI search engines (Perplexity, ChatGPT, Google AI Overviews).

Minor: No `/llms-full.txt` for extended context (optional).

---

### 9. 404 Page — `https://bloomme.co.in/not-found-test`

**HTTP Status:** 404 (correct)
**Title:** `Page Not Found — Bloomme`
**Meta Description:** `The page you are looking for could not be found.`
**H1:** `404`
**H2:** `This page has bloomed away`

Branded, on-theme, with navigation links (Home, View Plans, FAQ). Correct HTTP status code. Good.

---

## Critical Issues Ranked by Impact

| # | Issue | Severity | Pages |
|---|-------|----------|-------|
| 1 | Root layout hardcodes `<link rel="canonical" href="https://bloomme.co.in/">` in JSX `<head>` — creates duplicate/wrong canonical on every inner page | **Critical** | All pages |
| 2 | Root layout manually adds `<meta name="viewport">` and `<meta charSet>` — duplicated because Next.js metadata system also adds them | **High** | All pages |
| 3 | `og:image` not defined in inner-page layouts — social shares of /plans, /about, /faq, /contact render with no preview image | **High** | plans, about, faq, contact |
| 4 | Twitter Card tags on inner pages show homepage title/description (root layout Twitter values not overridden) | **High** | plans, about, faq, contact |
| 5 | Homepage `page.tsx` is `"use client"` — H1 rendered client-side only; initial HTML has no H1 for crawlers | **Medium** | Homepage |
| 6 | About page H1 defaults to "More than just arrangements." — zero keyword value | **Medium** | About |
| 7 | FAQ page H1 is "How can we assist you today?" — zero keyword value | **Medium** | FAQ |
| 8 | Contact page H1 defaults to "Let's create something beautiful together." — zero keyword value | **Medium** | Contact |
| 9 | Plans page H1 "Subscription Plans" — generic, missing "puja flowers" | **Low** | Plans |
| 10 | Sitemap missing `<lastmod>` on all URLs | **Low** | sitemap.xml |
| 11 | OG image is transparent logo PNG, not a proper 1200x630 social share photo | **Low** | Homepage |
| 12 | About page images: "About Bloomme", "Flowers", "Community" — weak alt texts | **Low** | About |
| 13 | Plan card alt texts ("Traditional", "Divine", "Celestial") too brief | **Low** | Plans, Homepage |
| 14 | No security headers (X-Content-Type-Options, X-Frame-Options, CSP) | **Low** | All pages |
| 15 | `ratingCount: 3` in LocalBusiness schema — too few reviews for rich result eligibility | **Low** | All (schema) |

---

## Structured Data Inventory

| Page | Schema Types | Status |
|------|-------------|--------|
| All pages (root) | Organization, LocalBusiness, WebSite | Good |
| /faq | FAQPage + 7 Question/Answer | Excellent |
| /plans | ItemList + 3 Product + 3 Offer | Excellent |
| /about | (none page-specific) | Missing |
| /contact | (none page-specific) | Missing |

---

## SEO Score Breakdown

| Category | Weight | Raw Score | Weighted |
|----------|--------|-----------|---------|
| Technical SEO | 22% | 60/100 | 13.2 |
| Content Quality | 23% | 72/100 | 16.6 |
| On-Page SEO | 20% | 75/100 | 15.0 |
| Schema / Structured Data | 10% | 85/100 | 8.5 |
| Performance (CWV) | 10% | 70/100 | 7.0 |
| AI Search Readiness | 10% | 90/100 | 9.0 |
| Images | 5% | 65/100 | 3.25 |
| **TOTAL** | **100%** | — | **72.6 / 100** |

### Category Rationale:

**Technical SEO (60/100):** Robots.txt, sitemap, llms.txt all exist. The hardcoded canonical in root layout causing duplicate/wrong canonicals on every page is the biggest drag. Duplicate viewport and charSet meta tags fail HTML validators. No security headers. `Cache-Control: no-store` on all pages (dev mode — will need proper caching in production).

**Content Quality (72/100):** Homepage and plans copy is strong. About, FAQ, and Contact H1s are content-weak (CMS fallbacks with no keywords). FAQ has 7 questions which is solid. Shlok dividers are unique culturally relevant content that differentiates the site.

**On-Page SEO (75/100):** Title tags well-crafted across all pages. Meta descriptions good. Canonical infrastructure exists and page-level values are correct — but root layout bug creates confusion. Inner-page Twitter/OG metadata incomplete (no og:image, wrong Twitter values).

**Schema / Structured Data (85/100):** FAQPage and ItemList/Product schemas are excellent. LocalBusiness schema is complete. Deducted for missing AboutPage, ContactPage, and BreadcrumbList schemas, plus low ratingCount.

**Performance (70/100):** Next.js 15, image/avif + image/webp configured, priority on hero image, next/font. Cannot measure actual Core Web Vitals from curl. In production, CDN and caching headers will be critical.

**AI Search Readiness (90/100):** llms.txt exists with structured content. robots.txt explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended. Organization schema with sameAs. Near-perfect. Deducted for no llms-full.txt.

**Images (65/100):** Hero and feature images have excellent descriptive alt texts. Plan card images and about-page images are weak. avif/webp formats configured. Some images sourced from lh3.googleusercontent.com (external CDN, not controlled).

---

## What Was Fixed Since Last Audit (Score: 41 → 72, +31 points)

| Fix | Impact |
|-----|--------|
| robots.txt created with AI bot permissions | +5 |
| sitemap.xml with 8 URLs and priorities | +5 |
| llms.txt with service description and pricing | +4 |
| Organization + LocalBusiness + WebSite JSON-LD | +4 |
| FAQPage JSON-LD on /faq (7 Q&As) | +3 |
| ItemList + Product JSON-LD on /plans | +3 |
| Per-route layout.tsx for about, plans, faq, contact | +3 |
| Full Open Graph set on homepage | +2 |
| Twitter Card on all pages | +1 |
| Hero image as Next.js Image with priority | +1 |
| Branded 404 page with correct HTTP 404 status | +1 |
| next/font/google replacing CDN fonts | +1 |
| image/avif + image/webp in next.config.ts | +1 |
| noindex on /admin and /dashboard | +1 |
| "Now delivering in Faridabad · NIT areas" geo signal | +1 |
