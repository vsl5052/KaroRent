import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GitCompare,
  Headphones,
  Heart,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
  X,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { ProductCategory } from '../../types/srs';
import { HeroSlideshow } from './HeroSlideshow';

// Shop by Space Categories with imagery
const ROOM_SPACES = [
  {
    name: 'Living Room',
    section: 'Living Room',
    image: 'assets/hero_emerald_living_luxe.jpg',
    count: '14+ Products',
    tagline: 'Velvet sofas & loungers',
  },
  {
    name: 'Bedroom',
    section: 'Bedroom',
    image: 'assets/theme_zen_japandi_bedroom.jpg',
    count: '18+ Products',
    tagline: 'Teak beds & mattresses',
  },
  {
    name: 'BHK Combos',
    section: 'BHK Combos',
    image: 'assets/hero_unlmtd_emerald_grid.jpg',
    count: '8+ Curated Suites',
    tagline: 'Full home packages',
  },
  {
    name: 'Appliances',
    section: 'Appliances',
    image: 'assets/theme_urban_industrial_loft.jpg',
    count: '12+ Smart Inverters',
    tagline: 'Fridges, ACs, Washing',
  },
  {
    name: 'Storage',
    section: 'Storage',
    image: 'assets/theme_warm_terracotta_living.jpg',
    count: '14+ Wardrobes & Units',
    tagline: 'Wardrobes & dressers',
  },
];

const ROOM_PACKAGES = [
  {
    id: 'PKG-STUDIO',
    title: 'Studio Apartment Starter Combo',
    category: 'Combo Package',
    tagline: 'Ideal for studio and 1 BHK living spaces.',
    items: ['Solid Ashwood Bed & Mattress', 'Accent Coffee Table', 'Bedside Nightstand'],
    rentPerMonth: 1899,
    retailRent: 2499,
    deposit: 7596,
    imageUrl: 'assets/hero_unlmtd_emerald_grid.jpg',
    productIdRef: 'PRD-01',
  },
  {
    id: 'PKG-1BHK-PRO',
    title: 'Executive 1 BHK Full Home Package',
    category: 'Combo Package',
    tagline: 'Complete living, bedroom & appliance setup.',
    items: ['3-Seater Velvet Sofa', 'Split Inverter AC 1.5 Ton', 'Queen Bed', 'Inverter Fridge'],
    rentPerMonth: 3499,
    retailRent: 4899,
    deposit: 13996,
    imageUrl: 'assets/hero_emerald_living_luxe.jpg',
    productIdRef: 'PRD-01',
  },
  {
    id: 'PKG-ESSENTIALS',
    title: 'Essential Living & Storage Bundle',
    category: 'Combo Package',
    tagline: 'Complete wardrobe, shoe storage & living room set.',
    items: ['3-Door Mirrored Wardrobe', 'Solid Teak Coffee Table', 'Shoe Cabinet'],
    rentPerMonth: 1299,
    retailRent: 1799,
    deposit: 5196,
    imageUrl: 'assets/theme_warm_terracotta_living.jpg',
    productIdRef: 'PRD-01',
  },
];

const FAQS = [
  {
    q: 'How does the security deposit work on KaroRent?',
    a: 'A refundable deposit is held safely during your active lease. Upon return, our technician inspects the item against the original delivery photo, and your deposit is refunded directly to your bank account within 72 hours.',
  },
  {
    q: 'What is the 3-Way Photo Inspection?',
    a: 'When an item is returned, our technician captures a photograph at your doorstep before moving the item. Any transit damage occurring during transport cannot be deducted from your deposit.',
  },
  {
    q: 'Can I relocate if I move to another apartment?',
    a: 'Yes! KaroRent offers 1 doorstep relocation service per 12 months of rental across all serviced delivery pincodes.',
  },
  {
    q: 'What happens if an appliance needs maintenance or repair?',
    a: 'All appliances include comprehensive repair and maintenance support. Our technician visits your doorstep promptly to resolve any issues.',
  },
  {
    q: 'What documents are required to complete digital KYC?',
    a: 'Just your Aadhaar (for instant OTP verification) and PAN card. No lengthy paperwork or physical visits required.',
  },
];

export const PublicStorefrontView: React.FC = () => {
  const {
    masterProducts,
    virtualInventory,
    selectedTenureMonths,
    openSectionCatalog,
    setActiveDetailProductId,
  } = useKaroRentStore();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Steal Deals: Products with rent under ₹1,000/mo
  const stealDeals = masterProducts.filter((product) => {
    const inv = virtualInventory.find((i) => i.productId === product.id);
    return inv?.livePublicEnabled && product.baseMonthlyRent <= 1000;
  });

  // Trending Bestsellers
  const bestsellers = masterProducts.filter((product) => {
    const inv = virtualInventory.find((i) => i.productId === product.id);
    return inv?.livePublicEnabled;
  }).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Lifestyle Slideshow */}
      <HeroSlideshow />

      {/* 2. Shop By Space / Room */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#10B981] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLORE CURATED COLLECTIONS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Shop by Living Space
            </h2>
          </div>
          <button
            onClick={() => openSectionCatalog('Living Room')}
            className="text-xs font-bold text-slate-600 hover:text-[#059669] dark:text-slate-400 dark:hover:text-[#10B981] flex items-center gap-1 transition-colors"
          >
            <span>View All Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ROOM_SPACES.map((space) => (
            <button
              key={space.name}
              onClick={() => openSectionCatalog(space.section)}
              className="group text-left p-4 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] hover:border-[#10B981] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center focus:outline-none"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-[#10B981] transition-all shadow-md">
                <img
                  src={space.image}
                  alt={space.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors">
                {space.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {space.tagline}
              </p>
              <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-pill bg-slate-100 dark:bg-[#13332A] text-[#059669] dark:text-[#10B981] border border-slate-200 dark:border-[#1E4E40]">
                {space.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. BHK Combos & Packages */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#10B981] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>CURATED LIVING BUNDLES</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Room Combos & BHK Packages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Save up to 35% with pre-matched furniture & appliance combinations.
            </p>
          </div>
          <button
            onClick={() => openSectionCatalog('BHK Combos')}
            className="text-xs font-bold text-slate-600 hover:text-[#059669] dark:text-slate-400 dark:hover:text-[#10B981] flex items-center gap-1 transition-colors"
          >
            <span>Explore All Combos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROOM_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setActiveDetailProductId(pkg.productIdRef)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] hover:border-[#10B981] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-[#061712]">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 dark:opacity-90"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-pill bg-[#10B981] text-emerald-950 text-[10px] font-extrabold shadow-sm">
                    Combo Package
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-pill bg-black/60 backdrop-blur-md text-white text-[10px] flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-[#10B981]" />
                    <span>Doorstep Setup</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pkg.tagline}</p>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-300">
                      Package Includes:
                    </div>
                    {pkg.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Pricing Row */}
              <div className="p-5 pt-3 bg-slate-50 dark:bg-[#061712]/70 border-t border-slate-200 dark:border-[#1E4E40] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-bold text-xl text-slate-900 dark:text-white font-ledger">
                      ₹{pkg.rentPerMonth.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ mo</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                      ₹{pkg.retailRent.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Refundable Deposit: ₹{pkg.deposit.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-xs font-bold text-[#059669] dark:text-[#10B981] group-hover:underline">
                  View Details →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Steal Deals • Under ₹999/mo */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#F59E0B] text-black text-[10px] font-extrabold uppercase tracking-wide">
              <Flame className="w-3 h-3 fill-black" />
              <span>Limited Stock • Flash Deals</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Steal Deals: Essentials Under ₹999/mo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-utility appliances and furniture rentals at introductory pricing.
            </p>
          </div>

          <button
            onClick={() => openSectionCatalog('% Steal Deals')}
            className="text-xs font-bold text-[#059669] dark:text-[#10B981] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>See All Steal Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stealDeals.map((product) => {
            const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
            const rate = Math.round(product.baseMonthlyRent * multiplier);
            const crossedOut = Math.round(product.baseMonthlyRent * 1.3);

            return (
              <div
                key={product.id}
                onClick={() => setActiveDetailProductId(product.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] hover:border-[#F59E0B] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-[#0C231C]">
                    <img
                      src={product.lifestyleImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 dark:opacity-90"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-pill bg-[#F59E0B] text-black text-[10px] font-extrabold">
                      Steal Deal
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-[#059669] dark:text-[#10B981]">
                      {product.category}
                    </div>
                    <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-200 dark:border-[#1E4E40] bg-slate-50 dark:bg-[#0C231C]/40 flex items-center justify-between">
                  <div>
                    <div className="font-serif font-bold text-base text-slate-900 dark:text-white font-ledger">
                      ₹{rate.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                      ₹{crossedOut.toLocaleString('en-IN')}/mo
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#059669] dark:text-[#10B981] group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Trending Bestsellers */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#10B981] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>TOP RATED CUSTOMER FAVORITES</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Trending Bestsellers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Top customer favorites curated for modern flexible living.
            </p>
          </div>
          <button
            onClick={() => openSectionCatalog('Living Room')}
            className="text-xs font-bold text-slate-600 hover:text-[#059669] dark:text-slate-400 dark:hover:text-[#10B981] flex items-center gap-1 transition-colors"
          >
            <span>Explore All Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => {
            const multiplier = product.tenureMultipliers[selectedTenureMonths] || 1;
            const rate = Math.round(product.baseMonthlyRent * multiplier);

            return (
              <div
                key={product.id}
                onClick={() => setActiveDetailProductId(product.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] hover:border-[#10B981] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#061712]">
                    <img
                      src={product.lifestyleImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 dark:opacity-90"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-pill bg-[#10B981] text-emerald-950 text-[10px] font-extrabold shadow-sm">
                      ⭐ 4.9 Bestseller
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-[#059669] dark:text-[#10B981]">
                      {product.category}
                    </div>
                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-200 dark:border-[#1E4E40] bg-slate-50 dark:bg-[#061712]/40 flex items-center justify-between">
                  <div>
                    <div className="font-serif font-bold text-base text-slate-900 dark:text-white font-ledger">
                      ₹{rate.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ mo</span>
                    </div>
                    <div className="text-[10px] text-[#059669] dark:text-[#10B981] font-semibold">
                      Prompt Delivery
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#059669] dark:text-[#10B981] group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FAQs Accordion */}
      <div className="rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about escrow deposits, 3-way photo inspections, and delivery.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#1E4E40]">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-slate-900 dark:text-white hover:text-[#059669] dark:hover:text-[#10B981] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
