// Vercel Edge Middleware for Geolocation Injection, Regional Routing, and Zero-Flash Hydration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _vercel internals
     * - static files with extensions (css, js, png, svg, ico, webmanifest, etc.)
     */
    '/((?!api|_vercel|assets|.*\\..*).*)',
  ],
};

const TN_CITY_MAP: Record<string, string> = {
  chennai: 'chennai',
  madras: 'chennai',
  coimbatore: 'coimbatore',
  kovai: 'coimbatore',
  madurai: 'madurai',
  trichy: 'tiruchirappalli',
  tiruchirappalli: 'tiruchirappalli',
  salem: 'salem',
  tirunelveli: 'tirunelveli',
  nellai: 'tirunelveli',
  vellore: 'vellore',
  thanjavur: 'thanjavur',
  erode: 'erode',
  nagercoil: 'kanyakumari',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);

  // Extract Vercel Edge Geolocation telemetry
  const country = headers.get('x-vercel-ip-country') || 'IN';
  const region = headers.get('x-vercel-ip-country-region') || 'TN';
  const rawCity = (headers.get('x-vercel-ip-city') || 'chennai').toLowerCase();
  const latitude = headers.get('x-vercel-ip-latitude') || '13.0827';
  const longitude = headers.get('x-vercel-ip-longitude') || '80.2707';

  const matchedCity = TN_CITY_MAP[rawCity] || 'chennai';

  // Inject enriched geolocation headers for SSR / Client Hydration
  headers.set('x-healthgrid-geo-country', country);
  headers.set('x-healthgrid-geo-region', region);
  headers.set('x-healthgrid-geo-city', matchedCity);
  headers.set('x-healthgrid-geo-lat', latitude);
  headers.set('x-healthgrid-geo-lng', longitude);

  // Forward request with injected geo context
  const response = new Response(null, {
    headers: {
      'x-middleware-next': '1',
      'x-healthgrid-geo-city': matchedCity,
      'x-healthgrid-geo-region': region,
      'Set-Cookie': `hg_geo_city=${matchedCity}; Path=/; Max-Age=604800; SameSite=Lax`,
    },
  });

  return response;
}
