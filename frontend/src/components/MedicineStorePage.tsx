import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Plus,
  Minus,
  FileText,
  Check,
  X,
  Store,
  Upload,
  ArrowLeft,
  Droplet,
  HeartPulse,
  FlaskConical,
  Wind,
  Flame,
  Thermometer,
  LayoutGrid,
  Percent,
  CheckCircle
} from 'lucide-react';
import type { Language } from '../types';
import {
  medicineStoreService,
  type MedicineItem,
  type MedicineCartItem,
  type DeliveryType,
  type PaymentMethod,
  type JanAushadhiKendra,
  type MedicineOrder
} from '../services/medicineStoreService';
import { authService, type AuthUser } from '../services/authService';

interface MedicineStorePageProps {
  lang: Language;
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
}

interface CategoryTab {
  id: string;
  nameEn: string;
  nameTa: string;
  icon: React.ReactNode;
}

export const MedicineStorePage: React.FC<MedicineStorePageProps> = ({
  lang,
  onNavigateHome,
  onOpenLogin,
  onOpenPrescription,
  onOpenDiseaseMap
}) => {
  // Database & Catalog state
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => medicineStoreService.getCatalog());
  const [kendras] = useState<JanAushadhiKendra[]>(() => medicineStoreService.getKendras());
  const [isDbLive, setIsDbLive] = useState(false);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'name'>('popular');
  const [onlySubsidized, setOnlySubsidized] = useState(false);

  // Cart & Checkout state
  const [cart, setCart] = useState<MedicineCartItem[]>(() => medicineStoreService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<MedicineOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User state
  const [currentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Checkout form state
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home_delivery');
  const [selectedKendraId, setSelectedKendraId] = useState<string>(kendras[0]?.id || '');
  const [patientName, setPatientName] = useState(currentUser?.name || 'K. Sundaram');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '98401 23456');
  const [shippingAddress, setShippingAddress] = useState('No. 14, 2nd Main Road, Royapuram, Chennai');
  const [pincode, setPincode] = useState('600013');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Categories matching the reference design pills
  const categories: CategoryTab[] = [
    {
      id: 'all',
      nameEn: 'All Medicines',
      nameTa: 'அனைத்து மருந்துகள்',
      icon: <LayoutGrid className="w-4 h-4" />
    },
    {
      id: 'diabetes',
      nameEn: 'Diabetes',
      nameTa: 'சர்க்கரை நோய்',
      icon: <Droplet className="w-4 h-4" />
    },
    {
      id: 'blood_pressure',
      nameEn: 'Blood Pressure',
      nameTa: 'இரத்த அழுத்தம்',
      icon: <HeartPulse className="w-4 h-4" />
    },
    {
      id: 'cholesterol',
      nameEn: 'Cholesterol',
      nameTa: 'கொழுப்பு / இதயம்',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      id: 'antibiotics',
      nameEn: 'Antibiotics',
      nameTa: 'நுண்ணுயிர் எதிர்ப்பு',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      id: 'asthma_inhalers',
      nameEn: 'Asthma & Inhalers',
      nameTa: 'ஆஸ்துமா & இன்ஹேலர்',
      icon: <Wind className="w-4 h-4" />
    },
    {
      id: 'gastro_acidity',
      nameEn: 'Gastro & Acidity',
      nameTa: 'அசிடிட்டி & குடல்',
      icon: <Flame className="w-4 h-4" />
    },
    {
      id: 'pain_fever',
      nameEn: 'Pain & Fever',
      nameTa: 'வலி & காய்ச்சல்',
      icon: <Thermometer className="w-4 h-4" />
    }
  ];

  // Fetch medicines dynamically from Supabase database on mount & subscribe to store updates
  useEffect(() => {
    let isMounted = true;
    
    // Proactively pull real database rows from Supabase
    medicineStoreService.fetchMedicinesFromDb().then(data => {
      if (isMounted && data && data.length > 0) {
        setMedicines(data);
        setIsDbLive(true);
      }
    });

    const unsubscribe = medicineStoreService.subscribe(() => {
      if (isMounted) {
        setMedicines([...medicineStoreService.getCatalog()]);
        setCart([...medicineStoreService.getCart()]);
        setIsDbLive(medicineStoreService.isDbConnected());
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cart operations
  const handleAddToCart = (medicine: MedicineItem) => {
    medicineStoreService.addToCart(medicine, 1);
    setCart([...medicineStoreService.getCart()]);
    showToast(`Added ${medicine.brandName.split('/')[0].trim()} generic equivalent to cart!`);
  };

  const handleUpdateQty = (medicineId: string, qty: number) => {
    medicineStoreService.updateQuantity(medicineId, qty);
    setCart([...medicineStoreService.getCart()]);
  };

  const cartTotals = useMemo(() => medicineStoreService.getCartTotals(), [cart]);

  // Filter & Sort Logic
  const filteredMedicines = useMemo(() => {
    let result = medicines.filter(med => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory = med.categorySlug === selectedCategory || 
          med.category.toLowerCase().includes(selectedCategory.replace('_', ' '));
        if (!matchesCategory) return false;
      }

      // Subsidized filter
      if (onlySubsidized && !med.isSubsidized) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const brandMatch = med.brandName.toLowerCase().includes(query);
        const genericMatch = med.genericName.toLowerCase().includes(query);
        const dosageMatch = med.dosage.toLowerCase().includes(query);
        const catMatch = med.category.toLowerCase().includes(query);
        const indicationEnMatch = med.indicationsEn.toLowerCase().includes(query);
        const indicationTaMatch = med.indicationsTa.toLowerCase().includes(query);
        return brandMatch || genericMatch || dosageMatch || catMatch || indicationEnMatch || indicationTaMatch;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'popular') return b.savingsPercentage - a.savingsPercentage;
      if (sortBy === 'price_asc') return a.genericPrice - b.genericPrice;
      if (sortBy === 'price_desc') return b.genericPrice - a.genericPrice;
      if (sortBy === 'name') return a.genericName.localeCompare(b.genericName);
      return 0;
    });
  }, [medicines, selectedCategory, searchQuery, sortBy, onlySubsidized]);

  // Handle Order Placement
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const selectedKendra = kendras.find(k => k.id === selectedKendraId);
    const order = medicineStoreService.placeOrder({
      patientName,
      patientPhone,
      deliveryType,
      shippingAddress: deliveryType === 'home_delivery' ? shippingAddress : undefined,
      pincode: deliveryType === 'home_delivery' ? pincode : undefined,
      kendra: deliveryType === 'kendra_pickup' ? selectedKendra : undefined,
      paymentMethod,
    });

    setConfirmedOrder(order);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PMBJP Jan Aushadhi
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">Govt. of India Scheme</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDiseaseMap}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded-lg"
            >
              <span>Outbreak Radar</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="hidden md:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Medical ID</span>
            </button>

            <button
              onClick={onOpenPrescription}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700" />
              <span>Upload Prescription</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm"
              id="open-cart-button"
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartTotals.totalItems > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-teal-500 text-white rounded-full">
                  {cartTotals.totalItems}
                </span>
              )}
              {cartTotals.totalSavings > 0 && (
                <span className="hidden md:inline text-xs text-emerald-400 font-semibold border-l border-slate-700 pl-2">
                  Save ₹{cartTotals.totalSavings.toFixed(0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section: Title & Subtitle on Left, 3 Trust Capsules on Right (Exact UI Ref) */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Buy Medicines
            </h1>
            <p className="text-base sm:text-lg text-slate-500 mt-1 font-medium">
              Quality generic medicines at lower prices.
            </p>
          </div>

          {/* 3 Trust Indicator Capsules from Reference Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Capsule 1: Quality Assured */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Quality Assured</div>
                <div className="text-slate-500 text-[11px]">Same as branded medicines</div>
              </div>
            </div>

            {/* Capsule 2: Lower Cost */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Lower Cost</div>
                <div className="text-slate-500 text-[11px]">Up to 89% savings</div>
              </div>
            </div>

            {/* Capsule 3: Government Certified */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Government Certified</div>
                <div className="text-slate-500 text-[11px]">WHO-GMP / PMBJP Kendra</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Input with Integrated Teal Search Button */}
        <section className="mt-6">
          <div className="relative flex items-center shadow-sm">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines, salts (e.g. Metformin, Telmisartan, Inhaler), conditions..."
              className="w-full pl-12 pr-32 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium transition-all"
              id="medicine-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-24 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {}}
              className="absolute right-2 px-5 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
        </section>

        {/* Category Filter Pills (From UI Reference) */}
        <section className="mt-6 overflow-x-auto scrollbar-none pb-2">
          <div className="flex items-center gap-2.5 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0d9488] text-white shadow-sm ring-2 ring-[#0d9488]/30'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  id={`cat-pill-${cat.id}`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {cat.icon}
                  </span>
                  <span>{lang === 'ta' ? cat.nameTa : cat.nameEn}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sub-Filter / Status Bar */}
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 py-2 border-y border-slate-200/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Showing {filteredMedicines.length} medicines
            </span>
            <div className="h-3 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${isDbLive ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500'}`} />
              <span>{isDbLive ? 'Live PMBJP Database' : 'PMBJP Verified'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Govt Subsidized Checkbox Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={onlySubsidized}
                onChange={(e) => setOnlySubsidized(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <span>Govt. Subsidized Only</span>
            </label>

            <div className="h-4 w-px bg-slate-200" />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="popular">Popular (Highest Savings)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product List: Clean Horizontal Cards Exactly as Reference Image */}
        <section className="mt-6 space-y-4" id="medicine-card-list">
          {filteredMedicines.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No medicines found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                No PMBJP generic medicine matches "{searchQuery}". Try searching by salt name or switch categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setOnlySubsidized(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const inCartItem = cart.find(c => c.medicine.id === med.id);
              const rupeeSavings = med.brandPrice - med.genericPrice;

              return (
                <div
                  key={med.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-stretch gap-6 group"
                >
                  {/* Left Column: Pharmaceutical Product Photo from Supabase Storage */}
                  <div className="w-full md:w-44 h-40 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
                    <img
                      src={med.imageUrl}
                      alt={med.genericName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-700 shadow-sm border border-slate-200/60">
                        {med.form}
                      </span>
                    </div>
                    {med.whoGmpCertified && (
                      <div className="absolute bottom-2 right-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm">
                          WHO-GMP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Center Column: Medicine Name, Clinical Details & Equivalent */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {med.category}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {med.packSize}
                        </span>
                      </div>

                      {/* Generic Name */}
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {med.genericName}
                      </h2>

                      {/* Branded Equivalent */}
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        <span className="text-slate-400">Generic equivalent to: </span>
                        <strong className="text-indigo-900 font-semibold">{med.brandName}</strong>
                      </p>

                      {/* Clinical Indication */}
                      <div className="mt-2.5 text-xs text-slate-600">
                        <p className="line-clamp-2">
                          <span className="font-semibold text-slate-700">Indication: </span>
                          {med.indicationsEn}
                          {lang === 'ta' && med.indicationsTa && (
                            <span className="block text-slate-500 text-[11px] mt-0.5">
                              {med.indicationsTa}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>IP Bio-Equivalent</span>
                      </span>
                      {med.requiresPrescription ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <FileText className="w-3 h-3" />
                          <span>Rx Required</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <span>OTC Medicine</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {med.manufacturer}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Add to Cart Action */}
                  <div className="w-full md:w-56 md:border-l md:border-slate-100 md:pl-6 flex flex-col justify-between items-start md:items-end mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-t-0">
                    <div className="md:text-right w-full">
                      <div className="flex items-center md:justify-end gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          ₹{med.genericPrice.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Save {med.savingsPercentage}%
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-400 mt-0.5">
                        Brand MRP: <span className="line-through">₹{med.brandPrice.toFixed(2)}</span>
                      </div>

                      <div className="text-xs font-semibold text-emerald-600 mt-1">
                        You save ₹{rupeeSavings.toFixed(2)} per pack
                      </div>
                    </div>

                    {/* Cart Action Buttons */}
                    <div className="w-full mt-4">
                      {inCartItem ? (
                        <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1 border border-slate-200 w-full">
                          <button
                            onClick={() => handleUpdateQty(med.id, inCartItem.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-sm transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-slate-800 px-3">
                            {inCartItem.quantity} in cart
                          </span>
                          <button
                            onClick={() => handleUpdateQty(med.id, inCartItem.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-sm transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(med)}
                          className="w-full py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                          id={`add-to-cart-${med.id}`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

      </main>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div data-lenis-prevent className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-base">Your Generic Medicine Cart</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {cartTotals.totalItems}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-700">Your cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Browse our PMBJP generic catalog to save up to 89%</p>
                  </div>
                ) : (
                  <>
                    {/* Big Government Subsidy Banner */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                        <span>Total Commercial Brand Price:</span>
                        <span className="line-through text-slate-500">₹{cartTotals.totalBrandPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-extrabold text-emerald-900">
                        <span>Jan Aushadhi Generic Price:</span>
                        <span className="text-teal-700 text-base">₹{cartTotals.totalGenericPrice.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-bold text-emerald-700">
                        <span>Direct Patient Savings:</span>
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Save ₹{cartTotals.totalSavings.toFixed(2)} ({cartTotals.savingsPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.medicine.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <img
                            src={item.medicine.imageUrl}
                            alt={item.medicine.genericName}
                            className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.medicine.genericName}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              Eq: {item.medicine.brandName}
                            </p>
                            <div className="text-xs font-extrabold text-teal-700 mt-0.5">
                              ₹{(item.medicine.genericPrice * item.quantity).toFixed(2)}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                (₹{item.medicine.genericPrice.toFixed(2)} each)
                              </span>
                            </div>
                          </div>
                          
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateQty(item.medicine.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item.medicine.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Payable Amount</div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        ₹{cartTotals.totalGenericPrice.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="px-6 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      id="proceed-checkout-btn"
                    >
                      <span>Proceed to Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Frictionless Checkout Modal */}
      {isCheckoutOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm PMBJP Medicine Dispatch</h3>
                <p className="text-xs text-slate-500">Government of India Jan Aushadhi Dispensing</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="mt-5 space-y-4">
              {/* Delivery Mode Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Fulfillment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home_delivery')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryType === 'home_delivery'
                        ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-teal-600 mb-1" />
                    <div className="text-xs font-bold text-slate-800">4-Hour Home Delivery</div>
                    <div className="text-[10px] text-slate-500">Directly to patient residence</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('kendra_pickup')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryType === 'kendra_pickup'
                        ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-5 h-5 text-teal-600 mb-1" />
                    <div className="text-xs font-bold text-slate-800">Instant Kendra Pickup</div>
                    <div className="text-[10px] text-slate-500">Counter token with zero wait</div>
                  </button>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address & Pincode or Kendra Selection */}
              {deliveryType === 'home_delivery' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Select Jan Aushadhi Kendra</label>
                  <select
                    value={selectedKendraId}
                    onChange={(e) => setSelectedKendraId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {kendras.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.distanceKm} km away)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery' },
                    { id: 'upi', label: 'UPI / QR Code' },
                    { id: 'ayushman_card', label: 'Ayushman Card' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold ${
                        paymentMethod === p.id
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Commercial MRP Total:</span>
                  <span className="line-through">₹{cartTotals.totalBrandPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Government Subsidy Saved:</span>
                  <span>-₹{cartTotals.totalSavings.toFixed(2)} ({cartTotals.savingsPercent}%)</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                  <span>Net Generic Payable:</span>
                  <span className="text-teal-700">₹{cartTotals.totalGenericPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="submit-order-btn"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Order • ₹{cartTotals.totalGenericPrice.toFixed(2)}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed Screen */}
      {confirmedOrder && (
        <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              PMBJP Order Confirmed
            </span>

            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              Order #{confirmedOrder.id}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Estimated Delivery: <strong>{confirmedOrder.estimatedDelivery} Today</strong>
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 my-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-800">{confirmedOrder.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment:</span>
                <span className="font-semibold text-slate-700">
                  {confirmedOrder.deliveryType === 'home_delivery' ? 'Home Delivery (4 hrs)' : 'Kendra Counter Pickup'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Items:</span>
                <span className="font-semibold text-slate-700">{confirmedOrder.items.length} Medicines</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Paid / COD:</span>
                <span className="font-extrabold text-teal-700 text-sm">₹{confirmedOrder.totalGenericPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>You Saved:</span>
                <span>₹{confirmedOrder.totalSavings.toFixed(2)}</span>
              </div>
            </div>

            {confirmedOrder.pickupToken && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4">
                <div className="text-[11px] font-semibold text-teal-800">
                  Counter Pickup / Delivery Verification Token
                </div>
                <div className="text-xl font-mono font-extrabold text-teal-900 tracking-wider">
                  {confirmedOrder.pickupToken}
                </div>
              </div>
            )}

            <button
              onClick={() => setConfirmedOrder(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors"
            >
              Done & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
