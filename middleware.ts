// Vercel Edge Middleware for Geolocation Injection, Regional Routing, and Zero-Flash SPA Hydration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _vercel internals
     * - static files with extensions (css, js, png, svg, ico, webmanifest, xml, txt)
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
  const headers = new Headers(request.headers);

  // Extract Vercel Edge Geolocation telemetry
  const country = headers.get('x-vercel-ip-country') || 'IN';
  const region = headers.get('x-vercel-ip-country-region') || 'TN';
  const rawCity = (headers.get('x-vercel-ip-city') || 'chennai').toLowerCase();
  const latitude = headers.get('x-vercel-ip-latitude') || '13.0827';
  const longitude = headers.get('x-vercel-ip-longitude') || '80.2707';

  const matchedCity = TN_CITY_MAP[rawCity] || 'chennai';

  // Target destination: Rewrite SPA routes seamlessly to /index.html
  const rewriteUrl = new URL('/index.html', request.url).toString();

  return new Response(null, {
    headers: {
      'x-middleware-rewrite': rewriteUrl,
      'x-healthgrid-geo-country': country,
      'x-healthgrid-geo-region': region,
      'x-healthgrid-geo-city': matchedCity,
      'x-healthgrid-geo-lat': latitude,
      'x-healthgrid-geo-lng': longitude,
      'Set-Cookie': `hg_geo_city=${matchedCity}; Path=/; Max-Age=604800; SameSite=Lax`,
    },
  });
}
