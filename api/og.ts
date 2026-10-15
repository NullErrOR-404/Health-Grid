import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      city = 'Tamil Nadu',
      service = 'Autonomous 24/7 AI Family Doctor & Emergency Guide',
      beds = '42',
    } = req.query;

    const safeCity = String(city).replace(/[<>&"']/g, '');
    const safeService = String(service).replace(/[<>&"']/g, '');
    const safeBeds = String(beds).replace(/[<>&"']/g, '');

    const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071E22" />
      <stop offset="60%" stop-color="#0B7A75" />
      <stop offset="100%" stop-color="#004D47" />
    </linearGradient>
    <linearGradient id="badge-bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00A896" />
      <stop offset="100%" stop-color="#02C39A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Subtle Decorative Grid Elements -->
  <circle cx="1080" cy="120" r="280" fill="#02C39A" opacity="0.08" />
  <circle cx="120" cy="540" r="220" fill="#00A896" opacity="0.08" />

  <!-- Header Section -->
  <g transform="translate(80, 70)">
    <!-- Brand Icon -->
    <rect x="0" y="0" width="56" height="56" rx="14" fill="url(#badge-bg)" filter="url(#shadow)" />
    <path d="M 28 14 L 28 42 M 14 28 L 42 28" stroke="#071E22" stroke-width="6" stroke-linecap="round" />
    
    <!-- Brand Name -->
    <text x="76" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">HealthGrid | &#2984;&#2994;&#2990;&#3021; AI</text>
    
    <!-- Geo Badge -->
    <rect x="740" y="4" width="300" height="48" rx="24" fill="rgba(2, 195, 154, 0.15)" stroke="#02C39A" stroke-width="1.5" />
    <text x="890" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#02C39A" text-anchor="middle">&#128205; ${safeCity}, Tamil Nadu</text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(80, 220)">
    <text x="0" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
      ${safeService}
    </text>
    <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" fill="#02C39A">
      in ${safeCity} Regional Health District
    </text>
    <text x="0" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#D1E8E2">
      Tamil Nadu 24/7 Autonomous Emergency Ambulance 108 Telemetry &amp; PMBJP Generic Savings
    </text>
  </g>

  <!-- Bottom Metric Cards -->
  <g transform="translate(80, 470)">
    <!-- Card 1: Available Beds -->
    <rect x="0" y="0" width="310" height="96" rx="16" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
    <text x="24" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#02C39A" letter-spacing="1">AVAILABLE HOSPITAL BEDS</text>
    <text x="24" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF">${safeBeds} Ward Beds Ready</text>

    <!-- Card 2: AI Triage -->
    <rect x="340" y="0" width="310" height="96" rx="16" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />
    <text x="364" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#02C39A" letter-spacing="1">CLINICAL TRIAGE SPEED</text>
    <text x="364" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF">Instant (&lt; 30s)</text>

    <!-- Card 3: 108 Emergency -->
    <rect x="680" y="0" width="360" height="96" rx="16" fill="rgba(242, 84, 91, 0.12)" stroke="rgba(242, 84, 91, 0.4)" stroke-width="1" />
    <text x="704" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#F2545B" letter-spacing="1">EMERGENCY AMBULANCE</text>
    <text x="704" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF">108 Link Connected</text>
  </g>
</svg>
    `.trim();

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(svg);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate OG image', message: err.message });
  }
}
