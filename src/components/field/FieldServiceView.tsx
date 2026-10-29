import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Ruler,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const FieldServiceView: React.FC = () => {
  const { bookings, masterProducts, fieldTechnicians } = useKaroRentStore();

  const operationalBookings = bookings.filter(
    (b) => b.status !== 'Flagged — Blacklist Review'
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    operationalBookings[0]?.id || 'BKG-2026-8841'
  );

  const activeBooking =
    operationalBookings.find((b) => b.id === selectedBookingId) ||
    operationalBookings[0];

  if (!activeBooking) return null;

  const product = masterProducts.find((p) => p.id === activeBooking.productId);
  const isMultiStep = activeBooking.workflowType === 'SITE_VISIT_MULTI_STEP';

  const getTaskCategoryLabel = (b: typeof activeBooking) => {
    if (b.returnRecord || b.status === 'Pickup Scheduled') {
      return 'Return Pickup';
    }
    if (b.workflowType === 'SITE_VISIT_MULTI_STEP') {
      return 'Home Visit & Delivery';
    }
    return 'Standard Delivery';
  };

  const assignedTechInfo =
    activeBooking.deliveryAssignment ||
    (activeBooking.siteVisit?.assignedTechnician
      ? {
          technicianName: activeBooking.siteVisit.assignedTechnician,
          technicianPhone: '+91 97400 55667',
          technicianPhoto:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          scheduledDate: activeBooking.siteVisit.scheduledDate,
          scheduledTimeSlot: 'Scheduled Window',
          reason: 'Home Measurement Visit',
        }
      : null);

  return (
    <div className="space-y-8">
      {/* Top Selector Bar (Switching between different deliveries & visits) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-hearth-sageLight text-hearth-sage flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              Deliveries & Visits Status
            </h1>
          </div>
          <p className="text-xs text-hearth-umber mt-1">
            Status overview of all dispatched orders, home measurement visits, and return pickups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-hearth-ink">
            Select Delivery / Visit:
          </label>
          <select
            value={activeBooking.id}
            onChange={(e) => setSelectedBookingId(e.target.value)}
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

      {/* Main Associated Information & Status Card */}
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
                <div className="text-xs text-hearth-taupe">
                  Customer: <strong>{activeBooking.customerName}</strong>
                </div>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-semibold text-hearth-ink">
              Current Status: {activeBooking.status}
            </span>
          </div>

          {/* 3-Column Associated Order Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
              <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>Service & Delivery Address</span>
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
                <span>Rental Plan & Schedule</span>
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
                <span>Assigned Unit Serial</span>
              </div>
              <p className="text-hearth-umber font-mono">
                Serial: <strong>{activeBooking.allocatedSerial || 'Pending Dispatch'}</strong>
              </p>
              <p className="text-[11px] text-hearth-taupe">
                Fulfilling Partner: {activeBooking.fulfillingVendorName}
              </p>
            </div>
          </div>
        </div>

        {/* Read-Only Status & Assigned Staff Panels */}
        <div className="p-6 space-y-6 bg-[#F3EFE6]/60 dark:bg-hearth-oat/40">
          {/* Assigned Technician Card (Read-Only) */}
          <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-3">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-hearth-sage" />
                <h3 className="font-serif text-base font-bold text-hearth-ink">
                  Assigned Field Technician
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-pill bg-hearth-oat text-hearth-taupe">
                Staff Status
              </span>
            </div>

            {assignedTechInfo ? (
              <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <img
                    src={assignedTechInfo.technicianPhoto}
                    alt={assignedTechInfo.technicianName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-hearth-border shrink-0 shadow-sm"
                  />
                  <div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-hearth-terracotta font-semibold">
                      {assignedTechInfo.reason || 'Assigned Technician'}
                    </div>
                    <div className="font-serif font-bold text-base text-hearth-ink">
                      {assignedTechInfo.technicianName}
                    </div>
                    <div className="text-[11px] text-hearth-umber flex items-center gap-1 font-mono mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-hearth-terracotta" />
                      <span>{assignedTechInfo.technicianPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[11px] text-hearth-taupe">
                    Scheduled Window
                  </div>
                  <div className="font-semibold text-hearth-ink text-sm">
                    {assignedTechInfo.scheduledDate}
                  </div>
                  {assignedTechInfo.scheduledTimeSlot && (
                    <div className="text-[11px] font-mono text-hearth-terracotta font-semibold">
                      {assignedTechInfo.scheduledTimeSlot}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border text-xs text-hearth-taupe">
                No field technician assigned yet for this order. Staff can be assigned via the <strong>Assign Deliveries</strong> tab.
              </div>
            )}
          </div>

          {/* Delivery & Setup Status Panel (Read-Only) */}
          <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hearth-border pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-hearth-sage" />
                <h3 className="font-serif text-base font-bold text-hearth-ink">
                  Delivery & Handover Status
                </h3>
              </div>
              <span className="text-xs font-mono text-hearth-taupe">
                {activeBooking.deliveryCompletedAt
                  ? `Delivered on ${activeBooking.deliveryCompletedAt}`
                  : 'Pending Handover'}
              </span>
            </div>

            {activeBooking.deliveryCompletedAt ? (
              <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivery & Installation Completed</span>
                  </div>
                  <p>
                    Serial Allocated:{' '}
                    <strong className="font-mono">{activeBooking.allocatedSerial}</strong>{' '}
                    • Delivered on {activeBooking.deliveryCompletedAt}
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
              <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border text-xs text-hearth-umber space-y-1">
                <div className="font-semibold text-hearth-ink">
                  Fulfillment in Progress
                </div>
                <p>
                  Unit dispatch and customer delivery are in progress. Once completed by the field technician, the delivery timestamp and verified photo are recorded automatically.
                </p>
              </div>
            )}
          </div>

          {/* Home Measurement Visit Status (Read-Only, for multi-step products) */}
          {isMultiStep && (
            <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
              <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-hearth-terracotta" />
                  <h3 className="font-serif text-base font-bold text-hearth-ink">
                    Home Measurement Visit Status
                  </h3>
                </div>
                {activeBooking.siteVisit && (
                  <span className="px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                    {activeBooking.siteVisit.status}
                  </span>
                )}
              </div>

              {activeBooking.siteVisit ? (
                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">Copper Piping</span>
                      <strong className="text-hearth-ink font-mono">
                        {activeBooking.siteVisit.measuredCopperPipeMeters} meters
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">Outdoor Bracket</span>
                      <strong className="text-hearth-ink">
                        {activeBooking.siteVisit.outdoorBracketRequired ? 'Required' : 'Standard Ledge'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">Core Wall Cutting</span>
                      <strong className="text-hearth-ink">
                        {activeBooking.siteVisit.coreCuttingRequired ? 'Required' : 'Not Required'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">Quote Approval</span>
                      <strong className="text-hearth-sage">
                        {activeBooking.siteVisit.customerQuoteDecision || 'Pending'}
                      </strong>
                    </div>
                  </div>
                  {activeBooking.siteVisit.technicianNotes && (
                    <p className="text-[11px] text-hearth-umber italic pt-1">
                      "{activeBooking.siteVisit.technicianNotes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border text-xs text-hearth-taupe">
                  Home measurement visit details pending field technician completion.
                </div>
              )}
            </div>
          )}

          {/* Return Pickup Status (Read-Only, if return present) */}
          {activeBooking.returnRecord && (
            <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
              <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#9A3412]" />
                  <h3 className="font-serif text-base font-bold text-hearth-ink">
                    Return Pickup Status
                  </h3>
                </div>
                <span className="px-3 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA] text-[11px] font-semibold">
                  {activeBooking.returnRecord.pickupStatus}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Pickup Staff:{' '}
                    <strong>{activeBooking.returnRecord.assignedPickupStaff || 'Unassigned'}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-hearth-taupe">
                    Preferred Window: {activeBooking.returnRecord.preferredPickupSlot}
                  </span>
                </div>
                {activeBooking.returnRecord.pickupPhotoExifTimestamp && (
                  <p className="text-[11px] text-hearth-sage font-medium">
                    ✓ Handover Photo Verified: {activeBooking.returnRecord.pickupPhotoExifTimestamp}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
