import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  ShieldAlert,
  Sliders,
  Sparkles,
  Store,
  XCircle,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { mandatoryReasonSchema } from '../../lib/validation';

export const AdminGovernanceView: React.FC = () => {
  const {
    virtualInventory,
    vendors,
    masterProducts,
    bookings,
    depositLedgers,
    blacklist,
    resolveStagedInventoryRequest,
    updateMasterProductPricing,
    reviewVendorApplication,
    terminateVendorAndAssignContinuity,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  // Staged Inventory Decision State
  const [adminReasonByInv, setAdminReasonByInv] = useState<Record<string, string>>({
    'INV-502':
      'Reassigning inventory source to Oak & Loom Studio (VEN-202) so Split AC remains enabled on the live marketplace without interruption.',
    'INV-503':
      'Verified daylight studio photography and physical stock audit; approved for public display.',
  });
  const [targetVendorByInv, setTargetVendorByInv] = useState<Record<string, string>>({
    'INV-502': 'VEN-202',
    'INV-503': 'VEN-201',
  });

  // Direct Source Switcher State
  const [directSwitchInvId, setDirectSwitchInvId] = useState<string>('INV-501');
  const [directSwitchNewVendorId, setDirectSwitchNewVendorId] = useState<string>('VEN-202');
  const [directSwitchReason, setDirectSwitchReason] = useState<string>(
    'Rebalancing Indiranagar zone fulfilment load; historical rentals preserve prior vendor snapshot.'
  );

  // Master Platform Pricing Editor State
  const [selectedPricingProductId, setSelectedPricingProductId] =
    useState<string>('PRD-02');
  const selectedProd =
    masterProducts.find((p) => p.id === selectedPricingProductId) ||
    masterProducts[0];
  const [editRent, setEditRent] = useState<number>(selectedProd.baseMonthlyRent);
  const [editDepositMult, setEditDepositMult] = useState<number>(
    selectedProd.depositMonthsMultiple
  );
  const [editVisitFee, setEditVisitFee] = useState<number>(
    selectedProd.siteVisitFee
  );
  const [editPipeRate, setEditPipeRate] = useState<number>(850);
  const [pricingReason, setPricingReason] = useState<string>(
    'Q4 2026 Platform Rate-Card standardization approved by Product Owner.'
  );

  // Vendor Termination & Continuity Modal State
  const [terminatingVendorId, setTerminatingVendorId] = useState<string | null>(
    null
  );
  const [continuityAssignee, setContinuityAssignee] = useState<string>(
    'Oak & Loom Studio (VEN-202) + Platform Operations Continuity Desk'
  );
  const [terminationReason, setTerminationReason] = useState<string>(
    'Initiating partner contract termination due to repeated SLA breaches; placing automated payout hold and enrolling in Vendor Blacklist.'
  );

  const stagedItems = virtualInventory.filter((i) => i.pendingStagedRequest);
  const eligibleVendors = vendors.filter(
    (v) => v.status === 'Approved' && v.agreementState === 'Signed'
  );
  const totalVaultBalance = depositLedgers.reduce(
    (acc, d) => acc + d.heldBalance,
    0
  );

  const handleSelectPricingProduct = (id: string) => {
    setSelectedPricingProductId(id);
    const found = masterProducts.find((p) => p.id === id);
    if (found) {
      setEditRent(found.baseMonthlyRent);
      setEditDepositMult(found.depositMonthsMultiple);
      setEditVisitFee(found.siteVisitFee);
      const pipe = found.installationRateCard.find(
        (r) => r.code === 'RC-PIPE-CU'
      );
      if (pipe) setEditPipeRate(pipe.ratePerUnit);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Morning Triage KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Staged Vendor Edits
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-terracotta mt-1 font-ledger">
            {stagedItems.length} Pending
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Live catalog protected by admin approval gate
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Blacklist & Fraud Intercepts
          </div>
          <div className="font-serif text-3xl font-bold text-[#991B1B] mt-1 font-ledger">
            {blacklist.filter((b) => b.status === 'Active Blacklist').length} Active
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            {bookings.filter((b) => b.status === 'Flagged — Blacklist Review').length}{' '}
            booking(s) & 1 vendor re-application flagged
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Returns Under 3-Way Care
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-ink mt-1 font-ledger">
            {bookings.filter((b) => b.returnRecord).length} Cases
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Mandatory doorstep EXIF photo gate enforced
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Segregated Deposit Vault
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-sage mt-1 font-ledger">
            ₹{totalVaultBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            100% isolated from platform rental revenue
          </div>
        </div>
      </div>

      {/* SECTION 1: Staged Vendor Inventory Approval & Source Reassignment Queue */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hearth-border pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
              Catalog Governance & Source Continuity
            </span>
            <h2 className="font-serif text-xl font-bold text-hearth-ink mt-1">
              Staged Vendor Inventory Approval & Source Reassignment Queue
            </h2>
            <p className="text-xs text-hearth-umber">
              Vendor actions to enable, disable, or update stock are held here in staging. If a vendor requests to disable a popular item, you can seamlessly reassign its Source Vendor so the item remains enabled on the live marketplace!
            </p>
          </div>
        </div>

        {stagedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-hearth-oat text-center text-xs text-hearth-taupe">
            All staged vendor inventory requests have been processed! You can submit a new staged request from the Vendor Portal tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stagedItems.map((inv) => {
              const req = inv.pendingStagedRequest!;
              const reasonVal =
                adminReasonByInv[inv.id] ||
                'Reviewed staged vendor inventory change.';
              const targetVenId =
                targetVendorByInv[inv.id] ||
                eligibleVendors.find((v) => v.id !== inv.owningVendorId)?.id ||
                'VEN-202';

              return (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-hearth-parchment border-2 border-hearth-terracotta/40 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.uploadedImages[0] || inv.itemImages[0]}
                        alt={inv.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-hearth-border"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-hearth-ink">
                            {req.id} → {inv.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] text-[10px] font-semibold">
                            {req.requestType}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-hearth-ink mt-0.5">
                          {inv.productTitle}
                        </h3>
                        <div className="text-[11px] text-hearth-taupe">
                          Submitted by: <strong>{req.vendorName}</strong> ({req.submittedAt})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side Before (Live) vs. After (Requested) Diff */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0]">
                      <div className="text-[10px] font-mono uppercase text-[#166534] font-bold">
                        Current Live Platform State
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        Display: {inv.livePublicEnabled ? 'ENABLED (Public)' : 'DISABLED'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Declared Stock: {inv.declaredQuantity} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe">
                        Source: {inv.owningVendorName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFEDD5]/60 border border-[#FED7AA]">
                      <div className="text-[10px] font-mono uppercase text-[#9A3412] font-bold">
                        Vendor Staged Request
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        Requested: {req.requestedPublicEnabled ? 'ENABLE' : 'DISABLE ITEM'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Requested Stock: {req.requestedDeclaredStock} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe truncate">
                        "{req.vendorNotes}"
                      </div>
                    </div>
                  </div>

                  {/* Platform Manager Decision Controls */}
                  <div className="space-y-3 pt-2 border-t border-hearth-border text-xs">
                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Option B — Reassign Inventory Source to Alternate Eligible Vendor:
                      </label>
                      <select
                        value={targetVenId}
                        onChange={(e) =>
                          setTargetVendorByInv({
                            ...targetVendorByInv,
                            [inv.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-medium"
                      >
                        {eligibleVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.displayName} ({v.id}) — Zones: {v.serviceAreas.join(', ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Mandatory Governance Reason (Logged in Audit Trail) *
                      </label>
                      <input
                        type="text"
                        value={reasonVal}
                        onChange={(e) =>
                          setAdminReasonByInv({
                            ...adminReasonByInv,
                            [inv.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'APPROVE',
                            adminReason: reasonVal,
                          })
                        }
                        className="spring-btn px-3.5 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Option A: Approve & Update Live</span>
                      </button>

                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'REASSIGN_SOURCE',
                            newSourceVendorId: targetVenId,
                            adminReason: reasonVal,
                          })
                        }
                        className="spring-btn px-3.5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Option B: Reassign Source & Keep Enabled</span>
                      </button>

                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'REJECT',
                            adminReason: reasonVal,
                          })
                        }
                        className="px-3.5 py-2 rounded-pill bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Option C: Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Anytime Platform Manager Inventory Source Switcher */}
        <div className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-3">
          <div className="text-xs font-bold text-hearth-ink flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-hearth-terracotta" />
            <span>
              Direct Inventory Source Reassignment Tool
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Inventory Item
              </label>
              <select
                value={directSwitchInvId}
                onChange={(e) => setDirectSwitchInvId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              >
                {virtualInventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.productTitle.slice(0, 22)} (Current: {i.owningVendorName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                New Fulfilling Vendor Source
              </label>
              <select
                value={directSwitchNewVendorId}
                onChange={(e) => setDirectSwitchNewVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              >
                {eligibleVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.displayName} ({v.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Audit Reason *
              </label>
              <input
                type="text"
                value={directSwitchReason}
                onChange={(e) => setDirectSwitchReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              />
            </div>
            <button
              onClick={() =>
                resolveStagedInventoryRequest({
                  inventoryId: directSwitchInvId,
                  decision: 'REASSIGN_SOURCE',
                  newSourceVendorId: directSwitchNewVendorId,
                  adminReason: directSwitchReason,
                })
              }
              className="spring-btn py-2 px-4 rounded-pill bg-hearth-ink text-hearth-canvas font-semibold"
            >
              Switch Source Now
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Master Platform Pricing & Installation Rate-Card Authority */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
        <div className="xl:col-span-5 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-pill bg-hearth-sageLight text-hearth-sage font-semibold">
                Central Rate Authority
              </span>
              <h3 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                Master Platform Pricing & Rate Cards
              </h3>
            </div>
            <Sliders className="w-5 h-5 text-hearth-terracotta" />
          </div>

          <p className="text-xs text-hearth-umber">
            Centrally govern product rental rates, deposit multiples, site-visit charges, and installation material rate cards across all vendors.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Select Master Catalog Product
              </label>
              <select
                value={selectedPricingProductId}
                onChange={(e) => handleSelectPricingProduct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-medium"
              >
                {masterProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Base Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  value={editRent}
                  onChange={(e) => setEditRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                />
              </div>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Deposit Multiple (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={editDepositMult}
                  onChange={(e) => setEditDepositMult(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                />
              </div>
            </div>

            {selectedProd.workflowType === 'SITE_VISIT_MULTI_STEP' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Site Visit Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editVisitFee}
                    onChange={(e) => setEditVisitFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Copper Pipe Rate (₹/m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPipeRate}
                    onChange={(e) => setEditPipeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Policy Change Rationale *
              </label>
              <input
                type="text"
                value={pricingReason}
                onChange={(e) => setPricingReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border"
              />
            </div>

            <button
              onClick={() =>
                updateMasterProductPricing({
                  productId: selectedPricingProductId,
                  baseMonthlyRent: editRent,
                  depositMonthsMultiple: editDepositMult,
                  siteVisitFee: editVisitFee,
                  copperPipeRate: editPipeRate,
                  reason: pricingReason,
                })
              }
              className="spring-btn w-full py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white font-semibold shadow-sm"
            >
              Publish Master Rate Card Update
            </button>
          </div>
        </div>

        {/* SECTION 3: Vendor Onboarding, Blacklist Match Detection & Termination Continuity */}
        <div className="xl:col-span-7 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-pill bg-[#FEE2E2] text-[#991B1B] font-semibold">
                Partner Onboarding & Continuity Governance
              </span>
              <h3 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                Vendor Governance, Blacklist Match Review & Termination Continuity
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {vendors.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  v.blacklistMatchWarning
                    ? 'bg-[#FEE2E2]/40 border-2 border-[#DC2626]'
                    : 'bg-hearth-oat/60 border-hearth-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-hearth-ink">
                        {v.id}
                      </span>
                      <span className="font-serif font-bold text-sm text-hearth-ink">
                        {v.legalBusinessName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                          v.status === 'Approved'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : v.status.includes('Terminat')
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FFEDD5] text-[#9A3412]'
                        }`}
                      >
                        {v.status} • Agreement: {v.agreementState}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-hearth-taupe mt-0.5">
                      GSTIN: {v.taxIdGstin} • PAN: {v.panNumber} • Payout: {v.bankAccountMasked}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() =>
                            reviewVendorApplication(
                              v.id,
                              'Approved',
                              'Approved after executive compliance verification.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-hearth-sage text-white text-[11px] font-semibold"
                        >
                          Approve & Sign
                        </button>
                        <button
                          onClick={() =>
                            reviewVendorApplication(
                              v.id,
                              'Rejected',
                              'Rejected due to Blacklist Match with terminated vendor VEN-203.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-[#991B1B] text-white text-[11px] font-semibold"
                        >
                          Reject Application
                        </button>
                      </>
                    )}

                    {v.status === 'Approved' && (
                      <button
                        onClick={() => setTerminatingVendorId(v.id)}
                        className="px-3 py-1.5 rounded-pill bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border border-[#FECACA] text-[11px] font-semibold"
                      >
                        Initiate Termination
                      </button>
                    )}
                  </div>
                </div>

                {/* High-Priority Blacklist Match Warning */}
                {v.blacklistMatchWarning && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        HIGH-PRIORITY ALERT: Blacklist Match — Terminated Vendor ({v.blacklistMatchWarning.matchedVendorId})
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <strong>Matched Identifiers:</strong>{' '}
                      {v.blacklistMatchWarning.matchedFields.join(' • ')}
                    </div>
                    <div className="text-[11px]">
                      <strong>Historical Dossier:</strong>{' '}
                      {v.blacklistMatchWarning.priorTerminationReason}
                    </div>
                  </div>
                )}

                {v.continuityManager && (
                  <div className="text-[11px] font-mono text-[#9A3412] bg-[#FFEDD5] px-3 py-1.5 rounded-xl">
                    Continuity Manager: {v.continuityManager} | Settlement Escrow Hold: ₹{v.settlementHoldAmount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Termination & Continuity Manager Modal */}
      {terminatingVendorId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">
                Initiate Vendor Termination & Continuity Assignment
              </h3>
            </div>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Terminating vendor <strong>{terminatingVendorId}</strong> will immediately delist public listings, place an automated escrow hold on pending payouts, restrict the vendor to read-only access, and automatically enroll all vendor identifiers into the Unified Vendor Blacklist.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Assign Continuity Manager for Active Rentals *
                </label>
                <input
                  type="text"
                  value={continuityAssignee}
                  onChange={(e) => setContinuityAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                />
              </div>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Mandatory Termination & Blacklist Reason *
                </label>
                <textarea
                  rows={2}
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTerminatingVendorId(null)}
                className="px-4 py-2 rounded-pill bg-hearth-oat text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const valid = mandatoryReasonSchema.safeParse(terminationReason);
                  if (!valid.success) {
                    addToast({
                      title: 'Reason Required',
                      description: valid.error.errors[0].message,
                      variant: 'error',
                    });
                    return;
                  }
                  await terminateVendorAndAssignContinuity(
                    terminatingVendorId,
                    continuityAssignee,
                    terminationReason
                  );
                  setTerminatingVendorId(null);
                }}
                className="px-5 py-2 rounded-pill bg-[#991B1B] text-white text-xs font-semibold"
              >
                Confirm Termination & Auto-Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
