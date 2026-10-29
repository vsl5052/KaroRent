import React from 'react';
import {
  Building2,
  CalendarCheck,
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
  Users,
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
    serviceTickets,
    blacklist,
    settlements,
    disputeCases,
  } = useKaroRentStore();

  const stagedCount = virtualInventory.filter((i) => i.pendingStagedRequest).length;
  const activeBlacklistCount = blacklist.filter((b) => b.status === 'Active Blacklist').length;
  const flaggedBookingsCount = bookings.filter((b) => b.status === 'Flagged — Blacklist Review').length;

  const techAssignedCount =
    bookings.filter((b) => {
      if (b.status === 'Flagged — Blacklist Review') return false;
      const name = activePersona.name.toLowerCase().trim();
      const phone = (activePersona.phone || '').replace(/\D/g, '');
      const aTech = b.deliveryAssignment;
      const sTech = b.siteVisit?.assignedTechnician;
      const pTech = b.returnRecord?.assignedPickupStaff;
      if (
        aTech &&
        (aTech.technicianPhone.replace(/\D/g, '') === phone ||
          aTech.technicianName.toLowerCase().trim() === name)
      )
        return true;
      if (sTech && sTech.toLowerCase().trim().includes(name)) return true;
      if (pTech && pTech.toLowerCase().trim().includes(name)) return true;
      return false;
    }).length +
    serviceTickets.filter((st) => {
      const name = activePersona.name.toLowerCase().trim();
      const phone = (activePersona.phone || '').replace(/\D/g, '');
      return (
        st.status !== 'Resolved' &&
        st.status !== 'Closed' &&
        ((st.assignedTechnicianPhone &&
          st.assignedTechnicianPhone.replace(/\D/g, '') === phone) ||
          (st.assignedTechnicianName &&
            st.assignedTechnicianName.toLowerCase().trim().includes(name)))
      );
    }).length;

  const fieldJobsCount =
    activePersona.role === 'FIELD_PERSONNEL'
      ? techAssignedCount
      : activePersona.role === 'VENDOR_OWNER'
      ? bookings.filter(
          (b) =>
            b.fulfillingVendorId === activePersona.vendorId &&
            (b.status === 'Site Visit Scheduled' ||
              b.status === 'Confirmed' ||
              b.status === 'Pickup Scheduled')
        ).length
      : bookings.filter(
          (b) =>
            b.status === 'Site Visit Scheduled' ||
            b.status === 'Confirmed' ||
            b.status === 'Pickup Scheduled'
        ).length;
  const pendingSettlementsCount = settlements.filter((s) => s.status === 'Pending Approval').length;
  const openDisputesCount = disputeCases.filter((d) => d.status !== 'Decided' && d.status !== 'Closed').length;
  const unassignedDeliveriesCount = bookings.filter(
    (b) =>
      !b.deliveryCompletedAt &&
      (b.status === 'Confirmed' ||
        b.status === 'Site Visit Scheduled' ||
        b.status === 'Return Requested') &&
      !b.deliveryAssignment &&
      (!b.siteVisit || !b.siteVisit.assignedTechnician)
  ).length;

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
      id: 'VENDOR_STAFF',
      label: 'Staff',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['VENDOR_OWNER', 'PLATFORM_ADMIN'],
    },
    {
      id: 'ASSIGN_DELIVERIES',
      label: 'Assign Deliveries',
      icon: <CalendarCheck className="w-4 h-4" />,
      badgeCount: unassignedDeliveriesCount || undefined,
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

  // Logical, chronological top-to-bottom tab order tailored per persona
  const roleNavOrder: Record<string, NavigationTab[]> = {
    CUSTOMER_INDIVIDUAL: [
      'MARKETPLACE',
      'MY_RENTALS',
      'AGREEMENTS_ESIGN',
      'INVOICES_DEPOSITS',
      'THREE_WAY_INSPECTION',
      'SUPPORT_DISPUTES',
    ],
    CUSTOMER_BUSINESS: [
      'MARKETPLACE',
      'MY_RENTALS',
      'AGREEMENTS_ESIGN',
      'INVOICES_DEPOSITS',
      'THREE_WAY_INSPECTION',
      'SUPPORT_DISPUTES',
    ],
    VENDOR_OWNER: [
      'VENDOR_PORTAL',
      'VENDOR_STAFF',
      'ASSIGN_DELIVERIES',
      'FIELD_OPERATIONS',
      'THREE_WAY_INSPECTION',
      'SETTLEMENTS_FINANCE',
      'SUPPORT_DISPUTES',
    ],
    FIELD_PERSONNEL: [
      'FIELD_OPERATIONS',
    ],
    PLATFORM_ADMIN: [
      'ADMIN_GOVERNANCE',
      'VENDOR_PORTAL',
      'ASSIGN_DELIVERIES',
      'FIELD_OPERATIONS',
      'THREE_WAY_INSPECTION',
      'VENDOR_STAFF',
      'SETTLEMENTS_FINANCE',
      'MARKETPLACE',
      'MY_RENTALS',
      'AGREEMENTS_ESIGN',
      'INVOICES_DEPOSITS',
      'BLACKLIST_REGISTRY',
      'AUDIT_OBD_REPORTS',
      'SUPPORT_DISPUTES',
    ],
  };

  const currentRoleOrder = roleNavOrder[activePersona.role];

  const visibleNavItems = currentRoleOrder
    ? currentRoleOrder
        .map((tabId) => navItems.find((item) => item.id === tabId))
        .filter((item): item is NavItemConfig =>
          Boolean(item && item.allowedRoles.includes(activePersona.role))
        )
    : navItems.filter((item) => item.allowedRoles.includes(activePersona.role));

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
