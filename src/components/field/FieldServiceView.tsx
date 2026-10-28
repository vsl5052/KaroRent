import React, { useState } from 'react';
import {
  AlertOctagon,
  Camera,
  CheckCircle2,
  Lock,
  MapPin,
  Ruler,
  ShieldCheck,
  Truck,
  Upload,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const FieldServiceView: React.FC = () => {
  const {
    bookings,
    submitSiteVisitMetrics,
    completeDeliveryAndActivate,
    completeCustomerPremisePickupWithPhoto,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  // 1. Site Visit Jobs (FR-FUL-008)
  const siteVisitBookings = bookings.filter(
    (b) =>
      b.workflowType === 'SITE_VISIT_MULTI_STEP' &&
      (b.status === 'Site Visit Scheduled' || b.status === 'Awaiting Site Visit Payment')
  );
  const [selectedSiteVisitBookingId, setSelectedSiteVisitBookingId] = useState(
    siteVisitBookings[0]?.id || 'BKG-2026-8905'
  );
  const [isFeasible, setIsFeasible] = useState(true);
  const [unfeasibleReason, setUnfeasibleReason] = useState(
    'Load-bearing exterior wall absent and no safe drainage outlet within 15 meters.'
  );
  const [pipeMeters, setPipeMeters] = useState(4.5);
  const [coreCutting, setCoreCutting] = useState(true);
  const [outdoorBracket, setOutdoorBracket] = useState(true);
  const [drainMeters, setDrainMeters] = useState(2.5);
  const [siteNotes, setSiteNotes] = useState(
    'Verified 3-phase stabilizer socket; measured 4.5m total copper run (1.5m billable beyond 3m free allowance) + 1 bracket + 1 core hole.'
  );

  // 2. Return Pickup Jobs with Mandatory EXIF Timestamped Photo Gate (FR-RET-002 / BR-026 / EX-029)
  const pickupBookings = bookings.filter(
    (b) => b.status === 'Pickup Scheduled' || b.returnRecord?.pickupStatus === 'Scheduled'
  );
  const [selectedPickupBookingId, setSelectedPickupBookingId] = useState(
    pickupBookings[0]?.id || 'BKG-2026-8812'
  );
  const [capturedDoorstepPhoto, setCapturedDoorstepPhoto] = useState<string>('');
  const [capturedExifTimestamp, setCapturedExifTimestamp] = useState<string>('');
  const [capturedGeoTag, setCapturedGeoTag] = useState<string>(
    '12.9784° N, 77.6408° E (Customer Doorstep Verified)'
  );

  // 3. Confirmed Bookings Ready for Dispatch & Delivery (FR-FUL-002 to 007)
  const dispatchBookings = bookings.filter((b) => b.status === 'Confirmed');
  const [serialInput, setSerialInput] = useState('SN-AC15-2026-108');

  // Preview Platform Rate-Card Calculation for AC Site Visit (FR-PRC-004 / FR-PRC-008)
  const extraPipe = Math.max(0, pipeMeters - 3);
  const previewMaterialTotal =
    Math.round(extraPipe * 850) +
    (outdoorBracket ? 750 : 0) +
    (coreCutting ? 500 : 0) +
    Math.round(Math.max(0, drainMeters - 2) * 180);

  const handleCaptureLiveExifPhoto = () => {
    const now = new Date();
    const ts = `2026-10-28 ${now.toTimeString().slice(0, 8)} IST`;
    setCapturedDoorstepPhoto(
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=85'
    );
    setCapturedExifTimestamp(ts);
    addToast({
      title: 'Live Doorstep Photo & EXIF Captured',
      description: `Verified timestamp ${ts} at customer premises. Picked Up transition gate is now unlocked!`,
      variant: 'success',
    });
  };

  const handleAttemptBlockedPickup = () => {
    addToast({
      title: 'Status Transition Blocked',
      description:
        'Cannot transition return to Picked Up without uploading a live timestamped photograph at the customer’s premises!',
      variant: 'error',
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Field Care Banner using local delivery illustration */}
      <div className="relative rounded-3xl overflow-hidden border border-hearth-border shadow-hearth bg-[#F5EFE6]">
        <img
          src="assets/client_delivery_care.jpg"
          alt="Field Delivery & Pickup Care"
          className="w-full h-52 object-cover object-right opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent flex items-center p-6 sm:p-8">
          <div className="max-w-xl space-y-2">
            <span className="px-3 py-1 rounded-pill bg-hearth-card border border-hearth-border text-[10px] font-mono uppercase text-hearth-terracotta font-semibold">
              Job-Scoped Field Technician View
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              Home Site Visits, Deliveries & Doorstep EXIF Pickup Gate
            </h1>
            <p className="text-xs text-[#44403C]">
              Manages on-site AC pre-installation measurements and enforces our mandatory customer-premise timestamped pickup photo before marking any return as Picked Up.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 items-start">
        {/* MODULE A: Mandatory Customer-Premise EXIF Pickup Photo Gate */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
          <div className="flex items-center justify-between border-b border-hearth-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-[#FEE2E2] text-[#991B1B] font-semibold">
                Mandatory Doorstep Verification Gate
              </span>
              <h2 className="font-serif text-xl font-bold text-hearth-ink mt-1">
                Return Pickup Handover & EXIF Timestamp Gate
              </h2>
            </div>
            <Camera className="w-6 h-6 text-hearth-terracotta" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
              Select Assigned Return Pickup Job:
            </label>
            <select
              value={selectedPickupBookingId}
              onChange={(e) => {
                setSelectedPickupBookingId(e.target.value);
                setCapturedDoorstepPhoto('');
                setCapturedExifTimestamp('');
              }}
              className="w-full px-4 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs font-mono font-semibold text-hearth-ink"
            >
              {pickupBookings.length > 0 ? (
                pickupBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.productTitle} ({b.customerName})
                  </option>
                ))
              ) : (
                <option value="BKG-2026-8812">
                  BKG-2026-8812 — Oatmeal Linen 3-Seater Sofa (Pickup Completed)
                </option>
              )}
            </select>
          </div>

          {/* Hard-Locked Red Policy Banner when Photo is Missing */}
          {!capturedDoorstepPhoto ? (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] space-y-2">
              <div className="font-bold text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  GATE LOCKED: Mandatory Customer-Premise Pickup Photo Required!
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The system blocks transition to <strong>Picked Up</strong> until a clear photograph with a verified system/EXIF timestamp is captured at the point of customer handover.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#DCFCE7] border-2 border-[#166534] text-[#166534] space-y-2">
              <div className="font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  EXIF Doorstep Handover Photo Verified — Gate Unlocked!
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={capturedDoorstepPhoto}
                  alt="Captured Doorstep Handover"
                  className="w-20 h-20 rounded-xl object-cover border border-[#166534]"
                />
                <div className="text-[11px] font-mono space-y-0.5">
                  <div>Format: JPEG [Validated]</div>
                  <div>EXIF Timestamp: {capturedExifTimestamp}</div>
                  <div>Geo-Coordinates: {capturedGeoTag}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons: Step 1 Capture Live Photo | Step 2 Unlock Picked Up Transition */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleCaptureLiveExifPhoto}
              className="spring-btn w-full py-3 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>
                1. Capture Live Customer-Premise Handover Photo (Auto-Stamps EXIF & GPS)
              </span>
            </button>

            {!capturedDoorstepPhoto ? (
              <button
                type="button"
                onClick={handleAttemptBlockedPickup}
                className="w-full py-3 rounded-pill bg-hearth-oat border-2 border-dashed border-[#991B1B]/50 text-[#991B1B] text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>
                  2. Mark Return as Picked Up [LOCKED — Photo Required]
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSimulatingLatency}
                onClick={() =>
                  completeCustomerPremisePickupWithPhoto({
                    bookingId: selectedPickupBookingId,
                    photoUrl: capturedDoorstepPhoto,
                    exifTimestamp: capturedExifTimestamp,
                    geoTag: capturedGeoTag,
                  })
                }
                className="spring-btn w-full py-3 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  2. Complete Handover & Transition to Picked Up — Under Inspection
                </span>
              </button>
            )}
          </div>
        </div>

        {/* MODULE B: Pre-Installation AC Site Feasibility & Metric Capture */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
          <div className="flex items-center justify-between border-b border-hearth-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
                Multi-Step Appliance Flow • On-Site Metrics
              </span>
              <h2 className="font-serif text-xl font-bold text-hearth-ink mt-1">
                Pre-Installation Site Feasibility & Metric Capture
              </h2>
            </div>
            <Ruler className="w-6 h-6 text-hearth-terracotta" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
              Select Scheduled Site Visit Job:
            </label>
            <select
              value={selectedSiteVisitBookingId}
              onChange={(e) => setSelectedSiteVisitBookingId(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs font-mono font-semibold text-hearth-ink"
            >
              {bookings
                .filter((b) => b.workflowType === 'SITE_VISIT_MULTI_STEP')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.productTitle} ({b.status})
                  </option>
                ))}
            </select>
          </div>

          {/* Feasibility Toggle */}
          <div className="grid grid-cols-2 gap-3">
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
              <span>Site Feasible (Record Metrics)</span>
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
              <span>Site Not Feasible</span>
            </button>
          </div>

          {!isFeasible ? (
            <div className="p-4 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] space-y-3 text-xs">
              <div className="font-bold text-[#991B1B]">
                Unfeasible Site Cancellation Policy:
              </div>
              <p className="text-hearth-umber">
                Marking the site Not Feasible will automatically cancel the booking without charging rental or security deposit, and release the virtual inventory hold.
              </p>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Structural / Technical Unfeasibility Reason *
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
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Measured Copper Pipe (Meters) *
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
                    3.0m included free; ₹850/m beyond
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Drainage PVC Extension (Meters)
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
                    2.0m included free; ₹180/m beyond
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-hearth-oat border border-hearth-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={outdoorBracket}
                    onChange={(e) => setOutdoorBracket(e.target.checked)}
                    className="rounded text-hearth-terracotta"
                  />
                  <span>Outdoor Unit Bracket (+₹750)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-hearth-oat border border-hearth-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coreCutting}
                    onChange={(e) => setCoreCutting(e.target.checked)}
                    className="rounded text-hearth-terracotta"
                  />
                  <span>Masonry Core Cutting (+₹500)</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Field Engineer Site Inspection Notes *
                </label>
                <input
                  type="text"
                  value={siteNotes}
                  onChange={(e) => setSiteNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border"
                />
              </div>

              {/* Auto-Calculated Rate Card Preview Box */}
              <div className="p-3.5 rounded-2xl bg-hearth-apricot border border-hearth-terracotta/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-hearth-ink">
                    Platform Rate-Card Material Total:
                  </div>
                  <div className="text-[10px] text-hearth-taupe">
                    Vendor inputs physical metrics only; system calculates price from locked Rate Card.
                  </div>
                </div>
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
                bookingId: selectedSiteVisitBookingId,
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
            className="spring-btn w-full py-3 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm"
          >
            {isFeasible
              ? `Submit Site Metrics & Dispatch ₹${previewMaterialTotal.toLocaleString('en-IN')} Final Quote to Customer`
              : 'Record Site Unfeasible & Release Booking Hold'}
          </button>
        </div>
      </div>

      {/* MODULE C: Confirmed Bookings Ready for Dispatch & Delivery Activation */}
      {dispatchBookings.length > 0 && (
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <h3 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
            <Truck className="w-5 h-5 text-hearth-sage" />
            <span>
              Confirmed Orders Ready for Dispatch & Delivery Activation
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dispatchBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="font-mono font-bold text-hearth-ink">
                    {b.id} — {b.productTitle}
                  </div>
                  <div className="text-hearth-umber">
                    Customer: {b.customerName} • Address: {b.deliveryAddress}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold">Allocate Serial:</span>
                    <input
                      type="text"
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-hearth-card border border-hearth-border font-mono text-xs"
                    />
                  </div>
                </div>
                <button
                  onClick={() =>
                    completeDeliveryAndActivate(
                      b.id,
                      serialInput,
                      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=80'
                    )
                  }
                  className="spring-btn px-4 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold"
                >
                  Capture POD & Activate Rental
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
