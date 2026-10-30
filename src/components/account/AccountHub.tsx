import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  Camera,
  CheckCircle2,
  CreditCard,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Headphones,
  Home,
  KeyRound,
  Layers,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  MessageSquareWarning,
  Package,
  PackageCheck,
  Phone,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Truck,
  User,
  UserCheck,
  Users,
  Wallet,
  WalletCards,
  Wrench,
  Zap,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { NavigationTab } from '../../types/srs';

interface AccountTile {
  title: string;
  description: string;
  icon: React.ReactNode;
  tab: NavigationTab;
  badge?: string;
  badgeVariant?: 'terracotta' | 'green' | 'amber' | 'blue';
}

export const AccountHub: React.FC = () => {
  const {
    activePersona,
    setActiveTab,
    bookings,
    settlements,
    disputeCases,
    logoutUser,
  } = useKaroRentStore();

  const customerActiveRentals = bookings.filter(
    (b) =>
      b.customerId === activePersona.customerId &&
      b.status !== 'Returned & Closed' &&
      b.status !== 'Cancelled'
  );

  // 1. Customer Tiles
  const customerTiles: AccountTile[] = [
    {
      title: 'Your Rentals & Orders',
      description: 'Track active deliveries, tenure countdown, extensions, and returns',
      icon: <Package className="w-9 h-9 text-[#059669] dark:text-[#10B981]" />,
      tab: 'MY_RENTALS',
      badge:
        customerActiveRentals.length > 0
          ? `${customerActiveRentals.length} Active`
          : undefined,
      badgeVariant: 'green',
    },
    {
      title: 'Rental Agreements & E-Sign',
      description: 'View legally binding Aadhaar OTP signed lease agreements & amendments',
      icon: <FileSignature className="w-9 h-9 text-blue-600 dark:text-blue-400" />,
      tab: 'AGREEMENTS_ESIGN',
    },
    {
      title: 'Invoices & Deposit Vault',
      description: '5-stage periodic invoices, receipts, and 4-month refundable deposit ledger',
      icon: <ReceiptIndianRupee className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />,
      tab: 'INVOICES_DEPOSITS',
    },
    {
      title: 'Doorstep Return & Inspection',
      description: 'Track return pickups, view 3-way photo comparison, and condition findings',
      icon: <Camera className="w-9 h-9 text-amber-600 dark:text-amber-400" />,
      tab: 'THREE_WAY_INSPECTION',
    },
    {
      title: 'Help, Maintenance & Disputes',
      description: 'Request free repair visits, report appliance issues, or view claim status',
      icon: <Headphones className="w-9 h-9 text-purple-600 dark:text-purple-400" />,
      tab: 'SUPPORT_DISPUTES',
    },
    {
      title: 'For Business & GST Billing',
      description: 'Corporate multi-workstation leasing with 18% input tax credit',
      icon: <Briefcase className="w-9 h-9 text-slate-700 dark:text-slate-300" />,
      tab: 'FOR_BUSINESS',
    },
  ];

  // 2. Vendor Tiles
  const vendorTiles: AccountTile[] = [
    {
      title: 'Showroom & Inventory',
      description: 'Manage registered products, declared stock, and public catalog visibility',
      icon: <Building2 className="w-9 h-9 text-[#059669] dark:text-[#10B981]" />,
      tab: 'VENDOR_PORTAL',
    },
    {
      title: 'Assign Deliveries & Pickups',
      description: 'Assign scheduled customer deliveries and return pickups to field crew',
      icon: <Truck className="w-9 h-9 text-blue-600 dark:text-blue-400" />,
      tab: 'ASSIGN_DELIVERIES',
    },
    {
      title: 'Field Technician Staff',
      description: 'Register staff members and view active daily delivery/maintenance rosters',
      icon: <Users className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />,
      tab: 'VENDOR_STAFF',
    },
    {
      title: 'Partner Settlements & Escrow',
      description: 'Review monthly earnings at agreed rate cards and segregated reserve holds',
      icon: <WalletCards className="w-9 h-9 text-amber-600 dark:text-amber-400" />,
      tab: 'SETTLEMENTS_FINANCE',
    },
    {
      title: 'Doorstep Pickup Inspections',
      description: 'Verify mandatory premise photo inspections before warehouse return',
      icon: <Camera className="w-9 h-9 text-purple-600 dark:text-purple-400" />,
      tab: 'THREE_WAY_INSPECTION',
    },
    {
      title: 'Voluntary Offboarding & Run-Off',
      description: 'Monitor Option A run-off timeline, active rentals, and Blacklist immunity',
      icon: <ShieldCheck className="w-9 h-9 text-slate-700 dark:text-slate-300" />,
      tab: 'VENDOR_PORTAL',
    },
  ];

  // 3. Technician Tiles
  const technicianTiles: AccountTile[] = [
    {
      title: 'My Daily Assigned Tasks',
      description: 'Active deliveries, AC measurement surveys, and breakdown repairs today',
      icon: <Wrench className="w-9 h-9 text-[#059669] dark:text-[#10B981]" />,
      tab: 'FIELD_OPERATIONS',
    },
    {
      title: 'Doorstep Photo Verification',
      description: 'Capture mandatory customer premise photo with EXIF timestamp & GPS tag',
      icon: <Camera className="w-9 h-9 text-blue-600 dark:text-blue-400" />,
      tab: 'THREE_WAY_INSPECTION',
    },
    {
      title: 'Technician Staff Directory',
      description: 'View field team assignments and service areas across assigned operational zones',
      icon: <Users className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />,
      tab: 'VENDOR_STAFF',
    },
  ];

  // 4. Admin Tiles
  const adminTiles: AccountTile[] = [
    {
      title: 'Catalog & Inventory Governance',
      description: 'Review staged stock updates, source reassignments, and pricing engine',
      icon: <Layers className="w-9 h-9 text-[#059669] dark:text-[#10B981]" />,
      tab: 'ADMIN_GOVERNANCE',
    },
    {
      title: 'Unified Blacklist Registry',
      description: 'Cross-entity risk registry, watchlists, and exception overrides',
      icon: <ShieldAlert className="w-9 h-9 text-rose-600 dark:text-rose-400" />,
      tab: 'BLACKLIST_REGISTRY',
    },
    {
      title: 'Financial Settlements & Reserves',
      description: 'Approve vendor payout statements, custom adjustments, and reserve holds',
      icon: <WalletCards className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />,
      tab: 'SETTLEMENTS_FINANCE',
    },
    {
      title: 'Support Disputes & Mediation',
      description: 'Mediate deposit return deductions and resolve customer service tickets',
      icon: <Headphones className="w-9 h-9 text-amber-600 dark:text-amber-400" />,
      tab: 'SUPPORT_DISPUTES',
    },
    {
      title: 'Vendor Run-Off Supervision',
      description: 'Supervise partner run-off, breach takeovers, and amicable closures',
      icon: <ShieldCheck className="w-9 h-9 text-purple-600 dark:text-purple-400" />,
      tab: 'ADMIN_GOVERNANCE',
    },
    {
      title: 'Audit Logs & OBD Matrix',
      description: 'Review immutable platform event logs and Open Business Decision matrix',
      icon: <FileText className="w-9 h-9 text-slate-700 dark:text-slate-300" />,
      tab: 'AUDIT_OBD_REPORTS',
    },
  ];

  const currentTiles =
    activePersona.role === 'PLATFORM_ADMIN'
      ? adminTiles
      : activePersona.role === 'VENDOR_OWNER'
      ? vendorTiles
      : activePersona.role === 'FIELD_PERSONNEL'
      ? technicianTiles
      : customerTiles;

  return (
    <div className="space-y-10 py-2">
      {/* Top Welcome Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hearth-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-hearth-taupe">
            <span>KaroRent Account Hub</span>
            <span>•</span>
            <span className="font-mono text-[#059669] dark:text-[#10B981] font-bold">
              {activePersona.customerId || activePersona.vendorId || 'Console'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-hearth-ink mt-1 tracking-tight">
            Your Account
          </h1>
          <p className="text-xs sm:text-sm text-hearth-umber mt-1">
            Welcome back, <strong>{activePersona.name}</strong>. Manage your rental orders, contracts, deposit vault, and settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className="spring-btn px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-sand text-hearth-ink text-xs font-semibold border border-hearth-border flex items-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
            <span>Browse Catalog</span>
          </button>

          <button
            onClick={() => logoutUser()}
            className="px-4 py-2 rounded-pill bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Large Tile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentTiles.map((tile, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(tile.tab)}
            className="spring-card text-left p-6 rounded-3xl bg-hearth-card border border-hearth-border hover:border-[#059669]/50 dark:hover:border-[#10B981]/50 shadow-hearth hover:shadow-lg flex items-start gap-4 transition-all group"
          >
            <div className="p-3 rounded-2xl bg-hearth-oat/80 group-hover:bg-emerald-50 dark:group-hover:bg-[#10B981]/10 transition-colors shrink-0">
              {tile.icon}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-hearth-ink group-hover:text-[#059669] dark:group-hover:text-[#10B981] transition-colors truncate">
                  {tile.title}
                </h3>
                {tile.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold shrink-0 ${
                      tile.badgeVariant === 'green'
                        ? 'bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-400 border border-[#86EFAC] dark:border-emerald-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#10B981] border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {tile.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-hearth-taupe leading-relaxed line-clamp-2">
                {tile.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Profile & KYC Summary Strip (For Customer or Vendor) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-[#059669] dark:text-[#10B981] font-bold text-xl flex items-center justify-center shadow-sm">
            {activePersona.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-hearth-ink">
                {activePersona.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-pill bg-hearth-oat text-[10px] font-semibold text-hearth-umber border border-hearth-border">
                {activePersona.roleBadge}
              </span>
            </div>
            <div className="text-xs text-hearth-taupe mt-0.5">
              Email: <strong>{activePersona.email}</strong> • Mobile: <strong>{activePersona.phone}</strong> • Cluster: <strong>{activePersona.subtitle}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aadhaar E-KYC Verified</span>
          </span>
        </div>
      </div>

      {/* Sub-sections */}
      <div className="pt-6 border-t border-hearth-border grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        {/* Column 1: Account & Security */}
        <div className="space-y-3">
          <div className="font-bold text-sm text-hearth-ink">
            Account & Security Preferences
          </div>
          <ul className="space-y-2 text-hearth-umber">
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Personal details, name, and registered phone</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <Lock className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Login security & two-factor SMS OTP</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Manage delivery addresses</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <CreditCard className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Payment methods & UPI autopay mandate</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Agreements & Statutory Policies */}
        <div className="space-y-3">
          <div className="font-bold text-sm text-hearth-ink">
            Lease Agreements & Policies
          </div>
          <ul className="space-y-2 text-hearth-umber">
            <li
              onClick={() => setActiveTab('AGREEMENTS_ESIGN')}
              className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <FileSignature className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Standard Residential Rental Agreement (2026 Edition)</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Deposit Protection & Refund Safety Charter</span>
            </li>
            <li
              onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
              className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>3-Way Doorstep Photo Verification</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <Briefcase className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Commercial Corporate Lease Terms</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Mediation */}
        <div className="space-y-3">
          <div className="font-bold text-sm text-hearth-ink">
            Customer Care & Resolution
          </div>
          <ul className="space-y-2 text-hearth-umber">
            <li
              onClick={() => setActiveTab('SUPPORT_DISPUTES')}
              className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Contact KaroRent Concierge (Phone / WhatsApp)</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <Wrench className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Book periodic maintenance or AC servicing</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <MessageSquareWarning className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Escalate an unresolved deposit deduction</span>
            </li>
            <li className="hover:text-[#059669] dark:hover:text-[#10B981] cursor-pointer flex items-center gap-1.5 transition-colors">
              <Home className="w-3.5 h-3.5 text-hearth-taupe" />
              <span>Request annual home relocation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
