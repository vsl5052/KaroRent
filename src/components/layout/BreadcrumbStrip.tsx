import React, { useState } from 'react';
import { Check, ChevronRight, Clock, Copy, Loader2, Shield } from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { NavigationTab } from '../../types/srs';

const TAB_TITLES: Record<NavigationTab, { title: string; srsRef: string }> = {
  MARKETPLACE: {
    title: 'Warm Lifestyle Marketplace & Interior Catalog',
    srsRef: 'FR-CAT-001..007 • FR-PRC-001 (Platform Pricing)',
  },
  MY_RENTALS: {
    title: 'Customer Rental Lifecycle & Guided AC Site-Visit Storyboard',
    srsRef: 'WF-04 • FR-BKG-004 • FR-LIF-001..008',
  },
  AGREEMENTS_ESIGN: {
    title: 'Stationery Rental Agreement & E-Signature Reader',
    srsRef: 'FR-AGR-001..009 • BR-002 • Clause 9.4 (BR-026)',
  },
  INVOICES_DEPOSITS: {
    title: '5-Invoice Financial Split & Segregated Deposit Vault',
    srsRef: 'FR-PAY-011 • FR-DEP-001..006 • BR-011',
  },
  THREE_WAY_INSPECTION: {
    title: 'Condition Comparison Storyboard & Fair Deposit Settlement',
    srsRef: 'FR-RET-002..008 • BR-026 (Doorstep EXIF Photo Gate)',
  },
  VENDOR_PORTAL: {
    title: 'Partner Vendor Portal — Catalogue & Staged Inventory Governance',
    srsRef: 'FR-INV-010 • BR-030 (Pending Admin Approval Gate)',
  },
  FIELD_OPERATIONS: {
    title: 'Field Service Console — AC Site Visits, Deliveries & EXIF Pickup Gate',
    srsRef: 'FR-FUL-008 • FR-RET-002 • EX-029',
  },
  ADMIN_GOVERNANCE: {
    title: 'Super Admin Governance — Staged Approvals, Source Routing & Rate Cards',
    srsRef: 'FR-INV-009..011 • BR-031 • FR-PRC-001',
  },
  BLACKLIST_REGISTRY: {
    title: 'Unified Vendor & Client Blacklist Registry & Evasion Radar',
    srsRef: 'FR-BLK-001..008 • WF-16 • EX-031 / EX-032',
  },
  SETTLEMENTS_FINANCE: {
    title: 'Platform Commission, Vendor Settlements & Termination Holds',
    srsRef: 'FR-SET-001..008 • FR-VEN-013 (Escrow Hold)',
  },
  SUPPORT_DISPUTES: {
    title: 'Customer Support Concierge, SLA Escalations & Asset Replacements',
    srsRef: 'FR-SRV-001..006 • FR-SUP-001..005 • FR-DSP',
  },
  AUDIT_OBD_REPORTS: {
    title: 'Immutable Audit Trail, Open Business Decisions (OBD) & Role Exports',
    srsRef: 'FR-ADM-004 • Section 18 OBD-01..25 • FR-RPT-001',
  },
};

export const BreadcrumbStrip: React.FC = () => {
  const { activeTab, setActiveTab, activePersona, isSimulatingLatency, latencyActionLabel } =
    useKaroRentStore();
  const [copied, setCopied] = useState(false);

  const currentMeta = TAB_TITLES[activeTab];

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(`KARORENT-${activeTab}-${activePersona.id.toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-hearth-card/70 border-b border-hearth-border px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-1.5 text-hearth-taupe flex-wrap">
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className="hover:text-hearth-terracotta transition-colors font-medium"
        >
          KaroRent Platform
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-hearth-umber font-medium">
          {activePersona.role.replace('_', ' ')}
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-hearth-ink font-semibold">{currentMeta.title}</span>
      </div>

      {/* Right: SRS Requirement Traceability Pill + Simulated Latency Indicator */}
      <div className="flex items-center gap-2.5">
        {isSimulatingLatency && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-hearth-apricot border border-hearth-terracotta/40 text-hearth-terracotta text-[11px] font-medium animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{latencyActionLabel || 'Syncing Ledger...'}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-pill bg-hearth-sageLight border border-hearth-sage/20 text-hearth-sage text-[11px] font-mono">
          <Shield className="w-3 h-3" />
          <span>{currentMeta.srsRef}</span>
        </div>

        <button
          onClick={handleCopyRef}
          className="flex items-center gap-1 px-2.5 py-1 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-[10px] font-mono text-hearth-taupe hover:text-hearth-ink transition-colors"
          title="Copy Immutable Traceability Reference"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied Ref' : 'Trace ID'}</span>
        </button>

        <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-hearth-taupe">
          <Clock className="w-3 h-3 text-hearth-terracotta" />
          <span>IST (UTC+5:30)</span>
        </div>
      </div>
    </div>
  );
};
