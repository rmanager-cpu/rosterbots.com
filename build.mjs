// Builds the site: every page body in src/pages gets the shared head, header and footer, and
// is written to <path>/index.html. Links are relative ({{root}}), so the same files work on a
// preview address and on www.rosterbots.com. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://www.rosterbots.com";
// Cloudflare Web Analytics, on the TurboTips account: counts page views with no cookies. The token
// only names the site to Cloudflare and is public by design.
const CF_BEACON = "bef8f31d6a1a4deda575c5db79d40670";
// Each stylesheet and script link carries a hash of the file, so a browser holding the old copy
// (GitHub Pages caches for 10 minutes) fetches the new one as soon as the page changes.
const asset = f => `assets/${f}?v=${createHash("sha256").update(readFileSync(join(here, "assets", f))).digest("hex").slice(0, 8)}`;

const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Turbo Devs",
  url: ORIGIN,
  email: "support@rosterbots.com",
  logo: `${ORIGIN}/assets/icon-512.png`,
};
const APP = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RosterBots",
  alternateName: "RosterBots: Hangover Protection",
  applicationCategory: "SportsApplication",
  operatingSystem: "Android, iOS",
  description: "Watches your ESPN fantasy football lineup on game day and swaps out a starter who is ruled out, on bye or projected for zero, until three minutes before kickoff.",
  url: ORIGIN,
  publisher: { "@type": "Organization", name: "Turbo Devs" },
};

// path: "" is the home page. In the sitemap unless noindex.
const pages = [
  {
    path: "",
    file: "home.html",
    title: "RosterBots: Fantasy Football Lineup Protection for ESPN",
    description: "RosterBots watches your ESPN fantasy football lineup on game day. When a starter is ruled out, on bye or projected for zero, it swaps in your best bench player before kickoff.",
    jsonld: [ORG, APP],
  },
  {
    path: "pricing",
    file: "pricing.html",
    title: "Pricing: One-Tap Alerts, Auto Protect and Agentic Protection | RosterBots",
    description: "One-Tap Alerts are free. Auto Protect is a $30 season pass and Agentic Protection $50, both half price after Week 8. Less than $2 a week to never start an inactive player.",
  },
  {
    path: "odunze",
    file: "odunze.html",
    title: "The Odunze Incident: The Late Scratch That Cost Fantasy Playoffs | RosterBots",
    description: "Week 15, 2025: Rome Odunze was listed active, hurt his foot in warmups and was ruled out minutes before kickoff. The case file, the managers who took a zero, and how RosterBots would have stopped it.",
    css: "odunze.css",
    fonts: "family=Special+Elite&family=IBM+Plex+Mono:wght@500;700",
    ogType: "article",
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "The Odunze Incident",
        description: "How a late scratch minutes before kickoff cost fantasy managers the first week of the playoffs, and how RosterBots would have stopped it.",
        datePublished: "2026-10-26",
        dateModified: "2026-10-26",
        author: { "@type": "Organization", name: "Turbo Devs" },
        publisher: { "@type": "Organization", name: "Turbo Devs", logo: { "@type": "ImageObject", url: `${ORIGIN}/assets/icon-512.png` } },
        about: [{ "@type": "Person", name: "Rome Odunze" }, { "@type": "Thing", name: "Fantasy football" }],
        mainEntityOfPage: `${ORIGIN}/odunze/`,
        image: `${ORIGIN}/assets/og.jpg`,
      },
    ],
  },
  {
    path: "waitlist",
    file: "waitlist.html",
    title: "Join the RosterBots Waitlist for Android and iPhone",
    description: "RosterBots is coming soon to Android and iPhone. Join the waitlist and we'll email you when it's ready for your phone.",
    script: "waitlist.js",
  },
  {
    path: "megacast",
    file: "megacast.html",
    title: "MegaCast: A Live Broadcast Booth for Your Fantasy League | RosterBots",
    description: "MegaCast is coming soon: three announcers calling your fantasy draft live, and weekly recap episodes about your league. Join the waitlist.",
    script: "waitlist.js",
  },
  {
    path: "support",
    file: "support.html",
    title: "Support and FAQ | RosterBots",
    description: "Answers about RosterBots: what it does, when it acts, what it never does, your ESPN sign-in, pricing, and deleting your account. Email support@rosterbots.com.",
    jsonld: "faq",
  },
  {
    path: "privacy",
    file: "privacy.html",
    title: "Privacy Policy | RosterBots",
    description: "What RosterBots collects, why, where it's kept, who it's shared with, and how to delete it.",
  },
  {
    path: "delete-account",
    file: "delete-account.html",
    title: "Delete Your RosterBots Account",
    description: "How to delete your RosterBots account and everything it stores, in the app or by email.",
  },
  {
    path: "recaps",
    file: "recaps.html",
    title: "Recaps | RosterBots",
    description: "League recaps.",
    noindex: true,
  },
];

const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function faqJson(body) {
  const items = [...body.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)];
  const text = h => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(m => ({ "@type": "Question", name: text(m[1]), acceptedAnswer: { "@type": "Answer", text: text(m[2]) } })),
  };
}

function page(p) {
  const root = p.path ? "../" : "./";
  const url = `${ORIGIN}/${p.path ? p.path + "/" : ""}`;
  const body = readFileSync(join(here, "src/pages", p.file), "utf8").replaceAll("{{root}}", root);
  const header = readFileSync(join(here, "src/header.html"), "utf8").replaceAll("{{root}}", root);
  const footer = readFileSync(join(here, "src/footer.html"), "utf8").replaceAll("{{root}}", root);
  const current = p.path ? `href="${root}${p.path}/"` : null;
  const nav = current ? header.replace(current, `${current} aria-current="page"`) : header;
  const ld = p.jsonld === "faq" ? [faqJson(body)] : p.jsonld ?? [];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#0B1020">
<meta property="og:site_name" content="RosterBots">
<meta property="og:type" content="${p.ogType ?? "website"}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="${root}assets/favicon-32.png">
<link rel="apple-touch-icon" href="${root}assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="${root}${asset("site.css")}">
${p.fonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${p.fonts}&display=swap">\n` : ""}${p.css ? `<link rel="stylesheet" href="${root}${asset(p.css)}">\n` : ""}${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>
<body>
${nav}
<main id="main">
${body}
</main>
${footer}
<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${CF_BEACON}"}'></script>
${p.script ? `<script src="${root}${asset(p.script)}" defer></script>\n` : ""}</body>
</html>
`;
}

for (const p of pages) {
  const out = join(here, p.path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page(p));
  console.log("wrote", p.path ? p.path + "/index.html" : "index.html");
}

const today = "2026-10-26";
const urls = pages.filter(p => !p.noindex).map(p => `  <url><loc>${ORIGIN}/${p.path ? p.path + "/" : ""}</loc><lastmod>${today}</lastmod></url>`);
writeFileSync(join(here, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
// Recaps are unlisted: the page carries noindex, and the audio itself is kept from crawlers.
writeFileSync(join(here, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /recaps/*.mp3\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log("wrote sitemap.xml and robots.txt");
