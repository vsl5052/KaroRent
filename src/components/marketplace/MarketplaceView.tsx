import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  GitCompare,
  Info,
  Lock,
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
    activePersona,
    switchPersona,
    setActiveTab,
  } = useKaroRentStore();

  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [expandedRateCardProductId, setExpandedRateCardProductId] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showThemeMockupModal, setShowThemeMockupModal] = useState(false);

  // Only show products whose linked virtual inventory is livePublicEnabled (FR-INV-009 / FR-CAT-002)
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
      {/* Editorial Lifestyle Hero Banner using local Terracotta Hearth illustration */}
      <div className="relative rounded-3xl overflow-hidden border border-hearth-border shadow-hearth bg-[#F5EFE6]">
        <img
          src="assets/client_hero_living.jpg"
          alt="Terracotta Hearth Warm Editorial Living"
          className="w-full h-[290px] sm:h-[320px] object-cover object-right opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent flex items-center p-6 sm:p-10">
          <div className="max-w-xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-hearth-card/90 border border-hearth-border text-[11px] font-medium text-hearth-terracotta shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Theme 3: “Terracotta Hearth” • Platform-Guaranteed Rental Rates (BR-027)</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1C1917] leading-tight">
              Thoughtful living, curated for your home & studio.
            </h1>
            <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
              Every rental is contracted directly with <strong>KaroRent</strong> (FR-AGR-001), priced transparently by our central rate card, and protected by our <strong>Segregated Security Deposit Vault</strong> with mandatory doorstep EXIF pickup verification (BR-026).
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>Explore 3-Way Deposit Protection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowThemeMockupModal(true)}
                className="spring-btn px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-[#1C1917] border border-[#E7E5E4] text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>View Theme 3 HD Design Reference</span>
              </button>
              {!activePersona.isBlacklisted && (
                <button
                  onClick={() => switchPersona('persona-cus-blk')}
                  className="px-3.5 py-2 rounded-pill bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] text-[11px] font-medium transition-colors"
                >
                  Test Blacklist Checkout Intercept (FR-BLK-005)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Horizontal Filter Ribbon & Rental Duration Slider (Exact Match to Theme 3 Screen A Mockup!) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Category 999px Pill Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono text-hearth-taupe mr-1 shrink-0">
              999px Pills:
            </span>
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

          {/* Interactive Rental Duration Slider (3 / 6 / 12 / 24 Months) */}
          <div className="flex items-center gap-4 xl:border-l border-hearth-border xl:pl-6 min-w-[290px]">
            <div className="shrink-0">
              <div className="text-xs font-semibold text-hearth-ink">Rental Duration</div>
              <div className="text-[10px] text-hearth-taupe font-mono">
                Dynamic Rate Plan (FR-PRC-001)
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

        {/* Sub-Ribbon: Dual-Path Workflow Filter (FR-CAT-003) & Comparison Tray */}
        <div className="pt-3 border-t border-hearth-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-hearth-taupe flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-hearth-terracotta" />
              <span>Booking Path (FR-CAT-003):</span>
            </span>

            <button
              onClick={() => setSelectedWorkflowFilter('ALL')}
              className={`px-3 py-1 rounded-pill text-xs border transition-colors ${
                selectedWorkflowFilter === 'ALL'
                  ? 'bg-hearth-ink text-hearth-canvas border-hearth-ink font-medium'
                  : 'bg-hearth-oat text-hearth-umber border-hearth-border'
              }`}
            >
              All Offerings ({publishedProducts.length})
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
              <span>Instant Home Booking (1-Step)</span>
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
              <span>Includes Guided Home Measurement Visit (Multi-Step)</span>
            </button>
          </div>

          {comparisonProductIds.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="spring-btn px-4 py-1.5 rounded-pill bg-hearth-sage text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({comparisonProductIds.length}/3) — FR-CAT-005</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Editorial Product Grid (Exact Match to Theme 3 Screen A Cards!) */}
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
              {/* Top Image Container with Floating Ivory Workflow Pill & Studio Hover Cross-Fade */}
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

                  {/* Top-Left Floating Ivory Pill (Exact Match to Theme 3 Mockup) */}
                  <div className="absolute top-4 left-4 right-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-[#FFFCF7]/95 backdrop-blur-sm border border-[#E7E5E4] shadow-md text-xs font-semibold text-[#1C1917]">
                      <span>
                        {isMultiStep
                          ? 'Includes Guided Home Measurement Visit'
                          : 'Instant Home Booking'}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isMultiStep ? 'bg-hearth-terracotta' : 'bg-[#658361]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Top-Right Compare Toggle Button */}
                  <button
                    onClick={() => toggleCompareProduct(product.id)}
                    className={`absolute top-4 right-4 p-2 rounded-pill border text-xs transition-all shadow-sm ${
                      isCompared
                        ? 'bg-hearth-terracotta text-white border-hearth-terracotta'
                        : 'bg-[#FFFCF7]/90 text-[#1C1917] border-[#E7E5E4] hover:bg-white'
                    }`}
                    title="Compare Product Offer (FR-CAT-005)"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom-Left Virtual Stock & Condition Pill */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-pill bg-[#1C1917]/80 backdrop-blur-sm text-white text-[10px] font-mono">
                      {inv.conditionGrade} • {inv.availableQuantity} Units Available
                    </span>
                    <span className="px-2.5 py-1 rounded-pill bg-[#FFFCF7]/90 text-[#1C1917] text-[10px] font-medium">
                      {isHovered ? 'Studio Condition View' : 'Hover for Studio View'}
                    </span>
                  </div>
                </div>

                {/* Editorial Product Details & Partner Vendor Attribution (FR-CAT-004) */}
                <div className="p-5 pb-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-hearth-taupe font-mono">
                    <span>{product.category.toUpperCase()}</span>
                    <span>SKU: {product.sku}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-hearth-ink leading-snug">
                    {product.title}
                  </h3>

                  <p className="text-xs text-hearth-umber line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Vendor Attribution & Source Transparency (FR-CAT-004 / FR-INV-011) */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-hearth-umber bg-hearth-oat/60 px-3 py-2 rounded-xl border border-hearth-border">
                    <div className="flex items-center gap-1.5 truncate">
                      <Store className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
                      <span className="truncate">
                        Fulfilled by <strong>{inv.owningVendorName}</strong>
                      </span>
                    </div>
                    {inv.pendingStagedRequest && (
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] shrink-0"
                        title="Vendor submitted a staged change; live display remains unaffected until Platform Manager approval (BR-030)"
                      >
                        Staged Edit Pending
                      </span>
                    )}
                  </div>

                  {/* Multi-Step Rate Card Preview Accordion (FR-PRC-001) */}
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
                          <span>
                            View Locked Platform Installation Rate Card (FR-PRC-001)
                          </span>
                        </span>
                        <span>{isRateCardOpen ? 'Hide' : 'Show'}</span>
                      </button>

                      {isRateCardOpen && (
                        <div className="mt-1.5 p-3 rounded-xl bg-hearth-apricot border border-hearth-terracotta/30 space-y-1.5 text-[11px]">
                          <div className="font-semibold text-hearth-ink flex items-center justify-between">
                            <span>Pre-Installation Site Visit Fee:</span>
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

              {/* Bottom Pricing Ribbon & Sage-Green Deposit Vault Box (Exact Match to Theme 3 Screen A Mockup!) */}
              <div>
                {/* Warm Oat Rate Strip */}
                <div className="bg-[#EFE8D8] dark:bg-hearth-oat px-5 py-3 border-t border-b border-hearth-border flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-xl font-bold text-[#1C1917] dark:text-hearth-ink font-ledger">
                      ₹{effectiveMonthlyRate.toLocaleString('en-IN')} / month
                    </span>
                    <span className="ml-1.5 text-[11px] text-[#44403C] dark:text-hearth-umber">
                      (All-inclusive Platform Rate)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-hearth-taupe flex items-center gap-1">
                    <Lock className="w-3 h-3 text-hearth-terracotta" />
                    BR-027
                  </span>
                </div>

                {/* Sage-Green Segregated Deposit Vault Footer & Sun-Baked Terracotta CTA */}
                <div className="p-3.5 bg-hearth-card">
                  <div className="rounded-2xl bg-[#BCC8B8]/75 dark:bg-hearth-sageLight border border-[#9FB09A] px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-[#2F5233] dark:text-emerald-400 shrink-0" />
                      <div className="text-[11px] leading-tight text-[#1C1917] dark:text-hearth-ink">
                        <span className="font-semibold font-ledger">
                          ₹{depositAmount.toLocaleString('en-IN')} Refundable Deposit
                        </span>{' '}
                        • Protected in Segregated Vault & Refunded in 14 Days
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveCheckoutProductId(product.id)}
                      disabled={inv.availableQuantity <= 0}
                      className="spring-btn shrink-0 px-4 py-2 rounded-pill bg-[#C66B49] hover:bg-hearth-terracotta text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                    >
                      {inv.availableQuantity > 0 ? 'Reserve Item' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Comparison Modal (FR-CAT-005) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-hearth-border">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Side-by-Side Offer Comparison (FR-CAT-005)
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Distinguishes workflow requirements, condition grades, and fulfilling vendor locations without implying identical service terms.
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
                        <span className="text-hearth-taupe">Platform Rent:</span>
                        <span className="font-ledger font-bold">₹{p.baseMonthlyRent}/mo</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">4x Vault Deposit:</span>
                        <span className="font-ledger">
                          ₹{(p.baseMonthlyRent * p.depositMonthsMultiple).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Booking Path:</span>
                        <span className="font-semibold text-hearth-terracotta">
                          {p.workflowType === 'SITE_VISIT_MULTI_STEP'
                            ? 'Multi-Step Site Visit'
                            : '1-Step Direct'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Fulfilling Vendor:</span>
                        <span>{inv.owningVendorName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-hearth-border">
                        <span className="text-hearth-taupe">Condition Grade:</span>
                        <span>{inv.conditionGrade}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-hearth-taupe">Available Stock:</span>
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
                      Select This Offer
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Theme 3 High-Definition Visual Reference Modal */}
      {showThemeMockupModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Theme 3: “Terracotta Hearth” — Official HD Design Specification Mockups
                </h3>
                <p className="text-xs text-hearth-taupe">
                  From Conversation 7e971d04-5916-45d3-9534-e682cc3d3022 • Warm Alabaster Linen (#FAF8F5), Woven Oat (#F5F2EB), Sun-Baked Terracotta (#C2410C) & Botanical Sage (#2F5233)
                </p>
              </div>
              <button
                onClick={() => setShowThemeMockupModal(false)}
                className="p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-hearth-ink">
                  Screen A: Warm Lifestyle Marketplace & Interior Catalog
                </div>
                <img
                  src="assets/theme3_terracotta_hearth_marketplace.jpg"
                  alt="Theme 3 Marketplace Mockup"
                  className="w-full rounded-2xl border border-hearth-border shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-hearth-ink">
                  Screen B: Guided AC Site-Visit Storyboard, Stationery Agreement & Fair Deposit Console
                </div>
                <img
                  src="assets/theme3_terracotta_hearth_console.jpg"
                  alt="Theme 3 Console Mockup"
                  className="w-full rounded-2xl border border-hearth-border shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
