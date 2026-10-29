import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { mandatoryReasonSchema } from '../../lib/validation';

interface StagePhotoGalleryProps {
  stageBadge: string;
  title: string;
  subtitle: React.ReactNode;
  photos: string[];
  verifiedBadgeText?: string;
  highlightBorder?: boolean;
  emptyText?: string;
}

const StagePhotoGallery: React.FC<StagePhotoGalleryProps> = ({
  stageBadge,
  title,
  subtitle,
  photos,
  verifiedBadgeText,
  highlightBorder = false,
  emptyText = 'Awaiting Photos',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = photos.length > 0 ? activeIndex % photos.length : 0;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="space-y-2.5 text-center">
      <div
        className={`relative h-52 rounded-2xl overflow-hidden bg-hearth-oat shadow-sm ${
          highlightBorder
            ? 'border-2 border-hearth-sage'
            : 'border border-hearth-border'
        }`}
      >
        {photos.length > 0 ? (
          <>
            <img
              src={photos[safeIndex]}
              alt={`${title} - Photo ${safeIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-200"
            />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-pill bg-black/70 text-white text-[10px] font-medium">
              {stageBadge}
            </span>
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-pill bg-black/70 text-white text-[10px] font-mono">
              {safeIndex + 1} / {photos.length}
            </span>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center shadow transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center shadow transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {verifiedBadgeText && (
              <span className="absolute bottom-2.5 inset-x-2.5 px-2.5 py-0.5 rounded-pill bg-[#166534]/90 text-white text-[10px] font-medium truncate">
                {verifiedBadgeText}
              </span>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold">
            <AlertTriangle className="w-6 h-6 mb-1" />
            <span>{emptyText}</span>
          </div>
        )}
      </div>

      {/* Multi-Image Thumbnails */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {photos.map((photoUrl, idx) => (
            <button
              key={`${photoUrl}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`w-11 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                safeIndex === idx
                  ? 'border-hearth-terracotta scale-105 shadow-sm'
                  : 'border-hearth-border opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={photoUrl}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="text-xs font-bold text-hearth-ink">{title}</div>
      <div className="text-[11px] text-hearth-taupe leading-snug">{subtitle}</div>
    </div>
  );
};

export const ThreeWayInspectionView: React.FC = () => {
  const {
    bookings,
    depositLedgers,
    disputeCases,
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
    'The pickup photos taken at my doorstep clearly show the item was in good condition when handed over.'
  );

  // Resolution Form State
  const [mediatorApprovedAmount, setMediatorApprovedAmount] = useState<number>(0);
  const [mediatorNotes, setMediatorNotes] = useState<string>(
    'Pickup photos confirm item was in good condition at handover. Full deposit refund approved.'
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

  const beforeDeliveryPhotos =
    returnRec.preDispatchPhotos && returnRec.preDispatchPhotos.length > 0
      ? returnRec.preDispatchPhotos
      : [returnRec.preDispatchPhoto];

  const doorstepPickupPhotos =
    returnRec.customerPremisePickupPhotos &&
    returnRec.customerPremisePickupPhotos.length > 0
      ? returnRec.customerPremisePickupPhotos
      : returnRec.customerPremisePickupPhoto
      ? [returnRec.customerPremisePickupPhoto]
      : [];

  const warehousePhotos =
    returnRec.warehouseReturnPhotos &&
    returnRec.warehouseReturnPhotos.length > 0
      ? returnRec.warehouseReturnPhotos
      : [returnRec.warehouseReturnPhoto || returnRec.preDispatchPhoto];

  const linkedDispute = disputeCases.find((d) => d.bookingId === activeBooking.id);
  const hasCustomerDispute = returnRec.customerResponse === 'Disputed' || Boolean(linkedDispute);
  const disputeNotes = returnRec.customerDisputeNotes || linkedDispute?.customerResponseText;

  const handleRunWarehouseInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = mandatoryReasonSchema.safeParse(inspectionNotes);
    if (!valid.success) {
      addToast({
        title: 'Notes Required',
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
        title: 'Reason Required',
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
        title: 'Notes Required',
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

  const isStaffOrAdmin =
    activePersona.role === 'VENDOR_OWNER' ||
    activePersona.role === 'PLATFORM_ADMIN';

  return (
    <div className="space-y-8">
      {/* Top Selector Bar */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-hearth-ink">
            {activePersona.role === 'VENDOR_OWNER'
              ? 'Returned Products'
              : 'Returns'}
          </h1>
          <p className="text-xs text-hearth-umber mt-0.5">
            {activePersona.role === 'VENDOR_OWNER'
              ? 'Review return pickup photos and log warehouse condition checks.'
              : 'Review return pickup photos, item condition, and deposit refunds.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-hearth-ink">
            {activePersona.role === 'VENDOR_OWNER'
              ? 'Select Returned Product:'
              : 'Select Return:'}
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="px-4 py-2 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
          >
            {returnBookings.map((b) => (
              <option key={b.id} value={b.id} className="bg-white text-hearth-ink font-sans font-normal">
                {b.id} — {b.productTitle.slice(0, 28)} ({b.returnRecord?.pickupStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Return Condition & Refund Card */}
      <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold text-hearth-ink">
                {activeBooking.productTitle}
              </h2>
              <p className="text-xs text-hearth-taupe">
                Order {activeBooking.id}
              </p>
            </div>
            <span className="px-3 py-1 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-semibold text-hearth-ink">
              {returnRec.pickupStatus}
            </span>
          </div>

          {/* 3-Stage Multi-Photo Condition Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Stage 1: Before Delivery */}
            <StagePhotoGallery
              key={`${activeBooking.id}-before`}
              stageBadge="1. Before Delivery"
              title="Before Delivery"
              subtitle={returnRec.preDispatchNotes}
              photos={beforeDeliveryPhotos}
            />

            {/* Stage 2: At Doorstep Pickup */}
            <StagePhotoGallery
              key={`${activeBooking.id}-pickup`}
              stageBadge="2. At Doorstep Pickup"
              title="At Doorstep Pickup"
              subtitle={
                returnRec.pickupPhotoExifTimestamp ||
                'Photos taken at your doorstep during pickup'
              }
              photos={doorstepPickupPhotos}
              verifiedBadgeText="✓ Verified at Pickup"
              highlightBorder
              emptyText="Awaiting Pickup Photos"
            />

            {/* Stage 3: At Warehouse */}
            <StagePhotoGallery
              key={`${activeBooking.id}-warehouse`}
              stageBadge="3. At Warehouse"
              title="At Warehouse"
              subtitle={
                <span>
                  Condition:{' '}
                  <strong>
                    {returnRec.warehouseInspectionFinding || 'Pending Check'}
                  </strong>
                </span>
              }
              photos={warehousePhotos}
            />
          </div>

          {returnRec.transitDamageBlockedByBR026 && (
            <div className="p-3.5 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Deposit Protected — No Charge for Transit Scuffs
                </div>
                <p className="text-[11px] mt-0.5">
                  {returnRec.findingDescription}
                </p>
              </div>
            </div>
          )}

          {!returnRec.transitDamageBlockedByBR026 &&
            returnRec.findingDescription && (
              <div className="p-3.5 rounded-2xl bg-hearth-oat border border-hearth-border text-xs text-hearth-umber">
                <span className="font-semibold text-hearth-ink">
                  Inspection Summary:{' '}
                </span>
                {returnRec.findingDescription}
              </div>
            )}
        </div>

        {/* Deposit Refund Breakdown */}
        <div className="bg-[#F3EFE6] dark:bg-hearth-oat px-6 py-5 border-t border-hearth-border space-y-3">
          <div className="flex items-center justify-between text-sm text-hearth-ink">
            <span className="font-medium">Original Deposit:</span>
            <span className="font-ledger font-bold text-base">
              ₹{originalDeposit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-hearth-ink">
            <span className="font-medium">
              Deductions ({returnRec.warehouseInspectionFinding || 'None'}):
            </span>
            <span className="font-ledger font-bold text-base">
              ₹{currentDeduction.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-3 border-t border-hearth-border flex items-center justify-between text-base font-bold text-hearth-ink">
            <span>Total Refund:</span>
            <span className="font-ledger text-xl text-hearth-sage">
              ₹{netRefund.toLocaleString('en-IN')}
            </span>
          </div>

          {activePersona.role === 'PLATFORM_ADMIN' ? (
            <div className="pt-3 border-t border-hearth-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-hearth-taupe font-medium">Customer Dispute Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    hasCustomerDispute
                      ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                      : 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                  }`}
                >
                  {hasCustomerDispute ? 'Dispute Raised by Customer' : 'No Dispute Raised'}
                </span>
              </div>
              {hasCustomerDispute ? (
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#991B1B]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Customer Raised Dispute
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#991B1B] font-semibold border border-[#FECACA]">
                      {linkedDispute?.id || 'DSP-ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-[#7F1D1D] italic bg-white/70 p-2.5 rounded-xl border border-[#FECACA]/60">
                    "{disputeNotes || 'Customer raised an objection against the proposed deductions.'}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#991B1B]">
                    <span>Customer: <strong>{activeBooking.customerName}</strong></span>
                    <span>Disputed Deduction: <strong>₹{currentDeduction.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-hearth-taupe flex items-center gap-1.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-hearth-sage" />
                  <span>The customer has not raised any dispute regarding this inspection or deduction.</span>
                </div>
              )}
            </div>
          ) : activePersona.role === 'VENDOR_OWNER' ? (
            <div className="pt-2 flex items-center justify-between text-xs text-hearth-taupe">
              <span>Customer Status: <strong>{returnRec.customerResponse || 'Pending Review'}</strong></span>
              <span>Deposit settlement governed by platform</span>
            </div>
          ) : (
            <>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-hearth-taupe">
                  Status: <strong>{returnRec.customerResponse || 'Approved'}</strong> • Refunded within 14 days
                </span>
                <button
                  onClick={() => setShowDisputeInput(!showDisputeInput)}
                  className="spring-btn px-5 py-2 rounded-pill bg-[#B85D3B] hover:bg-hearth-terracotta text-white text-xs font-semibold shadow-sm"
                >
                  Raise a Dispute
                </button>
              </div>

              {showDisputeInput && (
                <div className="mt-4 p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-3">
                  <div className="text-xs font-bold text-hearth-ink">
                    Tell us why you disagree with this inspection
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
                      Submit Dispute
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Staff & Admin Inspection Controls */}
      {isStaffOrAdmin && (
        <div className="grid grid-cols-1 gap-6">
          {/* Warehouse Inspection Form (Vendor Only - Admin is read-only for warehouse logs) */}
          {activePersona.role !== 'PLATFORM_ADMIN' && (
            <form
              onSubmit={handleRunWarehouseInspection}
              className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-hearth-terracotta" />
                <h3 className="font-serif text-base font-bold text-hearth-ink">
                  Log Warehouse Inspection
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1">
                    Item Condition
                  </label>
                  <select
                    value={findingType}
                    onChange={(e) => setFindingType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-semibold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                  >
                    <option value="Normal Wear" className="bg-white text-hearth-ink font-sans font-normal">Normal Wear (₹0 Charge)</option>
                    <option value="Customer Damage" className="bg-white text-hearth-ink font-sans font-normal">Customer Damage</option>
                    <option value="Transit Damage (Vendor Fault)" className="bg-white text-hearth-ink font-sans font-normal">
                      Transit Damage (₹0 Customer Charge)
                    </option>
                    <option value="Missing Accessory" className="bg-white text-hearth-ink font-sans font-normal">Missing Accessory</option>
                    <option value="Severe Damage / Loss" className="bg-white text-hearth-ink font-sans font-normal">Severe Damage / Loss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1">
                    Deduction Amount (₹)
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
                  Damage was visible in the doorstep pickup photo
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Inspection Notes *
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
                Save Inspection
              </button>
            </form>
          )}

          {/* Final Refund Approval (Platform Operator Only) */}
          {activePersona.role === 'PLATFORM_ADMIN' && (
            <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-hearth-sage" />
                <h3 className="font-serif text-base font-bold text-hearth-ink">
                  Finalize Deposit Refund
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Approved Deduction (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={mediatorApprovedAmount}
                  onChange={(e) =>
                    setMediatorApprovedAmount(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs font-ledger text-hearth-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Resolution Notes *
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
                  onChange={(e) =>
                    setTriggerBlacklistOnResolve(e.target.checked)
                  }
                  className="rounded text-[#991B1B]"
                />
                <span>
                  Block customer account due to severe damage or loss
                </span>
              </label>

              <button
                type="button"
                disabled={isSimulatingLatency}
                onClick={handleMediatorDecision}
                className="spring-btn w-full py-2.5 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold shadow-sm"
              >
                Confirm & Issue Refund
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
