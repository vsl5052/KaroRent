import React, { useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  Camera,
  CheckCircle2,
  Lock,
  MapPin,
  PackageCheck,
  Ruler,
  Truck,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const FieldServiceView: React.FC = () => {
  const {
    bookings,
    masterProducts,
    submitSiteVisitMetrics,
    completeDeliveryAndActivate,
    completeCustomerPremisePickupWithPhoto,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const operationalBookings = bookings.filter(
    (b) => b.status !== 'Flagged — Blacklist Review'
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    operationalBookings[0]?.id || 'BKG-2026-8841'
  );

  // Home Measurement Visit Form State
  const [isFeasible, setIsFeasible] = useState(true);
  const [unfeasibleReason, setUnfeasibleReason] = useState(
    'Suitable exterior wall or drainage outlet is not available.'
  );
  const [pipeMeters, setPipeMeters] = useState(4.5);
  const [coreCutting, setCoreCutting] = useState(true);
  const [outdoorBracket, setOutdoorBracket] = useState(true);
  const [drainMeters, setDrainMeters] = useState(2.5);
  const [siteNotes, setSiteNotes] = useState(
    'Measured 4.5m total copper pipe (3m included free), 1 outdoor bracket, and 1 core hole.'
  );

  // Return Pickup State
  const [capturedDoorstepPhoto, setCapturedDoorstepPhoto] =
    useState<string>('');
  const [capturedExifTimestamp, setCapturedExifTimestamp] =
    useState<string>('');
  const [capturedGeoTag] = useState<string>('Customer Doorstep');

  // Delivery Serial Input State
  const [serialInput, setSerialInput] = useState('SN-AC15-2026-108');

  const activeBooking =
    operationalBookings.find((b) => b.id === selectedBookingId) ||
    operationalBookings[0];

  if (!activeBooking) return null;

  const product = masterProducts.find((p) => p.id === activeBooking.productId);
  const isMultiStep = activeBooking.workflowType === 'SITE_VISIT_MULTI_STEP';
  const hasReturnPickup =
    Boolean(activeBooking.returnRecord) ||
    activeBooking.status === 'Pickup Scheduled' ||
    activeBooking.status === 'Return Requested';

  const extraPipe = Math.max(0, pipeMeters - 3);
  const previewMaterialTotal =
    Math.round(extraPipe * 850) +
    (outdoorBracket ? 750 : 0) +
    (coreCutting ? 500 : 0) +
    Math.round(Math.max(0, drainMeters - 2) * 180);

  const handleCaptureLiveExifPhoto = () => {
    const now = new Date();
    const ts = `2026-10-29 ${now.toTimeString().slice(0, 8)}`;
    setCapturedDoorstepPhoto(
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=85'
    );
    setCapturedExifTimestamp(ts);
    addToast({
      title: 'Pickup Photo Saved',
      description: `Photo captured at ${ts}. You can now complete the pickup.`,
      variant: 'success',
    });
  };

  const handleAttemptBlockedPickup = () => {
    addToast({
      title: 'Pickup Photo Required',
      description:
        'Please take a photo of the item at the customer doorstep before completing pickup.',
      variant: 'error',
    });
  };

  const getTaskCategoryLabel = (b: typeof activeBooking) => {
    if (b.returnRecord || b.status === 'Pickup Scheduled') {
      return 'Return Pickup';
    }
    if (b.workflowType === 'SITE_VISIT_MULTI_STEP') {
      return 'Home Visit & Delivery';
    }
    return 'Standard Delivery';
  };

  return (
    <div className="space-y-8">
      {/* Top Selector Bar (Structured like Returns) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-hearth-ink">
            Deliveries & Visits
          </h1>
          <p className="text-xs text-hearth-umber mt-0.5">
            Select a delivery, home measurement visit, or pickup to view details and update progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-hearth-ink">
            Select Delivery / Visit:
          </label>
          <select
            value={activeBooking.id}
            onChange={(e) => {
              setSelectedBookingId(e.target.value);
              setCapturedDoorstepPhoto('');
              setCapturedExifTimestamp('');
            }}
            className="px-4 py-2 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-mono font-semibold text-hearth-ink focus:outline-none"
          >
            {operationalBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.productTitle.slice(0, 28)} ({getTaskCategoryLabel(b)} •{' '}
                {b.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Associated Information Card for Selected Order */}
      <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden">
        {/* Top Summary Header */}
        <div className="p-6 border-b border-hearth-border space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {product && (
                <img
                  src={product.lifestyleImage}
                  alt={activeBooking.productTitle}
                  className="w-16 h-16 rounded-2xl object-cover border border-hearth-border shrink-0 hidden sm:block"
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                    {activeBooking.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-pill bg-hearth-apricot border border-hearth-terracotta/30 text-[11px] font-semibold text-hearth-terracotta">
                    {getTaskCategoryLabel(activeBooking)}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                  {activeBooking.productTitle}
                </h2>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-semibold text-hearth-ink">
              {activeBooking.status}
            </span>
          </div>

          {/* 3-Column Associated Order Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
              <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>Delivery & Visit Address</span>
              </div>
              <p className="text-hearth-umber leading-relaxed">
                {activeBooking.deliveryAddress}
              </p>
              <p className="text-[11px] text-hearth-taupe">
                Zone: {activeBooking.serviceLocation}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
              <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-hearth-sage" />
                <span>Schedule & Rental Plan</span>
              </div>
              <p className="text-hearth-umber">
                Duration: <strong>{activeBooking.tenureMonths} Months</strong> (Qty:{' '}
                {activeBooking.quantity})
              </p>
              <p className="text-[11px] text-hearth-taupe font-mono">
                {activeBooking.startDate} → {activeBooking.endDate}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
              <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>Assigned Unit & Staff</span>
              </div>
              <p className="text-hearth-umber font-mono">
                Serial: <strong>{activeBooking.allocatedSerial || 'Pending Dispatch'}</strong>
              </p>
              <p className="text-[11px] text-hearth-taupe">
                Staff:{' '}
                {activeBooking.siteVisit?.assignedTechnician ||
                  activeBooking.returnRecord?.assignedPickupStaff ||
                  'Rajan Kumar'}
              </p>
            </div>
          </div>
        </div>

        {/* Associated Task Panels Below */}
        <div className="p-6 space-y-6 bg-[#F3EFE6]/60 dark:bg-hearth-oat/40">
          {/* 1. Standard Delivery & Handover Panel */}
          <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hearth-border pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-hearth-sage" />
                <h3 className="font-serif text-base font-bold text-hearth-ink">
                  Delivery & Setup Status
                </h3>
              </div>
              <span className="text-xs font-mono text-hearth-taupe">
                {activeBooking.deliveryCompletedAt
                  ? `Delivered on ${activeBooking.deliveryCompletedAt}`
                  : 'Pending Delivery Handover'}
              </span>
            </div>

            {activeBooking.deliveryCompletedAt ? (
              <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivery & Setup Completed</span>
                  </div>
                  <p>
                    Assigned Serial:{' '}
                    <strong className="font-mono">
                      {activeBooking.allocatedSerial}
                    </strong>{' '}
                    • Delivered at {activeBooking.deliveryCompletedAt}
                  </p>
                </div>
                {activeBooking.deliveryEvidencePhoto && (
                  <img
                    src={activeBooking.deliveryEvidencePhoto}
                    alt="Delivery Handover"
                    className="w-16 h-16 rounded-xl object-cover border border-[#166534]"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-end justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1 min-w-[220px]">
                  <label className="block font-semibold text-hearth-ink">
                    Assign Unit Serial Number *
                  </label>
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    className="w-full max-w-xs px-3.5 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-mono text-xs text-hearth-ink"
                  />
                </div>
                <button
                  type="button"
                  disabled={isSimulatingLatency}
                  onClick={() =>
                    completeDeliveryAndActivate(
                      activeBooking.id,
                      serialInput,
                      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80'
                    )
                  }
                  className="spring-btn px-5 py-2.5 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold shadow-sm"
                >
                  Complete Delivery & Activate
                </button>
              </div>
            )}
          </div>

          {/* 2. Home Measurement Visit Panel (for Multi-Step Products) */}
          {isMultiStep && (
            <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
              <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-hearth-terracotta" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Home Measurement Visit
                    </h3>
                    <p className="text-[11px] text-hearth-taupe">
                      Record piping, brackets, and installation requirements for this order.
                    </p>
                  </div>
                </div>
                {activeBooking.siteVisit && (
                  <span className="px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                    {activeBooking.siteVisit.status}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setIsFeasible(true)}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isFeasible
                      ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                      : 'bg-hearth-oat text-hearth-umber border-hearth-border'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Installation Possible</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeasible(false)}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    !isFeasible
                      ? 'bg-[#FEE2E2] text-[#991B1B] border-[#DC2626]'
                      : 'bg-hearth-oat text-hearth-umber border-hearth-border'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Cannot Install</span>
                </button>
              </div>

              {!isFeasible ? (
                <div className="p-4 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] space-y-3 text-xs">
                  <p className="text-hearth-umber">
                    Marking the visit as unable to install will cancel the order without charging rent or security deposit.
                  </p>
                  <div>
                    <label className="block font-semibold text-hearth-ink mb-1">
                      Reason *
                    </label>
                    <input
                      type="text"
                      value={unfeasibleReason}
                      onChange={(e) => setUnfeasibleReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Copper Pipe (m) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={1}
                        max={25}
                        value={pipeMeters}
                        onChange={(e) => setPipeMeters(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                      />
                      <span className="text-[10px] text-hearth-taupe">
                        3m free; ₹850/m extra
                      </span>
                    </div>
                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Drain Pipe (m)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={20}
                        value={drainMeters}
                        onChange={(e) => setDrainMeters(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                      />
                      <span className="text-[10px] text-hearth-taupe">
                        2m free; ₹180/m extra
                      </span>
                    </div>
                    <div className="flex items-center">
                      <label className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-hearth-oat border border-hearth-border cursor-pointer">
                        <input
                          type="checkbox"
                          checked={outdoorBracket}
                          onChange={(e) => setOutdoorBracket(e.target.checked)}
                          className="rounded text-hearth-terracotta"
                        />
                        <span>Outdoor Bracket (+₹750)</span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-hearth-oat border border-hearth-border cursor-pointer">
                        <input
                          type="checkbox"
                          checked={coreCutting}
                          onChange={(e) => setCoreCutting(e.target.checked)}
                          className="rounded text-hearth-terracotta"
                        />
                        <span>Wall Core Cutting (+₹500)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-hearth-ink mb-1">
                      Technician Notes *
                    </label>
                    <input
                      type="text"
                      value={siteNotes}
                      onChange={(e) => setSiteNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-hearth-apricot border border-hearth-terracotta/30 flex items-center justify-between">
                    <span className="font-semibold text-hearth-ink">
                      Estimated Installation Cost
                    </span>
                    <span className="font-serif text-xl font-bold text-hearth-terracotta font-ledger">
                      ₹{previewMaterialTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSimulatingLatency}
                onClick={() =>
                  submitSiteVisitMetrics({
                    bookingId: activeBooking.id,
                    feasible: isFeasible,
                    unfeasibleReason: !isFeasible ? unfeasibleReason : undefined,
                    measuredCopperPipeMeters: pipeMeters,
                    coreCuttingRequired: coreCutting,
                    outdoorBracketRequired: outdoorBracket,
                    drainageExtensionMeters: drainMeters,
                    technicianNotes: siteNotes,
                    sitePhotoUrl:
                      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
                  })
                }
                className="spring-btn px-6 py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm"
              >
                {isFeasible
                  ? `Save Measurements & Send Quote (₹${previewMaterialTotal.toLocaleString('en-IN')})`
                  : 'Cancel Order (Cannot Install)'}
              </button>
            </div>
          )}

          {/* 3. Return Pickup Panel (when Return Pickup is scheduled/active) */}
          {hasReturnPickup && (
            <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
              <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-hearth-terracotta" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Doorstep Return Pickup
                    </h3>
                    <p className="text-[11px] text-hearth-taupe">
                      Preferred Slot:{' '}
                      {activeBooking.returnRecord?.preferredPickupSlot ||
                        'Scheduled Today'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                  {activeBooking.returnRecord?.pickupStatus || 'Scheduled'}
                </span>
              </div>

              {!capturedDoorstepPhoto &&
              !activeBooking.returnRecord?.customerPremisePickupPhoto ? (
                <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] space-y-1.5">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Pickup Photo Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Take a photo of the item at the customer's doorstep before completing the pickup.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] space-y-2">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Doorstep Pickup Photo Verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        capturedDoorstepPhoto ||
                        activeBooking.returnRecord?.customerPremisePickupPhoto
                      }
                      alt="Pickup Photo"
                      className="w-20 h-20 rounded-xl object-cover border border-[#166534]"
                    />
                    <div className="text-[11px] font-mono space-y-0.5">
                      <div>
                        Time:{' '}
                        {capturedExifTimestamp ||
                          activeBooking.returnRecord?.pickupPhotoExifTimestamp}
                      </div>
                      <div>Location: {capturedGeoTag}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCaptureLiveExifPhoto}
                  className="spring-btn py-2.5 px-4 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>1. Take Pickup Photo</span>
                </button>

                {!capturedDoorstepPhoto &&
                !activeBooking.returnRecord?.customerPremisePickupPhoto ? (
                  <button
                    type="button"
                    onClick={handleAttemptBlockedPickup}
                    className="py-2.5 px-4 rounded-pill bg-hearth-oat border border-dashed border-[#991B1B]/50 text-[#991B1B] text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>2. Complete Pickup (Photo Required)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSimulatingLatency}
                    onClick={() =>
                      completeCustomerPremisePickupWithPhoto({
                        bookingId: activeBooking.id,
                        photoUrl:
                          capturedDoorstepPhoto ||
                          activeBooking.returnRecord
                            ?.customerPremisePickupPhoto ||
                          '',
                        exifTimestamp:
                          capturedExifTimestamp ||
                          activeBooking.returnRecord
                            ?.pickupPhotoExifTimestamp ||
                          '2026-10-29 11:30:00',
                        geoTag: capturedGeoTag,
                      })
                    }
                    className="spring-btn py-2.5 px-4 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. Complete Pickup</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
