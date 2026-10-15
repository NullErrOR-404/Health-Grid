import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://healthgrid-app.vercel.app';
const TODAY = new Date().toISOString().split('T')[0];

// Complete 38 Districts of Tamil Nadu for Programmatic SEO Dominance
export const TN_DISTRICTS = [
  { slug: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707, hospitals: 142, beds: 1850 },
  { slug: 'coimbatore', name: 'Coimbatore', lat: 11.0168, lng: 76.9558, hospitals: 98, beds: 1220 },
  { slug: 'madurai', name: 'Madurai', lat: 9.9252, lng: 78.1198, hospitals: 86, beds: 1100 },
  { slug: 'tiruchirappalli', name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, hospitals: 72, beds: 950 },
  { slug: 'salem', name: 'Salem', lat: 11.6643, lng: 78.1460, hospitals: 68, beds: 880 },
  { slug: 'tirunelveli', name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, hospitals: 54, beds: 710 },
  { slug: 'vellore', name: 'Vellore', lat: 12.9165, lng: 79.1325, hospitals: 64, beds: 830 },
  { slug: 'thanjavur', name: 'Thanjavur', lat: 10.7870, lng: 79.1378, hospitals: 48, beds: 620 },
  { slug: 'erode', name: 'Erode', lat: 11.3410, lng: 77.7172, hospitals: 52, beds: 660 },
  { slug: 'kanyakumari', name: 'Kanyakumari', lat: 8.0883, lng: 77.5385, hospitals: 46, beds: 590 },
  { slug: 'dindigul', name: 'Dindigul', lat: 10.3673, lng: 77.9803, hospitals: 44, beds: 540 },
  { slug: 'cuddalore', name: 'Cuddalore', lat: 11.7480, lng: 79.7714, hospitals: 42, beds: 510 },
  { slug: 'kanchipuram', name: 'Kanchipuram', lat: 12.8342, lng: 79.7036, hospitals: 48, beds: 580 },
  { slug: 'tiruvallur', name: 'Tiruvallur', lat: 13.1432, lng: 79.9083, hospitals: 50, beds: 610 },
  { slug: 'tiruvannamalai', name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, hospitals: 38, beds: 460 },
  { slug: 'viluppuram', name: 'Viluppuram', lat: 11.9401, lng: 79.4861, hospitals: 36, beds: 430 },
  { slug: 'kallakurichi', name: 'Kallakurichi', lat: 11.7384, lng: 78.9639, hospitals: 28, beds: 340 },
  { slug: 'chengalpattu', name: 'Chengalpattu', lat: 12.6841, lng: 79.9836, hospitals: 56, beds: 720 },
  { slug: 'ranipet', name: 'Ranipet', lat: 12.9274, lng: 79.3330, hospitals: 30, beds: 380 },
  { slug: 'tirupathur', name: 'Tirupathur', lat: 12.4958, lng: 78.5678, hospitals: 28, beds: 350 },
  { slug: 'dharmapuri', name: 'Dharmapuri', lat: 12.1211, lng: 78.1582, hospitals: 32, beds: 390 },
  { slug: 'krishnagiri', name: 'Krishnagiri', lat: 12.5186, lng: 78.2137, hospitals: 36, beds: 440 },
  { slug: 'namakkal', name: 'Namakkal', lat: 11.2189, lng: 78.1674, hospitals: 38, beds: 470 },
  { slug: 'nilgiris', name: 'Nilgiris (Ooty)', lat: 11.4102, lng: 76.6950, hospitals: 26, beds: 310 },
  { slug: 'karur', name: 'Karur', lat: 10.9601, lng: 78.0766, hospitals: 30, beds: 370 },
  { slug: 'perambalur', name: 'Perambalur', lat: 11.2342, lng: 78.8820, hospitals: 22, beds: 270 },
  { slug: 'ariyalur', name: 'Ariyalur', lat: 11.1401, lng: 79.0786, hospitals: 20, beds: 240 },
  { slug: 'nagapattinam', name: 'Nagapattinam', lat: 10.7672, lng: 79.8449, hospitals: 28, beds: 340 },
  { slug: 'mayiladuthurai', name: 'Mayiladuthurai', lat: 11.1075, lng: 79.6524, hospitals: 26, beds: 320 },
  { slug: 'tiruvarur', name: 'Tiruvarur', lat: 10.7725, lng: 79.6365, hospitals: 30, beds: 360 },
  { slug: 'pudukkottai', name: 'Pudukkottai', lat: 10.3833, lng: 78.8001, hospitals: 34, beds: 410 },
  { slug: 'sivaganga', name: 'Sivaganga', lat: 9.8433, lng: 78.4809, hospitals: 32, beds: 390 },
  { slug: 'ramanathapuram', name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, hospitals: 34, beds: 410 },
  { slug: 'virudhunagar', name: 'Virudhunagar', lat: 9.5872, lng: 77.9514, hospitals: 40, beds: 490 },
  { slug: 'thoothukudi', name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, hospitals: 48, beds: 590 },
  { slug: 'tenkasi', name: 'Tenkasi', lat: 8.9594, lng: 77.3150, hospitals: 32, beds: 380 },
  { slug: 'tiruppur', name: 'Tiruppur', lat: 11.1085, lng: 77.3411, hospitals: 58, beds: 710 },
  { slug: 'theni', name: 'Theni', lat: 10.0104, lng: 77.4768, hospitals: 32, beds: 390 },
];

const STATIC_ROUTES = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/chat', changefreq: 'daily', priority: '0.95' },
  { path: '/medicines', changefreq: 'daily', priority: '0.95' },
  { path: '/maps', changefreq: 'daily', priority: '0.90' },
  { path: '/hospital-erp', changefreq: 'daily', priority: '0.88' },
  { path: '/bulletins', changefreq: 'daily', priority: '0.85' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.60' },
  { path: '/terms', changefreq: 'monthly', priority: '0.60' },
];

export function generateSitemapXml() {
  const urls = [];

  // 1. Static Root & Core Modules
  for (const route of STATIC_ROUTES) {
    urls.push(`  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${route.path}" />
    <xhtml:link rel="alternate" hreflang="ta" href="${SITE_URL}${route.path}?lang=ta" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.path}" />
  </url>`);
  }

  // 2. Programmatic District Geo Landing Pages (38 Districts x 2 Services = 76 Localized Landing Gates)
  for (const d of TN_DISTRICTS) {
    // Service A: Emergency Care, 108 Ambulance & Hospital Beds
    urls.push(`  <url>
    <loc>${SITE_URL}/emergency-care/${d.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.92</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/emergency-care/${d.slug}" />
    <xhtml:link rel="alternate" hreflang="ta" href="${SITE_URL}/emergency-care/${d.slug}?lang=ta" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/emergency-care/${d.slug}" />
  </url>`);

    // Service B: Jan Aushadhi (PMBJP) Generic Medicine Center Finder
    urls.push(`  <url>
    <loc>${SITE_URL}/jan-aushadhi/${d.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.89</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/jan-aushadhi/${d.slug}" />
    <xhtml:link rel="alternate" hreflang="ta" href="${SITE_URL}/jan-aushadhi/${d.slug}?lang=ta" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/jan-aushadhi/${d.slug}" />
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
}

export function generateRobotsTxt() {
  return `# HealthGrid Autonomous Healthcare Operating System (2026 Production Protocol)
# Strict Search Engine Crawling & Generative Engine Optimization (GEO) Directives

User-agent: *
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /chat
Allow: /medicines
Allow: /maps
Allow: /hospital-erp
Allow: /bulletins
Allow: /privacy
Allow: /terms
Allow: /thank-you
Disallow: /profile
Disallow: /api/
Disallow: /auth/
Disallow: /cabinet

# Dedicated Generative Engine LLM Crawlers (Perplexity, ChatGPT, Claude, Gemini, Applebot)
User-agent: GPTBot
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /medicines
Allow: /maps
Allow: /bulletins

User-agent: ClaudeBot
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /medicines
Allow: /maps
Allow: /bulletins

User-agent: PerplexityBot
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /medicines
Allow: /maps
Allow: /bulletins

User-agent: Google-Extended
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /medicines
Allow: /maps

User-agent: Applebot-Extended
Allow: /
Allow: /emergency-care/
Allow: /jan-aushadhi/
Allow: /medicines
Allow: /maps

User-agent: Amazonbot
Allow: /

# Authoritative Canonical Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// Write files to frontend/public
const publicDir = path.resolve(__dirname, '../frontend/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemapXml(), 'utf-8');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobotsTxt(), 'utf-8');

console.log(`[SEO-Pipeline] Successfully written sitemap.xml with ${STATIC_ROUTES.length + TN_DISTRICTS.length * 2} URLs.`);
console.log(`[SEO-Pipeline] Successfully written hardened robots.txt.`);
