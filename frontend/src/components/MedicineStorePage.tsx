import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Phone,
  Share2,
  Copy,
  Sparkles,
  FileUp,
  RefreshCw,
  MessageCircle,
  Clock,
  Calendar,
  Bell,
  Smartphone,
  AlertTriangle,
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
  type MedicineOrder,
  type ChronicRefillSchedule,
} from '../services/medicineStoreService';
import { authService, type AuthUser, generateImmutableHealthId } from '../services/authService';
import { prescriptionAiService } from '../services/prescriptionAiService';

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

  // In-Store Prescription OCR & Token state
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrSuccessNotice, setOcrSuccessNotice] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const storeFileInputRef = useRef<HTMLInputElement>(null);

  // Tab Navigation: Catalog vs Chronic Refill Manager vs Order History
  const [activeStoreTab, setActiveStoreTab] = useState<'catalog' | 'refills' | 'history'>('catalog');
  const [chronicRefills, setChronicRefills] = useState<ChronicRefillSchedule[]>(() => medicineStoreService.getChronicRefills());
  const [pastOrders, setPastOrders] = useState<MedicineOrder[]>(() => medicineStoreService.getOrders());

  // Refill Review & Reorder Modal State
  const [selectedRefillForReview, setSelectedRefillForReview] = useState<ChronicRefillSchedule | null>(null);
  const [reviewStrips, setReviewStrips] = useState<Record<string, number>>({});
  const [reviewFulfillment, setReviewFulfillment] = useState<DeliveryType>('kendra_pickup');
  const [reviewKendraId, setReviewKendraId] = useState<string>(kendras[0]?.id || '');

  // SMS Simulation Modal State
  const [smsModal, setSmsModal] = useState<{ open: boolean; message: string; phone: string } | null>(null);

  // Sync auth state
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
      if (user?.phone && !patientPhone) {
        setPatientPhone(user.phone);
      }
    });
  }, [patientPhone]);

  // Sync cart, refills, and orders from window events
  useEffect(() => {
    const handleCartSync = () => {
      setCart(medicineStoreService.getCart());
    };
    const handleRefillsSync = () => {
      setChronicRefills(medicineStoreService.getChronicRefills());
    };
    const handleOrdersSync = () => {
      setPastOrders(medicineStoreService.getOrders());
    };

    window.addEventListener('healthgrid_cart_updated', handleCartSync);
    window.addEventListener('healthgrid_refills_updated', handleRefillsSync);
    window.addEventListener('healthgrid_orders_updated', handleOrdersSync);

    return () => {
      window.removeEventListener('healthgrid_cart_updated', handleCartSync);
      window.removeEventListener('healthgrid_refills_updated', handleRefillsSync);
      window.removeEventListener('healthgrid_orders_updated', handleOrdersSync);
    };
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

  const handleStorePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsOcrProcessing(true);
    setOcrSuccessNotice(null);

    try {
      const result = await prescriptionAiService.analyzePrescription(Array.from(files));
      if (result && result.medicines && result.medicines.length > 0) {
        const added = medicineStoreService.addScannedMedicinesToCart(result.medicines);
        setCart(medicineStoreService.getCart());
        setOcrSuccessNotice(
          lang === 'en'
            ? `OCR Success: Deciphered ${result.medicines.length} medications from doctor slip. Added ${added} generic equivalents to your cart (You save ₹${result.totalSavings.toFixed(1)} / ${result.savingsPercentage}% off)!`
            : `மருந்துச் சீட்டு ஸ்கேன் வெற்றி: ${result.medicines.length} மருந்துகள் கண்டறியப்பட்டு ${added} ஜெனரிக் மாத்திரைகள் கூடையில் சேர்க்கப்பட்டன! (₹${result.totalSavings.toFixed(1)} சேமிப்பு)!`
        );
        setIsCartOpen(true);
      } else {
        setToastMessage(lang === 'en' ? 'Could not read medicines clearly. Please upload a clear photo.' : 'மருந்துச் சீட்டை தெளிவாக படம் எடுக்கவும்.');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setToastMessage(lang === 'en' ? 'Failed to analyze prescription slip.' : 'மருந்துச் சீட்டை ஸ்கேன் செய்ய முடியவில்லை.');
    } finally {
      setIsOcrProcessing(false);
      if (storeFileInputRef.current) {
        storeFileInputRef.current.value = '';
      }
    }
  };

  const handleCopyOtp = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
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

  // =========================================================================
  // CHRONIC REFILL ACTION HANDLERS & ADHERENCE CALCULATIONS
  // =========================================================================

  const dueSchedules = chronicRefills.filter((s) => {
    const st = medicineStoreService.calculateScheduleStatus(s);
    return st.isDue || st.isOverdue;
  });
  const earliestDueSchedule = dueSchedules[0] || null;
  const earliestDueStatus = earliestDueSchedule ? medicineStoreService.calculateScheduleStatus(earliestDueSchedule) : null;

  const handleOpenRefillReview = (schedule: ChronicRefillSchedule) => {
    const initialStrips: Record<string, number> = {};
    schedule.items.forEach((item) => {
      initialStrips[item.id] = item.stripsCount;
    });
    setReviewStrips(initialStrips);
    setReviewFulfillment(schedule.preferredFulfillment || 'kendra_pickup');
    setReviewKendraId(schedule.preferredKendraId || kendras[0]?.id || '');
    setSelectedRefillForReview(schedule);
  };

  const handleUpdateReviewStripCount = (itemId: string, delta: number) => {
    setReviewStrips((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleConfirmRefillOrder = () => {
    if (!selectedRefillForReview) return;
    if (!currentUser) {
      onOpenLogin();
      setToastMessage(lang === 'en' ? 'Healthcare Compliance: Sign in with your Medical ID to reorder' : 'மறுவரிசைப்படுத்த மருத்துவ ஐடியுடன் உள்நுழையவும்');
      return;
    }

    // Persist any adjusted strip counts
    selectedRefillForReview.items.forEach((item) => {
      const adjusted = reviewStrips[item.id];
      if (adjusted && adjusted !== item.stripsCount) {
        medicineStoreService.updateRefillItemStrips(selectedRefillForReview.id, item.id, adjusted);
      }
    });

    // Populate generic cart from this refill
    medicineStoreService.populateCartFromRefill(selectedRefillForReview.id);
    const populatedCart = medicineStoreService.getCart();
    setCart(populatedCart);

    const healthId = currentUser.healthId || generateImmutableHealthId(currentUser.id);
    const selectedKendra = kendras.find((k) => k.id === reviewKendraId) || kendras[0];

    const totalGen = populatedCart.reduce((sum, i) => sum + i.medicine.genericPrice * i.quantity, 0);
    const totalBr = populatedCart.reduce((sum, i) => sum + i.medicine.brandPrice * i.quantity, 0);
    const totalSav = Math.max(0, totalBr - totalGen);

    const order = medicineStoreService.createOrder({
      userId: currentUser.id,
      patientName: currentUser.name || selectedRefillForReview.patientName || 'Verified Patient',
      patientPhone: patientPhone || currentUser.phone || '9840123456',
      healthId,
      deliveryType: reviewFulfillment,
      shippingAddress: reviewFulfillment === 'home_delivery' ? shippingAddress : undefined,
      pincode: reviewFulfillment === 'home_delivery' ? pincode : undefined,
      kendra: reviewFulfillment === 'kendra_pickup' ? selectedKendra : undefined,
      paymentMethod: reviewFulfillment === 'kendra_pickup' ? 'kendra_counter' : 'cod',
      items: populatedCart,
      totalBrandPrice: totalBr,
      totalGenericPrice: totalGen,
      totalSavings: totalSav,
      prescriptionName: selectedRefillForReview.prescriptionId || 'Chronic Refill Regimen',
    });

    setSelectedRefillForReview(null);
    setConfirmedOrder(order);
    setToastMessage(
      lang === 'en'
        ? `Refill Order Placed! Reserved at ${selectedKendra.name}. Token: ${order.pickupToken}`
        : `மறுவரிசைப்படுத்தல் உறுதி செய்யப்பட்டது! டோக்கன்: ${order.pickupToken}`
    );
  };

  const handleDownloadRefillIcs = (schedule: ChronicRefillSchedule) => {
    const icsContent = medicineStoreService.generateRefillIcs(schedule);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HealthGrid-Refill-${schedule.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(lang === 'en' ? 'Downloaded Calendar reminder (.ics) with Day-25 alarms!' : 'நாட்காட்டி நிகழ்வு பதிவிறக்கப்பட்டது!');
  };

  const handleShareRefillWhatsApp = (schedule: ChronicRefillSchedule) => {
    const url = medicineStoreService.generateRefillWhatsAppUrl(schedule);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSimulateRefillSms = (schedule: ChronicRefillSchedule) => {
    const status = medicineStoreService.calculateScheduleStatus(schedule);
    const msg = `[Govt PMBJP Refill Alert] Patient ${schedule.patientName} (${schedule.medicalId}): Your 30-day chronic medicines (Refill #${schedule.id}) have pills running low (${status.minDaysLeft} days remaining). Target refill date: ${status.nextRefillDate}. Cost at Kendra: ₹${schedule.totalMonthlyGenericCost.toFixed(0)} (You save ₹${schedule.totalMonthlySavings.toFixed(0)}). Reorder at healthgrid.vercel.app/medicines?refill=${schedule.id}`;
    setSmsModal({
      open: true,
      message: msg,
      phone: schedule.patientPhone || patientPhone || '+91 98401 23456',
    });
  };

  const handleToggleRefill = (scheduleId: string) => {
    medicineStoreService.toggleRefillStatus(scheduleId);
    setChronicRefills(medicineStoreService.getChronicRefills());
    setToastMessage(lang === 'en' ? 'Refill schedule updated' : 'அட்டவணை புதுப்பிக்கப்பட்டது');
  };

  const handleDeleteRefill = (scheduleId: string) => {
    medicineStoreService.deleteRefillSchedule(scheduleId);
    setChronicRefills(medicineStoreService.getChronicRefills());
    setToastMessage(lang === 'en' ? 'Refill schedule removed' : 'அட்டவணை நீக்கப்பட்டது');
  };

  // Calculations for Review Modal
  const reviewAdjustedBrandTotal = selectedRefillForReview
    ? selectedRefillForReview.items.reduce(
        (sum, item) => sum + item.brandPricePerStrip * (reviewStrips[item.id] || item.stripsCount),
        0
      )
    : 0;

  const reviewAdjustedGenericTotal = selectedRefillForReview
    ? selectedRefillForReview.items.reduce(
        (sum, item) => sum + item.genericPricePerStrip * (reviewStrips[item.id] || item.stripsCount),
        0
      )
    : 0;

  const reviewAdjustedSavings = Math.max(0, reviewAdjustedBrandTotal - reviewAdjustedGenericTotal);
  const reviewSavingsPct =
    reviewAdjustedBrandTotal > 0 ? Math.round((reviewAdjustedSavings / reviewAdjustedBrandTotal) * 100) : 0;

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
      {/* 5-DAY REFILL DUE ALERT BANNER (REAL SYSTEM CLOCK TRIGGER) */}
      {/* ========================================================= */}
      {earliestDueSchedule && earliestDueStatus && (earliestDueStatus.isDue || earliestDueStatus.isOverdue) && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white px-4 py-3 shadow-md animate-in fade-in slide-in-from-top-1">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm flex items-center gap-2">
                  <span>
                    {lang === 'en'
                      ? `Refill Reminder: Chronic Regimen (${earliestDueSchedule.id}) runs out in ${earliestDueStatus.minDaysLeft} days!`
                      : `தொடர் மருந்து நினைவூட்டல்: ${earliestDueSchedule.id} மாத்திரைகள் இன்னும் ${earliestDueStatus.minDaysLeft} நாட்களில் முடிகிறது!`}
                  </span>
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    Target: {earliestDueStatus.nextRefillDate}
                  </span>
                </div>
                <div className="text-[11px] text-amber-100/90 mt-0.5">
                  {lang === 'en'
                    ? `Prescribed by ${earliestDueSchedule.doctorName || 'Doctor'} • ${earliestDueSchedule.items.length} daily medicines need replenishment.`
                    : `${earliestDueSchedule.items.length} மருந்துகளை உடனே மறுவரிசைப்படுத்தவும்.`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenRefillReview(earliestDueSchedule)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-800" />
                <span>{lang === 'en' ? 'Review & Reorder Refill' : 'மறுவரிசைப்படுத்து'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStoreTab('refills')}
                className="px-3 py-1.5 rounded-xl bg-black/15 hover:bg-black/25 text-white font-bold text-xs transition-all cursor-pointer"
              >
                {lang === 'en' ? 'Manage Refills' : 'அட்டவணை'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECONDARY NAVIGATION: CATALOG vs REFILLS vs ORDERS */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveStoreTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStoreTab === 'catalog'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>{lang === 'en' ? 'Browse PMBJP Generics' : 'ஜெனரிக் மருந்துகள்'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStoreTab('refills')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStoreTab === 'refills'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{lang === 'en' ? 'My Chronic Refills' : 'தொடர் மறுவரவு'}</span>
              {dueSchedules.length > 0 && (
                <span className="bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse shadow-2xs">
                  {dueSchedules.length} Due
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveStoreTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStoreTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'en' ? 'Order History & Passes' : 'முந்தைய ஆர்டர்கள்'}</span>
              {pastOrders.length > 0 && (
                <span className="bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pastOrders.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Govt. Subsidized Prices</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PMBJP CATALOG VIEW */}
      {/* ========================================================= */}
      {activeStoreTab === 'catalog' && (
        <>
          {/* CHRONIC SAVINGS BANNER & SEARCH ROW */}
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

          {/* Dual Row: Search Input + In-Store Prescription OCR Quick-Fill */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Real-time Search Capsule (Span 7) */}
            <div className="lg:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Search by Brand (e.g. Telma, Augmentin, Gleevec) or Generic Salt...'
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

            {/* Instant Prescription OCR Auto-Fill Trigger (Span 5) */}
            <div className="lg:col-span-5">
              <input
                type="file"
                ref={storeFileInputRef}
                onChange={handleStorePrescriptionUpload}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => storeFileInputRef.current?.click()}
                disabled={isOcrProcessing}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-emerald-400/40 backdrop-blur-md text-white transition-all cursor-pointer group shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {isOcrProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <FileUp className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-xs text-emerald-200 group-hover:text-emerald-100 flex items-center gap-1.5">
                      <span>{lang === 'en' ? 'Upload Rx to Auto-Fill Cart' : 'சீட்டை பதிவேற்றி தானியங்கி நிரப்பு'}</span>
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-teal-100/80">
                      {isOcrProcessing
                        ? (lang === 'en' ? 'TrOCR deciphering doctor prescription...' : 'மருத்துவர் கையெழுத்தை பகுப்பாய்வு செய்கிறது...')
                        : (lang === 'en' ? 'AI reads doctor handwriting & adds generics' : 'கையெழுத்தை படித்து ஜெனரிக் மருந்துகளை சேர்க்கும்')}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/30 border border-emerald-300/40 text-[10px] font-bold text-emerald-100">
                  {lang === 'en' ? 'Snap Photo' : 'படம் எடு'}
                </div>
              </button>
            </div>
          </div>

          {/* OCR Success Banner if prescription was parsed */}
          {ocrSuccessNotice && (
            <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{ocrSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setOcrSuccessNotice(null)}
                className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* CATEGORY SELECTOR PILLS (EXPANDED SPECIALTY CATEGORIES) */}
      {/* ========================================================= */}
      <section className="bg-white border-b border-slate-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', labelEn: 'All Medicines', labelTa: 'அனைத்து மருந்துகள்' },
            { id: 'diabetes', labelEn: 'Diabetes Care', labelTa: 'சர்க்கரை நோய்' },
            { id: 'hypertension', labelEn: 'Blood Pressure (BP)', labelTa: 'இரத்த அழுத்தம்' },
            { id: 'cholesterol', labelEn: 'Cholesterol & Heart', labelTa: 'கொழுப்பு & இதயம்' },
            { id: 'cardiac', labelEn: 'Blood Thinners', labelTa: 'இரத்த உறைவு தடுப்பு' },
            { id: 'antibiotics', labelEn: 'Antibiotics & Infection', labelTa: 'ஆன்டிபயாடிக் & தொற்று' },
            { id: 'respiratory', labelEn: 'Asthma & Inhalers', labelTa: 'ஆஸ்துமா & இன்ஹேலர்' },
            { id: 'oncology', labelEn: 'Cancer Lifeline Care', labelTa: 'புற்றுநோய் சிகிச்சை' },
            { id: 'neuro_psych', labelEn: 'Neuro & Mental Health', labelTa: 'நரம்பியல் & வலிப்பு' },
            { id: 'gastro', labelEn: 'Acidity & Digestion', labelTa: 'நெஞ்செரிச்சல் & அமிலம்' },
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
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CHRONIC REFILL MANAGER & SMART ADHERENCE RADAR */}
      {/* ========================================================= */}
      {activeStoreTab === 'refills' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in duration-200">
          
          {/* Header section with prescription setup guide */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-500/30">
                Prescription-Driven Chronic Adherence
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lang === 'en'
                  ? 'Smart Jan Aushadhi Monthly Refill Radar'
                  : 'மலிவு விலை மாதாந்திர மருந்து மறுவரவு கண்காணிப்பு'}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                {lang === 'en'
                  ? 'Continuous 30-day treatment tracker. Real system clock countdowns trigger automated Day-25 WhatsApp alerts, SMS simulations, and Google Calendar sync so you never miss life-saving daily doses.'
                  : 'உங்களின் 30 நாள் மருந்து இருப்பு கண்காணிக்கப்பட்டு, முடிவதற்கு 5 நாட்களுக்கு முன் வாட்ஸ்அப் மற்றும் எஸ்எம்எஸ் மூலம் நினைவூட்டப்படும்.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => storeFileInputRef.current?.click()}
                className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <FileUp className="w-4 h-4 text-slate-950" />
                <span>{lang === 'en' ? 'Scan Rx to Create Refill' : 'புதிய மருந்துச் சீட்டு சேர்'}</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Active Chronic Plans</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {chronicRefills.filter((r) => r.status === 'active').length} Regimens
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">Real-time adherence active</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Earliest Refill Due</div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                {earliestDueStatus ? `${earliestDueStatus.minDaysLeft} Days` : 'All Stocked'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                {earliestDueStatus ? earliestDueStatus.nextRefillDate : 'No upcoming due'}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Monthly Jan Aushadhi Cost</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                ₹{chronicRefills.reduce((sum, r) => sum + r.totalMonthlyGenericCost, 0).toFixed(0)}
              </div>
              <div className="text-[10px] text-slate-400 line-through mt-0.5">
                Brands: ₹{chronicRefills.reduce((sum, r) => sum + r.totalMonthlyBrandCost, 0).toFixed(0)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Yearly Family Savings</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                ₹{(chronicRefills.reduce((sum, r) => sum + r.totalMonthlySavings, 0) * 12).toFixed(0)}
              </div>
              <div className="text-[10px] text-emerald-700 font-extrabold mt-1">80%+ Lower Out-of-Pocket</div>
            </div>
          </div>

          {/* Refill Schedules List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Your Active Refill Subscriptions</span>
              </h3>
              <span className="text-xs text-slate-500">
                Clock synced to real Indian Standard Time
              </span>
            </div>

            {chronicRefills.length > 0 ? (
              <div className="space-y-6">
                {chronicRefills.map((schedule) => {
                  const status = medicineStoreService.calculateScheduleStatus(schedule);
                  const isDue = status.isDue;
                  const isOverdue = status.isOverdue;

                  return (
                    <div
                      key={schedule.id}
                      className={`bg-white rounded-3xl border transition-all shadow-sm ${
                        isDue
                          ? 'border-amber-400 ring-2 ring-amber-400/20'
                          : isOverdue
                          ? 'border-rose-400 ring-2 ring-rose-400/20'
                          : 'border-slate-200/90'
                      }`}
                    >
                      {/* Top Bar of Refill Card */}
                      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 rounded-t-3xl">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-sm text-slate-900">
                              {schedule.id}
                            </span>
                            {isDue && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                <span>Refill Due in {status.minDaysLeft} Days</span>
                              </span>
                            )}
                            {isOverdue && (
                              <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-700" />
                                <span>Pills Exhausted - Reorder Now</span>
                              </span>
                            )}
                            {schedule.status === 'active' && !isDue && !isOverdue && (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Adherence On Track
                              </span>
                            )}
                            {schedule.status === 'paused' && (
                              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Paused
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span><span className="font-semibold">Patient:</span> {schedule.patientName} ({schedule.medicalId})</span>
                            <span>•</span>
                            <span><span className="font-semibold">Doctor:</span> {schedule.doctorName}</span>
                            <span>•</span>
                            <span><span className="font-semibold">Prescribed:</span> {schedule.prescriptionDate}</span>
                          </div>
                        </div>

                        {/* Preferred Fulfillment & Savings */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-400 line-through">Brand: ₹{schedule.totalMonthlyBrandCost.toFixed(0)}</div>
                            <div className="text-base font-black text-emerald-700">₹{schedule.totalMonthlyGenericCost.toFixed(0)} / mo</div>
                            <div className="text-[10px] text-emerald-800 font-extrabold">Save ₹{schedule.totalMonthlySavings.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Medicines List with Adherence Meters */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Prescribed Daily Regimen & Adherence Countdown ({schedule.items.length} Medicines)
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {schedule.items.map((item) => {
                            const adh = medicineStoreService.calculateItemAdherence(item);
                            const itemDue = adh.isDue;

                            return (
                              <div
                                key={item.id}
                                className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-black text-sm text-slate-900">
                                      {item.genericName}
                                    </h4>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                      {item.dosage}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Commercial Brand: <span className="font-medium text-slate-700">{item.brandName}</span>
                                  </div>
                                  <div className="text-xs text-slate-600 font-medium flex items-center gap-3">
                                    <span>Frequency: <strong className="text-slate-900">{item.frequency}</strong></span>
                                    <span>•</span>
                                    <span>Timing: <strong className="text-slate-900">{item.timing}</strong></span>
                                  </div>

                                  {/* Adherence Progress Bar */}
                                  <div className="pt-2 space-y-1 max-w-md">
                                    <div className="flex justify-between text-[11px] font-semibold">
                                      <span className={itemDue ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                                        Day {adh.elapsedDays} of {item.durationDays} ({adh.daysRemaining} days remaining)
                                      </span>
                                      <span className="text-slate-500">{adh.targetRefillDate}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          adh.isOverdue
                                            ? 'bg-rose-500'
                                            : itemDue
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${adh.progressPct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Strip Count Adjuster & Cost */}
                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                  <div className="text-left md:text-right">
                                    <div className="text-[11px] text-slate-500">Prescribed Strips</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          medicineStoreService.updateRefillItemStrips(schedule.id, item.id, item.stripsCount - 1);
                                          setChronicRefills(medicineStoreService.getChronicRefills());
                                        }}
                                        disabled={item.stripsCount <= 1}
                                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-8 text-center font-black text-xs text-slate-900">
                                        {item.stripsCount}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          medicineStoreService.updateRefillItemStrips(schedule.id, item.id, item.stripsCount + 1);
                                          setChronicRefills(medicineStoreService.getChronicRefills());
                                        }}
                                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-xs text-slate-400 line-through">
                                      ₹{(item.brandPricePerStrip * item.stripsCount).toFixed(0)}
                                    </div>
                                    <div className="text-sm font-black text-emerald-700">
                                      ₹{(item.genericPricePerStrip * item.stripsCount).toFixed(0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-Channel Notification & Reorder Action Bar */}
                      <div className="p-4 sm:p-5 bg-slate-50/80 rounded-b-3xl border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        {/* Channel Triggers */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadRefillIcs(schedule)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Add 25-Day Refill Reminder to Google/Apple Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            <span>Add to Calendar (.ics)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareRefillWhatsApp(schedule)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Send Refill Alert & Cart Link to Patient WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>WhatsApp Alert</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSimulateRefillSms(schedule)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Preview SMS alert dispatched to phone"
                          >
                            <Bell className="w-3.5 h-3.5 text-slate-500" />
                            <span>SMS Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleRefill(schedule.id)}
                            className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-xs cursor-pointer"
                          >
                            {schedule.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRefill(schedule.id)}
                            className="px-3 py-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                            title="Remove Schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Primary Review & Reorder CTA */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenRefillReview(schedule)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Review & Reorder Refill' : 'மறுவரிசைப்படுத்து'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">No active chronic refill subscriptions</h4>
                <p className="text-xs text-slate-500">
                  Upload a doctor prescription with maintenance medications or browse PMBJP catalog to initiate your 30-day generic auto-refill plan.
                </p>
                <button
                  type="button"
                  onClick={() => storeFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Upload Prescription Slip
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ORDER HISTORY & PICKUP PASSES */}
      {/* ========================================================= */}
      {activeStoreTab === 'history' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'en' ? 'Jan Aushadhi Orders & Pickup Passes' : 'மருந்தக ஆர்டர்கள்'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {lang === 'en'
                  ? 'All government generic medicine reservations, active counter tokens, and verification OTPs.'
                  : 'உங்கள் முந்தைய முன்பதிவுகள் மற்றும் மருந்தக டோக்கன்கள்.'}
              </p>
            </div>
          </div>

          {pastOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">{order.id}</span>
                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-700">₹{order.totalGenericPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-800 font-bold">Saved ₹{order.totalSavings.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Pickup Pass Card if Kendra pickup */}
                  {order.deliveryType === 'kendra_pickup' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PMBJP Store Pickup Pass</span>
                        </span>
                        <span>Show to Pharmacist</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center py-2 bg-white/10 rounded-xl border border-emerald-400/20">
                        <div>
                          <div className="text-[10px] text-emerald-200">Pickup Token</div>
                          <div className="font-mono font-black text-sm text-white">{order.pickupToken || 'KENDRA-8492'}</div>
                        </div>
                        <div className="border-l border-white/20 pl-2">
                          <div className="text-[10px] text-emerald-200">Counter OTP</div>
                          <div className="font-mono font-black text-sm text-emerald-300">{order.verificationOtp || '629140'}</div>
                        </div>
                      </div>

                      {order.kendra && (
                        <div className="text-xs text-teal-100/90 pt-1 space-y-0.5">
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{order.kendra.name}</span>
                            <span className="text-[10px] text-emerald-300">{order.kendra.distanceKm} km</span>
                          </div>
                          <div className="text-[11px] text-teal-200/80">{order.kendra.address}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items summary */}
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Items ({order.items.length})</div>
                    <div className="space-y-1 text-xs text-slate-700">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="line-clamp-1">{it.medicine.genericName} × {it.quantity}</span>
                          <span className="font-semibold text-slate-900">₹{(it.medicine.genericPrice * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Medical ID: <strong className="text-slate-800">{order.healthId}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmedOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold cursor-pointer"
                    >
                      View Pickup Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">No previous orders found</h4>
              <p className="text-xs text-slate-500">
                Explore the PMBJP generic catalog to order verified medicines at 80%+ discount.
              </p>
              <button
                type="button"
                onClick={() => setActiveStoreTab('catalog')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Browse Generic Catalog
              </button>
            </div>
          )}
        </main>
      )}

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
      {/* ORDER SUCCESS MODAL / DIGITAL RECEIPT WITH TOKEN & OTP */}
      {/* ========================================================= */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl border border-emerald-200 space-y-4 my-8">
            
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Order Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                {confirmedOrder.deliveryType === 'kendra_pickup' ? 'Jan Aushadhi Kendra Reservation Confirmed!' : 'Generic Prescription Placed!'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Order ID: {confirmedOrder.id}
              </p>
            </div>

            {/* Kendra Pickup Token & Verification OTP Card */}
            {confirmedOrder.deliveryType === 'kendra_pickup' && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-left space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                      PMBJP Store Pickup Pass
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Valid for 48 Hrs</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  {/* Token Box */}
                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pickup Token</div>
                    <div className="font-mono font-black text-base text-slate-900 mt-0.5">
                      {confirmedOrder.pickupToken || 'KENDRA-8492'}
                    </div>
                  </div>

                  {/* Verification OTP Box */}
                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 shadow-2xs relative">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pharmacist OTP</div>
                    <div className="font-mono font-black text-base text-emerald-700 mt-0.5 tracking-wider">
                      {confirmedOrder.verificationOtp || '629140'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(confirmedOrder.verificationOtp || '629140')}
                      className="absolute top-2 right-2 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Kendra Store Location & Direct Contact */}
                {confirmedOrder.kendra && (
                  <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-emerald-100 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{confirmedOrder.kendra.name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">{confirmedOrder.kendra.distanceKm} km away</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {confirmedOrder.kendra.address}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-medium">Timings: {confirmedOrder.kendra.timings}</span>
                      <a
                        href={`tel:${confirmedOrder.kendra.phone}`}
                        className="font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-teal-700" />
                        <span>{confirmedOrder.kendra.phone}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Simulated SMS Notification Banner */}
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-[11px] font-mono border border-slate-800 space-y-1 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>Simulated Instant SMS Dispatched</span>
                    </span>
                    <span>To: +91 {confirmedOrder.patientPhone}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "Govt PMBJP Kendra: Order {confirmedOrder.id} is RESERVED at {confirmedOrder.kendra?.name || 'Local Kendra'}. Show Token {confirmedOrder.pickupToken || 'KENDRA-8492'} & OTP {confirmedOrder.verificationOtp || '629140'} at billing counter. Valid for 48 hrs."
                  </p>
                </div>

                {/* WhatsApp Pickup Pass Trigger */}
                <div className="pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `*HealthGrid PMBJP Jan Aushadhi Medicine Reservation*\nOrder ID: ${confirmedOrder.id}\nPickup Token: ${confirmedOrder.pickupToken || 'KENDRA-8492'}\nPharmacist OTP: ${confirmedOrder.verificationOtp || '629140'}\nPatient Medical ID: ${confirmedOrder.healthId}\nKendra: ${confirmedOrder.kendra?.name || 'Jan Aushadhi'}\nTotal: ₹${confirmedOrder.totalGenericPrice.toFixed(2)} (Family Saved ₹${confirmedOrder.totalSavings.toFixed(2)})\nPickup within 48 hours.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send Pickup Pass to WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Patient Medical ID:</span>
                <span className="font-mono font-bold text-slate-900">{confirmedOrder.healthId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Mode:</span>
                <span className="font-semibold text-slate-900">
                  {confirmedOrder.deliveryType === 'home_delivery' ? 'Home Doorstep Delivery' : 'Jan Aushadhi Kendra Store Pickup'}
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

      {/* ========================================================= */}
      {/* REFILL REVIEW & DOSAGE ADJUSTMENT MODAL */}
      {/* ========================================================= */}
      {selectedRefillForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    30-Day Generic Refill Review
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-500">
                    #{selectedRefillForReview.id}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Confirm Dosages & Adjust Strip Counts
                </h3>
                <p className="text-xs text-slate-500">
                  Prescribed by {selectedRefillForReview.doctorName} • Patient: {selectedRefillForReview.patientName} ({selectedRefillForReview.medicalId})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRefillForReview(null)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strips & Dosage adjustment list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Medicines in this Refill Cycle (Adjust quantity if you have remaining pills)
              </div>

              {selectedRefillForReview.items.map((item) => {
                const count = reviewStrips[item.id] || item.stripsCount;
                const brCost = item.brandPricePerStrip * count;
                const genCost = item.genericPricePerStrip * count;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{item.genericName}</span>
                        <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                          {item.dosage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Brand: {item.brandName} • Regimen: <strong className="text-slate-800">{item.frequency}</strong> ({item.timing})
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateReviewStripCount(item.id, -1)}
                          disabled={count <= 1}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-black text-xs text-slate-900">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateReviewStripCount(item.id, 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-[10px] text-slate-400 line-through">₹{brCost.toFixed(0)}</div>
                        <div className="text-xs font-black text-emerald-700">₹{genCost.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fulfillment Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Fulfillment Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReviewFulfillment('kendra_pickup')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    reviewFulfillment === 'kendra_pickup'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>Kendra Store Pickup</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                      FREE • Instant
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1">
                    Collect pass with Pickup Token & Counter OTP.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFulfillment('home_delivery')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    reviewFulfillment === 'home_delivery'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span>Home Delivery</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                      ₹40 • 2-3 Days
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1">
                    Delivered directly to registered home address.
                  </div>
                </button>
              </div>

              {/* Kendra Store Select if pickup */}
              {reviewFulfillment === 'kendra_pickup' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Pradhan Mantri Jan Aushadhi Kendra
                  </label>
                  <select
                    value={reviewKendraId}
                    onChange={(e) => setReviewKendraId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {kendras.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.distanceKm} km away) - {k.area}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Savings & Price Breakdown Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs text-teal-200">Commercial Brand Total: ₹{reviewAdjustedBrandTotal.toFixed(2)}</div>
                <div className="text-lg font-black text-white mt-0.5">
                  PMBJP Total: ₹{reviewAdjustedGenericTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-300 font-bold">
                  You save ₹{reviewAdjustedSavings.toFixed(2)} ({reviewSavingsPct}% discount)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRefillForReview(null)}
                  className="px-3.5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefillOrder}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Refill & Book Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SIMULATED SMS PREVIEW MODAL */}
      {/* ========================================================= */}
      {smsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Simulated Cellular SMS</span>
              </div>
              <button
                type="button"
                onClick={() => setSmsModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Recipient Phone</div>
              <div className="font-mono text-xs font-bold text-slate-900">{smsModal.phone}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-xs leading-relaxed shadow-inner">
              {smsModal.message}
            </div>

            <button
              type="button"
              onClick={() => setSmsModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              Close SMS Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
