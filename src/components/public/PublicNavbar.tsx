import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Building2,
  ChevronDown,
  Compass,
  FileSignature,
  FileSpreadsheet,
  Headphones,
  Home,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Package,
  ReceiptIndianRupee,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  User,
  UserCheck,
  Users,
  Wrench,
  X,
  Briefcase,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { ProductCategory, NavigationTab } from '../../types/srs';
import { SECTION_TABS } from './SectionCatalogView';

const DEFAULT_PINCODES = [
  '560038',
  '560034',
  '560066',
  '560102',
  '560042',
  '560001',
];

// Mega-Menu Columns matching Reference
const RENT_MEGA_COLUMNS = [
  {
    section: 'Bedroom',
    title: 'Bedroom',
    items: [
      'Beds',
      'Queen Beds',
      'Storage Beds',
      'King Beds',
      'Single Beds',
      'Bedside Tables',
      'Beds without Mattress',
      'Mattress',
      'Bedroom Combos',
      'Compact Double Bed',
    ],
  },
  {
    section: 'BHK Combos',
    title: 'BHK Combos',
    items: [
      'Bedroom Combos',
      'Living Room Combos',
      'Appliance Combos',
      'Storage Combos',
    ],
  },
  {
    section: 'Living Room',
    title: 'Living Room',
    items: [
      'Sofas',
      '3 Seater',
      'Sofa Sets',
      '2 Seater',
      '1 Seater',
      'Recliner',
      'L Shape',
      'Sofa Cum Bed',
      'Multifunctional',
      'Centre Tables',
      'Living Room Combos',
    ],
  },
  {
    section: 'Appliances',
    title: 'Appliances',
    items: [
      'Washing machines',
      'Refrigerators',
      'TV',
      'Microwave',
      'Water Purifier',
      'Appliance Combos',
      'AC',
      'Air Purifier',
    ],
  },
  {
    section: 'Storage',
    title: 'Storage',
    items: [
      'Wardrobes',
      'Chest of Drawers',
      'Entertainment Units',
      'Dressing Table',
      'Bookshelves',
      'Shoe Racks',
      'Storage Combos',
    ],
  },
];

export const PublicNavbar: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    activeTab,
    setActiveTab,
    activePersona,
    personas,
    switchPersona,
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    setIsLoginModalOpen,
    logoutUser,
    bookings,
    publicPageMode,
    setPublicPageMode,
    catalogSection,
    openSectionCatalog,
  } = useKaroRentStore();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showDemoRoleMenu, setShowDemoRoleMenu] = useState(false);
  const [isRentHovered, setIsRentHovered] = useState(false);

  const currentPincode =
    selectedLocation.match(/\d{6}/)?.[0] ||
    (selectedLocation.length === 6 ? selectedLocation : '560038');
  const [customPincodeInput, setCustomPincodeInput] = useState(currentPincode);

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const demoDropdownRef = useRef<HTMLDivElement>(null);
  const rentMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(e.target as Node)) {
        setShowDemoRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRentMouseEnter = () => {
    if (rentMenuTimeoutRef.current) clearTimeout(rentMenuTimeoutRef.current);
    setIsRentHovered(true);
  };

  const handleRentMouseLeave = () => {
    rentMenuTimeoutRef.current = setTimeout(() => {
      setIsRentHovered(false);
    }, 200);
  };

  const activeRentalsCount = bookings.filter(
    (b) =>
      b.customerId === activePersona.customerId &&
      b.status !== 'Returned & Closed' &&
      b.status !== 'Cancelled'
  ).length;

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setShowAccountDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#061712]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E4E40] shadow-sm select-none transition-colors duration-300">
      {/* 1. Main Navbar Header Row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Logo & Primary Top Links (RENT, FOR BUSINESS) */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Brand Wordmark */}
          <button
            onClick={() => {
              setActiveTab('MARKETPLACE');
              setPublicPageMode('HOME');
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-emerald-950 flex items-center justify-center font-serif font-bold text-2xl shadow-sm group-hover:bg-[#059669] group-hover:text-white transition-all">
              K
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors leading-none">
                KaroRent
              </div>
              <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                Royal Emerald Boutique
              </div>
            </div>
          </button>

          {/* Core Navigation Links: RENT (with mega-hover) & FOR BUSINESS */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold uppercase tracking-wider">
            {/* RENT Link with Hover Mega-Menu */}
            <div
              className="relative"
              onMouseEnter={handleRentMouseEnter}
              onMouseLeave={handleRentMouseLeave}
            >
              <button
                onClick={() => openSectionCatalog('Living Room')}
                className={`py-3 flex items-center gap-1.5 transition-colors ${
                  isRentHovered || (activeTab === 'MARKETPLACE' && publicPageMode === 'SECTION')
                    ? 'text-[#059669] dark:text-[#10B981] font-extrabold border-b-2 border-[#10B981]'
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#059669] dark:hover:text-[#10B981]'
                }`}
              >
                <span>RENT</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Mega-Menu Dropdown */}
              {isRentHovered && (
                <div
                  className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handleRentMouseEnter}
                  onMouseLeave={handleRentMouseLeave}
                >
                  <div className="w-[820px] bg-white dark:bg-[#0C231C] rounded-3xl border border-slate-200 dark:border-[#1E4E40] shadow-2xl p-6 grid grid-cols-5 gap-4 transition-colors">
                    {RENT_MEGA_COLUMNS.map((col, idx) => (
                      <div key={idx} className="space-y-2 border-r border-slate-100 dark:border-[#1E4E40]/60 last:border-0 pr-2">
                        {/* Column Header */}
                        <button
                          onClick={() => {
                            openSectionCatalog(col.section);
                            setIsRentHovered(false);
                          }}
                          className="font-serif font-bold text-xs text-[#059669] dark:text-[#10B981] hover:underline block text-left"
                        >
                          {col.title}
                        </button>

                        {/* Category List */}
                        <div className="space-y-1 text-[11px] font-normal text-slate-600 dark:text-slate-300">
                          {col.items.map((item, itemIdx) => (
                            <button
                              key={itemIdx}
                              onClick={() => {
                                openSectionCatalog(col.section, item);
                                setIsRentHovered(false);
                              }}
                              className="w-full text-left hover:text-[#059669] dark:hover:text-[#10B981] hover:font-semibold py-0.5 block truncate transition-colors"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FOR BUSINESS (Direct link to B2B module) */}
            <button
              onClick={() => handleNavClick('FOR_BUSINESS')}
              className={`py-3 flex items-center gap-1.5 transition-colors ${
                activeTab === 'FOR_BUSINESS'
                  ? 'text-[#059669] dark:text-[#10B981] font-extrabold border-b-2 border-[#10B981]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#059669] dark:hover:text-[#10B981]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>FOR BUSINESS</span>
            </button>
          </nav>

          {/* Delivery Pincode Selector */}
          <div className="relative hidden xl:block" ref={locationDropdownRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#0C231C] dark:hover:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs text-slate-800 dark:text-white transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981] shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none">
                  Deliver to
                </span>
                <span className="font-semibold font-mono block leading-tight">
                  {currentPincode}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  Enter Delivery Pincode
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={customPincodeInput}
                    onChange={(e) => setCustomPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 560038"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                  />
                  <button
                    onClick={() => {
                      if (customPincodeInput.length === 6) {
                        setSelectedLocation(customPincodeInput);
                        setShowLocationDropdown(false);
                      }
                    }}
                    disabled={customPincodeInput.length !== 6}
                    className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-emerald-950 font-bold text-xs transition-all"
                  >
                    Apply
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">
                  Popular Pincodes
                </div>
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {DEFAULT_PINCODES.map((pin) => (
                    <button
                      key={pin}
                      onClick={() => {
                        setSelectedLocation(pin);
                        setCustomPincodeInput(pin);
                        setShowLocationDropdown(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono text-center transition-all ${
                        currentPincode === pin
                          ? 'bg-[#10B981]/20 text-[#059669] dark:text-[#10B981] font-bold border border-[#10B981]/40'
                          : 'hover:bg-slate-100 dark:hover:bg-[#13332A] text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      {pin}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sofa, washing machine, split AC, double bed, wardrobe..."
              className="w-full pl-9 pr-9 py-2 rounded-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Theme Toggle & Sign In */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#0C231C] dark:hover:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-slate-700 dark:text-slate-300 transition-all"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Quick Demo Persona Switcher */}
          <div className="relative hidden md:block" ref={demoDropdownRef}>
            <button
              onClick={() => setShowDemoRoleMenu(!showDemoRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/40 text-xs font-mono font-bold text-[#059669] dark:text-[#10B981] shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Role</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showDemoRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#1E4E40]">
                  Quick Demo Persona Switcher
                </div>
                <div className="space-y-1 pt-1.5 max-h-72 overflow-y-auto">
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setShowDemoRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                        activePersona.id === p.id && isAuthenticated
                          ? 'bg-emerald-50 dark:bg-[#13332A] text-[#059669] dark:text-[#10B981] font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-[#13332A] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {p.roleBadge} • {p.subtitle.split(',')[0]}
                        </div>
                      </div>
                      {activePersona.id === p.id && isAuthenticated && (
                        <span className="text-[#059669] dark:text-[#10B981] font-bold text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sign In / Account & Lists Button */}
          <div className="relative" ref={accountDropdownRef}>
            {!isAuthenticated ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="spring-btn flex items-center gap-2 px-4 py-1.5 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#0C231C] dark:hover:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] hover:border-[#10B981] text-slate-800 dark:text-slate-200 hover:text-[#059669] dark:hover:text-[#10B981] text-xs font-bold shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#0C231C] dark:hover:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs text-slate-900 dark:text-white transition-all shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-[#10B981] text-emerald-950 flex items-center justify-center font-bold text-xs">
                  {activePersona.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none">
                    Hello, {activePersona.name.split(' ')[0]}
                  </span>
                  <span className="font-bold block leading-tight flex items-center gap-1 text-slate-900 dark:text-white">
                    <span>Account & Lists</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </button>
            )}

            {/* Authenticated Amazon "Account & Lists" Mega Dropdown */}
            {isAuthenticated && showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] flex items-center justify-between gap-2">
                  <div>
                    <div className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      {activePersona.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {activePersona.roleBadge} • {activePersona.customerId || activePersona.vendorId || 'Staff'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavClick('YOUR_ACCOUNT')}
                    className="px-2.5 py-1 rounded-pill bg-[#10B981] text-emerald-950 text-[10px] font-bold shadow-sm hover:bg-[#059669] hover:text-white"
                  >
                    Your Account
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => handleNavClick('YOUR_ACCOUNT')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-bold text-slate-900 dark:text-white"
                  >
                    <LayoutGrid className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
                    <span>Your Account Hub (Amazon Layout)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('MARKETPLACE');
                      setPublicPageMode('HOME');
                      setShowAccountDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Explore Public Catalog</span>
                  </button>

                  {/* Customer specific links */}
                  {(activePersona.role === 'CUSTOMER_INDIVIDUAL' ||
                    activePersona.role === 'CUSTOMER_BUSINESS') && (
                    <>
                      <button
                        onClick={() => handleNavClick('MY_RENTALS')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center justify-between font-medium text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>Your Orders & Rentals</span>
                        </div>
                        {activeRentalsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-pill bg-[#10B981]/20 text-[#059669] dark:text-[#10B981] font-mono text-[10px] font-bold">
                            {activeRentalsCount} Active
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handleNavClick('INVOICES_DEPOSITS')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <ReceiptIndianRupee className="w-4 h-4 text-slate-400" />
                        <span>Invoices & Refundable Deposits</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('AGREEMENTS_ESIGN')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <FileSignature className="w-4 h-4 text-slate-400" />
                        <span>Rental Agreements & E-Sign</span>
                      </button>
                    </>
                  )}

                  {/* Vendor specific links */}
                  {activePersona.role === 'VENDOR_OWNER' && (
                    <>
                      <button
                        onClick={() => handleNavClick('VENDOR_PORTAL')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Showroom & Inventory Stock</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('ASSIGN_DELIVERIES')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Assign Deliveries & Pickups</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('SETTLEMENTS_FINANCE')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <ReceiptIndianRupee className="w-4 h-4 text-slate-400" />
                        <span>Partner Payouts & Escrow</span>
                      </button>
                    </>
                  )}

                  {/* Technician specific links */}
                  {activePersona.role === 'FIELD_PERSONNEL' && (
                    <>
                      <button
                        onClick={() => handleNavClick('FIELD_OPERATIONS')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Wrench className="w-4 h-4 text-slate-400" />
                        <span>My Assigned Field Tasks</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('THREE_WAY_INSPECTION')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Doorstep Photo Inspections</span>
                      </button>
                    </>
                  )}

                  {/* Admin specific links */}
                  {activePersona.role === 'PLATFORM_ADMIN' && (
                    <>
                      <button
                        onClick={() => handleNavClick('ADMIN_GOVERNANCE')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Governance & Catalog Approvals</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('BLACKLIST_REGISTRY')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#13332A] flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                        <span>Unified Blacklist Registry</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Sign Out Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#1E4E40]">
                  <button
                    onClick={() => {
                      logoutUser();
                      setShowAccountDropdown(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-[#13332A] dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Return to Guest Browsing)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Header: Section Shortcuts & Trust Signals */}
      <div className="bg-slate-50/95 dark:bg-[#061712]/95 border-t border-slate-200 dark:border-[#1E4E40] px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 text-xs">
          {/* Section Quick Chips */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-0.5 no-scrollbar">
            <button
              onClick={() => {
                setActiveTab('MARKETPLACE');
                setPublicPageMode('HOME');
              }}
              className={`px-3 py-1 rounded-pill text-xs font-bold transition-all shrink-0 ${
                activeTab === 'MARKETPLACE' && publicPageMode === 'HOME'
                  ? 'bg-[#10B981] text-emerald-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#13332A]'
              }`}
            >
              Featured Home
            </button>
            {SECTION_TABS.map((tab) => {
              const active =
                activeTab === 'MARKETPLACE' &&
                publicPageMode === 'SECTION' &&
                catalogSection.toLowerCase() === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => openSectionCatalog(tab)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all shrink-0 ${
                    active
                      ? 'bg-[#10B981] text-emerald-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#13332A]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
