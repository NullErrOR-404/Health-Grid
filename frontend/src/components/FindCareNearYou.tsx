import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Crosshair,
  MapPin,
  Building2,
  Pill,
  Stethoscope,
  ChevronRight,
  Navigation,
  Clock,
  Phone,
  X,
  Compass,
  Plus,
  Minus,
  Sparkles,
  Siren,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Language } from '../types';
import { FacilityListSkeleton } from './SkeletonLoader';
import { CustomSelect } from './CustomSelect';

export type FacilityType = 'all' | 'hospital' | 'pharmacy' | 'clinic';

export interface PlaceItem {
  id: string;
  nameEn: string;
  nameTa: string;
  type: 'hospital' | 'pharmacy' | 'clinic';
  categoryEn: string;
  categoryTa: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isOpen: boolean;
  statusHighlightEn: string;
  statusHighlightTa: string;
  phone: string;
  addressEn: string;
  addressTa: string;
  image: string;
  featuresEn: { icon: 'emergency' | 'outpatient' | 'clock' | 'generic' | 'specialist'; label: string }[];
  featuresTa: { icon: 'emergency' | 'outpatient' | 'clock' | 'generic' | 'specialist'; label: string }[];
  bedCount?: number;
  genericDiscount?: string;
}

const PLACES_DATA: PlaceItem[] = [
  {
    id: 'place-1',
    nameEn: 'Rajiv Gandhi Govt General Hospital',
    nameTa: 'ராஜீவ் காந்தி அரசு பொது மருத்துவமனை',
    type: 'hospital',
    categoryEn: 'Government Hospital • Multi-speciality',
    categoryTa: 'அரசு மருத்துவமனை • பல்நோக்கு சிறப்பு பிரிவு',
    lat: 13.0805,
    lng: 80.2798,
    distanceKm: 1.0,
    isOpen: true,
    statusHighlightEn: '24/7 Emergency',
    statusHighlightTa: '24/7 அவசர சிகிச்சை',
    phone: '044-25305000',
    addressEn: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003',
    addressTa: 'ஈ.வே.ரா பெரியார் சாலை, பார்க் டவுன், சென்னை 600003',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'emergency', label: 'Emergency care' },
      { icon: 'outpatient', label: 'Outpatient services' },
      { icon: 'clock', label: '24/7 Availability' }
    ],
    featuresTa: [
      { icon: 'emergency', label: 'அவசர சிகிச்சை' },
      { icon: 'outpatient', label: 'புறநோயாளி பிரிவு' },
      { icon: 'clock', label: '24/7 செயல்படும்' }
    ],
    bedCount: 2700
  },
  {
    id: 'place-2',
    nameEn: 'Pradhan Mantri Jan Aushadhi Kendra',
    nameTa: 'ஜன் அவுஷதி மக்கள் மருந்தகம்',
    type: 'pharmacy',
    categoryEn: 'Pharmacy • Govt. of India',
    categoryTa: 'மக்கள் மருந்தகம் • மத்திய அரசு திட்டம்',
    lat: 13.0765,
    lng: 80.2715,
    distanceKm: 0.7,
    isOpen: true,
    statusHighlightEn: 'Generic Medicines',
    statusHighlightTa: 'மலிவு விலை ஜெனரிக் மருந்துகள்',
    phone: '1800-180-8080',
    addressEn: 'Shop 4, Near Park Town Station, Chennai 600003',
    addressTa: 'கடை எண் 4, பார்க் டவுன் ரயில் நிலையம் அருகில், சென்னை',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'generic', label: 'Up to 80% Discounts' },
      { icon: 'clock', label: 'Open 8:00 AM - 10:00 PM' }
    ],
    featuresTa: [
      { icon: 'generic', label: '80% வரை கட்டணக் குறைப்பு' },
      { icon: 'clock', label: 'காலை 8:00 - இரவு 10:00' }
    ],
    genericDiscount: '50-80%'
  },
  {
    id: 'place-3',
    nameEn: "Chennai Government Children's Hospital",
    nameTa: 'சென்னை அரசு குழந்தைகள் நல மருத்துவமனை (எழும்பூர்)',
    type: 'hospital',
    categoryEn: 'Government Hospital • Paediatrics',
    categoryTa: 'அரசு குழந்தைகள் சிறப்பு மருத்துவமனை',
    lat: 13.0732,
    lng: 80.2589,
    distanceKm: 1.8,
    isOpen: true,
    statusHighlightEn: 'Paediatric Care',
    statusHighlightTa: 'குழந்தைகள் சிறப்பு பிரிவு',
    phone: '044-28191982',
    addressEn: 'Halls Rd, Egmore, Chennai 600008',
    addressTa: 'ஹால்ஸ் சாலை, எழும்பூர், சென்னை 600008',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'specialist', label: 'Pediatric ICU' },
      { icon: 'emergency', label: 'Neonatal Trauma' },
      { icon: 'clock', label: '24/7 Availability' }
    ],
    featuresTa: [
      { icon: 'specialist', label: 'குழந்தைகள் தீவிர சிகிச்சை' },
      { icon: 'emergency', label: 'பச்சிளம் குழந்தை பிரிவு' },
      { icon: 'clock', label: '24/7 செயல்படும்' }
    ],
    bedCount: 850
  },
  {
    id: 'place-4',
    nameEn: "Dr. Mehta's Clinic",
    nameTa: 'டாக்டர் மேத்தா கிளினிக்',
    type: 'clinic',
    categoryEn: 'Clinic • Appointment available',
    categoryTa: 'மருத்துவ மையம் • நேரடி ஆலோசனை',
    lat: 13.0715,
    lng: 80.2458,
    distanceKm: 1.9,
    isOpen: true,
    statusHighlightEn: 'General Physician',
    statusHighlightTa: 'பொது மருத்துவர்',
    phone: '044-42271001',
    addressEn: 'Poonamallee High Rd, Chetpet, Chennai 600031',
    addressTa: 'பூந்தமல்லி நெடுஞ்சாலை, சேத்துப்பட்டு, சென்னை',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'specialist', label: 'General Physician' },
      { icon: 'outpatient', label: 'Vaccination & Blood Test' },
      { icon: 'clock', label: 'Open till 9:00 PM' }
    ],
    featuresTa: [
      { icon: 'specialist', label: 'பொது மருத்துவர்' },
      { icon: 'outpatient', label: 'தடுப்பூசி & பரிசோதனை' },
      { icon: 'clock', label: 'இரவு 9:00 வரை இயங்கும்' }
    ]
  },
  {
    id: 'place-5',
    nameEn: 'MedPlus Pharmacy',
    nameTa: 'மெட்பிளஸ் மருந்தகம் - பார்க் டவுன்',
    type: 'pharmacy',
    categoryEn: 'Retail Pharmacy • 24/7 Delivery',
    categoryTa: 'தனியார் மருந்தகம் • 24/7 விநியோகம்',
    lat: 13.0845,
    lng: 80.2865,
    distanceKm: 2.1,
    isOpen: true,
    statusHighlightEn: 'Wide range of medicines',
    statusHighlightTa: 'அனைத்து மருந்துகளும் கிடைக்கும்',
    phone: '044-49004900',
    addressEn: 'Wall Tax Road, Park Town, Chennai 600003',
    addressTa: 'வால் டாக்ஸ் சாலை, பார்க் டவுன், சென்னை',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'generic', label: 'Doorstep Delivery' },
      { icon: 'clock', label: '24/7 Store' }
    ],
    featuresTa: [
      { icon: 'generic', label: 'வீட்டுக்கே டெலிவரி' },
      { icon: 'clock', label: '24 மணி நேரமும் திறந்திருக்கும்' }
    ]
  },
  {
    id: 'place-6',
    nameEn: 'Apollo Clinic - Park Town',
    nameTa: 'அப்பல்லோ கிளினிக் - பார்க் டவுன்',
    type: 'clinic',
    categoryEn: 'Speciality Clinic • Diagnostics',
    categoryTa: 'சிறப்பு மருத்துவ பரிசோதனை மையம்',
    lat: 13.0820,
    lng: 80.2745,
    distanceKm: 2.4,
    isOpen: true,
    statusHighlightEn: 'Diagnostics & Consultation',
    statusHighlightTa: 'பரிசோதனை மற்றும் ஆலோசனை',
    phone: '044-25381001',
    addressEn: 'NSC Bose Rd, Sowcarpet, Chennai 600079',
    addressTa: 'என்.எஸ்.சி போஸ் சாலை, சவுகார்பேட்டை, சென்னை',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'specialist', label: 'ECG & Echo Diagnostics' },
      { icon: 'outpatient', label: 'Consultant Specialist' }
    ],
    featuresTa: [
      { icon: 'specialist', label: 'ஈசிஜி & எக்கோ பரிசோதனை' },
      { icon: 'outpatient', label: 'சிறப்பு மருத்துவர் ஆலோசனை' }
    ]
  },
  {
    id: 'place-7',
    nameEn: 'Govt Kilpauk Medical College Hospital',
    nameTa: 'கீழ்ப்பாக்கம் அரசு மருத்துவக் கல்லூரி மருத்துவமனை',
    type: 'hospital',
    categoryEn: 'Government Hospital • Super-speciality',
    categoryTa: 'அரசு மருத்துவக் கல்லூரி மருத்துவமனை',
    lat: 13.0784,
    lng: 80.2427,
    distanceKm: 3.5,
    isOpen: true,
    statusHighlightEn: '24/7 Burns & Trauma Care',
    statusHighlightTa: '24/7 தீக்காய மற்றும் விபத்து சிகிச்சை',
    phone: '044-28364951',
    addressEn: '822, Poonamallee High Rd, Kilpauk, Chennai 600010',
    addressTa: '822, பூந்தமல்லி நெடுஞ்சாலை, கீழ்ப்பாக்கம், சென்னை',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'emergency', label: 'Specialized Burn ICU' },
      { icon: 'clock', label: '24/7 Availability' }
    ],
    featuresTa: [
      { icon: 'emergency', label: 'தீக்காய சிறப்பு தீவிர சிகிச்சை' },
      { icon: 'clock', label: '24/7 செயல்படும்' }
    ],
    bedCount: 1050
  },
  {
    id: 'place-8',
    nameEn: 'Government Royapettah Hospital',
    nameTa: 'அரசு ராயப்பேட்டை மருத்துவமனை',
    type: 'hospital',
    categoryEn: 'Government Hospital • Multi-speciality',
    categoryTa: 'அரசு பல்நோக்கு மருத்துவமனை',
    lat: 13.0532,
    lng: 80.2608,
    distanceKm: 3.8,
    isOpen: true,
    statusHighlightEn: 'Toxicology & Trauma Unit',
    statusHighlightTa: 'நச்சுமுறிவு மற்றும் விபத்து பிரிவு',
    phone: '044-28483051',
    addressEn: 'Westcott Rd, Royapettah, Chennai 600014',
    addressTa: 'வெஸ்ட்காட் சாலை, ராயப்பேட்டை, சென்னை',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    featuresEn: [
      { icon: 'emergency', label: 'Regional Poison Center' },
      { icon: 'clock', label: '24/7 Casualty & ICU' }
    ],
    featuresTa: [
      { icon: 'emergency', label: 'விஷமுறிவு சிகிச்சை மையம்' },
      { icon: 'clock', label: '24/7 அவசர சிகிச்சை' }
    ],
    bedCount: 1025
  }
];

interface FindCareNearYouProps {
  lang: Language;
  onClose?: () => void;
  isModal?: boolean;
}

export const FindCareNearYou: React.FC<FindCareNearYouProps> = ({
  lang,
  onClose,
  isModal = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FacilityType>('all');
  const [selectedRadius, setSelectedRadius] = useState<'2' | '5' | '10' | 'all'>('2');
  const [sortBy, setSortBy] = useState<'nearest' | 'name'>('nearest');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 13.0827,
    lng: 80.2707,
    name: 'Chennai Central, Park Town'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(PLACES_DATA[0]);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Invalidate map size when switching to map tab on mobile
  useEffect(() => {
    if (mobileTab === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [mobileTab]);

  // Haversine formula to compute distance from center
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    return PLACES_DATA.map((p) => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
      return { ...p, distanceKm: dist };
    })
      .filter((place) => {
        // Category filter
        if (selectedCategory !== 'all' && place.type !== selectedCategory) return false;

        // Radius filter
        if (selectedRadius !== 'all') {
          const maxRadius = parseFloat(selectedRadius);
          if (place.distanceKm > maxRadius) return false;
        }

        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchEn = place.nameEn.toLowerCase().includes(q) || place.categoryEn.toLowerCase().includes(q) || place.addressEn.toLowerCase().includes(q);
          const matchTa = place.nameTa.toLowerCase().includes(q) || place.categoryTa.toLowerCase().includes(q) || place.addressTa.toLowerCase().includes(q);
          if (!matchEn && !matchTa) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        return a.nameEn.localeCompare(b.nameEn);
      });
  }, [selectedCategory, selectedRadius, searchQuery, sortBy, userLocation]);

  // Handle GPS location fetch
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'உங்கள் உலாவியில் இருப்பிட வசதி இல்லை.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          name: lang === 'en' ? 'Current GPS Location' : 'தற்போதைய இருப்பிடம்'
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        // Fallback: stay at Chennai Central
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create clean CartoDB Positron / OSM Map
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      const cartoKey = (import.meta.env.VITE_CARTO_API_KEY as string) || '';
      // Note: CARTO raster basemaps require ?key= parameter to serve authenticated tiles
      const tileUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`;

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; CARTO &copy; OpenStreetMap'
      });

      tileLayer.on('tileerror', (error) => {
        const tileImg = error.tile as HTMLImageElement;
        if (tileImg && !tileImg.dataset.retried) {
          tileImg.dataset.retried = 'true';
          const coords = (error as any).coords;
          if (coords) {
            tileImg.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
          }
        }
      });

      tileLayer.addTo(map);

      // Markers layer
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size on initial mount
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers and circle
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }

    // 1. Draw User Location Pin & Radius Circle
    const userIcon = L.divIcon({
      className: 'user-loc-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(13, 148, 136, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 9999px; background: #0D9488; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
      .bindTooltip(userLocation.name, { permanent: false, direction: 'top' })
      .addTo(markersLayerRef.current!);

    // Draw radius boundary circle matching Maps ref.png
    if (selectedRadius !== 'all') {
      const radiusMeters = parseFloat(selectedRadius) * 1000;
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusMeters,
        color: '#0D9488',
        fillColor: '#0D9488',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
      radiusCircleRef.current = circle;
    }

    // 2. Draw Facility Pins (Red for Hospitals, Blue for Pharmacies, Purple for Clinics)
    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;

      // Color scheme based on type
      let pinColor = '#DC2626'; // Hospital red
      let iconSvg = `<path d="M12 7v10M7 12h10" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`;

      if (place.type === 'pharmacy') {
        pinColor = '#2563EB'; // Pharmacy blue
        iconSvg = `<rect x="6" y="6" width="12" height="12" rx="4" transform="rotate(45 12 12)" stroke="white" stroke-width="2" fill="none"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" stroke="white" stroke-width="2"/>`;
      } else if (place.type === 'clinic') {
        pinColor = '#9333EA'; // Clinic purple
        iconSvg = `<path d="M6 4v5a6 6 0 0 0 12 0V4M12 15v5m-3 0h6" stroke="white" stroke-width="2" stroke-linecap="round"/>`;
      }

      // Teardrop pin HTML exactly as in Maps ref.png
      const pinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
          ${
            isSelected
              ? `<div style="background: #0B132B; color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; margin-bottom: 3px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); white-space: nowrap;">
                  ${place.distanceKm} km
                </div>`
              : ''
          }
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '44px' : '38px'};
            background-color: ${pinColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            transition: all 0.2s ease-in-out;
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none">
              ${iconSvg}
            </svg>
          </div>
        </div>
      `;

      const customPinIcon = L.divIcon({
        className: 'custom-facility-pin',
        html: pinHtml,
        iconSize: [36, 52],
        iconAnchor: [18, 50]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customPinIcon });
      marker.on('click', () => {
        setSelectedPlace(place);
        map.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
      });

      markersLayerRef.current?.addLayer(marker);
    });

  }, [filteredPlaces, selectedPlace, userLocation, selectedRadius]);

  // Center on selected place
  const handleSelectPlace = (place: PlaceItem) => {
    setSelectedPlace(place);
    setMobileTab('map');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }
  };

  return (
    <div
      data-lenis-prevent={isModal ? true : undefined}
      className={`bg-white text-slate-900 w-full flex flex-col font-sans ${isModal ? 'max-w-7xl h-full sm:h-[92vh] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-none sm:border border-slate-200' : 'min-h-[calc(100vh-120px)]'}`}
    >
      {/* Top Header / Page Title Row */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between bg-white gap-3 shrink-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            {lang === 'en' ? 'Find Care Near You' : 'உங்கள் அருகிலுள்ள மருத்துவ மையங்கள்'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {lang === 'en'
              ? 'Hospitals, pharmacies and clinics based on your location'
              : 'உங்கள் இருப்பிடத்தை அடிப்படையாகக் கொண்ட மருத்துவமனைகள், மருந்தகங்கள் மற்றும் கிளினிக்குகள்'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Segmented View Switcher: List vs Map (lg:hidden) */}
          <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileTab('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileTab === 'list'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'List' : 'பட்டியல்'}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileTab === 'map'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Map' : 'வரைபடம்'}
            </button>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors min-w-[36px] min-h-[36px] cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout matching Maps ref.png */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT COLUMN: Directory & Filters Sidebar (400px - 440px) */}
        <div className={`w-full lg:w-[440px] xl:w-[460px] border-r border-slate-100 bg-white flex flex-col h-full z-10 flex-shrink-0 ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Top Controls in Sidebar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search hospitals, pharmacies or clinics' : 'மருத்துவமனை, மருந்தகம் அல்லது கிளினிக் தேடுக'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Status Row: Near Chennai Central + Use my location */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
              <div className="flex items-center gap-2 text-slate-800 font-semibold truncate max-w-[240px]">
                <Crosshair className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="truncate">
                  {lang === 'en' ? `Near ${userLocation.name}` : `${userLocation.name} அருகில்`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer flex-shrink-0 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 text-teal-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? (lang === 'en' ? 'Locating...' : 'கண்டறிகிறது...') : (lang === 'en' ? 'Use my location' : 'என் இருப்பிடம்')}</span>
              </button>
            </div>

            {/* Category Filter Pills (All, Hospitals, Pharmacies, Clinics) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* All */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'All' : 'அனைத்தும்'}</span>
              </button>

              {/* Hospitals (Red) */}
              <button
                type="button"
                onClick={() => setSelectedCategory('hospital')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'hospital'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#FEE2E2] text-[#DC2626] hover:bg-rose-200/80'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Hospitals' : 'மருத்துவமனைகள்'}</span>
              </button>

              {/* Pharmacies (Blue) */}
              <button
                type="button"
                onClick={() => setSelectedCategory('pharmacy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'pharmacy'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[#DBEAFE] text-[#2563EB] hover:bg-blue-200/80'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Pharmacies' : 'மருந்தகங்கள்'}</span>
              </button>

              {/* Clinics (Purple) */}
              <button
                type="button"
                onClick={() => setSelectedCategory('clinic')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'clinic'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#F3E8FF] text-[#9333EA] hover:bg-purple-200/80'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Clinics' : 'கிளினிக்குகள்'}</span>
              </button>
            </div>

            {/* Radius Filters: Within 2 km, 5 km, 10 km, All */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                {lang === 'en' ? 'Within' : 'சுற்றளவு'}:
              </span>
              <div className="flex items-center gap-2">
                {(['2', '5', '10', 'all'] as const).map((rad) => (
                  <button
                    key={rad}
                    type="button"
                    onClick={() => setSelectedRadius(rad)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRadius === rad
                        ? 'bg-[#E6F4F1] text-teal-800 border border-teal-300 font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {rad === 'all' ? (lang === 'en' ? 'All' : 'அனைத்தும்') : `${rad} km`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary & Sort Dropdown */}
          <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-[#0B132B]">
              {filteredPlaces.length} {lang === 'en' ? 'places nearby' : 'இடங்கள் உள்ளன'}
            </span>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                {lang === 'en' ? 'Sort:' : 'வரிசை:'}
              </span>
              <div className="w-36">
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: 'nearest', label: lang === 'en' ? 'Nearest' : 'அருகிலுள்ளவை' },
                    { value: 'name', label: lang === 'en' ? 'Name (A-Z)' : 'பெயர்' },
                  ]}
                  placeholder={lang === 'en' ? 'Sort' : 'வரிசை'}
                  size="xs"
                  rounded="xl"
                  align="right"
                  icon={<ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  triggerClassName="!py-1 !px-2.5 !bg-white !text-xs !font-semibold !border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Directory Places List matching Maps ref.png */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {isLocating ? (
              <div className="p-2">
                <div className="text-xs text-slate-400 font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  <span>{lang === 'en' ? 'Scanning nearest verified healthcare centers...' : 'அருகிலுள்ள மருத்துவ மையங்களை தேடுகிறது...'}</span>
                </div>
                <FacilityListSkeleton count={4} />
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">{lang === 'en' ? 'No places found in this radius' : 'இந்த சுற்றளவில் இடங்கள் இல்லை'}</p>
                <p className="text-xs text-slate-400 mt-1">{lang === 'en' ? 'Try selecting 5 km or All' : '5 km அல்லது அனைத்தையும் தேர்ந்தெடுக்கவும்'}</p>
              </div>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/60 border border-teal-300 shadow-xs'
                        : 'hover:bg-slate-50/80 border border-transparent'
                    }`}
                  >
                    {/* Left: Icon circle */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          place.type === 'hospital'
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : place.type === 'pharmacy'
                            ? 'bg-[#DBEAFE] text-[#2563EB]'
                            : 'bg-[#F3E8FF] text-[#9333EA]'
                        }`}
                      >
                        {place.type === 'hospital' ? (
                          <Building2 className="w-5 h-5" />
                        ) : place.type === 'pharmacy' ? (
                          <Pill className="w-5 h-5" />
                        ) : (
                          <Stethoscope className="w-5 h-5" />
                        )}
                      </div>

                      {/* Info: Name + Meta + Category */}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {lang === 'ta' ? place.nameTa : place.nameEn}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{place.distanceKm} km</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {lang === 'en' ? 'Open' : 'திறந்துள்ளது'}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {lang === 'ta' ? place.statusHighlightTa : place.statusHighlightEn}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {lang === 'ta' ? place.categoryTa : place.categoryEn}
                        </div>
                      </div>
                    </div>

                    {/* Right: Chevron */}
                    <ChevronRight className={`w-4 h-4 text-slate-300 flex-shrink-0 ml-2 transition-transform ${isSelected ? 'text-teal-600 translate-x-0.5' : ''}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Leaflet Interactive Map */}
        <div className={`flex-1 relative h-full min-h-[420px] lg:h-auto overflow-hidden bg-slate-100 ${mobileTab === 'map' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Map Container */}
          <div data-lenis-prevent ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

          {/* Floating Map Controls Stack (Top Right) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[999]">
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.8 });
                }
              }}
              className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-teal-700 shadow-md border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Re-center Map' : 'இருப்பிடத்திற்கு திரும்பு'}
            >
              <Compass className="w-5 h-5 text-teal-600" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-teal-700 shadow-md border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:text-teal-700 shadow-md border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Scale Bar at Bottom Right */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 shadow-xs border border-slate-200 z-[999] pointer-events-none">
            1 km ───
          </div>

          {/* FLOATING SELECTED PLACE CARD AT BOTTOM - Matching Maps ref.png */}
          {selectedPlace && (
            <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-2xl bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 z-[999] animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Left: Building Image */}
                <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-100">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#0B132B]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedPlace.type}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Name + Close Button */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-extrabold text-[#0B132B] leading-tight truncate">
                        {lang === 'ta' ? selectedPlace.nameTa : selectedPlace.nameEn}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedPlace(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Close details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta: Distance • Open • 24/7 Emergency */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <span className="font-bold text-slate-800">{selectedPlace.distanceKm} km</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {lang === 'en' ? 'Open' : 'திறந்துள்ளது'}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">
                        {lang === 'ta' ? selectedPlace.statusHighlightTa : selectedPlace.statusHighlightEn}
                      </span>
                    </div>

                    {/* Subtitle Category */}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {lang === 'ta' ? selectedPlace.categoryTa : selectedPlace.categoryEn}
                    </div>

                    {/* Feature Badges (Emergency care, Outpatient, 24/7) */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {(lang === 'ta' ? selectedPlace.featuresTa : selectedPlace.featuresEn).map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {f.icon === 'emergency' && <Siren className="w-3 h-3 text-red-500" />}
                          {f.icon === 'outpatient' && <Stethoscope className="w-3 h-3 text-purple-500" />}
                          {f.icon === 'clock' && <Clock className="w-3 h-3 text-slate-500" />}
                          {f.icon === 'generic' && <Pill className="w-3 h-3 text-teal-600" />}
                          {f.icon === 'specialist' && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                          <span>{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Get Directions & View Details */}
                  <div className="flex items-center gap-2.5 mt-3 pt-2 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#0A5C4F] hover:bg-[#08493f] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Get Directions' : 'வழிசெலுத்தல்'}</span>
                    </a>

                    <a
                      href={`tel:${selectedPlace.phone}`}
                      className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-xl transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>{lang === 'en' ? 'Call Now' : 'அழை'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
