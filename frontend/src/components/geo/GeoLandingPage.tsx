import React, { useEffect, useMemo } from 'react';
import {
  MapPin,
  PhoneCall,
  Activity,
  Pill,
  Building2,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { TN_DISTRICTS, type DistrictInfo } from '../../data/tnDistricts';

interface GeoLandingPageProps {
  districtSlug?: string;
  serviceType: 'emergency-care' | 'jan-aushadhi';
  onNavigateHome?: () => void;
  onOpenChat?: () => void;
  onOpenMedicines?: () => void;
  onOpenErp?: () => void;
}

export const GeoLandingPage: React.FC<GeoLandingPageProps> = ({
  districtSlug = 'chennai',
  serviceType,
  onNavigateHome,
  onOpenChat,
  onOpenMedicines,
  onOpenErp,
}) => {
  const currentSlug = districtSlug.toLowerCase();
  const district = useMemo<DistrictInfo>(() => {
    return TN_DISTRICTS.find(d => d.slug === currentSlug) || TN_DISTRICTS[0];
  }, [currentSlug]);

  const isEmergency = serviceType === 'emergency-care';

  useEffect(() => {
    // Dynamic Document Title for High SERP Click-Through Rate
    const pageTitle = isEmergency
      ? `24/7 Emergency Hospital Beds, OPD & 108 Ambulance in ${district.name} | HealthGrid நலம் AI`
      : `Jan Aushadhi Generic Medicine Stores & Price Comparison in ${district.name} | HealthGrid (Save Up to 90%)`;
    document.title = pageTitle;

    // Update Geolocation Meta Tags in DOM
    const metaGeoRegion = document.querySelector('meta[name="geo.region"]');
    if (metaGeoRegion) metaGeoRegion.setAttribute('content', 'IN-TN');

    const metaGeoPlacename = document.querySelector('meta[name="geo.placename"]');
    if (metaGeoPlacename) metaGeoPlacename.setAttribute('content', `${district.name}, Tamil Nadu, India`);

    // Update OpenGraph Image dynamically to API OG endpoint
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute(
        'content',
        `https://healthgrid-app.vercel.app/api/og?city=${encodeURIComponent(district.name)}&service=${encodeURIComponent(
          isEmergency ? 'Emergency Hospital Beds & 108 Ambulance' : 'Jan Aushadhi Generic Medicines'
        )}&beds=${district.beds}`
      );
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [district, isEmergency]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans">
      {/* Top Banner: Regional Health Directorate Verified */}
      <div className="bg-[#071E22] text-[#02C39A] px-4 py-2.5 text-xs font-semibold tracking-wider uppercase flex items-center justify-between border-b border-white/10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#02C39A] animate-pulse" />
            <span>Tamil Nadu Health Systems Network • {district.name} District Active Node</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>Emergency Telemetry: <strong className="text-white">Active (108)</strong></span>
            <span>Language: <strong className="text-white">English / தமிழ்</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation for SEO Rich Snippets */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex items-center flex-wrap gap-2">
            <li>
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-teal-700 transition font-medium"
              >
                Home
              </button>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <li>
              <span className="text-slate-600 font-medium">Tamil Nadu Regional Network</span>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <li>
              <span className="text-slate-600 font-medium">
                {isEmergency ? 'Emergency & Hospital Care' : 'Jan Aushadhi Generic Formulary'}
              </span>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <li className="font-semibold text-teal-700" aria-current="page">
              {district.name}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#071E22] via-[#0B7A75] to-[#004D47] rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#02C39A] text-xs font-bold tracking-wide uppercase mb-6">
              <MapPin className="w-3.5 h-3.5" />
              <span>{district.name} District Regional Directorate</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
              {isEmergency ? (
                <>
                  24/7 AI Clinical Triage, Emergency Beds & 108 Ambulance in{' '}
                  <span className="text-[#02C39A]">{district.name}</span>
                </>
              ) : (
                <>
                  Jan Aushadhi Generic Medicine Stores & 90% Savings in{' '}
                  <span className="text-[#02C39A]">{district.name}</span>
                </>
              )}
            </h1>

            <p className="text-lg text-emerald-50 leading-relaxed mb-8">
              {isEmergency
                ? `Instant ICMR-calibrated medical triage, live ward bed tracking across ${district.hospitals}+ government and private healthcare facilities in ${district.name}, and priority 108 emergency ambulance coordination.`
                : `Save up to 90% on essential chronic, acute, and emergency medications across ${district.kendras}+ verified Jan Aushadhi Kendras in ${district.name}. Search identical chemical compositions verified by PMBJP.`}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              {isEmergency ? (
                <>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg hover:shadow-rose-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Call 108 Ambulance</span>
                  </a>
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#071E22] font-bold text-base shadow-lg transition transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <span>Consult AI Doctor (DocBot)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenErp}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-md transition"
                  >
                    <Activity className="w-5 h-5 text-[#02C39A]" />
                    <span>Live Hospital Bed Radar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenMedicines}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#02C39A] hover:bg-[#00A896] text-[#071E22] font-black text-base shadow-lg transition transform hover:-translate-y-0.5"
                  >
                    <Pill className="w-5 h-5" />
                    <span>Search Jan Aushadhi Prices</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-md transition"
                  >
                    <Stethoscope className="w-5 h-5 text-[#02C39A]" />
                    <span>Ask DocBot for Safe Generic Alternates</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Localized District Telemetry Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900">{district.hospitals}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Hospitals & Centers</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900">{district.beds}+</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Verified Inpatient Beds</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900">{district.kendras}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Jan Aushadhi Kendras</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-slate-900">{district.phcs}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Primary Health Centers</div>
          </div>
        </div>

        {/* Notable Government & District Facilities in this Region */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Key Healthcare Facilities in {district.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Synchronized with Ayushman Bharat Digital Mission (ABDM) and Tamil Nadu Health Portal
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live ABDM Node
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {district.notableHospitals.map((hosp, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-teal-300 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{hosp}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    24/7 Casualty • Inpatient Wards • Jan Aushadhi Pharmacy Inside
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-medium text-teal-700">
                    <button
                      type="button"
                      onClick={onOpenErp}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>Check Live Ward Beds</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Intent Frequently Asked Questions (GEO AI Search Optimized) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6">
            Frequently Asked Questions for Patients in {district.name}
          </h2>

          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                How do I call a 108 Emergency Ambulance in {district.name}?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dial 108 directly from your mobile or landline anywhere within {district.name} district. HealthGrid integrates directly with the GVK EMRI 108 emergency network, transmitting the patient's triage severity index and geolocation coordinates to the nearest available emergency ambulance crew.
              </p>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Where can I find PMBJP Jan Aushadhi generic medicines in {district.name}?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                There are {district.kendras} verified Jan Aushadhi Kendras operating across {district.name}, including facilities at government medical college hospitals, taluk headquarters, and town bus stands. You can use HealthGrid's Jan Aushadhi search tool to compare branded prescriptions against quality-certified generic substitutes and calculate direct savings up to 90%.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Can I book hospital OPD appointments and check bed availability in {district.name}?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. Through HealthGrid's Hospital ERP integration, citizens can book verified digital OPD consultation tokens and monitor real-time available beds across general, ICU, maternity, and pediatric wards at partnered hospitals in {district.name}.
              </p>
            </div>
          </div>
        </div>

        {/* District Switcher for Full Regional Exploration */}
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Explore Healthcare Services in Other Tamil Nadu Districts:</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {TN_DISTRICTS.map(d => (
              <a
                key={d.slug}
                href={`/${serviceType}/${d.slug}`}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  d.slug === district.slug
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                }`}
              >
                {d.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
