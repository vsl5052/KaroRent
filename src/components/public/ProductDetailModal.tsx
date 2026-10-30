import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tag,
  Info,
  Calendar,
  Layers,
  MapPin,
  Wrench,
  Building2,
  FileCheck,
  Check,
  Zap,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const ProductDetailModal: React.FC = () => {
  const {
    activeDetailProductId,
    setActiveDetailProductId,
    masterProducts,
    virtualInventory,
    selectedTenureMonths,
    setSelectedTenureMonths,
    selectedLocation,
    isAuthenticated,
    setIsLoginModalOpen,
    setActiveCheckoutProductId,
    addToast,
  } = useKaroRentStore();

  const product = masterProducts.find((p) => p.id === activeDetailProductId);
  const inv = virtualInventory.find((i) => i.productId === activeDetailProductId);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincode, setPincode] = useState('560038');
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [activeTabSpec, setActiveTabSpec] = useState<'SPECS' | 'CARE' | 'ESCROW'>('SPECS');

  // Multi-angle photo gallery for this product
  const galleryImages = product
    ? [
        product.lifestyleImage,
        product.studioImage,
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=900&q=85',
      ]
    : [];

  useEffect(() => {
    setActiveImageIdx(0);
    setIsCouponApplied(false);
  }, [activeDetailProductId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDetailProductId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveDetailProductId]);

  if (!product || !inv) return null;

  const TENURE_OPTIONS: (1 | 3 | 6 | 12 | 24)[] = [1, 3, 6, 12, 24];
  const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
  const rawMonthlyRate = Math.round(product.baseMonthlyRent * multiplier);
  const couponDiscount = isCouponApplied ? 200 : 0;
  const effectiveMonthlyRate = Math.max(99, rawMonthlyRate - couponDiscount);
  const crossedOutRetailRate = Math.round(product.baseMonthlyRent * 1.25);
  const discountPercent = Math.round(((crossedOutRetailRate - effectiveMonthlyRate) / crossedOutRetailRate) * 100);
  const depositAmount = effectiveMonthlyRate * product.depositMonthsMultiple;

  const handleProceedRent = () => {
    setActiveDetailProductId(null);
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      addToast({
        title: 'Sign In to Proceed',
        description: 'Please sign in or select a demo role to complete digital KYC & e-sign.',
        variant: 'info',
      });
    } else {
      setActiveCheckoutProductId(product.id);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    addToast({
      title: !isWishlisted ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.title,
      variant: 'info',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setActiveDetailProductId(null)}
      />

      {/* Main Full-Screen Modal Card */}
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-white dark:bg-[#16181B] rounded-3xl border border-slate-200 dark:border-[#242B33] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
        {/* Top Header Strip with Close Button */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-[#242B33] flex items-center justify-between bg-slate-50 dark:bg-[#111315]">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[#008BA3] dark:text-[#00C4DF]">{product.category}</span>
            <span>/</span>
            <span className="font-mono">{product.sku}</span>
            <span>/</span>
            <span className="text-[#008BA3] dark:text-[#00C4DF] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Available for Delivery</span>
            </span>
          </div>

          <button
            onClick={() => setActiveDetailProductId(null)}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-[#1E2328] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Image Gallery & Right Detail Sidebar */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-[#242B33]">
          {/* LEFT COLUMN: Gallery with Vertical Thumbnails & Main Preview (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col md:flex-row gap-4 bg-slate-50/70 dark:bg-[#111315]/60">
            {/* Vertical Thumbnail Strip */}
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[480px] shrink-0 order-2 md:order-1 py-1 no-scrollbar">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 focus:outline-none ${
                    activeImageIdx === idx
                      ? 'border-[#00C4DF] ring-2 ring-[#00C4DF]/30 shadow-md scale-105'
                      : 'border-slate-200 dark:border-[#242B33] opacity-60 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image Display */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111315] border border-slate-200 dark:border-[#242B33] flex items-center justify-center min-h-[320px] sm:min-h-[440px] order-1 md:order-2 group">
              <img
                src={galleryImages[activeImageIdx]}
                alt={product.title}
                className="w-full h-full object-cover max-h-[500px] transition-transform duration-500 group-hover:scale-105 opacity-95 dark:opacity-90"
              />

              {/* Prev / Next Image Overlay Controls */}
              <button
                onClick={() =>
                  setActiveImageIdx((prev) =>
                    prev === 0 ? galleryImages.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-black transition-all opacity-80 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setActiveImageIdx((prev) =>
                    (prev + 1) % galleryImages.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-black transition-all opacity-80 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Shop Live / 360 Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-pill bg-[#00C4DF] text-black text-[10px] font-extrabold tracking-wide uppercase shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-black" />
                <span>Shop Live • Verified Mint</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pricing, Tenure Pills, Coupons & Action Flow (5 Cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 space-y-5 bg-white dark:bg-[#16181B] overflow-y-auto">
            {/* Title & Headline */}
            <div>
              <div className="text-xs font-semibold text-[#008BA3] dark:text-[#00C4DF] uppercase tracking-wider mb-1">
                {product.category}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {product.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111315] border border-slate-200 dark:border-[#242B33] space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#008BA3] dark:text-[#00C4DF] font-ledger">
                  ₹{effectiveMonthlyRate.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ mo</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  ₹{crossedOutRetailRate.toLocaleString('en-IN')}/mo
                </span>
                <span className="px-2 py-0.5 rounded-pill bg-[#00C4DF]/15 dark:bg-[#00C4DF]/20 text-[#008BA3] dark:text-[#00C4DF] font-extrabold text-[11px]">
                  {discountPercent}% OFF
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#242B33]">
                <span>Refundable Escrow Deposit:</span>
                <span className="font-bold text-slate-900 dark:text-white font-ledger">
                  ₹{depositAmount.toLocaleString('en-IN')} ({product.depositMonthsMultiple}x monthly)
                </span>
              </div>
            </div>

            {/* Tenure Selector Tabs (1, 3, 6, 12, 24 Months) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Choose Rental Duration:</span>
                <span className="text-[11px] text-[#008BA3] dark:text-[#00C4DF] font-semibold">
                  {selectedTenureMonths >= 12 ? 'Best Value Plan' : 'Flexible Rental'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {TENURE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedTenureMonths(m)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center focus:outline-none ${
                      selectedTenureMonths === m
                        ? 'bg-[#00C4DF] text-black border-[#00C4DF] font-bold shadow-md scale-102'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#111315] dark:hover:bg-[#1E2328] border-slate-200 dark:border-[#242B33] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{m} {m === 1 ? 'Month' : 'Mos'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon & Promotional Offer Card */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Use Coupon: KAROFIRST</span>
                </div>
                <div className="text-[11px] text-amber-700/80 dark:text-amber-200/80">
                  Save ₹200/mo on your rental today!
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCouponApplied(!isCouponApplied);
                  addToast({
                    title: !isCouponApplied ? 'Coupon Applied!' : 'Coupon Removed',
                    description: !isCouponApplied
                      ? '₹200 monthly discount applied to your rent.'
                      : 'Standard rate restored.',
                    variant: 'success',
                  });
                }}
                className={`px-3 py-1.5 rounded-pill text-xs font-bold transition-all shadow-sm ${
                  isCouponApplied
                    ? 'bg-[#00C4DF] text-black font-extrabold'
                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold'
                }`}
              >
                {isCouponApplied ? '✓ Applied' : 'Apply'}
              </button>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#111315] border border-slate-200 dark:border-[#242B33] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#009BB5] dark:text-[#00C4DF]" />
                  <span>Doorstep Delivery & Assembly</span>
                </span>
                <button
                  onClick={() => setIsEditingPincode(!isEditingPincode)}
                  className="text-[#008BA3] dark:text-[#00C4DF] font-semibold hover:underline text-[11px]"
                >
                  {isEditingPincode ? 'Save' : 'Change Pincode'}
                </button>
              </div>

              {isEditingPincode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-32 px-3 py-1 rounded-xl bg-white dark:bg-[#16181B] border border-slate-200 dark:border-[#242B33] text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Delivery Zone</span>
                </div>
              ) : (
                <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pincode}</span>
                  <span className="text-[#008BA3] dark:text-[#00C4DF] font-semibold">• Standard Doorstep Delivery</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Wishlist & Rent Now */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={toggleWishlist}
                className={`p-3 rounded-2xl border transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#111315] border-slate-200 dark:border-[#242B33] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleProceedRent}
                disabled={inv.availableQuantity <= 0}
                className="flex-1 spring-btn py-3.5 px-6 rounded-pill bg-[#00C4DF] hover:bg-[#00B2D6] text-black text-xs sm:text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-black fill-black" />
                <span>
                  {inv.availableQuantity > 0 ? 'Rent Now (Proceed to Agreement)' : 'Out of Stock'}
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#009BB5] dark:text-[#00C4DF] shrink-0" />
                <span>Refundable Deposit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                <span>1x Annual Relocation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Maintenance Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>Photo Inspection</span>
              </div>
            </div>

            {/* Product Specifications & Care Tabs */}
            <div className="border-t border-slate-200 dark:border-[#242B33] pt-4 space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#242B33] pb-1">
                <button
                  onClick={() => setActiveTabSpec('SPECS')}
                  className={`text-xs font-semibold pb-1.5 transition-all ${
                    activeTabSpec === 'SPECS'
                      ? 'text-[#008BA3] dark:text-[#00C4DF] border-b-2 border-[#00C4DF]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTabSpec('CARE')}
                  className={`text-xs font-semibold pb-1.5 transition-all ${
                    activeTabSpec === 'CARE'
                      ? 'text-[#008BA3] dark:text-[#00C4DF] border-b-2 border-[#00C4DF]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Care & Quality
                </button>
                <button
                  onClick={() => setActiveTabSpec('ESCROW')}
                  className={`text-xs font-semibold pb-1.5 transition-all ${
                    activeTabSpec === 'ESCROW'
                      ? 'text-[#008BA3] dark:text-[#00C4DF] border-b-2 border-[#00C4DF]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Deposit & Return Policy
                </button>
              </div>

              {activeTabSpec === 'SPECS' && (
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C4DF]" />
                      <span>{spec}</span>
                    </div>
                  ))}
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    Dimensions: 198 cm (L) × 86 cm (W) × 78 cm (H) • Solid Hardwood Core
                  </div>
                </div>
              )}

              {activeTabSpec === 'CARE' && (
                <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>• Spot clean with damp microfiber cloth. Do not use harsh solvents.</p>
                  <p>• Periodic deep sanitization and steam-cleaning provided by KaroRent technicians.</p>
                </div>
              )}

              {activeTabSpec === 'ESCROW' && (
                <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>• Your 4-month deposit (₹{depositAmount.toLocaleString('en-IN')}) is held securely as a refundable security deposit.</p>
                  <p>• Returns are verified with doorstep photo inspection to protect both parties.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
