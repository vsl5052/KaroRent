import React, { useState, useEffect } from 'react';
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
  Wrench,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { BookingOrder, ServiceMaintenanceTicket, DeliveryAssignment } from '../../types/srs';

export interface TaskTechnician {
  id?: string;
  name: string;
  phone: string;
  photo: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  reason?: string;
}

export interface OperationalTask {
  id: string; // e.g. 'BKG-2026-8841' or 'SRV-2026-301'
  displayKey: string;
  taskType: 'DELIVERY' | 'SITE_VISIT' | 'PICKUP' | 'MAINTENANCE';
  categoryLabel: string;
  productTitle: string;
  productImage?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  serviceLocation: string;
  status: string;
  vendorId?: string;
  vendorName?: string;
  allocatedSerial?: string;
  booking?: BookingOrder;
  serviceTicket?: ServiceMaintenanceTicket;
  assignedTechnician?: TaskTechnician;
  scheduledDate: string;
  scheduledTimeSlot?: string;
  notes?: string;
}

const mapAssignmentToTech = (a?: DeliveryAssignment): TaskTechnician | undefined => {
  if (!a) return undefined;
  return {
    id: a.technicianId,
    name: a.technicianName,
    phone: a.technicianPhone,
    photo: a.technicianPhoto,
    scheduledDate: a.scheduledDate,
    scheduledTimeSlot: a.scheduledTimeSlot,
    reason: a.reason,
  };
};

export const FieldServiceView: React.FC = () => {
  const {
    bookings,
    serviceTickets,
    masterProducts,
    fieldTechnicians,
    activePersona,
  } = useKaroRentStore();

  // Identify matching field technician for logged-in persona
  const loggedInTech = fieldTechnicians.find(
    (t) =>
      (activePersona.phone &&
        t.phone.replace(/\D/g, '') === activePersona.phone.replace(/\D/g, '')) ||
      t.fullName.toLowerCase().trim() === activePersona.name.toLowerCase().trim() ||
      activePersona.id === `persona-${t.id}` ||
      activePersona.id === t.id
  );
  const myTechId = loggedInTech?.id || activePersona.id.replace('persona-', '');
  const myTechName = (loggedInTech?.fullName || activePersona.name).toLowerCase().trim();
  const myTechPhone = (loggedInTech?.phone || activePersona.phone || '').replace(/\D/g, '');

  // Aggregate all operational tasks across the platform
  const allTasks: OperationalTask[] = [];

  // 1. Process Bookings (Deliveries, Site Visits, Pickups)
  bookings
    .filter((b) => b.status !== 'Flagged — Blacklist Review')
    .forEach((b) => {
      const product = masterProducts.find((p) => p.id === b.productId);

      // A) Site Visit Task
      if (b.workflowType === 'SITE_VISIT_MULTI_STEP' && b.siteVisit) {
        const siteVisitAssignedName = b.siteVisit.assignedTechnician;
        const matchingTech = fieldTechnicians.find(
          (t) =>
            (siteVisitAssignedName &&
              t.fullName.toLowerCase() === siteVisitAssignedName.toLowerCase()) ||
            (b.deliveryAssignment?.technicianId &&
              t.id === b.deliveryAssignment.technicianId)
        );

        allTasks.push({
          id: b.id,
          displayKey: `${b.id}-VISIT`,
          taskType: 'SITE_VISIT',
          categoryLabel: 'Home Measurement Visit',
          productTitle: b.productTitle,
          productImage: product?.lifestyleImage,
          customerName: b.customerName,
          deliveryAddress: b.deliveryAddress,
          serviceLocation: b.serviceLocation,
          status: b.siteVisit.status || b.status,
          vendorId: b.fulfillingVendorId,
          vendorName: b.fulfillingVendorName,
          allocatedSerial: b.allocatedSerial,
          booking: b,
          assignedTechnician:
            b.deliveryAssignment?.taskType === 'SITE_VISIT'
              ? mapAssignmentToTech(b.deliveryAssignment)
              : siteVisitAssignedName
              ? {
                  id: matchingTech?.id || b.deliveryAssignment?.technicianId,
                  name: siteVisitAssignedName,
                  phone:
                    matchingTech?.phone ||
                    b.deliveryAssignment?.technicianPhone ||
                    '+91 97400 55667',
                  photo:
                    matchingTech?.photoUrl ||
                    b.deliveryAssignment?.technicianPhoto ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                  scheduledDate: b.siteVisit.scheduledDate,
                  scheduledTimeSlot:
                    b.deliveryAssignment?.scheduledTimeSlot || 'Scheduled Window',
                  reason: 'Home Measurement Visit',
                }
              : undefined,
          scheduledDate: b.siteVisit.scheduledDate,
          scheduledTimeSlot: b.deliveryAssignment?.scheduledTimeSlot,
        });
      }

      // B) Standard Delivery Task
      if (
        b.deliveryAssignment?.taskType === 'DELIVERY' ||
        (!b.deliveryAssignment && b.workflowType !== 'SITE_VISIT_MULTI_STEP') ||
        (b.workflowType === 'SITE_VISIT_MULTI_STEP' &&
          b.siteVisit?.status.includes('Completed') &&
          b.deliveryAssignment)
      ) {
        allTasks.push({
          id: b.id,
          displayKey: `${b.id}-DELIVERY`,
          taskType: 'DELIVERY',
          categoryLabel: 'Standard Delivery',
          productTitle: b.productTitle,
          productImage: product?.lifestyleImage,
          customerName: b.customerName,
          deliveryAddress: b.deliveryAddress,
          serviceLocation: b.serviceLocation,
          status: b.deliveryCompletedAt ? 'Delivered' : b.status,
          vendorId: b.fulfillingVendorId,
          vendorName: b.fulfillingVendorName,
          allocatedSerial: b.allocatedSerial,
          booking: b,
          assignedTechnician:
            b.deliveryAssignment?.taskType === 'DELIVERY' ||
            (!b.deliveryAssignment?.taskType && b.deliveryAssignment)
              ? mapAssignmentToTech(b.deliveryAssignment)
              : undefined,
          scheduledDate: b.deliveryAssignment?.scheduledDate || b.startDate,
          scheduledTimeSlot: b.deliveryAssignment?.scheduledTimeSlot,
        });
      }

      // C) Return Pickup Task
      if (b.returnRecord) {
        const pickupStaff = b.returnRecord.assignedPickupStaff;
        const matchingPickupTech = fieldTechnicians.find(
          (t) =>
            (b.returnRecord?.assignedStaffId &&
              t.id === b.returnRecord.assignedStaffId) ||
            (pickupStaff &&
              t.fullName.toLowerCase().includes(pickupStaff.toLowerCase()))
        );

        allTasks.push({
          id: b.id,
          displayKey: `${b.id}-PICKUP`,
          taskType: 'PICKUP',
          categoryLabel: 'Return Pickup',
          productTitle: b.productTitle,
          productImage: product?.lifestyleImage,
          customerName: b.customerName,
          deliveryAddress: b.deliveryAddress,
          serviceLocation: b.serviceLocation,
          status: b.returnRecord.pickupStatus,
          vendorId: b.fulfillingVendorId,
          vendorName: b.fulfillingVendorName,
          allocatedSerial: b.allocatedSerial,
          booking: b,
          assignedTechnician:
            b.deliveryAssignment?.taskType === 'PICKUP'
              ? mapAssignmentToTech(b.deliveryAssignment)
              : pickupStaff
              ? {
                  id: b.returnRecord.assignedStaffId || matchingPickupTech?.id,
                  name: pickupStaff,
                  phone:
                    b.returnRecord.assignedStaffPhone ||
                    matchingPickupTech?.phone ||
                    '+91 97400 55667',
                  photo:
                    b.returnRecord.assignedStaffPhoto ||
                    matchingPickupTech?.photoUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                  scheduledDate:
                    b.returnRecord.scheduledDate ||
                    b.returnRecord.preferredPickupSlot.split('   ')[0] ||
                    'Scheduled Window',
                  scheduledTimeSlot:
                    b.returnRecord.scheduledTimeSlot ||
                    b.returnRecord.preferredPickupSlot.split('   ')[1] ||
                    'Pickup Window',
                  reason: 'Return Pickup',
                }
              : undefined,
          scheduledDate:
            b.returnRecord.scheduledDate || b.returnRecord.preferredPickupSlot,
          scheduledTimeSlot: b.returnRecord.scheduledTimeSlot,
        });
      }
    });

  // 2. Process Maintenance Tickets
  serviceTickets.forEach((st) => {
    const stBooking = bookings.find((b) => b.id === st.bookingId);
    const matchingMaintTech = fieldTechnicians.find(
      (t) =>
        (st.assignedTechnicianId && t.id === st.assignedTechnicianId) ||
        (st.assignedTechnicianName &&
          t.fullName.toLowerCase().includes(st.assignedTechnicianName.toLowerCase()))
    );

    allTasks.push({
      id: st.id,
      displayKey: st.id,
      taskType: 'MAINTENANCE',
      categoryLabel: 'Maintenance & Repair',
      productTitle: st.productTitle,
      productImage:
        masterProducts.find((p) =>
          p.title.toLowerCase().includes(st.productTitle.toLowerCase().slice(0, 15))
        )?.lifestyleImage ||
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=700&q=80',
      customerName: st.customerName,
      deliveryAddress:
        stBooking?.deliveryAddress ||
        'Customer Registered Address (Indiranagar, Bengaluru)',
      serviceLocation: stBooking?.serviceLocation || 'Indiranagar',
      status: st.status,
      vendorId: st.vendorId,
      vendorName: st.vendorName,
      allocatedSerial: st.currentAssetSerial,
      booking: stBooking,
      serviceTicket: st,
      assignedTechnician: st.assignedTechnicianName
        ? {
            id: st.assignedTechnicianId || matchingMaintTech?.id,
            name: st.assignedTechnicianName,
            phone:
              st.assignedTechnicianPhone ||
              matchingMaintTech?.phone ||
              '+91 97400 55667',
            photo:
              st.assignedTechnicianPhoto ||
              matchingMaintTech?.photoUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            scheduledDate: st.scheduledDate || 'Scheduled Date',
            scheduledTimeSlot: st.scheduledTimeSlot || 'Scheduled Window',
            reason: 'Maintenance & Repair',
          }
        : undefined,
      scheduledDate: st.scheduledDate || st.createdAt,
      scheduledTimeSlot: st.scheduledTimeSlot,
      notes: st.issueDescription,
    });
  });

  // Strict role-based filtering:
  // Field Technicians will be ONLY able to view deliveries, maintenance & pickups assigned to them!
  const isAssignedToMe = (task: OperationalTask) => {
    if (!task.assignedTechnician) return false;
    const a = task.assignedTechnician;
    const aId = a.id;
    const aName = a.name.toLowerCase().trim();
    const aPhone = (a.phone || '').replace(/\D/g, '');

    if (
      myTechId &&
      aId &&
      (aId === myTechId || aId.toLowerCase() === myTechId.toLowerCase())
    ) {
      return true;
    }
    if (
      myTechPhone &&
      aPhone &&
      (aPhone === myTechPhone ||
        aPhone.endsWith(myTechPhone) ||
        myTechPhone.endsWith(aPhone))
    ) {
      return true;
    }
    if (
      myTechName &&
      aName &&
      (aName === myTechName ||
        aName.includes(myTechName) ||
        myTechName.includes(aName))
    ) {
      return true;
    }
    return false;
  };

  const visibleTasks = allTasks.filter((task) => {
    if (activePersona.role === 'FIELD_PERSONNEL') {
      return isAssignedToMe(task);
    }
    if (activePersona.role === 'VENDOR_OWNER') {
      return task.vendorId === activePersona.vendorId;
    }
    // PLATFORM_ADMIN sees all
    return true;
  });

  const [selectedTaskKey, setSelectedTaskKey] = useState<string>(
    visibleTasks[0]?.displayKey || ''
  );

  // Sync selected task key when visible tasks list changes
  useEffect(() => {
    if (!visibleTasks.some((t) => t.displayKey === selectedTaskKey)) {
      setSelectedTaskKey(visibleTasks[0]?.displayKey || '');
    }
  }, [visibleTasks, selectedTaskKey]);

  const activeTask =
    visibleTasks.find((t) => t.displayKey === selectedTaskKey) ||
    visibleTasks[0];

  return (
    <div className="space-y-8">
      {/* Top Selector Bar (Switching between assigned deliveries, visits, maintenance, and pickups) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-hearth-sageLight text-hearth-sage flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              {activePersona.role === 'FIELD_PERSONNEL'
                ? 'My Assigned Deliveries & Visits'
                : 'Deliveries & Visits Status'}
            </h1>
          </div>
          <p className="text-xs text-hearth-umber mt-1">
            {activePersona.role === 'FIELD_PERSONNEL'
              ? `Operational status of deliveries, maintenance requests, and return pickups assigned to ${activePersona.name}.`
              : 'Status overview of all dispatched orders, home measurement visits, maintenance jobs, and return pickups.'}
          </p>
        </div>

        {visibleTasks.length > 0 && activeTask && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-hearth-ink">
              {activePersona.role === 'FIELD_PERSONNEL'
                ? 'Select Assigned Task:'
                : 'Select Delivery / Visit:'}
            </label>
            <select
              value={activeTask.displayKey}
              onChange={(e) => setSelectedTaskKey(e.target.value)}
              className="px-4 py-2 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
            >
              {visibleTasks.map((t) => (
                <option
                  key={t.displayKey}
                  value={t.displayKey}
                  className="bg-white text-hearth-ink font-sans font-normal"
                >
                  {t.id} — {t.productTitle.slice(0, 26)} ({t.categoryLabel} •{' '}
                  {t.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Zero State if Field Technician has no tasks assigned */}
      {visibleTasks.length === 0 ? (
        <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-hearth-sageLight text-hearth-sage flex items-center justify-center mx-auto text-2xl font-bold">
            <Truck className="w-8 h-8 text-hearth-sage" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              No Assigned Field Tasks Yet
            </h2>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Welcome, <strong>{activePersona.name}</strong>! You currently have
              no deliveries, site visits, maintenance requests, or return pickups
              assigned to you by your vendor.
            </p>
            <p className="text-[11px] text-hearth-taupe">
              As soon as your partner vendor assigns a task to you in the
              dispatch portal, it will immediately appear here with customer
              delivery address, contact details, and scheduled appointment
              window.
            </p>
          </div>
        </div>
      ) : (
        /* Main Associated Information & Status Card */
        <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden">
          {/* Top Summary Header */}
          <div className="p-6 border-b border-hearth-border space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {activeTask.productImage && (
                  <img
                    src={activeTask.productImage}
                    alt={activeTask.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-hearth-border shrink-0 hidden sm:block"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                      {activeTask.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-hearth-apricot border border-hearth-terracotta/30 text-[11px] font-semibold text-hearth-terracotta">
                      {activeTask.categoryLabel}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                    {activeTask.productTitle}
                  </h2>
                  <div className="text-xs text-hearth-taupe">
                    Customer: <strong>{activeTask.customerName}</strong>
                  </div>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-semibold text-hearth-ink">
                Current Status: {activeTask.status}
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
                  {activeTask.deliveryAddress}
                </p>
                <p className="text-[11px] text-hearth-taupe">
                  Zone: {activeTask.serviceLocation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
                <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-hearth-sage" />
                  <span>Appointment Window & Schedule</span>
                </div>
                <p className="text-hearth-umber">
                  Scheduled Date: <strong>{activeTask.scheduledDate}</strong>
                </p>
                {activeTask.scheduledTimeSlot && (
                  <p className="text-[11px] text-hearth-taupe font-mono">
                    Time Window: {activeTask.scheduledTimeSlot}
                  </p>
                )}
                {activeTask.booking && (
                  <p className="text-[11px] text-hearth-taupe">
                    Duration: {activeTask.booking.tenureMonths} Months
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
                <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-hearth-terracotta" />
                  <span>Assigned Unit Serial</span>
                </div>
                <p className="text-hearth-umber font-mono">
                  Serial:{' '}
                  <strong>{activeTask.allocatedSerial || 'Pending Allocation'}</strong>
                </p>
                <p className="text-[11px] text-hearth-taupe">
                  Fulfilling Partner:{' '}
                  {activeTask.vendorName || 'Platform Partner'}
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
                {activePersona.role === 'FIELD_PERSONNEL' ? (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] font-semibold">
                    ✓ Assigned to You
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-pill bg-hearth-oat text-hearth-taupe">
                    Staff Status
                  </span>
                )}
              </div>

              {activeTask.assignedTechnician ? (
                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={activeTask.assignedTechnician.photo}
                      alt={activeTask.assignedTechnician.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-hearth-border shrink-0 shadow-sm"
                    />
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-hearth-terracotta font-semibold">
                        {activeTask.assignedTechnician.reason ||
                          activeTask.categoryLabel}
                      </div>
                      <div className="font-serif font-bold text-base text-hearth-ink">
                        {activeTask.assignedTechnician.name}
                      </div>
                      <div className="text-[11px] text-hearth-umber flex items-center gap-1 font-mono mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>{activeTask.assignedTechnician.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-[11px] text-hearth-taupe">
                      Scheduled Window
                    </div>
                    <div className="font-semibold text-hearth-ink text-sm">
                      {activeTask.assignedTechnician.scheduledDate ||
                        activeTask.scheduledDate}
                    </div>
                    {(activeTask.assignedTechnician.scheduledTimeSlot ||
                      activeTask.scheduledTimeSlot) && (
                      <div className="text-[11px] font-mono text-hearth-terracotta font-semibold">
                        {activeTask.assignedTechnician.scheduledTimeSlot ||
                          activeTask.scheduledTimeSlot}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border text-xs text-hearth-taupe">
                  No field technician assigned yet for this task.
                </div>
              )}
            </div>

            {/* Task-Specific Status Panels (Read-Only) */}

            {/* 1. DELIVERY TASK */}
            {activeTask.taskType === 'DELIVERY' && activeTask.booking && (
              <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hearth-border pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-hearth-sage" />
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Delivery & Handover Status
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-hearth-taupe">
                    {activeTask.booking.deliveryCompletedAt
                      ? `Delivered on ${activeTask.booking.deliveryCompletedAt}`
                      : 'Pending Handover'}
                  </span>
                </div>

                {activeTask.booking.deliveryCompletedAt ? (
                  <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Delivery & Installation Completed</span>
                      </div>
                      <p>
                        Serial Allocated:{' '}
                        <strong className="font-mono">
                          {activeTask.booking.allocatedSerial}
                        </strong>{' '}
                        • Delivered on {activeTask.booking.deliveryCompletedAt}
                      </p>
                    </div>
                    {activeTask.booking.deliveryEvidencePhoto && (
                      <img
                        src={activeTask.booking.deliveryEvidencePhoto}
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
                      Unit dispatch and customer delivery are in progress. Once
                      completed by the field technician, the delivery timestamp
                      and verified photo are recorded automatically.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. SITE VISIT TASK */}
            {activeTask.taskType === 'SITE_VISIT' && activeTask.booking?.siteVisit && (
              <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
                <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-hearth-terracotta" />
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Home Measurement Visit Details
                    </h3>
                  </div>
                  <span className="px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                    {activeTask.booking.siteVisit.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Copper Piping
                      </span>
                      <strong className="text-hearth-ink font-mono">
                        {activeTask.booking.siteVisit.measuredCopperPipeMeters}{' '}
                        meters
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Outdoor Bracket
                      </span>
                      <strong className="text-hearth-ink">
                        {activeTask.booking.siteVisit.outdoorBracketRequired
                          ? 'Required'
                          : 'Standard Ledge'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Core Wall Cutting
                      </span>
                      <strong className="text-hearth-ink">
                        {activeTask.booking.siteVisit.coreCuttingRequired
                          ? 'Required'
                          : 'Not Required'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Quote Approval
                      </span>
                      <strong className="text-hearth-sage">
                        {activeTask.booking.siteVisit.customerQuoteDecision ||
                          'Pending'}
                      </strong>
                    </div>
                  </div>
                  {activeTask.booking.siteVisit.technicianNotes && (
                    <p className="text-[11px] text-hearth-umber italic pt-1">
                      "{activeTask.booking.siteVisit.technicianNotes}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 3. RETURN PICKUP TASK */}
            {activeTask.taskType === 'PICKUP' && activeTask.booking?.returnRecord && (
              <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
                <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#9A3412]" />
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Return Pickup Details
                    </h3>
                  </div>
                  <span className="px-3 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA] text-[11px] font-semibold">
                    {activeTask.booking.returnRecord.pickupStatus}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Pickup Staff:{' '}
                      <strong>
                        {activeTask.booking.returnRecord.assignedPickupStaff ||
                          'Unassigned'}
                      </strong>
                    </span>
                    <span className="text-[11px] font-mono text-hearth-taupe">
                      Preferred Window:{' '}
                      {activeTask.booking.returnRecord.preferredPickupSlot}
                    </span>
                  </div>
                  {activeTask.booking.returnRecord.pickupPhotoExifTimestamp && (
                    <p className="text-[11px] text-hearth-sage font-medium">
                      ✓ Handover Photo Verified:{' '}
                      {activeTask.booking.returnRecord.pickupPhotoExifTimestamp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 4. MAINTENANCE TASK */}
            {activeTask.taskType === 'MAINTENANCE' && activeTask.serviceTicket && (
              <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
                <div className="flex items-center justify-between border-b border-hearth-border pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-hearth-terracotta" />
                    <h3 className="font-serif text-base font-bold text-hearth-ink">
                      Maintenance & Repair Request
                    </h3>
                  </div>
                  <span className="px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-semibold text-hearth-ink">
                    {activeTask.serviceTicket.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-hearth-taupe block mb-0.5">
                      Reported Issue
                    </span>
                    <p className="text-hearth-ink font-medium leading-relaxed">
                      {activeTask.serviceTicket.issueDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-hearth-border">
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Equipment Serial
                      </span>
                      <strong className="text-hearth-ink font-mono">
                        {activeTask.serviceTicket.currentAssetSerial}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Unit Replacement
                      </span>
                      <strong className="text-hearth-ink">
                        {activeTask.serviceTicket.replacementRequested
                          ? 'Requested by Customer'
                          : 'Standard Repair / Servicing'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-hearth-taupe block">
                        Downtime Credit
                      </span>
                      <strong className="text-hearth-sage">
                        ₹{activeTask.serviceTicket.downtimeCreditAmount}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
