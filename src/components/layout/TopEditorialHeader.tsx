import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogIn,
  MapPin,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sun,
  UserCheck,
  Users,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

const LOCATIONS = [
  'Indiranagar, Bengaluru (560038)',
  'Koramangala, Bengaluru (560034)',
  'Ulsoor Lakefront, Bengaluru (560042)',
  'Whitefield, Bengaluru (560066)',
  'HSR Layout, Bengaluru (560102)',
];

export const TopEditorialHeader: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    activeTab,
    setActiveTab,
    activePersona,
    personas,
    switchPersona,
    loginWithMobile,
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
  } = useKaroRentStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [accountMenuTab, setAccountMenuTab] = useState<'SWITCH' | 'MOBILE_LOGIN'>('SWITCH');
  const [mobileLoginInput, setMobileLoginInput] = useState('');
  const [mobileLoginError, setMobileLoginError] = useState<string | null>(null);

  const handleMobileLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileLoginError(null);
    if (!mobileLoginInput.trim()) {
      setMobileLoginError('Please enter your registered mobile number.');
      return;
    }
    const result = loginWithMobile(mobileLoginInput.trim());
    if (result.success) {
      setMobileLoginInput('');
      setShowPersonaMenu(false);
    } else {
      setMobileLoginError(result.message);
    }
  };

  const scopedNotifications = notifications.filter((n) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (n.recipientRole === 'ALL') return true;
    if (n.recipientRole === activePersona.role) {
      if (n.customerScopeId && n.customerScopeId !== activePersona.customerId) return false;
      if (n.vendorScopeId && n.vendorScopeId !== activePersona.vendorId) return false;
      return true;
    }
    return false;
  });

  const unreadCount = scopedNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 h-[72px] w-full bg-hearth-card/95 backdrop-blur-md border-b border-hearth-border px-4 lg:px-8 flex items-center justify-between gap-3 shadow-sm">
      {/* Left: Brand Wordmark + Location Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            setActiveTab(
              activePersona.role === 'VENDOR_OWNER'
                ? 'VENDOR_PORTAL'
                : activePersona.role === 'FIELD_PERSONNEL'
                ? 'FIELD_OPERATIONS'
                : 'MARKETPLACE'
            )
          }
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-hearth-terracotta text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm group-hover:bg-hearth-kiln transition-colors">
            K
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-hearth-ink">
            KaroRent
          </span>
        </button>

        {/* Location Selector Pill (Customer & Admin only) */}
        {activePersona.role !== 'VENDOR_OWNER' &&
          activePersona.role !== 'FIELD_PERSONNEL' && (
            <div className="relative hidden xl:block">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-ink transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
                <span>{selectedLocation.split(' (')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-hearth-taupe" />
              </button>

              {showLocationMenu && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-hearth-card border border-hearth-border shadow-hearth-lg p-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-hearth-taupe">
                    Delivery Area
                  </div>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        selectedLocation === loc
                          ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                          : 'hover:bg-hearth-oat text-hearth-umber'
                      }`}
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && (
                        <span className="w-2 h-2 rounded-full bg-hearth-terracotta" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Center: Search Bar (Customer & Admin only) */}
      {activePersona.role !== 'VENDOR_OWNER' &&
      activePersona.role !== 'FIELD_PERSONNEL' ? (
        <div className="flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-hearth-taupe absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'MARKETPLACE') setActiveTab('MARKETPLACE');
              }}
              placeholder="Search furniture, appliances, or home essentials..."
              className="w-full pl-10 pr-4 py-2 rounded-pill bg-hearth-oat/80 focus:bg-hearth-card border border-hearth-border focus:border-hearth-terracotta text-xs text-hearth-ink placeholder:text-hearth-taupe focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[11px] text-hearth-taupe hover:text-hearth-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Quick Links, Profile Switcher, Notifications, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {activePersona.role !== 'VENDOR_OWNER' &&
          activePersona.role !== 'FIELD_PERSONNEL' && (
            <nav className="hidden md:flex items-center gap-1 mr-1">
              <button
                onClick={() => setActiveTab('MARKETPLACE')}
                className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  activeTab === 'MARKETPLACE'
                    ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                    : 'text-hearth-umber hover:bg-hearth-oat'
                }`}
              >
                Catalog
              </button>
              {activePersona.role !== 'PLATFORM_ADMIN' && (
                <button
                  onClick={() => setActiveTab('MY_RENTALS')}
                  className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                    activeTab === 'MY_RENTALS'
                      ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                      : 'text-hearth-umber hover:bg-hearth-oat'
                  }`}
                >
                  My Orders
                </button>
              )}
              <button
                onClick={() => setActiveTab('FOR_BUSINESS')}
                className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  activeTab === 'FOR_BUSINESS'
                    ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                    : 'text-hearth-umber hover:bg-hearth-oat'
                }`}
              >
                For Business
              </button>
            </nav>
          )}

        {/* Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill border text-xs font-medium transition-all ${
              activePersona.role === 'PLATFORM_ADMIN'
                ? 'bg-hearth-sage text-white border-hearth-sage shadow-sm'
                : 'bg-hearth-oat text-hearth-ink border-hearth-border hover:border-hearth-terracotta'
            }`}
            title="Switch Account"
          >
            {activePersona.role === 'PLATFORM_ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
            )}
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold leading-tight truncate max-w-[140px]">
                {activePersona.name}
              </div>
              <div className="text-[9px] opacity-80 leading-tight truncate max-w-[140px]">
                {activePersona.roleBadge}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-75" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth-lg p-3 z-50">
              {/* Top Tabs: Switch Account vs Mobile Login */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-hearth-oat border border-hearth-border mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuTab('SWITCH');
                    setMobileLoginError(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    accountMenuTab === 'SWITCH'
                      ? 'bg-hearth-card text-hearth-terracotta shadow-sm'
                      : 'text-hearth-umber hover:text-hearth-ink'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Website Accounts</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuTab('MOBILE_LOGIN');
                    setMobileLoginError(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    accountMenuTab === 'MOBILE_LOGIN'
                      ? 'bg-hearth-card text-hearth-terracotta shadow-sm'
                      : 'text-hearth-umber hover:text-hearth-ink'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile Login</span>
                </button>
              </div>

              {/* Tab 1: Account List */}
              {accountMenuTab === 'SWITCH' && (
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {personas.map((p) => {
                    const isSelected = p.id === activePersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchPersona(p.id);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-hearth-apricot border-hearth-terracotta'
                            : 'bg-hearth-card hover:bg-hearth-oat border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-hearth-ink truncate">
                              {p.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[9px] font-semibold text-hearth-umber">
                              {p.roleBadge}
                            </span>
                          </div>
                          <div className="text-[10px] text-hearth-taupe mt-0.5 truncate">
                            {p.subtitle}
                          </div>
                          <div className="text-[10px] text-hearth-terracotta font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{p.phone}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-pill bg-hearth-terracotta text-white text-[10px] shrink-0">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Mobile Number Login */}
              {accountMenuTab === 'MOBILE_LOGIN' && (
                <form
                  onSubmit={handleMobileLoginSubmit}
                  className="p-2 space-y-3 text-xs"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                      Enter Registered Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-3.5 h-3.5 text-hearth-taupe absolute left-3 pointer-events-none" />
                      <input
                        type="tel"
                        value={mobileLoginInput}
                        onChange={(e) => {
                          setMobileLoginInput(e.target.value);
                          setMobileLoginError(null);
                        }}
                        placeholder="e.g. +91 97400 55667 or 9740055667"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-mono text-xs text-hearth-ink focus:outline-none focus:border-hearth-terracotta"
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-hearth-taupe mt-1 block">
                      Field technicians and accounts registered by vendors can log in using their phone number.
                    </span>
                  </div>

                  {mobileLoginError && (
                    <div className="p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-[11px] font-medium leading-relaxed">
                      {mobileLoginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full spring-btn py-2 px-4 rounded-xl bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In with Mobile</span>
                  </button>

                  {/* Quick-fill shortcut pills for registered technician mobile numbers */}
                  <div className="pt-2 border-t border-hearth-border space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase text-hearth-taupe tracking-wider">
                      Quick-Fill Registered Numbers:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {personas
                        .filter((p) => p.role === 'FIELD_PERSONNEL')
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setMobileLoginInput(p.phone);
                              setMobileLoginError(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-hearth-oat hover:bg-hearth-apricot text-[10px] font-mono text-hearth-umber transition-colors flex items-center gap-1 border border-hearth-border"
                          >
                            <span>{p.name.split(' ')[0]}:</span>
                            <span className="font-semibold">{p.phone.slice(-5)}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Notifications Drawer */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="relative p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-hearth-ink transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-hearth-terracotta text-white text-[10px] font-mono font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDrawer && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth-lg p-4 z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-hearth-border">
                <h4 className="font-serif text-sm font-semibold text-hearth-ink">
                  Notifications
                </h4>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-hearth-terracotta hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                {scopedNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.linkedView) setActiveTab(n.linkedView);
                      setShowNotifDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      n.priority === 'critical'
                        ? 'bg-[#FEE2E2]/50 border-[#FECACA]'
                        : !n.read
                        ? 'bg-hearth-apricot border-hearth-terracotta/40'
                        : 'bg-hearth-oat/60 border-hearth-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-hearth-ink">{n.title}</span>
                      <span className="text-[10px] text-hearth-taupe">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-hearth-umber mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-hearth-ink transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
