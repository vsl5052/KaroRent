import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  MapPin,
  Moon,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
    resetDemoState,
  } = useKaroRentStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Scope notifications by role (FR-NTF-002 / BR-012 / BR-013)
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
      {/* Left: Serif Wordmark + Warm Delivery Location Pill */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-hearth-terracotta text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm group-hover:bg-hearth-kiln transition-colors">
            K
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-hearth-ink">
              KaroRent
            </span>
          </div>
        </button>

        {/* Location & Delivery Promise Selector Pill */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-ink transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
            <span>Delivering to {selectedLocation.split(' (')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-hearth-taupe" />
          </button>

          {showLocationMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-hearth-card border border-hearth-border shadow-hearth-lg p-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-hearth-taupe">
                Select Service Zone
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
                  {selectedLocation === loc && <span className="w-2 h-2 rounded-full bg-hearth-terracotta" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Warm Pill-Shaped Search Bar */}
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
            placeholder="Search oak desks, inverter ACs, serials, or rate cards..."
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

      {/* Right: Editorial Quick Links, Role Switcher, Notifications, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        <nav className="hidden md:flex items-center gap-1 mr-1">
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
              activeTab === 'MARKETPLACE'
                ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                : 'text-hearth-umber hover:bg-hearth-oat'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
              activeTab === 'THREE_WAY_INSPECTION'
                ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                : 'text-hearth-umber hover:bg-hearth-oat'
            }`}
          >
            Fair Rent & 3-Way Care
          </button>
          <button
            onClick={() => setActiveTab('INVOICES_DEPOSITS')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
              activeTab === 'INVOICES_DEPOSITS'
                ? 'bg-hearth-apricot text-hearth-terracotta font-semibold'
                : 'text-hearth-umber hover:bg-hearth-oat'
            }`}
          >
            5-Invoice Vault
          </button>
        </nav>

        {/* Role & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill border text-xs font-medium transition-all ${
              activePersona.isBlacklisted || activePersona.isTerminatedVendor
                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                : activePersona.role === 'PLATFORM_ADMIN'
                ? 'bg-hearth-sage text-white border-hearth-sage shadow-sm'
                : 'bg-hearth-oat text-hearth-ink border-hearth-border hover:border-hearth-terracotta'
            }`}
            title="Switch Active Account Role"
          >
            {activePersona.isBlacklisted || activePersona.isTerminatedVendor ? (
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            ) : activePersona.role === 'PLATFORM_ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
            )}
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-semibold leading-tight truncate max-w-[155px]">
                {activePersona.name}
              </div>
              <div className="text-[9px] opacity-80 leading-tight truncate max-w-[155px]">
                {activePersona.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-75" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth-lg p-3 z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b border-hearth-border mb-2">
                <div>
                  <div className="text-xs font-serif font-semibold text-hearth-ink flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-hearth-terracotta" />
                    Account & Role Switcher
                  </div>
                  <p className="text-[10px] text-hearth-taupe">
                    Switch between customer, partner vendor, field technician, and admin views
                  </p>
                </div>
              </div>
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
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-hearth-ink">{p.name}</span>
                          {(p.isBlacklisted || p.isTerminatedVendor) && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-pill bg-[#FEE2E2] text-[#991B1B] font-semibold">
                              RISK / RESTRICTED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-hearth-terracotta mt-0.5">
                          {p.roleBadge}
                        </div>
                        <div className="text-[10px] text-hearth-taupe mt-0.5">{p.subtitle}</div>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-pill bg-hearth-terracotta text-white text-[10px] font-mono">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Drawer Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="relative p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-hearth-ink transition-colors"
            title="Account Notifications"
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
                <div>
                  <h4 className="font-serif text-sm font-semibold text-hearth-ink">
                    Activity & Event Notifications
                  </h4>
                  <p className="text-[10px] text-hearth-taupe">
                    Scoped for: {activePersona.name}
                  </p>
                </div>
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
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta">
                        {n.eventCode}
                      </span>
                      <span className="text-[10px] text-hearth-taupe">{n.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-hearth-ink mt-1.5">{n.title}</div>
                    <p className="text-[11px] text-hearth-umber mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Warm Hearth Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-hearth-ink transition-colors"
          title={darkMode ? 'Switch to Warm Alabaster Light Mode' : 'Switch to Espresso Hearth Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset Data Button */}
        <button
          onClick={resetDemoState}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-[11px] font-medium text-hearth-taupe hover:text-hearth-ink transition-colors"
          title="Reset platform data to default state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset Data</span>
        </button>
      </div>
    </header>
  );
};
