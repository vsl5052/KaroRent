import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Gavel,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { AgreementReaderModal } from '../customer/AgreementReaderModal';
import { mandatoryReasonSchema } from '../../lib/validation';

export const ThreeWayInspectionView: React.FC = () => {
  const {
    bookings,
    depositLedgers,
    activePersona,
    submitWarehouseInspection,
    customerDisputeInspectionFinding,
    resolveDisputeAndSettleDeposit,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const returnBookings = bookings.filter((b) => b.returnRecord);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    returnBookings[0]?.id || 'BKG-2026-8790'
  );

  // Warehouse Inspection Form State
  const [findingType, setFindingType] = useState<
    | 'Normal Wear'
    | 'Customer Damage'
    | 'Transit Damage (Vendor Fault)'
    | 'Missing Accessory'
    | 'Severe Damage / Loss'
  >('Customer Damage');
  const [proposedAmount, setProposedAmount] = useState<number>(1200);
  const [wasInPickupPhoto, setWasInPickupPhoto] = useState<boolean>(false);
  const [inspectionNotes, setInspectionNotes] = useState<string>(
    'Rear lower oak leg shows 4cm surface scuff upon warehouse unloading.'
  );

  // Customer Dispute Form State
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState(
    'The verified EXIF doorstep pickup photo taken at 14:22 IST clearly shows zero scuff at handover. Under our Doorstep Handover Protection Policy, transit scuffs cannot be deducted from my deposit.'
  );

  // Platform Mediator Resolution Form State
  const [mediatorApprovedAmount, setMediatorApprovedAmount] = useState<number>(0);
  const [mediatorNotes, setMediatorNotes] = useState<string>(
    'Verified 3-way EXIF evidence: doorstep pickup photo shows pristine condition at customer handover. Deduction disallowed; full deposit refund approved.'
  );
  const [triggerBlacklistOnResolve, setTriggerBlacklistOnResolve] =
    useState<boolean>(false);

  const activeBooking =
    returnBookings.find((b) => b.id === selectedBookingId) || returnBookings[0];
  const returnRec = activeBooking?.returnRecord;
  const ledger = depositLedgers.find((d) => d.bookingId === activeBooking?.id);

  if (!activeBooking || !returnRec) return null;

  const originalDeposit =
    ledger?.collectedDeposit || activeBooking.securityDepositAmount;
  const currentDeduction =
    returnRec.approvedDeductionAmount || returnRec.proposedDeductionAmount || 0;
  const netRefund = Math.max(0, originalDeposit - currentDeduction);

  const handleRunWarehouseInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = mandatoryReasonSchema.safeParse(inspectionNotes);
    if (!valid.success) {
      addToast({
        title: 'Inspection Evidence Note Required',
        description: valid.error.errors[0].message,
        variant: 'error',
      });
      return;
    }

    await submitWarehouseInspection({
      bookingId: activeBooking.id,
      warehousePhotoUrl:
        returnRec.warehouseReturnPhoto ||
        'https://images.unsplash.com/photo-1540518614846-7ede433c4573?auto=format&fit=crop&w=700&q=80',
      finding: findingType,
      findingDescription: inspectionNotes,
      proposedDeduction: findingType === 'Normal Wear' ? 0 : proposedAmount,
      wasPresentInDoorstepPickupPhoto: wasInPickupPhoto,
    });
  };

  const handleCustomerDispute = async () => {
    const valid = mandatoryReasonSchema.safeParse(disputeReason);
    if (!valid.success) {
      addToast({
        title: 'Dispute Reason Required',
        description: valid.error.errors[0].message,
        variant: 'error',
      });
      return;
    }
    await customerDisputeInspectionFinding(activeBooking.id, disputeReason);
    setShowDisputeInput(false);
  };

  const handleMediatorDecision = async () => {
    const valid = mandatoryReasonSchema.safeParse(mediatorNotes);
    if (!valid.success) {
      addToast({
        title: 'Mediator Rationale Required',
        description: valid.error.errors[0].message,
        variant: 'error',
      });
      return;
    }
    await resolveDisputeAndSettleDeposit({
      bookingId: activeBooking.id,
      finalApprovedDeduction: mediatorApprovedAmount,
      mediatorDecisionNotes: mediatorNotes,
      enrollCustomerInBlacklist: triggerBlacklistOnResolve,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Selector Bar */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
            3-Way EXIF Evidence & Deposit Protection
          </span>
          <h1 className="font-serif text-2xl font-bold text-hearth-ink mt-1">
            Three-Way Condition Storyboard & Fair Deposit Settlement Console
          </h1>
          <p className="text-xs text-hearth-umber">
            Compares (1) Pre-Dispatch, (2) Customer-Premise EXIF Handover Photo, and (3) Partner Warehouse Return Photo to eliminate unfair transit damage deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-hearth-ink">
            Inspect Return Case:
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="px-4 py-2 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-mono font-semibold text-hearth-ink focus:outline-none"
          >
            {returnBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.productTitle.slice(0, 28)} ({b.returnRecord?.pickupStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual-Column Layout (Left: Stationery Agreement Reader | Right: 3-Way Condition Storyboard & Deposit Receipt) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* Left 6 Columns: Stationery Rental Agreement & E-Signature Reader */}
        <div className="xl:col-span-6 space-y-3">
          <h2 className="font-serif text-lg font-bold text-hearth-ink">
            Rental Agreement & E-Signature Reader
          </h2>
          <AgreementReaderModal inlineMode={true} />
        </div>

        {/* Right 6 Columns: Condition Comparison Storyboard & Fair Deposit Settlement */}
        <div className="xl:col-span-6 space-y-3">
          <h2 className="font-serif text-lg font-bold text-hearth-ink">
            Condition Comparison Storyboard & Fair Deposit Settlement
          </h2>

          <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden">
            {/* 3-Column Photo Storyboard */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Photo 1: Before Delivery */}
                <div className="space-y-2 text-center">
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-hearth-border bg-hearth-oat shadow-sm">
                    <img
                      src={returnRec.preDispatchPhoto}
                      alt="Before Delivery"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill bg-black/70 text-white text-[10px] font-mono">
                      1. Pre-Dispatch
                    </span>
                  </div>
                  <div className="text-xs font-bold text-hearth-ink">
                    Before Delivery
                  </div>
                  <div className="text-[10px] text-hearth-taupe leading-snug">
                    {returnRec.preDispatchNotes}
                  </div>
                </div>

                {/* Photo 2: At Doorstep Pickup [EXIF Verified] */}
                <div className="space-y-2 text-center">
                  <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-hearth-sage bg-hearth-oat shadow-sm">
                    {returnRec.customerPremisePickupPhoto ? (
                      <>
                        <img
                          src={returnRec.customerPremisePickupPhoto}
                          alt="At Doorstep Pickup"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 inset-x-2 px-2 py-0.5 rounded-pill bg-[#166534]/90 text-white text-[9px] font-mono truncate">
                          ✓ EXIF Verified Handover
                        </span>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#FEE2E2] text-[#991B1B] text-[11px] font-semibold">
                        <AlertTriangle className="w-6 h-6 mb-1" />
                        <span>Missing Doorstep Photo (Pickup Gate Locked)</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-hearth-ink">
                    At Doorstep Pickup
                    <div className="text-[11px] font-mono text-hearth-sage font-semibold">
                      [EXIF Verified]
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-hearth-taupe leading-snug">
                    {returnRec.pickupPhotoExifTimestamp ||
                      'Awaiting field staff capture at customer premises'}
                  </div>
                </div>

                {/* Photo 3: At Partner Warehouse */}
                <div className="space-y-2 text-center">
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-hearth-border bg-hearth-oat shadow-sm">
                    <img
                      src={
                        returnRec.warehouseReturnPhoto ||
                        returnRec.preDispatchPhoto
                      }
                      alt="At Partner Warehouse"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill bg-black/70 text-white text-[10px] font-mono">
                      3. Warehouse
                    </span>
                  </div>
                  <div className="text-xs font-bold text-hearth-ink">
                    At Partner Warehouse
                  </div>
                  <div className="text-[10px] text-hearth-taupe leading-snug">
                    Finding: <strong>{returnRec.warehouseInspectionFinding || 'Pending Intake'}</strong>
                  </div>
                </div>
              </div>

              {/* Protection Notice if Transit Damage was Blocked */}
              {returnRec.transitDamageBlockedByBR026 && (
                <div className="p-3.5 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      Customer Deposit Protected by Doorstep Handover Policy!
                    </div>
                    <p className="text-[11px] mt-0.5">
                      {returnRec.findingDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Finding Summary Note */}
              {!returnRec.transitDamageBlockedByBR026 &&
                returnRec.findingDescription && (
                  <div className="p-3.5 rounded-2xl bg-hearth-oat border border-hearth-border text-xs text-hearth-umber">
                    <span className="font-semibold text-hearth-ink">
                      Three-Way Inspection Outcome:{' '}
                    </span>
                    {returnRec.findingDescription}
                  </div>
                )}
            </div>

            {/* Bottom Deposit Settlement Receipt */}
            <div className="bg-[#F3EFE6] dark:bg-hearth-oat px-6 py-5 border-t border-hearth-border space-y-3">
              <div className="flex items-center justify-between text-sm text-hearth-ink">
                <span className="font-medium">Original Deposit:</span>
                <span className="font-ledger font-bold text-base">
                  ₹{originalDeposit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-hearth-ink">
                <span className="font-medium">
                  Deductions ({returnRec.warehouseInspectionFinding || 'Normal Wear'}):
                </span>
                <span className="font-ledger font-bold text-base">
                  ₹{currentDeduction.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 border-t border-hearth-border flex items-center justify-between text-base font-bold text-hearth-ink">
                <span>Full Refund:</span>
                <span className="font-ledger text-xl text-hearth-sage">
                  ₹{netRefund.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowDisputeInput(!showDisputeInput)}
                  className="spring-btn px-7 py-2.5 rounded-pill bg-[#B85D3B] hover:bg-hearth-terracotta text-white text-xs font-semibold shadow-sm"
                >
                  Dispute This Finding
                </button>
                <span className="text-[11px] font-mono text-hearth-taupe">
                  Status: {returnRec.customerResponse || 'Accepted'} • Refunded in 14 Days
                </span>
              </div>

              {/* Customer Dispute Input Drawer */}
              {showDisputeInput && (
                <div className="mt-4 p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-3">
                  <div className="text-xs font-bold text-hearth-ink">
                    Submit Customer Inspection Dispute
                  </div>
                  <textarea
                    rows={2}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs text-hearth-ink"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDisputeInput(false)}
                      className="px-3 py-1.5 rounded-pill bg-hearth-oat text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSimulatingLatency}
                      onClick={handleCustomerDispute}
                      className="px-4 py-1.5 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
                    >
                      Freeze Deduction & Escalate to Mediator
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Strip: Warehouse Transit Gate & Platform Mediator Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Warehouse Inspector Simulator */}
        <form
          onSubmit={handleRunWarehouseInspection}
          className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-hearth-terracotta" />
              <h3 className="font-serif text-base font-bold text-hearth-ink">
                Partner Warehouse Inspection & Transit Protection Gate
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
              3-Way Evidence Check
            </span>
          </div>

          <p className="text-xs text-hearth-umber">
            Try proposing a ₹1,200 warehouse damage charge while leaving{" "}
            <strong>"Visible in Doorstep Pickup Photo"</strong> unchecked to see how our{" "}
            <strong>Doorstep Handover Protection</strong> automatically protects the customer's deposit!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                Wear vs. Damage Classification
              </label>
              <select
                value={findingType}
                onChange={(e) => setFindingType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs text-hearth-ink"
              >
                <option value="Normal Wear">Normal Wear (₹0 Charge)</option>
                <option value="Customer Damage">Customer Damage</option>
                <option value="Transit Damage (Vendor Fault)">
                  Transit Damage (Vendor Fault — ₹0 Customer Charge)
                </option>
                <option value="Missing Accessory">Missing Accessory</option>
                <option value="Severe Damage / Loss">Severe Damage / Loss</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                Proposed Deduction Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={proposedAmount}
                onChange={(e) => setProposedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs font-ledger text-hearth-ink"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-hearth-sageLight border border-hearth-sage/30 text-xs text-hearth-ink cursor-pointer">
            <input
              type="checkbox"
              checked={wasInPickupPhoto}
              onChange={(e) => setWasInPickupPhoto(e.target.checked)}
              className="rounded text-hearth-sage"
            />
            <span>
              <strong>Doorstep Evidence Check:</strong> Was this damage clearly documented in the verified Customer-Premise EXIF Pickup Photo? (If unchecked, transit damage presumption blocks deduction!)
            </span>
          </label>

          <div>
            <label className="block text-xs font-semibold text-hearth-ink mb-1">
              Warehouse Inspection Notes *
            </label>
            <input
              type="text"
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs text-hearth-ink"
            />
          </div>

          <button
            type="submit"
            disabled={isSimulatingLatency}
            className="spring-btn w-full py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm"
          >
            Run 3-Way Comparison & Calculate Proposed Deduction
          </button>
        </form>

        {/* Panel 2: Platform Mediator Final Settlement & Direct Blacklist Trigger */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-hearth-sage" />
              <h3 className="font-serif text-base font-bold text-hearth-ink">
                Platform Mediator Ruling & Deposit Vault Release
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-sageLight text-hearth-sage font-semibold">
              Mediator Console
            </span>
          </div>

          <p className="text-xs text-hearth-umber">
            Record final approved deduction, execute net deposit refund, and optionally trigger{" "}
            <strong>Immediate Customer Blacklisting</strong> if severe intentional damage is confirmed.
          </p>

          <div>
            <label className="block text-xs font-semibold text-hearth-ink mb-1">
              Final Approved Deposit Deduction (₹) — Excess over ₹{originalDeposit} auto-generates Adjustment Invoice #5
            </label>
            <input
              type="number"
              min={0}
              value={mediatorApprovedAmount}
              onChange={(e) => setMediatorApprovedAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs font-ledger text-hearth-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-hearth-ink mb-1">
              Mediator Policy Rationale & Audit Note *
            </label>
            <input
              type="text"
              value={mediatorNotes}
              onChange={(e) => setMediatorNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs text-hearth-ink"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA] text-xs text-[#991B1B] cursor-pointer">
            <input
              type="checkbox"
              checked={triggerBlacklistOnResolve}
              onChange={(e) => setTriggerBlacklistOnResolve(e.target.checked)}
              className="rounded text-[#991B1B]"
            />
            <span>
              <strong>Trust & Safety Risk Action:</strong> Finding involves severe/intentional damage or asset loss — Enroll Customer into Unified Customer Blacklist immediately upon resolution.
            </span>
          </label>

          <button
            type="button"
            disabled={isSimulatingLatency}
            onClick={handleMediatorDecision}
            className="spring-btn w-full py-2.5 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold shadow-sm"
          >
            Approve Final Settlement & Release Net Vault Refund
          </button>
        </div>
      </div>
    </div>
  );
};
