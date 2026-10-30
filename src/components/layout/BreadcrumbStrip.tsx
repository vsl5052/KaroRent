import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { NavigationTab } from '../../types/srs';

const TAB_TITLES: Record<NavigationTab, string> = {
  MARKETPLACE: 'Public Catalog',
  YOUR_ACCOUNT: 'Your Account',
  FOR_BUSINESS: 'For Business',
  MY_RENTALS: 'My Rentals',
  AGREEMENTS_ESIGN: 'Agreements',
  INVOICES_DEPOSITS: 'Payments & Deposits',
  THREE_WAY_INSPECTION: 'Returns',
  VENDOR_PORTAL: 'Vendor Inventory',
  VENDOR_STAFF: 'Staff',
  ASSIGN_DELIVERIES: 'Assign Deliveries',
  FIELD_OPERATIONS: 'Deliveries & Visits',
  ADMIN_GOVERNANCE: 'Catalog & Vendors',
  BLACKLIST_REGISTRY: 'Blocked Accounts',
  SETTLEMENTS_FINANCE: 'Payouts',
  SUPPORT_DISPUTES: 'Support',
  AUDIT_OBD_REPORTS: 'Reports & Logs',
};

export const BreadcrumbStrip: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activePersona,
    isSimulatingLatency,
    latencyActionLabel,
  } = useKaroRentStore();

  const currentTitle =
    activeTab === 'THREE_WAY_INSPECTION' && activePersona.role === 'VENDOR_OWNER'
      ? 'Returned Products'
      : TAB_TITLES[activeTab];

  return (
    <div className="w-full bg-hearth-card/70 border-b border-hearth-border px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Breadcrumb & Quick Return */}
      <div className="flex items-center gap-2 text-hearth-taupe flex-wrap">
        <button
          onClick={() => setActiveTab('YOUR_ACCOUNT')}
          className="hover:text-hearth-terracotta transition-colors font-bold text-hearth-terracotta flex items-center gap-1"
        >
          <span>← Your Account</span>
        </button>
        <span className="text-hearth-border">•</span>
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className="hover:text-hearth-terracotta transition-colors font-medium"
        >
          Catalog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-hearth-taupe" />
        <span className="text-hearth-ink font-semibold">{currentTitle}</span>
      </div>

      {/* Subtle Loading Indicator when saving */}
      {isSimulatingLatency && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-hearth-apricot border border-hearth-terracotta/40 text-hearth-terracotta text-[11px] font-medium animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{latencyActionLabel || 'Saving...'}</span>
        </div>
      )}
    </div>
  );
};
