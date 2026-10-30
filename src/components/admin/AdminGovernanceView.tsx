import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  XCircle,
  Zap,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { mandatoryReasonSchema } from '../../lib/validation';

export const AdminGovernanceView: React.FC = () => {
  const {
    virtualInventory,
    vendors,
    vendorProductRates,
    masterProducts,
    bookings,
    depositLedgers,
    blacklist,
    invoices,
    resolveStagedInventoryRequest,
    updateMasterProductPricing,
    reviewVendorApplication,
    terminateVendorAndAssignContinuity,
    initiateVendorVoluntaryOffboarding,
    triggerVendorBreachTakeover,
    completeVendorAmicableOffboarding,
    triggerDefaultNotice,
    curePaymentDefault,
    reportRepossessionObstruction,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [simBookingId, setSimBookingId] = useState<string>('BKG-2026-8892');
  const [simVendorId, setSimVendorId] = useState<string>('VEN-201');
  const [showBreachModal, setShowBreachModal] = useState<boolean>(false);
  const [breachPartner, setBreachPartner] = useState<string>(
    'KaroRent Rapid Response Fleet'
  );
  const [breachJustification, setBreachJustification] = useState<string>(
    'Vendor abandoned field servicing / return pickup obligations during run-off (BR-034). Platform emergency fleet reassigned and settlement reserve forfeited.'
  );

  // Inventory Decision State
  const [adminReasonByInv, setAdminReasonByInv] = useState<Record<string, string>>({
    'INV-502':
      'Reassigning inventory to Oak & Loom Studio so Split AC stays available in the catalog.',
    'INV-503':
      'Verified stock count and product photos; approved for catalog.',
  });

  // Product Pricing Editor State
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
    'Quarterly pricing update.'
  );

  // End Contract Modal State
  const [terminatingVendorId, setTerminatingVendorId] = useState<string | null>(
    null
  );
  const [continuityAssignee, setContinuityAssignee] = useState<string>(
    'Oak & Loom Studio (VEN-202)'
  );
  const [terminationReason, setTerminationReason] = useState<string>(
    'Ending partner contract due to repeated service delays.'
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Pending Stock Updates
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-terracotta mt-1 font-ledger">
            {stagedItems.length} Pending
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Awaiting catalog approval
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Blocked Accounts
          </div>
          <div className="font-serif text-3xl font-bold text-[#991B1B] mt-1 font-ledger">
            {blacklist.filter((b) => b.status === 'Active Blacklist').length} Active
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            {bookings.filter((b) => b.status === 'Flagged — Blacklist Review').length}{' '}
            order(s) held for review
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Active Returns
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-ink mt-1 font-ledger">
            {bookings.filter((b) => b.returnRecord).length} Returns
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Scheduled or under inspection
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Deposits Held
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-sage mt-1 font-ledger">
            ₹{totalVaultBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Refundable customer deposits
          </div>
        </div>
      </div>

      {/* SECTION: Statutory Default, Legal Notices & Repossession Simulator */}
      {(() => {
        const simBooking = bookings.find((b) => b.id === simBookingId) || bookings[0];
        const bookingInvoices = invoices.filter((i) => i.bookingId === simBooking?.id);
        const targetInvoice =
          bookingInvoices.find((i) => i.chargeType === 'PERIODIC_RENTAL_INVOICE' && i.paymentState !== 'Successful') ||
          bookingInvoices.find((i) => i.chargeType === 'PERIODIC_RENTAL_INVOICE') ||
          bookingInvoices[0];
        const latestNotice = simBooking?.defaultNotices?.slice(-1)[0];

        return (
          <div className="rounded-3xl bg-gradient-to-r from-rose-950/20 via-amber-950/20 to-orange-950/20 border-2 border-rose-400 p-6 shadow-hearth space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hearth-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-700 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
                    <span>Default Escalation & Repossession Simulator</span>
                    <span className="px-2 py-0.5 rounded-pill bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold">
                      Appendix C & Section 4
                    </span>
                  </h2>
                  <p className="text-xs text-hearth-umber">
                    Simulate real-time progression: Notice 1 (T+1 Reminder) → Notice 2 (T+5 Default & ₹500 Late Fee) → Notice 3 (T+11 Termination & Repossession).
                  </p>
                </div>
              </div>

              {/* Booking Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-hearth-ink">
                  Target Booking:
                </label>
                <select
                  value={simBookingId}
                  onChange={(e) => setSimBookingId(e.target.value)}
                  className="px-3.5 py-1.5 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white text-hearth-ink font-sans font-normal">
                      {b.id} — {b.customerName} ({b.productTitle.slice(0, 20)}) • {b.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {simBooking && (
              <div className="space-y-3 text-xs">
                {/* Active Booking Telemetry Bar */}
                <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-hearth-ink">{simBooking.id}</span>
                    <span className="font-semibold text-hearth-ink">{simBooking.customerName}</span>
                    <span className="text-hearth-taupe font-mono">Invoice: {targetInvoice?.id || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                      Status: {simBooking.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-rose-100 text-rose-800 text-[11px] font-bold">
                      Notices Dispatched: {simBooking.defaultNotices?.length || 0}
                    </span>
                    {latestNotice?.agentAuthCode && (
                      <span className="px-2.5 py-0.5 rounded-pill bg-red-700 text-white font-mono text-[11px] font-bold">
                        {latestNotice.agentAuthCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulator Action Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                  <button
                    disabled={isSimulatingLatency || !targetInvoice}
                    onClick={() => {
                      if (!targetInvoice) return;
                      triggerDefaultNotice({
                        bookingId: simBooking.id,
                        invoiceId: targetInvoice.id,
                        targetStage: 1,
                      });
                    }}
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-left transition-all space-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Stage 1: T+1 Reminder</span>
                    </div>
                    <div className="text-[10px] text-amber-800">
                      Courtesy notice • 3 days cure
                    </div>
                  </button>

                  <button
                    disabled={isSimulatingLatency || !targetInvoice}
                    onClick={() => {
                      if (!targetInvoice) return;
                      triggerDefaultNotice({
                        bookingId: simBooking.id,
                        invoiceId: targetInvoice.id,
                        targetStage: 2,
                      });
                    }}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-semibold text-left transition-all space-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                      <span>Stage 2: T+5 Formal</span>
                    </div>
                    <div className="text-[10px] text-rose-800">
                      ₹500 Late Fee & Restrict Account
                    </div>
                  </button>

                  <button
                    disabled={isSimulatingLatency || !targetInvoice}
                    onClick={() => {
                      if (!targetInvoice) return;
                      triggerDefaultNotice({
                        bookingId: simBooking.id,
                        invoiceId: targetInvoice.id,
                        targetStage: 3,
                      });
                    }}
                    className="p-3 rounded-2xl bg-red-900 hover:bg-red-950 text-white border border-red-950 font-semibold text-left transition-all space-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-200" />
                      <span>Stage 3: T+11 Terminate</span>
                    </div>
                    <div className="text-[10px] text-red-200">
                      Revoke License & Demand Repossession
                    </div>
                  </button>

                  <button
                    disabled={isSimulatingLatency}
                    onClick={() => {
                      reportRepossessionObstruction({
                        bookingId: simBooking.id,
                        refusalReason: 'Customer barred gate, refused surrender of asset, and disputed return policy.',
                      });
                    }}
                    className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-semibold text-left transition-all space-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <XCircle className="w-3.5 h-3.5 text-purple-700" />
                      <span>Report Refusal (EX-035)</span>
                    </div>
                    <div className="text-[10px] text-purple-800">
                      Enforce Hostile Retention Blacklist
                    </div>
                  </button>

                  <button
                    disabled={isSimulatingLatency || !targetInvoice}
                    onClick={() => {
                      if (!targetInvoice) return;
                      curePaymentDefault({
                        bookingId: simBooking.id,
                        invoiceId: targetInvoice.id,
                      });
                    }}
                    className="p-3 rounded-2xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#166534] border border-[#86EFAC] font-semibold text-left transition-all space-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                      <span>Cure Default Payment</span>
                    </div>
                    <div className="text-[10px] text-[#166534]">
                      Reconcile Invoice & Lift Restrictions
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SECTION: Vendor Voluntary Offboarding & Run-Off Governance (Workflow WF-14 & Option A) */}
      {(() => {
        const simVendor =
          vendors.find((v) => v.id === simVendorId) || vendors[0];
        const activeRentalsForVendor = bookings.filter(
          (b) =>
            b.fulfillingVendorId === simVendor?.id &&
            b.status !== 'Completed' &&
            b.status !== 'Returned & Closed' &&
            b.status !== 'Cancelled'
        );
        const isRunOff = simVendor?.status === 'Offboarding - Run-Off';
        const isClosed = simVendor?.status === 'Closed / Offboarded';
        const isAdverselyTerminated =
          simVendor?.status === 'Adversely Terminated / Blacklisted';
        const heldReserve =
          simVendor?.settlementReserveHeldAmount ||
          simVendor?.settlementHoldAmount ||
          15000;

        return (
          <div className="rounded-3xl bg-gradient-to-r from-amber-950/20 via-orange-950/20 to-stone-900/30 border-2 border-amber-400 p-6 shadow-hearth space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hearth-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
                    <span>Vendor Voluntary Offboarding & Run-Off Governance</span>
                    <span className="px-2 py-0.5 rounded-pill bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                      Workflow WF-14 / Option A
                    </span>
                  </h2>
                  <p className="text-xs text-hearth-umber">
                    Simulate & supervise "Run-Off to Expiry" (FR-VEN-009), Scoped Operations Mode (FR-VEN-011), Emergency Breach Takeover (EX-036), and Amicable Closure (FR-VEN-015).
                  </p>
                </div>
              </div>

              {/* Vendor Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-hearth-ink">
                  Target Partner:
                </label>
                <select
                  value={simVendorId}
                  onChange={(e) => setSimVendorId(e.target.value)}
                  className="px-3.5 py-1.5 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id} className="bg-white text-hearth-ink font-sans font-normal">
                      {v.id} — {v.displayName} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {simVendor && (
              <div className="space-y-3 text-xs">
                {/* Active Vendor Telemetry Bar */}
                <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-hearth-ink">{simVendor.id}</span>
                    <span className="font-semibold text-hearth-ink">{simVendor.legalBusinessName}</span>
                    <span className="text-hearth-taupe font-mono text-[11px]">
                      GSTIN: {simVendor.taxIdGstin}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-0.5 rounded-pill text-[11px] font-mono font-bold border ${
                        isRunOff
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : isClosed
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : isAdverselyTerminated
                          ? 'bg-red-700 text-white border-red-800'
                          : 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                      }`}
                    >
                      Status: {simVendor.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                      Active Field Rentals: {activeRentalsForVendor.length}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                      Segregated Reserve: ₹{heldReserve.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Simulator Action Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Action 1: WF-14 Initiate Run-Off */}
                  <button
                    disabled={isSimulatingLatency || isRunOff || isClosed}
                    onClick={() => initiateVendorVoluntaryOffboarding(simVendor.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 shadow-sm ${
                      !isRunOff && !isClosed
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                        : 'bg-hearth-oat text-hearth-taupe border-hearth-border opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <LogOut className="w-4 h-4 text-amber-700" />
                      <span>1. Initiate Run-Off to Expiry (WF-14)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Delist public catalog immediately (FR-VEN-010) & restrict portal to scoped operations mode (FR-VEN-011).
                    </p>
                  </button>

                  {/* Action 2: EX-036 Breach Takeover */}
                  <button
                    disabled={isSimulatingLatency || !isRunOff}
                    onClick={() => setShowBreachModal(true)}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 shadow-sm ${
                      isRunOff
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300'
                        : 'bg-hearth-oat text-hearth-taupe border-hearth-border opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertOctagon className="w-4 h-4 text-rose-700" />
                      <span>2. Emergency Breach Takeover (EX-036)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Reassign emergency fleet for field servicing, forfeit held reserve, and enroll partner into Blacklist (FR-BLK-002).
                    </p>
                  </button>

                  {/* Action 3: FR-VEN-015 Amicable Closure */}
                  <button
                    disabled={isSimulatingLatency || !isRunOff}
                    onClick={() => completeVendorAmicableOffboarding(simVendor.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 shadow-sm ${
                      isRunOff
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-hearth-oat text-hearth-taupe border-hearth-border opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>3. Finalize Amicable Closure (FR-VEN-015)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Disburse segregated settlement reserve, close vendor account, and confirm Blacklist Immunity (BR-035).
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SECTION 1: Pending Inventory Updates */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hearth-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              Pending Inventory Updates
            </h2>
            <p className="text-xs text-hearth-umber">
              Review stock and availability updates submitted by partner vendors.
            </p>
          </div>
        </div>

        {stagedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-hearth-oat text-center text-xs text-hearth-taupe">
            All pending inventory updates have been reviewed.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stagedItems.map((inv) => {
              const req = inv.pendingStagedRequest!;
              const reasonVal =
                adminReasonByInv[inv.id] ||
                'Reviewed vendor inventory update.';

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
                            {inv.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] text-[10px] font-semibold">
                            Pending Review
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-hearth-ink mt-0.5">
                          {inv.productTitle}
                        </h3>
                        <div className="text-[11px] text-hearth-taupe">
                          Partner: <strong>{req.vendorName}</strong> ({req.submittedAt})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current vs Requested */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0]">
                      <div className="text-[10px] font-mono uppercase text-[#166534] font-bold">
                        Current Status
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        {inv.livePublicEnabled ? 'Active' : 'Paused'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Stock: {inv.declaredQuantity} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe">
                        Partner: {inv.owningVendorName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFEDD5]/60 border border-[#FED7AA]">
                      <div className="text-[10px] font-mono uppercase text-[#9A3412] font-bold">
                        Requested Update
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        {req.requestedPublicEnabled ? 'Active' : 'Pause Listing'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Stock: {req.requestedDeclaredStock} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe truncate">
                        "{req.vendorNotes}"
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  <div className="space-y-3 pt-2 border-t border-hearth-border text-xs">
                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Notes *
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
                        <span>Approve</span>
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
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Product Pricing & Partner Vendors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
        <div className="xl:col-span-5 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-hearth-ink">
                Product Pricing
              </h3>
            </div>
            <Sliders className="w-5 h-5 text-hearth-terracotta" />
          </div>

          <p className="text-xs text-hearth-umber">
            Manage monthly rental prices, security deposits, and home installation fees.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Select Product
              </label>
              <select
                value={selectedPricingProductId}
                onChange={(e) => handleSelectPricingProduct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-semibold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
              >
                {masterProducts.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-hearth-ink font-sans font-normal">
                    {p.sku} — {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Monthly Rent (₹)
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
                  Deposit (Months)
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

            {/* Read-only Agreed Platform-Vendor Rate */}
            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Agreed Platform–Vendor Price / month
              </label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#DCFCE7]/40 border border-[#86EFAC] text-hearth-ink">
                <div>
                  <span className="font-ledger font-bold text-sm text-[#166534]">
                    ₹{(
                      vendorProductRates.find((r) => r.productId === selectedPricingProductId)?.agreedMonthlyRate ??
                      Math.round(selectedProd.baseMonthlyRent * 0.75)
                    ).toLocaleString('en-IN')}
                    /mo
                  </span>
                  <div className="text-[10px] text-hearth-taupe">
                    Contracted vendor disbursement rate
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
                  Read-Only
                </span>
              </div>
            </div>

            {selectedProd.workflowType === 'SITE_VISIT_MULTI_STEP' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Home Visit Fee (₹)
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
                Notes *
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
              Save Pricing
            </button>
          </div>
        </div>

        {/* SECTION 3: Partner Vendors */}
        <div className="xl:col-span-7 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-hearth-ink">
                Partner Vendors
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
                            : v.status === 'Offboarding - Run-Off'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                            : v.status === 'Closed / Offboarded'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold'
                            : v.status === 'Adversely Terminated / Blacklisted'
                            ? 'bg-red-700 text-white font-bold'
                            : v.status.includes('Terminat')
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FFEDD5] text-[#9A3412]'
                        }`}
                      >
                        {v.status === 'Terminating — Continuity Active'
                          ? 'Contract Ended'
                          : v.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-hearth-taupe mt-0.5">
                      GSTIN: {v.taxIdGstin} • PAN: {v.panNumber} • Bank: {v.bankAccountMasked}
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
                              'Approved partner registration.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-hearth-sage text-white text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            reviewVendorApplication(
                              v.id,
                              'Rejected',
                              'Rejected due to match with a previously blocked vendor.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-[#991B1B] text-white text-[11px] font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {v.status === 'Approved' && (
                      <button
                        onClick={() => setTerminatingVendorId(v.id)}
                        className="px-3 py-1.5 rounded-pill bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border border-[#FECACA] text-[11px] font-semibold"
                      >
                        End Contract
                      </button>
                    )}
                  </div>
                </div>

                {/* Duplicate Match Warning */}
                {v.blacklistMatchWarning && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        Matches Blocked Vendor ({v.blacklistMatchWarning.matchedVendorId})
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <strong>Matched Details:</strong>{' '}
                      {v.blacklistMatchWarning.matchedFields.join(' • ')}
                    </div>
                    <div className="text-[11px]">
                      <strong>Reason:</strong>{' '}
                      {v.blacklistMatchWarning.priorTerminationReason}
                    </div>
                  </div>
                )}

                {v.continuityManager && (
                  <div className="text-[11px] font-mono text-[#9A3412] bg-[#FFEDD5] px-3 py-1.5 rounded-xl">
                    Replacement Partner: {v.continuityManager} | Held Payout: ₹{v.settlementHoldAmount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Partner Contract Modal */}
      {terminatingVendorId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">
                End Partner Contract
              </h3>
            </div>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Ending the contract for <strong>{terminatingVendorId}</strong> will pause their public listings, hold pending payouts until active rentals finish, and add the account to Blocked Accounts.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Replacement Partner for Active Rentals *
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
                  Reason *
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EX-036 Emergency Breach Takeover Modal */}
      {showBreachModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border-2 border-red-500 p-6 shadow-hearth-lg space-y-4">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-lg font-bold">
                Emergency Breach Takeover (EX-036)
              </h3>
            </div>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Execute emergency fleet takeover for <strong>{simVendorId}</strong>. This will immediately forfeit the segregated settlement reserve and enroll the vendor and registered tax credentials into the Unified Blacklist (FR-BLK-002).
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Assigned Emergency Partner Fleet *
                </label>
                <input
                  type="text"
                  value={breachPartner}
                  onChange={(e) => setBreachPartner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                />
              </div>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Breach Justification & Evidence *
                </label>
                <textarea
                  rows={3}
                  value={breachJustification}
                  onChange={(e) => setBreachJustification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBreachModal(false)}
                className="px-4 py-2 rounded-pill bg-hearth-oat text-xs"
              >
                Cancel
              </button>
              <button
                disabled={isSimulatingLatency}
                onClick={async () => {
                  await triggerVendorBreachTakeover({
                    vendorId: simVendorId,
                    justification: breachJustification,
                    emergencyPartnerName: breachPartner,
                  });
                  setShowBreachModal(false);
                }}
                className="px-5 py-2 rounded-pill bg-[#991B1B] hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Confirm Breach Takeover & Blacklist</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
