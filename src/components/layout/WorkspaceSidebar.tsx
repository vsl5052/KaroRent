import React from 'react';
import {
  AlertOctagon,
  Building2,
  CalendarClock,
  Camera,
  CheckSquare,
  FileSignature,
  FileSpreadsheet,
  Home,
  Layers,
  MessageSquareWarning,
  ReceiptIndianRupee,
  ShieldAlert,
  Sparkles,
  Truck,
  WalletCards,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { NavigationTab } from '../../types/srs';

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  srsCode: string;
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
      label: 'Lifestyle Catalog',
      srsCode: 'FR-CAT / PRC',
      icon: <Home className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'VENDOR_OWNER', 'FIELD_PERSONNEL', 'PLATFORM_ADMIN'],
    },
    {
      id: 'MY_RENTALS',
      label: 'My Rentals & AC Storyboard',
      srsCode: 'WF-04 / FR-LIF',
      icon: <CalendarClock className="w-4 h-4" />,
      badgeCount: bookings.filter((b) => b.status === 'Final Bill Sent' || b.status === 'Awaiting Customer Agreement').length || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'AGREEMENTS_ESIGN',
      label: 'Stationery E-Agreements',
      srsCode: 'FR-AGR-001..009',
      icon: <FileSignature className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'INVOICES_DEPOSITS',
      label: '5-Invoice & Deposit Vault',
      srsCode: 'FR-PAY-011 / DEP',
      icon: <ReceiptIndianRupee className="w-4 h-4" />,
      badgeVariant: 'sage',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'PLATFORM_ADMIN'],
    },
    {
      id: 'THREE_WAY_INSPECTION',
      label: 'Returns & 3-Way Care',
      srsCode: 'FR-RET / BR-026',
      icon: <Camera className="w-4 h-4" />,
      badgeCount: openDisputesCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'VENDOR_PORTAL',
      label: 'Catalogue & Staged Edits',
      srsCode: 'FR-INV-010 / VEN',
      icon: <Building2 className="w-4 h-4" />,
      badgeCount: stagedCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'FIELD_OPERATIONS',
      label: 'Deliveries & Home Visits',
      srsCode: 'FR-FUL-008 / RET-002',
      icon: <Truck className="w-4 h-4" />,
      badgeCount: fieldJobsCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['FIELD_PERSONNEL', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'ADMIN_GOVERNANCE',
      label: 'Morning Triage & Source Control',
      srsCode: 'FR-INV-009..011',
      icon: <Layers className="w-4 h-4" />,
      badgeCount: stagedCount || undefined,
      badgeVariant: 'terracotta',
      allowedRoles: ['PLATFORM_ADMIN'],
    },
    {
      id: 'BLACKLIST_REGISTRY',
      label: 'Trust & Blacklist Safeguards',
      srsCode: 'FR-BLK-001..008',
      icon: <ShieldAlert className="w-4 h-4" />,
      badgeCount: activeBlacklistCount + flaggedBookingsCount,
      badgeVariant: 'crimson',
      allowedRoles: ['PLATFORM_ADMIN'],
    },
    {
      id: 'SETTLEMENTS_FINANCE',
      label: 'Commission & Settlements',
      srsCode: 'FR-SET-001..008',
      icon: <WalletCards className="w-4 h-4" />,
      badgeCount: pendingSettlementsCount || undefined,
      badgeVariant: 'sage',
      allowedRoles: ['VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'SUPPORT_DISPUTES',
      label: 'Support, SLA & Service Swaps',
      srsCode: 'FR-SRV / SUP / DSP',
      icon: <MessageSquareWarning className="w-4 h-4" />,
      allowedRoles: ['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS', 'VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'AUDIT_OBD_REPORTS',
      label: 'Audit Trail, OBDs & Exports',
      srsCode: 'FR-ADM / RPT / OBD',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowedRoles: ['PLATFORM_ADMIN', 'VENDOR_OWNER'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(activePersona.role)
  );

  return (
    <aside className="w-full lg:w-[272px] shrink-0 bg-hearth-oat border-b lg:border-b-0 lg:border-r border-hearth-border p-4 flex flex-col justify-between">
      <div>
        {/* Active Persona & Scope Card */}
        <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border shadow-sm mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
              Active Workspace Scope
            </span>
            <Sparkles className="w-3.5 h-3.5 text-hearth-terracotta" />
          </div>
          <div className="font-serif font-semibold text-sm text-hearth-ink mt-1.5">
            {activePersona.name}
          </div>
          <div className="text-[11px] text-hearth-umber font-medium mt-0.5">
            {activePersona.roleBadge}
          </div>
          <div className="text-[10px] text-hearth-taupe mt-1 leading-snug">
            {activePersona.subtitle}
          </div>
          {activePersona.isTerminatedVendor && (
            <div className="mt-2 p-2 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[10px] text-[#991B1B] font-medium flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>FR-VEN-014: Post-Termination Read-Only Mode Active</span>
            </div>
          )}
        </div>

        {/* Navigation Links (Matches Theme 3 Terracotta Hearth Console Sidebar) */}
        <div className="text-[10px] font-mono uppercase tracking-wider text-hearth-taupe px-3 mb-2">
          Guided Lifecycle Modules
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
                  <div className="truncate">
                    <div className="truncate leading-tight">{item.label}</div>
                    <div className="text-[9px] font-mono text-hearth-taupe">{item.srsCode}</div>
                  </div>
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

      {/* Theme 3 Palette Swatch Legend (Directly inspired by Theme 3 Console Mockup bottom-left!) */}
      <div className="hidden lg:block mt-6 pt-4 border-t border-hearth-border">
        <div className="p-3 rounded-2xl bg-hearth-card/80 border border-hearth-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] shadow-inner shrink-0 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-hearth-terracotta" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-hearth-ink">
              Theme 3: Terracotta Hearth
            </div>
            <div className="text-[10px] font-mono text-hearth-taupe">
              Alabaster Linen (#FAF8F5)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
