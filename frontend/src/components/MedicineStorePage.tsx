import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Truck,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  FileText,
  AlertCircle,
  Check,
  X,
  CreditCard,
  QrCode,
  Store,
  Upload,
  User,
  ArrowLeft
} from 'lucide-react';
import type { Language } from '../types';
import {
  medicineStoreService,
  type MedicineItem,
  type MedicineCartItem,
  type ChronicCategory,
  type DeliveryType,
  type PaymentMethod,
  type JanAushadhiKendra,
  type MedicineOrder
} from '../services/medicineStoreService';
import { authService, type AuthUser, generateImmutableHealthId } from '../services/authService';

interface MedicineStorePageProps {
  lang: Language;
  onNavigateHome: () => void;
  onOpenLogin: () => void;
  onOpenPrescription: () => void;
  onOpenDiseaseMap: () => void;
}

export const MedicineStorePage: React.FC<MedicineStorePageProps> = ({
  lang,
  onNavigateHome,
  onOpenLogin,
  onOpenPrescription,
  onOpenDiseaseMap,
}) => {
  const [catalog] = useState<MedicineItem[]>(() => medicineStoreService.getCatalog());
  const [kendras] = useState<JanAushadhiKendra[]>(() => medicineStoreService.getKendras());
  
  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<ChronicCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<MedicineCartItem[]>(() => medicineStoreService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // User Authentication & Medical ID
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  
  // Checkout Form State
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home_delivery');
  const [selectedKendraId, setSelectedKendraId] = useState<string>(kendras[0]?.id || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [pincode, setPincode] = useState('600040');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [prescriptionAttached, setPrescriptionAttached] = useState<string | null>(null);
  
  // Order Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<MedicineOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user?.phone && !patientPhone) {
        setPatientPhone(user.phone);
      }
    });
  }, [patientPhone]);

  // Sync cart from window events
  useEffect(() => {
    const handleCartSync = () => {
      setCart(medicineStoreService.getCart());
    };
    window.addEventListener('healthgrid_cart_updated', handleCartSync);
    return () => window.removeEventListener('healthgrid_cart_updated', handleCartSync);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Calculate totals
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalGenericPrice = cart.reduce((sum, item) => sum + item.medicine.genericPrice * item.quantity, 0);
  const totalBrandPrice = cart.reduce((sum, item) => sum + item.medicine.brandPrice * item.quantity, 0);
  const totalSavings = Math.max(0, totalBrandPrice - totalGenericPrice);
  const savingsPercentage = totalBrandPrice > 0 ? Math.round((totalSavings / totalBrandPrice) * 100) : 0;

  // Filtered catalog
  const filteredCatalog = catalog.filter((med) => {
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      med.brandName.toLowerCase().includes(query) ||
      med.genericName.toLowerCase().includes(query) ||
      med.dosage.toLowerCase().includes(query) ||
      med.indicationsEn.toLowerCase().includes(query) ||
      med.indicationsTa.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (medicine: MedicineItem) => {
    const updated = medicineStoreService.addToCart(medicine, 1);
    setCart(updated);
    setToastMessage(
      lang === 'en'
        ? `Added ${medicine.genericName.slice(0, 24)}... (Save ₹${(medicine.brandPrice - medicine.genericPrice).toFixed(1)})`
        : `${medicine.brandName} ஜெனரிக் சேர்க்கப்பட்டது`
    );
  };

  const handleUpdateQuantity = (medicineId: string, quantity: number) => {
    const updated = medicineStoreService.updateQuantity(medicineId, quantity);
    setCart(updated);
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      onOpenLogin();
      setToastMessage(
        lang === 'en'
          ? 'Healthcare Compliance: Sign in with your Medical ID to purchase medicines'
          : 'மருந்துகளை வாங்க மருத்துவ ஐடியுடன் உள்நுழையவும்'
      );
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    // Ensure valid Medical ID
    const healthId = currentUser.healthId || generateImmutableHealthId(currentUser.id);
    const selectedKendra = kendras.find((k) => k.id === selectedKendraId) || kendras[0];

    const order = medicineStoreService.createOrder({
      userId: currentUser.id,
      patientName: currentUser.name || 'Verified Patient',
      patientPhone: patientPhone || '9840123456',
      healthId,
      deliveryType,
      shippingAddress: deliveryType === 'home_delivery' ? shippingAddress : undefined,
      pincode: deliveryType === 'home_delivery' ? pincode : undefined,
      kendra: deliveryType === 'kendra_pickup' ? selectedKendra : undefined,
      paymentMethod,
      items: cart,
      totalBrandPrice,
      totalGenericPrice,
      totalSavings,
      prescriptionName: prescriptionAttached || undefined,
    });

    setConfirmedOrder(order);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP HEADER: BREADCRUMBS, BRAND TRUST & CART TRIGGER */}
      {/* ========================================================= */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <span>PMBJP Jan Aushadhi Generic Pharmacy</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>WHO-GMP Certified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'en'
                  ? 'Government-certified Indian Pharmacopoeia generics (Up to 89% lower cost)'
                  : 'அரசு அங்கீகாரம் பெற்ற மக்கள் மருந்தக மலிவு விலை மாத்திரைகள் (89% வரை சேமிப்பு)'}
              </p>
            </div>
          </div>

          {/* Right: Actions (Scan Rx, Cart Button) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenPrescription}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>{lang === 'en' ? 'Scan Rx to Auto-Fill' : 'சீட்டை ஸ்கேன் செய்க'}</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === 'en' ? 'Cart' : 'கூடை'}</span>
              {totalItemsCount > 0 && (
                <span className="ml-0.5 bg-white text-emerald-800 font-black text-[11px] px-1.5 py-0.2 rounded-full shadow-2xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHRONIC SAVINGS BANNER & SEARCH ROW */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Lifelong Chronic Illness Relief
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {lang === 'en'
                ? 'Save ₹1,000 to ₹3,500 every month on your chronic medications'
                : 'நீரிழிவு, இரத்த அழுத்தம் மற்றும் இதய மருந்துகளில் மாதம் ₹1,000+ சேமிக்கவும்'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 leading-relaxed">
              {lang === 'en'
                ? 'Identical active formulations manufactured to Indian Pharmacopoeia bio-equivalence standards at 50% to 89% lower than branded MRP.'
                : 'பிராண்டட் மருந்துகளை விட அதே செயல்திறன் கொண்ட PMBJP மலிவு விலை அரசு மருந்துகள்.'}
            </p>
          </div>

          {/* Real-time Search Capsule */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search by Brand (e.g. Telma, Glycomet, Atorva) or Generic Salt...'
                  : 'மருந்து பெயர் அல்லது உப்பு மூலம் தேடவும்...'
              }
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 outline-none shadow-lg border border-white/20 focus:ring-2 focus:ring-teal-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CATEGORY SELECTOR PILLS */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-slate-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', labelEn: 'All Chronic Medicines', labelTa: 'அனைத்து மருந்துகள்' },
            { id: 'diabetes', labelEn: 'Diabetes Care', labelTa: 'சர்க்கரை நோய்' },
            { id: 'hypertension', labelEn: 'Blood Pressure (BP)', labelTa: 'இரத்த அழுத்தம்' },
            { id: 'cholesterol', labelEn: 'Cholesterol & Heart', labelTa: 'கொழுப்பு & இதயம்' },
            { id: 'cardiac', labelEn: 'Blood Thinners', labelTa: 'இரத்த உறைவு தடுப்பு' },
            { id: 'gastro', labelEn: 'Chronic Acidity & GERD', labelTa: 'நெஞ்செரிச்சல் & அமிலம்' },
            { id: 'thyroid', labelEn: 'Thyroid Care', labelTa: 'தைராய்டு' },
            { id: 'kidney', labelEn: 'Kidney & Uric Acid', labelTa: 'சிறுநீரகம் & மூட்டு' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as ChronicCategory)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? cat.labelEn : cat.labelTa}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN MEDICINES CATALOG GRID */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Results Count & Kendra Finder banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-extrabold text-slate-900">{filteredCatalog.length}</span> verified generic substitutes
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WHO-GMP Bio-Equivalent</span>
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenDiseaseMap}
              className="text-teal-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Locate Kendra on Map</span>
            </button>
          </div>
        </div>

        {/* Medicine Product Cards */}
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((med) => {
              const inCartItem = cart.find((i) => i.medicine.id === med.id);
              const rupeeSavings = med.brandPrice - med.genericPrice;

              return (
                <div
                  key={med.id}
                  className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    
                    {/* Header: Strip size + Savings pill */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {med.packSize}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Save {med.savingsPercentage}%
                      </span>
                    </div>

                    {/* Generic Name & Formulation */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition-colors">
                        {med.genericName}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">Brand Equivalent:</span>
                        <span className="font-medium text-slate-600 line-clamp-1">{med.brandName}</span>
                      </div>
                    </div>

                    {/* Indications */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {lang === 'en' ? med.indicationsEn : med.indicationsTa}
                    </p>

                    {/* Quality & Schedule tags */}
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>IP Bio-Equivalent</span>
                      </span>
                      {med.scheduleH && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">Rx Required</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Action Row */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400 line-through">
                        MRP: ₹{med.brandPrice.toFixed(2)}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black text-emerald-700">
                          ₹{med.genericPrice.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800">only</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 font-extrabold">
                        Save ₹{rupeeSavings.toFixed(1)} / strip
                      </div>
                    </div>

                    {/* Quantity or Add to Cart Button */}
                    <div>
                      {inCartItem ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(med.id, inCartItem.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-emerald-800 flex items-center justify-center font-bold hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-black text-xs text-emerald-950">
                            {inCartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(med.id, inCartItem.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(med)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Add' : 'சேர்'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
            <Pill className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">No medicines found matching "{searchQuery}"</h4>
            <p className="text-xs text-slate-500">
              Try searching by generic salt, or browse all chronic therapeutic classes above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* SLIDE-OVER CART DRAWER */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              {/* Cart Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">
                    {lang === 'en' ? 'Your Generic Medicine Cart' : 'உங்கள் மருந்து கூடை'}
                  </h3>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    {totalItemsCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {cart.length > 0 ? (
                  <>
                    {/* Savings Highlight Box */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-1 shadow-2xs">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>PMBJP Janaushadhi Total Savings</span>
                      </div>
                      <div className="text-xl font-black text-emerald-900">
                        ₹{totalSavings.toFixed(2)} ({savingsPercentage}% Saved)
                      </div>
                      <div className="text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                        <span>Branded Equivalent MRP:</span>
                        <span className="line-through font-semibold">₹{totalBrandPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.medicine.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                                {item.medicine.genericName}
                              </h5>
                              <p className="text-[11px] text-slate-500">
                                Equivalent: {item.medicine.brandName} ({item.medicine.packSize})
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.medicine.id, 0)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity - 1)}
                                className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.medicine.id, item.quantity + 1)}
                                className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] text-slate-400 line-through mr-1.5">
                                ₹{(item.medicine.brandPrice * item.quantity).toFixed(1)}
                              </span>
                              <span className="font-extrabold text-sm text-emerald-700">
                                ₹{(item.medicine.genericPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Your medicine cart is empty</h4>
                    <p className="text-xs text-slate-500">
                      Add generic chronic medicines from the catalog to see your guaranteed PMBJP savings.
                    </p>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                  
                  {/* Authentication & Medical ID Guard Banner */}
                  {!currentUser ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Medical ID Required to Order</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        In accordance with pharmaceutical regulations, guests cannot checkout. Please sign in with your verified HealthGrid Medical ID.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenLogin}
                        className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In with Medical ID</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-[11px]">{currentUser.name || 'Verified Patient'}</div>
                          <div className="text-[10px] text-emerald-700 font-mono">
                            ID: {currentUser.healthId || generateImmutableHealthId(currentUser.id)}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                        Authorized
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Subtotal ({totalItemsCount} items):</span>
                    <span className="font-bold text-slate-900 text-sm">₹{totalGenericPrice.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHECKOUT MODAL: DUAL OPTION (HOME DELIVERY OR KENDRA PICKUP) */}
      {/* ========================================================= */}
      {isCheckoutOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {lang === 'en' ? 'Complete Generic Medicine Order' : 'மருந்து முன்பதிவு'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              
              {/* Verified Medical ID Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Patient Medical ID</div>
                  <div className="font-mono font-extrabold text-slate-900">
                    {currentUser.healthId || generateImmutableHealthId(currentUser.id)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Patient Name</div>
                  <div className="font-bold text-slate-800">{currentUser.name}</div>
                </div>
              </div>

              {/* Step 1: Delivery Mode (Dual Option per User Mandate) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Delivery Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home_delivery')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'home_delivery'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Home Delivery</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-tight">
                      Doorstep courier within 24 hours
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('kendra_pickup')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'kendra_pickup'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Store className="w-4 h-4 text-teal-700" />
                      <span>Kendra Store Pickup</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-1 leading-tight">
                      Ready in 2 hrs · Pay at counter
                    </div>
                  </button>
                </div>
              </div>

              {/* Home Delivery Form Fields */}
              {deliveryType === 'home_delivery' ? (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Delivery Address & Street
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Door No, Street Name, Apartment / Landmark"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="600040"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile for Delivery</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Kendra Store Pickup Dropdown */
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Select Nearest Jan Aushadhi Kendra Store
                  </label>
                  <select
                    value={selectedKendraId}
                    onChange={(e) => setSelectedKendraId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-600 cursor-pointer"
                  >
                    {kendras.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.distanceKm} km away)
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const k = kendras.find((x) => x.id === selectedKendraId) || kendras[0];
                    return (
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Address: {k.address} · Phone: {k.phone} · Timings: {k.timings}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Optional Doctor Prescription Slip Upload for Schedule H Drugs */}
              <div className="p-3 rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold text-teal-900">Doctor Prescription Slip: </span>
                    <span className="text-teal-700">
                      {prescriptionAttached ? prescriptionAttached : 'Optional Schedule H verification'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionAttached('Verified_Rx_DocBot.pdf');
                    setToastMessage('Prescription slip verified');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[10px] shadow-2xs cursor-pointer hover:bg-teal-700"
                >
                  {prescriptionAttached ? 'Attached ✓' : 'Attach Slip'}
                </button>
              </div>

              {/* Step 2: Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'cod', label: deliveryType === 'home_delivery' ? 'Cash on Delivery (COD)' : 'Pay at Kendra Counter', icon: CreditCard },
                    { id: 'upi', label: 'UPI (GPay / PhonePe / QR)', icon: QrCode },
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentMethod(pay.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === pay.id
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-300'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <pay.icon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] truncate">{pay.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary & Submit Button */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 line-through">MRP: ₹{totalBrandPrice.toFixed(2)}</div>
                  <div className="text-base font-black text-emerald-700">
                    Pay: ₹{totalGenericPrice.toFixed(2)}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER SUCCESS MODAL / DIGITAL RECEIPT */}
      {/* ========================================================= */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-emerald-200 space-y-4">
            
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Order Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1.5">
                Generic Prescription Placed!
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Order ID: {confirmedOrder.id}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Patient Medical ID:</span>
                <span className="font-mono font-bold text-slate-900">{confirmedOrder.healthId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Mode:</span>
                <span className="font-semibold text-slate-900">
                  {confirmedOrder.deliveryType === 'home_delivery' ? 'Home Doorstep Delivery' : 'Jan Aushadhi Kendra Pickup'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Availability:</span>
                <span className="font-bold text-emerald-800">{confirmedOrder.estimatedDelivery}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700">₹{confirmedOrder.totalGenericPrice.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-bold bg-emerald-100/60 p-2 rounded-lg text-center">
                Total Family Savings on this order: ₹{confirmedOrder.totalSavings.toFixed(2)}!
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
