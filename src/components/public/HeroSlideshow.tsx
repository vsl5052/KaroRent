import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

interface Slide {
  id: string;
  badge: string;
  headline: string;
  subheadline: string;
  startingPrice: string;
  perMonthLabel: string;
  features: string[];
  ctaLabel: string;
  targetSection: string;
  image: string;
  bgGradientLight: string;
  bgGradientDark: string;
}

const SLIDES: Slide[] = [
  {
    id: 'smart-appliances',
    badge: '5-STAR SMART INVERTER APPLIANCES',
    headline: 'Smart summer cooling and purified health.',
    subheadline: 'High-efficiency inverter split ACs, frost-free fridges and Livpure RO systems.',
    startingPrice: '₹449',
    perMonthLabel: '/mo',
    features: ['Flexible Rental Tenures', '5-Star Energy Certified', 'Prompt Doorstep Delivery'],
    ctaLabel: 'Explore Appliances',
    targetSection: 'Appliances',
    image: 'assets/theme_urban_industrial_loft.jpg',
    bgGradientLight: 'from-[#EDF6F1] via-[#DFEFE6] to-[#CEE7D8]',
    bgGradientDark: 'dark:from-[#061712] dark:via-[#0C271E] dark:to-[#13372B]',
  },
  {
    id: 'combos-all',
    badge: 'ROOM COMBOS & PACKAGES',
    headline: 'Everything your home needs!',
    subheadline: 'Pre-matched premium furniture and inverter appliances on flexible 1–24 month terms.',
    startingPrice: '₹1,499',
    perMonthLabel: '/mo',
    features: ['Curated Bundles', 'Move-In Ready Quality', 'Flexible Tenure Terms'],
    ctaLabel: 'Explore Room Combos',
    targetSection: 'BHK Combos',
    image: 'assets/hero_unlmtd_emerald_grid.jpg',
    bgGradientLight: 'from-[#EEF7F2] via-[#E1EFE6] to-[#D1E8DA]',
    bgGradientDark: 'dark:from-[#071913] dark:via-[#0D2A21] dark:to-[#143B2E]',
  },
  {
    id: 'luxe-living',
    badge: 'ROYAL EMERALD BOUTIQUE COLLECTION',
    headline: 'Curate your sanctuary. Live beautifully without buying.',
    subheadline: 'Artisanal velvet sofas, marble coffee tables and warm ambient statement pieces.',
    startingPrice: '₹1,999',
    perMonthLabel: '/mo',
    features: ['Certified Mint Condition', 'Doorstep White-Glove Setup', 'Artisanal Design'],
    ctaLabel: 'Explore Living Room',
    targetSection: 'Living Room',
    image: 'assets/hero_emerald_living_luxe.jpg',
    bgGradientLight: 'from-[#EAF5EF] via-[#DDF0E5] to-[#CCE8D7]',
    bgGradientDark: 'dark:from-[#081B15] dark:via-[#0E2E24] dark:to-[#154133]',
  },
  {
    id: 'smart-storage',
    badge: 'SMART WARDROBES & STORAGE',
    headline: 'Organize your home with spacious wardrobes.',
    subheadline: 'Multi-door wardrobes, shoe cabinets, and entertainment credenzas in matte finish.',
    startingPrice: '₹399',
    perMonthLabel: '/mo',
    features: ['Modular Storage Units', 'Soft-Close Hinges', 'Prompt Doorstep Assembly'],
    ctaLabel: 'Explore Storage',
    targetSection: 'Storage',
    image: 'assets/theme_warm_terracotta_living.jpg',
    bgGradientLight: 'from-[#EDF6F2] via-[#E0EFE6] to-[#D0E7D9]',
    bgGradientDark: 'dark:from-[#061712] dark:via-[#0C261E] dark:to-[#12362A]',
  },
];

export const HeroSlideshow: React.FC = () => {
  const { openSectionCatalog } = useKaroRentStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance slides every 6 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentSlide = SLIDES[currentSlideIndex];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E4E40] shadow-lg dark:shadow-2xl transition-all duration-500 select-none group bg-white dark:bg-[#061712]"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background Gradient & Image Composite */}
      <div
        className={`relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] bg-gradient-to-r ${currentSlide.bgGradientLight} ${currentSlide.bgGradientDark} flex items-center transition-all duration-700`}
      >
        {/* Subtle ambient emerald aura glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/15 dark:bg-[#10B981]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-[#10B981]/10 dark:bg-[#10B981]/8 blur-3xl pointer-events-none" />

        {/* Hero Product/Lifestyle Image on the right with smooth cross-fade */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] overflow-hidden pointer-events-none">
          <img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={currentSlide.headline}
            className="w-full h-full object-cover object-center lg:object-right transition-all duration-1000 transform scale-100 group-hover:scale-105 opacity-30 dark:opacity-85"
          />
          {/* Smooth gradient overlay to merge image with text for both light and dark */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4F8F5] via-[#F4F8F5]/85 to-transparent dark:from-[#061712] dark:via-[#061712]/85 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-[#061712] dark:via-transparent dark:to-transparent lg:hidden" />
        </div>

        {/* Content Overlay (Left Hand Column) */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-10 lg:px-14 py-10 space-y-5">
          {/* Top Badge (Jewel Emerald pill) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-[#10B981]/15 dark:bg-[#10B981]/15 backdrop-blur-md border border-[#10B981]/40 dark:border-[#10B981]/30 text-xs font-bold tracking-wide text-[#059669] dark:text-[#10B981] shadow-sm animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
            <span className="uppercase tracking-wider text-[11px]">
              {currentSlide.badge}
            </span>
          </div>

          {/* Headline (Crisp white in dark mode, deep forest emerald in light mode) */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#07261E] dark:text-[#F7FAF8] leading-[1.12] tracking-tight drop-shadow-sm">
            {currentSlide.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A7C7BC] leading-relaxed max-w-lg">
            {currentSlide.subheadline}
          </p>

          {/* Pricing Highlight Pill - Warm Champagne Gold */}
          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-[#6E9689] tracking-wider uppercase">
              PLANS STARTING AT
            </span>
            <span className="font-serif text-3xl sm:text-5xl font-extrabold text-[#D97706] dark:text-[#FBBF24] font-ledger drop-shadow-md">
              {currentSlide.startingPrice}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-[#6E9689]">
              {currentSlide.perMonthLabel}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => openSectionCatalog(currentSlide.targetSection)}
              className="spring-btn flex items-center gap-2 px-6 py-3 rounded-pill bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all"
            >
              <span>{currentSlide.ctaLabel}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => openSectionCatalog('BHK Combos')}
              className="spring-btn flex items-center gap-2 px-5 py-3 rounded-pill bg-white/80 hover:bg-white text-slate-800 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span>View All 8+ Sections</span>
            </button>
          </div>

          {/* Highlights Strip */}
          <div className="flex flex-wrap items-center gap-3 pt-3 text-[11px] text-slate-600 dark:text-[#A7C7BC] border-t border-slate-300/60 dark:border-[#1E4E40]/60">
            {currentSlide.features.map((g, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>{g}</span>
                {idx < currentSlide.features.length - 1 && (
                  <span className="text-slate-400 dark:text-[#6E9689] ml-2">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next Slider Arrow Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 dark:bg-black/50 dark:hover:bg-black/80 dark:text-white border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-md focus:outline-none"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 dark:bg-black/50 dark:hover:bg-black/80 dark:text-white border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-md focus:outline-none"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Navigation Dots & Play/Pause Control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 shadow-md">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-0.5 mr-1"
          title={isPlaying ? 'Pause auto-slide' : 'Resume auto-slide'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`transition-all rounded-full ${
              idx === currentSlideIndex
                ? 'w-7 h-2 bg-[#F59E0B] shadow-sm' // Warm golden-yellow for active carousel pagination dot
                : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
