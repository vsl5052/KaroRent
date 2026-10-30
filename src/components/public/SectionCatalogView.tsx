import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  ArrowLeft,
  X,
  Search,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { PlatformMasterProduct, ProductCategory } from '../../types/srs';

// The main sections matching navigation
export const SECTION_TABS = [
  'Bedroom',
  'BHK Combos',
  'Living Room',
  'Appliances',
  'Storage',
];

interface SectionConfig {
  title: string;
  subtitle: string;
  bannerImage: string;
  subCategories: string[];
  categoryFilter?: ProductCategory | 'ALL';
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  'Bedroom': {
    title: 'Master Bedroom & Suites',
    subtitle: 'King & queen beds, ergonomic mattresses, and handcrafted teak bedside storage.',
    bannerImage: 'assets/theme_zen_japandi_bedroom.jpg',
    subCategories: ['All', 'Queen Beds', 'King Beds', 'Storage Beds', 'Bedside Tables', 'Mattress', 'Compact Double Bed'],
    categoryFilter: 'Living Room',
  },
  'BHK Combos': {
    title: 'BHK Combos & Complete Home Packages',
    subtitle: 'Move into a fully furnished apartment tomorrow. Curated packages starting at ₹1,499/mo.',
    bannerImage: 'assets/hero_unlmtd_emerald_grid.jpg',
    subCategories: ['All', 'Bedroom Combos', 'Living Room Combos', 'Appliance Combos', 'Storage Combos'],
  },
  'Living Room': {
    title: 'Luxe Living Room Sanctuaries',
    subtitle: 'Deep velvet couches, solid oak center tables, and cozy accent armchairs.',
    bannerImage: 'assets/hero_emerald_living_luxe.jpg',
    subCategories: ['All', 'Sofas', '3 Seater', '2 Seater', 'Recliners', 'L Shape', 'Sofa Cum Bed', 'Centre Tables'],
    categoryFilter: 'Living Room',
  },
  'Appliances': {
    title: '5-Star Inverter Appliances',
    subtitle: 'Samsung, LG, and Whirlpool appliances with annual maintenance and repair support.',
    bannerImage: 'assets/theme_urban_industrial_loft.jpg',
    subCategories: ['All', 'Refrigerators', 'Washing Machines', 'Water Purifiers', 'Split AC', 'Microwaves', 'Air Purifiers'],
    categoryFilter: 'Kitchen & Appliances',
  },
  'Storage': {
    title: 'Smart Wardrobes & Storage Solutions',
    subtitle: 'Spacious wardrobes, chest of drawers, shoe racks, and entertainment media units.',
    bannerImage: 'assets/theme_warm_terracotta_living.jpg',
    subCategories: ['All', 'Wardrobes', 'Chest of Drawers', 'Entertainment Units', 'Bookshelves', 'Shoe Racks'],
  },
};

export const SectionCatalogView: React.FC = () => {
  const {
    catalogSection,
    setCatalogSection,
    catalogSubCategory,
    setCatalogSubCategory,
    setPublicPageMode,
    masterProducts,
    virtualInventory,
    selectedTenureMonths,
    setActiveDetailProductId,
  } = useKaroRentStore();

  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST'>('POPULAR');
  const [priceRange, setPriceRange] = useState<string>('ALL');
  const [stockOnly, setStockOnly] = useState(false);

  const currentConfig = SECTION_CONFIGS[catalogSection] || SECTION_CONFIGS['Living Room'];

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return masterProducts.filter((product) => {
      const inv = virtualInventory.find((i) => i.productId === product.id);
      if (!inv || !inv.livePublicEnabled) return false;

      // Section category match
      if (currentConfig.categoryFilter && currentConfig.categoryFilter !== 'ALL') {
        if (product.category !== currentConfig.categoryFilter) {
          const matchTitle = product.title.toLowerCase().includes(catalogSection.toLowerCase());
          if (!matchTitle && catalogSection !== 'BHK Combos' && catalogSection !== '% Steal Deals') {
            return false;
          }
        }
      }

      // Sub-category match
      if (catalogSubCategory && catalogSubCategory !== 'All') {
        const sub = catalogSubCategory.toLowerCase();
        const matchesSub =
          product.title.toLowerCase().includes(sub) ||
          product.category.toLowerCase().includes(sub) ||
          product.specifications.some((s) => s.toLowerCase().includes(sub));
        if (!matchesSub) return false;
      }

      // Price Range filter
      const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
      const rate = Math.round(product.baseMonthlyRent * multiplier);

      if (priceRange === 'UNDER_500' && rate >= 500) return false;
      if (priceRange === '500_1000' && (rate < 500 || rate > 1000)) return false;
      if (priceRange === '1000_2000' && (rate < 1000 || rate > 2000)) return false;
      if (priceRange === 'ABOVE_2000' && rate <= 2000) return false;

      // Stock check
      if (stockOnly && inv.availableQuantity <= 0) return false;

      return true;
    }).sort((a, b) => {
      const multA = a.tenureMultipliers[selectedTenureMonths] || 1;
      const multB = b.tenureMultipliers[selectedTenureMonths] || 1;
      const rateA = Math.round(a.baseMonthlyRent * multA);
      const rateB = Math.round(b.baseMonthlyRent * multB);

      if (sortBy === 'PRICE_ASC') return rateA - rateB;
      if (sortBy === 'PRICE_DESC') return rateB - rateA;
      return 0; // Default order
    });
  }, [masterProducts, virtualInventory, catalogSection, catalogSubCategory, currentConfig, priceRange, stockOnly, sortBy, selectedTenureMonths]);

  const handleCardClick = (productId: string) => {
    setActiveDetailProductId(productId);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumb & Back to Home Button */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
        <button
          onClick={() => setPublicPageMode('HOME')}
          className="flex items-center gap-1.5 font-bold text-[#059669] dark:text-[#10B981] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Featured Homepage</span>
        </button>

        <div className="flex items-center gap-2">
          <span>KaroRent</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">{catalogSection}</span>
          {catalogSubCategory !== 'All' && (
            <>
              <span>/</span>
              <span className="font-semibold text-[#059669] dark:text-[#10B981]">{catalogSubCategory}</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Secondary Sticky Navigation Bar */}
      <div className="sticky top-[74px] z-30 bg-white/95 dark:bg-[#061712]/95 backdrop-blur-md border-y border-slate-200 dark:border-[#1E4E40] py-2.5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 shadow-sm transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SECTION_TABS.map((tab) => {
            const isActive = catalogSection.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => {
                  setCatalogSection(tab);
                  setCatalogSubCategory('All');
                }}
                className={`px-4 py-1.5 rounded-pill text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-emerald-950 shadow-md scale-102'
                    : 'bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13332A]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Section Hero Banner Photo */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E4E40] shadow-md dark:shadow-xl min-h-[200px] sm:min-h-[260px] flex items-center bg-gradient-to-r from-[#EDF6F1] via-[#DFEFE6] to-[#CEE7D8] dark:from-[#061712] dark:via-[#0C271E]/90 dark:to-transparent transition-colors">
        <img
          src={currentConfig.bannerImage}
          alt={currentConfig.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25 dark:opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EDF6F1]/90 via-[#EDF6F1]/80 to-transparent dark:from-[#061712] dark:via-[#0C271E]/90 dark:to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl text-slate-900 dark:text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#10B981]/15 dark:bg-[#10B981]/15 backdrop-blur-md border border-[#10B981]/40 dark:border-[#10B981]/30 text-[11px] font-bold text-[#059669] dark:text-[#10B981]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Section • Delivery Hub</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            {currentConfig.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
            {currentConfig.subtitle}
          </p>
        </div>
      </div>

      {/* 4. Sub-Category Quick Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {currentConfig.subCategories.map((sub) => {
          const isSelected = catalogSubCategory === sub;
          return (
            <button
              key={sub}
              onClick={() => setCatalogSubCategory(sub)}
              className={`px-3.5 py-1.5 rounded-pill text-xs whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-[#10B981] border-[#10B981] text-emerald-950 font-extrabold shadow-sm'
                  : 'bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13332A]'
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* 5. Main Catalog Layout: Left Filter Sidebar + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Filter Sidebar */}
        <div
          className={`${
            showFilters ? 'lg:col-span-3' : 'hidden'
          } bg-white dark:bg-[#0C231C] rounded-3xl border border-slate-200 dark:border-[#1E4E40] p-5 space-y-6 shadow-sm transition-colors`}
        >
          {/* Top Filter Header with Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E4E40]">
            <div className="flex items-center gap-2 font-serif font-bold text-sm text-slate-900 dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
              <span>Filter Catalog</span>
            </div>
            <button
              onClick={() => {
                setPriceRange('ALL');
                setStockOnly(false);
                setCatalogSubCategory('All');
                setSortBy('POPULAR');
              }}
              className="text-[11px] font-bold text-[#059669] dark:text-[#10B981] hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Sort By Filter Accordion */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SORT BY
            </div>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {[
                { id: 'POPULAR', label: 'Most Popular / Best-Seller' },
                { id: 'PRICE_ASC', label: 'Price — Low to High' },
                { id: 'PRICE_DESC', label: 'Price — High to Low' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
                >
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === opt.id}
                    onChange={() => setSortBy(opt.id as any)}
                    className="accent-[#10B981]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sub-Category Filter Accordion */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-[#1E4E40]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SUB-CATEGORY
            </div>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
              {currentConfig.subCategories.map((sub) => (
                <label
                  key={sub}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
                >
                  <input
                    type="radio"
                    name="subCatRadio"
                    checked={catalogSubCategory === sub}
                    onChange={() => setCatalogSubCategory(sub)}
                    className="accent-[#10B981]"
                  />
                  <span>{sub}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter Accordion */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-[#1E4E40]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PRICE RANGE
            </div>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {[
                { id: 'ALL', label: 'All Rates' },
                { id: 'UNDER_500', label: 'Under ₹500/mo' },
                { id: '500_1000', label: '₹500 – ₹1,000/mo' },
                { id: '1000_2000', label: '₹1,000 – ₹2,000/mo' },
                { id: 'ABOVE_2000', label: 'Above ₹2,000/mo' },
              ].map((pr) => (
                <label
                  key={pr.id}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
                >
                  <input
                    type="radio"
                    name="priceFilter"
                    checked={priceRange === pr.id}
                    onChange={() => setPriceRange(pr.id)}
                    className="accent-[#10B981]"
                  />
                  <span>{pr.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock / Availability Checkbox */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1E4E40]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="rounded accent-[#10B981]"
              />
              <span className="font-semibold">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Right Product Grid Area */}
        <div className={showFilters ? 'lg:col-span-9 space-y-5' : 'lg:col-span-12 space-y-5'}>
          {/* Grid Subheader with Count & Filter Visibility Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] text-slate-800 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-[#13332A] transition-all"
              >
                <Filter className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
                <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
              </button>
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> items in <strong className="text-slate-900 dark:text-white">{catalogSection}</strong>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Plan: <strong className="text-slate-900 dark:text-white">{selectedTenureMonths} Month(s)</strong>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] space-y-3">
              <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
              <div className="font-serif font-bold text-base text-slate-900 dark:text-white">
                No items match your active filters
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try selecting "All" sub-categories or broadening the price range.
              </p>
              <button
                onClick={() => {
                  setPriceRange('ALL');
                  setCatalogSubCategory('All');
                }}
                className="px-4 py-2 rounded-pill bg-[#10B981] text-emerald-950 font-bold text-xs shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const inv = virtualInventory.find((i) => i.productId === product.id)!;
                const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
                const effectiveMonthlyRate = Math.round(product.baseMonthlyRent * multiplier);
                const crossedOutRate = Math.round(product.baseMonthlyRent * 1.25);
                const discount = Math.round(((crossedOutRate - effectiveMonthlyRate) / crossedOutRate) * 100);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleCardClick(product.id)}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] hover:border-[#10B981] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100 dark:bg-[#061712]">
                        <img
                          src={product.lifestyleImage}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-95 dark:opacity-90"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-pill bg-[#10B981] text-emerald-950 text-[10px] font-extrabold tracking-wide">
                            Best-Seller
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-sm">
                            <Heart className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Delivery Badge at bottom of image */}
                        <div className="absolute bottom-2 left-2.5 px-2.5 py-1 rounded-pill bg-black/60 backdrop-blur-md text-white text-[10px] flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#10B981]" />
                          <span>Prompt Delivery</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-[#059669] dark:text-[#10B981] tracking-wider">
                          {product.category}
                        </div>

                        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors line-clamp-1">
                          {product.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Pricing Row */}
                    <div className="p-4 pt-3 bg-slate-50 dark:bg-[#061712]/50 border-t border-slate-200 dark:border-[#1E4E40] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-lg text-slate-900 dark:text-white font-ledger">
                            ₹{effectiveMonthlyRate.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">/ mo</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                            ₹{crossedOutRate.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <div className="text-[10px] text-[#059669] dark:text-[#10B981] font-bold">
                          {discount}% OFF • Zero Deposit Option
                        </div>
                      </div>

                      <div className="text-xs font-bold text-[#059669] dark:text-[#10B981] group-hover:underline">
                        View Details →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
