export const config = {
  runtime: 'edge',
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

export default function handler(request: Request) {
  const headers = new Headers(request.headers);
  const country = headers.get('x-vercel-ip-country') || 'IN';
  const region = headers.get('x-vercel-ip-country-region') || 'TN';
  const rawCity = (headers.get('x-vercel-ip-city') || 'chennai').toLowerCase();
  const latitude = headers.get('x-vercel-ip-latitude') || '13.0827';
  const longitude = headers.get('x-vercel-ip-longitude') || '80.2707';

  const matchedCity = TN_CITY_MAP[rawCity] || 'chennai';

  const payload = {
    country,
    region,
    city: matchedCity,
    latitude,
    longitude,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      'Set-Cookie': `hg_geo_city=${matchedCity}; Path=/; Max-Age=604800; SameSite=Lax`,
      'x-healthgrid-geo-city': matchedCity,
      'x-healthgrid-geo-region': region,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
