import React, { useState } from 'react';
import {
  ArrowRight,
  GitCompare,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { ProductCategory } from '../../types/srs';

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Living Room',
  'Cooling & Air',
  'Water Purifiers',
  'Study & WFH',
  'Kitchen & Appliances',
  'IT & AV Equipment',
];

const TENURE_STEPS: (3 | 6 | 12 | 24)[] = [3, 6, 12, 24];

export const MarketplaceView: React.FC = () => {
  const {
    masterProducts,
    virtualInventory,
    selectedCategory,
    setSelectedCategory,
    selectedWorkflowFilter,
    setSelectedWorkflowFilter,
    selectedTenureMonths,
    setSelectedTenureMonths,
    searchQuery,
    comparisonProductIds,
    toggleCompareProduct,
    setActiveCheckoutProductId,
    setActiveTab,
  } = useKaroRentStore();

  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [expandedRateCardProductId, setExpandedRateCardProductId] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const publishedProducts = masterProducts.filter((product) => {
    const inv = virtualInventory.find((i) => i.productId === product.id);
    if (!inv || !inv.livePublicEnabled) return false;
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (
      selectedWorkflowFilter !== 'ALL' &&
      product.workflowType !== selectedWorkflowFilter
    ) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        inv.owningVendorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const comparedProducts = masterProducts.filter((p) =>
    comparisonProductIds.includes(p.id)
  );

  return (
    <div className="space-y-8">
      {/* Lifestyle Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-hearth-border shadow-hearth bg-[#F5EFE6]">
        <img
          src="assets/client_hero_living.jpg"
          alt="Home & Studio Living"
          className="w-full h-[290px] sm:h-[320px] object-cover object-right opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent flex items-center p-6 sm:p-10">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-hearth-card/90 border border-hearth-border text-[11px] font-medium text-hearth-terracotta shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Home & Studio Rentals</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1C1917] leading-tight">
              Thoughtful furniture & appliances for your home.
            </h1>
            <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
              Flexible monthly plans with free maintenance, doorstep setup, and 100% refundable security deposits.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => setActiveTab('MY_RENTALS')}
                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>View My Rentals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
                className="spring-btn px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-[#1C1917] border border-[#E7E5E4] text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Returns & Refunds</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter & Rental Duration Slider */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`spring-btn px-4 py-2 rounded-pill text-xs font-medium border shrink-0 transition-all ${
                    active
                      ? 'bg-hearth-apricot border-2 border-hearth-terracotta text-hearth-ink font-semibold shadow-sm'
                      : 'bg-hearth-oat/70 border-hearth-border text-hearth-umber hover:bg-hearth-oat'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Rental Duration Slider */}
          <div className="flex items-center gap-4 xl:border-l border-hearth-border xl:pl-6 min-w-[290px]">
            <div className="shrink-0">
              <div className="text-xs font-semibold text-hearth-ink">Rental Duration</div>
              <div className="text-[10px] text-hearth-taupe">
                Longer plans save more
              </div>
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={TENURE_STEPS.indexOf(selectedTenureMonths)}
                onChange={(e) =>
                  setSelectedTenureMonths(TENURE_STEPS[Number(e.target.value)])
                }
                className="w-full hearth-slider"
              />
              <div className="flex justify-between text-[11px] font-medium mt-1">
                {TENURE_STEPS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedTenureMonths(m)}
                    className={`transition-colors ${
                      selectedTenureMonths === m
                        ? 'text-hearth-terracotta font-bold'
                        : 'text-hearth-taupe hover:text-hearth-ink'
                    }`}
                  >
                    {m === 24 ? '24+ Mo' : `${m} Months`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Ribbon: Delivery Type Filter & Compare */}
        <div className="pt-3 border-t border-hearth-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-hearth-taupe flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-hearth-terracotta" />
              <span>Delivery Type:</span>
            </span>

            <button
              onClick={() => setSelectedWorkflowFilter('ALL')}
              className={`px-3 py-1 rounded-pill text-xs border transition-colors ${
                selectedWorkflowFilter === 'ALL'
                  ? 'bg-hearth-ink text-hearth-canvas border-hearth-ink font-medium'
                  : 'bg-hearth-oat text-hearth-umber border-hearth-border'
              }`}
            >
              All ({publishedProducts.length})
            </button>

            <button
              onClick={() => setSelectedWorkflowFilter('DIRECT_1_STEP')}
              className={`px-3 py-1 rounded-pill text-xs border flex items-center gap-1.5 transition-colors ${
                selectedWorkflowFilter === 'DIRECT_1_STEP'
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] font-semibold'
                  : 'bg-hearth-card text-hearth-umber border-hearth-border hover:bg-hearth-oat'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-hearth-sage" />
              <span>Standard Delivery</span>
            </button>

            <button
              onClick={() => setSelectedWorkflowFilter('SITE_VISIT_MULTI_STEP')}
              className={`px-3 py-1 rounded-pill text-xs border flex items-center gap-1.5 transition-colors ${
                selectedWorkflowFilter === 'SITE_VISIT_MULTI_STEP'
                  ? 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA] font-semibold'
                  : 'bg-hearth-card text-hearth-umber border-hearth-border hover:bg-hearth-oat'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-hearth-terracotta" />
              <span>Requires Home Measurement</span>
            </button>
          </div>

          {comparisonProductIds.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="spring-btn px-4 py-1.5 rounded-pill bg-hearth-sage text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare ({comparisonProductIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        {publishedProducts.map((product) => {
          const inv = virtualInventory.find((i) => i.productId === product.id)!;
          const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
          const effectiveMonthlyRate = Math.round(product.baseMonthlyRent * multiplier);
          const depositAmount = product.baseMonthlyRent * product.depositMonthsMultiple;
          const isMultiStep = product.workflowType === 'SITE_VISIT_MULTI_STEP';
          const isHovered = hoveredProductId === product.id;
          const isCompared = comparisonProductIds.includes(product.id);
          const isRateCardOpen = expandedRateCardProductId === product.id;

          return (
            <div
              key={product.id}
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
              className="spring-card rounded-[20px] bg-hearth-card border border-hearth-border shadow-hearth overflow-hidden flex flex-col justify-between"
            >
              {/* Image Container */}
              <div>
                <div className="relative h-72 w-full overflow-hidden bg-hearth-oat">
                  <img
                    src={
                      isHovered && product.studioImage
                        ? product.studioImage
                        : product.lifestyleImage
                    }
                    alt={product.title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  {/* Top-Left Delivery Badge */}
                  <div className="absolute top-4 left-4 right-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-[#FFFCF7]/95 backdrop-blur-sm border border-[#E7E5E4] shadow-md text-xs font-semibold text-[#1C1917]">
                      <span>
                        {isMultiStep ? 'Home Measurement Included' : 'Standard Delivery'}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isMultiStep ? 'bg-hearth-terracotta' : 'bg-[#658361]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Compare Button */}
                  <button
                    onClick={() => toggleCompareProduct(product.id)}
                    className={`absolute top-4 right-4 p-2 rounded-pill border text-xs transition-all shadow-sm ${
                      isCompared
                        ? 'bg-hearth-terracotta text-white border-hearth-terracotta'
                        : 'bg-[#FFFCF7]/90 text-[#1C1917] border-[#E7E5E4] hover:bg-white'
                    }`}
                    title="Compare Product"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom Stock Pill */}
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2.5 py-1 rounded-pill bg-[#1C1917]/80 backdrop-blur-sm text-white text-[10px]">
                      {inv.availableQuantity} Available
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5 pb-4 space-y-2.5">
                  <div className="text-[11px] text-hearth-taupe font-medium uppercase tracking-wide">
                    {product.category}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-hearth-ink leading-snug">
                    {product.title}
                  </h3>

                  <p className="text-xs text-hearth-umber line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Vendor Line */}
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-hearth-umber bg-hearth-oat/60 px-3 py-2 rounded-xl border border-hearth-border">
                    <Store className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
                    <span className="truncate">
                      Partner: <strong>{inv.owningVendorName}</strong>
                    </span>
                  </div>

                  {/* Installation Rates Accordion */}
                  {product.installationRateCard.length > 0 && (
                    <div>
                      <button
                        onClick={() =>
                          setExpandedRateCardProductId(
                            isRateCardOpen ? null : product.id
                          )
                        }
                        className="w-full text-left text-[11px] font-medium text-hearth-terracotta hover:underline flex items-center justify-between py-1"
                      >
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Installation Rates</span>
                        </span>
                        <span>{isRateCardOpen ? 'Hide' : 'View'}</span>
                      </button>

                      {isRateCardOpen && (
                        <div className="mt-1.5 p-3 rounded-xl bg-hearth-apricot border border-hearth-terracotta/30 space-y-1.5 text-[11px]">
                          <div className="font-semibold text-hearth-ink flex items-center justify-between">
                            <span>Home Measurement Visit:</span>
                            <span className="font-ledger">₹{product.siteVisitFee}</span>
                          </div>
                          {product.installationRateCard.map((rc) => (
                            <div
                              key={rc.code}
                              className="flex items-center justify-between text-hearth-umber border-t border-hearth-border/60 pt-1"
                            >
                              <span>
                                {rc.label}{' '}
                                {rc.includedFreeUnits > 0 &&
                                  `(${rc.includedFreeUnits} ${rc.unit}s free)`}
                              </span>
                              <span className="font-ledger font-semibold">
                                ₹{rc.ratePerUnit}/{rc.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Pricing & CTA */}
              <div>
                <div className="bg-[#EFE8D8] dark:bg-hearth-oat px-5 py-3 border-t border-b border-hearth-border flex items-baseline justify-between">
                  <span className="font-serif text-xl font-bold text-[#1C1917] dark:text-hearth-ink font-ledger">
                    ₹{effectiveMonthlyRate.toLocaleString('en-IN')} / month
                  </span>
                  <span className="text-[11px] text-hearth-taupe">
                    {selectedTenureMonths} month plan
                  </span>
                </div>

                <div className="p-3.5 bg-hearth-card">
                  <div className="rounded-2xl bg-[#BCC8B8]/75 dark:bg-hearth-sageLight border border-[#9FB09A] px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-[#2F5233] dark:text-emerald-400 shrink-0" />
                      <div className="text-[11px] leading-tight text-[#1C1917] dark:text-hearth-ink">
                        <span className="font-semibold font-ledger">
                          ₹{depositAmount.toLocaleString('en-IN')}
                        </span>{' '}
                        refundable deposit
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveCheckoutProductId(product.id)}
                      disabled={inv.availableQuantity <= 0}
                      className="spring-btn shrink-0 px-4 py-2 rounded-pill bg-[#C66B49] hover:bg-hearth-terracotta text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                    >
                      {inv.availableQuantity > 0 ? 'Rent Now' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-hearth-border">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Compare Products
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Compare monthly rent, deposit, and delivery options side by side.
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {comparedProducts.map((p) => {
                const inv = virtualInventory.find((i) => i.productId === p.id)!;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-hearth-card border border-hearth-border p-4 space-y-3"
                  >
                    <img
                      src={p.lifestyleImage}
                      alt={p.title}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <div className="font-serif font-bold text-sm text-hearth-ink">
                      {p.title}
                    </div>
                    <div className="text-xs space-y-1.5 text-hearth-umber">
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Monthly Rent:</span>
                        <span className="font-ledger font-bold">₹{p.baseMonthlyRent}/mo</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Deposit:</span>
                        <span className="font-ledger">
                          ₹{(p.baseMonthlyRent * p.depositMonthsMultiple).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Delivery:</span>
                        <span className="font-semibold text-hearth-terracotta">
                          {p.workflowType === 'SITE_VISIT_MULTI_STEP'
                            ? 'Home Measurement'
                            : 'Standard Delivery'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Partner:</span>
                        <span>{inv.owningVendorName}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-hearth-taupe">In Stock:</span>
                        <span className="font-ledger font-semibold text-emerald-700">
                          {inv.availableQuantity} units
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowCompareModal(false);
                        setActiveCheckoutProductId(p.id);
                      }}
                      className="w-full py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
                    >
                      Rent This Item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
