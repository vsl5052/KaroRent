import React from 'react';
import {
  AlertOctagon,
  Building2,
  CalendarClock,
  Camera,
  FileSignature,
  FileSpreadsheet,
  Home,
  Layers,
  MessageSquareWarning,
  ReceiptIndianRupee,
  ShieldAlert,
  Truck,
  WalletCards,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { NavigationTab } from '../../types/srs';

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  badgeVariant?: 'terracotta' | 'crimson' | 'sage';
  allowedRoles: string[];
}

export const WorkspaceSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activePersona,
    virtualInventory,
    bookings,
    blacklist,
    settlements,
    disputeCases,
  } = useKaroRentStore();

  const stagedCount = virtualInventory.filter((i) => i.pendingStagedRequest).length;
  const activeBlacklistCount = blacklist.filter((b) => b.status === 'Active Blacklist').length;
  const flaggedBookingsCount = bookings.filter((b) => b.status === 'Flagged — Blacklist Review').length;
  const fieldJobsCount = bookings.filter(
    (b) =>
      b.status === 'Site Visit Scheduled' ||
      b.status === 'Confirmed' ||
      b.status === 'Pickup Scheduled'
  ).length;
  const pendingSettlementsCount = settlements.filter((s) => s.status === 'Pending Approval').length;
  const openDisputesCount = disputeCases.filter((d) => d.status !== 'Decided' && d.status !== 'Closed').length;

  const navItems: NavItemConfig[] = [
    {
      id: 'MARKETPLACE',
      label: 'Catalog',
      icon: <Home className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'MY_RENTALS',
      label: 'My Rentals',
      icon: <CalendarClock className="w-4 h-4" />,
      badgeCount: bookings.filter((b) => b.status === 'Final Bill Sent' || b.status === 'Awaiting Customer Agreement').length || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'AGREEMENTS_ESIGN',
      label: 'Agreements',
      icon: <FileSignature className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'INVOICES_DEPOSITS',
      label: 'Payments & Deposits',
      icon: <ReceiptIndianRupee className="w-4 h-4" />,
      badgeVariant: 'sage',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'THREE_WAY_INSPECTION',
      label: activePersona.role === 'VENDOR_OWNER' ? 'Returned Products' : 'Returns',
      icon: <Camera className="w-4 h-4" />,
      badgeCount: openDisputesCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'SUPPORT_DISPUTES',
      label: 'Support',
      icon: <MessageSquareWarning className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'VENDOR_PORTAL',
      label: 'Vendor Inventory',
      icon: <Building2 className="w-4 h-4" />,
      badgeCount: stagedCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'FIELD_OPERATIONS',
      label: 'Deliveries & Visits',
      icon: <Truck className="w-4 h-4" />,
      badgeCount: fieldJobsCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['FIELD_PERSONNEL', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'SETTLEMENTS_FINANCE',
      label: 'Payouts',
      icon: <WalletCards className="w-4 h-4" />,
      badgeCount: pendingSettlementsCount || undefined,
      badgeVariant: 'sage',
      allowedRoles: ['VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'ADMIN_GOVERNANCE',
      label: 'Catalog & Vendors',
      icon: <Layers className="w-4 h-4" />,
      badgeCount: stagedCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['PLATFORM_ADMIN'],
    },
    {
      id: 'BLACKLIST_REGISTRY',
      label: 'Blocked Accounts',
      icon: <ShieldAlert className="w-4 h-4" />,
      badgeCount: activeBlacklistCount + flaggedBookingsCount,
      badgeVariant: 'crimson',
      allowedRoles: ['PLATFORM_ADMIN'],
    },
    {
      id: 'AUDIT_OBD_REPORTS',
      label: 'Reports & Logs',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowedRoles: ['PLATFORM_ADMIN'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(activePersona.role)
  );

  return (
    <aside className="w-full lg:w-[248px] shrink-0 bg-hearth-oat border-b lg:border-b-0 lg:border-r border-hearth-border p-4 flex flex-col justify-between">
      <div>
        {/* Clean User Profile Card */}
        <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border shadow-sm mb-4">
          <div className="font-serif font-semibold text-sm text-hearth-ink">
            {activePersona.name}
          </div>
          <div className="text-xs text-hearth-terracotta font-medium mt-0.5">
            {activePersona.roleBadge}
          </div>
          {activePersona.isTerminatedVendor && (
            <div className="mt-2 p-2 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[10px] text-[#991B1B] font-medium flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>Read-Only Account</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="text-[10px] font-mono uppercase tracking-wider text-hearth-taupe px-3 mb-2">
          Menu
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 lg:w-full text-left border-r-[3px] ${
                  isActive
                    ? 'bg-[#EADFD3]/70 dark:bg-hearth-apricot text-hearth-ink font-semibold border-hearth-terracotta shadow-sm'
                    : 'border-transparent text-hearth-umber hover:bg-hearth-card/70 hover:text-hearth-ink'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? 'text-hearth-terracotta'
                        : 'text-hearth-taupe group-hover:text-hearth-terracotta'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-pill text-[10px] font-mono font-semibold shrink-0 ${
                      item.badgeVariant === 'crimson'
                        ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                        : item.badgeVariant === 'sage'
                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                        : 'bg-hearth-terracotta text-white'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
