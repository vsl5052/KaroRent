import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Ruler,
  RotateCcw,
  Truck,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { BookingOrder, ServiceMaintenanceTicket } from '../../types/srs';

const TIME_SLOTS = [
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
];

type PrimarySection = 'NEW_BOOKINGS' | 'MAINTENANCE' | 'PICKUP';
type BookingSubSection = 'ALL' | 'SITE_VISIT' | 'DELIVERY';

export const AssignDeliveriesView: React.FC = () => {
  const {
    activePersona,
    vendors,
    bookings,
    serviceTickets,
    fieldTechnicians,
    masterProducts,
    assignTechnicianToTask,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [selectedAdminVendorId, setSelectedAdminVendorId] = useState<string>(
    activePersona.vendorId || 'VEN-201'
  );

  const activeVendorId =
    activePersona.role === 'PLATFORM_ADMIN'
      ? selectedAdminVendorId
      : activePersona.vendorId || 'VEN-201';

  const currentVendor =
    vendors.find((v) => v.id === activeVendorId) || vendors[0];

  const vendorTechs = fieldTechnicians.filter(
    (t) => t.vendorId === currentVendor.id
  );

  // Top Section Selector
  const [activeSection, setActiveSection] =
    useState<PrimarySection>('NEW_BOOKINGS');
  const [bookingSubSection, setBookingSubSection] =
    useState<BookingSubSection>('ALL');

  // Filter Vendor Bookings & Tickets
  const vendorBookings = bookings.filter(
    (b) => b.fulfillingVendorId === currentVendor.id
  );
  const vendorTickets = serviceTickets.filter(
    (t) => t.vendorId === currentVendor.id
  );

  // 1. Newly booked products not delivered
  const newBookingsPending = vendorBookings.filter(
    (b) =>
      !b.deliveryCompletedAt &&
      b.status !== 'Completed' &&
      b.status !== 'Cancelled' &&
      b.status !== 'Flagged — Blacklist Review' &&
      !b.returnRecord
  );

  const siteVisitBookings = newBookingsPending.filter(
    (b) =>
      b.workflowType === 'SITE_VISIT_MULTI_STEP' &&
      (!b.siteVisit || !b.siteVisit.status.includes('Completed'))
  );

  const deliveryBookings = newBookingsPending.filter(
    (b) =>
      b.workflowType === 'DIRECT_1_STEP' ||
      (b.workflowType === 'SITE_VISIT_MULTI_STEP' &&
        b.siteVisit?.status.includes('Completed'))
  );

  const displayedBookings =
    bookingSubSection === 'SITE_VISIT'
      ? siteVisitBookings
      : bookingSubSection === 'DELIVERY'
      ? deliveryBookings
      : newBookingsPending;

  // 2. Maintenance requests
  const pendingMaintenance = vendorTickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed'
  );

  // 3. Pickup requests
  const pendingPickups = vendorBookings.filter(
    (b) =>
      Boolean(b.returnRecord) &&
      (b.returnRecord?.pickupStatus === 'Requested' ||
        b.returnRecord?.pickupStatus === 'Scheduled' ||
        b.status === 'Pickup Scheduled' ||
        b.status === 'Return Requested')
  );

  // Assignment Modal State
  const [assigningTask, setAssigningTask] = useState<{
    taskId: string;
    taskType: 'DELIVERY' | 'SITE_VISIT' | 'PICKUP' | 'MAINTENANCE';
    title: string;
    productTitle: string;
    customerName: string;
    address: string;
    currentAssignedName?: string;
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-31');
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [assignError, setAssignError] = useState<string | null>(null);

  // Check if a technician is already booked on selectedDate & selectedSlot
  const isTechnicianAvailable = (techId: string, techName: string) => {
    // Check deliveries
    const hasConflictingDelivery = bookings.some(
      (b) =>
        b.deliveryAssignment &&
        (b.deliveryAssignment.technicianId === techId ||
          b.deliveryAssignment.technicianName.toLowerCase() ===
            techName.toLowerCase()) &&
        b.deliveryAssignment.scheduledDate === selectedDate &&
        b.deliveryAssignment.scheduledTimeSlot === selectedSlot
    );
    if (hasConflictingDelivery) return false;

    // Check site visits
    const hasConflictingVisit = bookings.some(
      (b) =>
        b.siteVisit &&
        b.siteVisit.assignedTechnician &&
        b.siteVisit.assignedTechnician.toLowerCase().includes(techName.toLowerCase()) &&
        b.siteVisit.scheduledDate.includes(selectedDate) &&
        b.siteVisit.scheduledDate.includes(selectedSlot)
    );
    if (hasConflictingVisit) return false;

    // Check pickups
    const hasConflictingPickup = bookings.some(
      (b) =>
        b.returnRecord &&
        b.returnRecord.assignedPickupStaff &&
        (b.returnRecord.assignedStaffId === techId ||
          b.returnRecord.assignedPickupStaff
            .toLowerCase()
            .includes(techName.toLowerCase())) &&
        ((b.returnRecord.scheduledDate === selectedDate &&
          b.returnRecord.scheduledTimeSlot === selectedSlot) ||
          (b.returnRecord.preferredPickupSlot.includes(selectedDate) &&
            b.returnRecord.preferredPickupSlot.includes(selectedSlot)))
    );
    if (hasConflictingPickup) return false;

    // Check maintenance
    const hasConflictingMaintenance = serviceTickets.some(
      (t) =>
        (t.assignedTechnicianId === techId ||
          (t.assignedTechnicianName &&
            t.assignedTechnicianName
              .toLowerCase()
              .includes(techName.toLowerCase()))) &&
        t.status !== 'Resolved' &&
        t.scheduledDate === selectedDate &&
        t.scheduledTimeSlot === selectedSlot
    );
    if (hasConflictingMaintenance) return false;

    return true;
  };

  const availableTechnicians = vendorTechs.filter((tech) =>
    isTechnicianAvailable(tech.id, tech.fullName)
  );

  const openAssignModal = (task: typeof assigningTask) => {
    setAssigningTask(task);
    setSelectedDate('2026-10-31');
    setSelectedSlot(TIME_SLOTS[0]);
    setSelectedTechId('');
    setAssignNotes('');
    setAssignError(null);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTask) return;
    setAssignError(null);

    if (!selectedTechId) {
      setAssignError('Please select an available technician.');
      return;
    }
    if (!selectedDate) {
      setAssignError('Please select a scheduled date.');
      return;
    }

    await assignTechnicianToTask({
      taskId: assigningTask.taskId,
      taskType: assigningTask.taskType,
      technicianId: selectedTechId,
      scheduledDate: selectedDate,
      scheduledTimeSlot: selectedSlot,
      notes: assignNotes.trim() || undefined,
    });

    setAssigningTask(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-hearth-sageLight text-hearth-sage flex items-center justify-center font-bold">
              <CalendarCheck className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              Assign Deliveries & Field Visits
            </h1>
          </div>
          <p className="text-xs text-hearth-umber mt-1">
            Assign registered field technicians to new bookings, home measurement site visits, maintenance requests, and return pickups.
          </p>
        </div>

        {activePersona.role === 'PLATFORM_ADMIN' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-hearth-ink">
              Select Partner:
            </label>
            <select
              value={selectedAdminVendorId}
              onChange={(e) => setSelectedAdminVendorId(e.target.value)}
              className="px-3.5 py-2 rounded-pill bg-hearth-oat border border-hearth-border text-xs font-mono font-semibold text-hearth-ink focus:outline-none"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.displayName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3 Main Sections Navigation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveSection('NEW_BOOKINGS')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeSection === 'NEW_BOOKINGS'
              ? 'bg-hearth-apricot border-hearth-terracotta shadow-sm'
              : 'bg-hearth-card border-hearth-border hover:bg-hearth-oat'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hearth-card border border-hearth-border flex items-center justify-center text-hearth-terracotta">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-hearth-ink">
                1. New Bookings
              </div>
              <div className="text-[11px] text-hearth-taupe">
                Pending Delivery / Visit
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-pill bg-hearth-terracotta text-white font-mono text-xs font-bold">
            {newBookingsPending.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('MAINTENANCE')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeSection === 'MAINTENANCE'
              ? 'bg-hearth-apricot border-hearth-terracotta shadow-sm'
              : 'bg-hearth-card border-hearth-border hover:bg-hearth-oat'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hearth-card border border-hearth-border flex items-center justify-center text-purple-700">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-hearth-ink">
                2. Maintenance
              </div>
              <div className="text-[11px] text-hearth-taupe">
                Repair & Swap Tickets
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-pill bg-purple-700 text-white font-mono text-xs font-bold">
            {pendingMaintenance.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('PICKUP')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeSection === 'PICKUP'
              ? 'bg-hearth-apricot border-hearth-terracotta shadow-sm'
              : 'bg-hearth-card border-hearth-border hover:bg-hearth-oat'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-hearth-card border border-hearth-border flex items-center justify-center text-[#9A3412]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-hearth-ink">
                3. Pickup Requests
              </div>
              <div className="text-[11px] text-hearth-taupe">
                Return Doorstep Pickups
              </div>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-pill bg-[#9A3412] text-white font-mono text-xs font-bold">
            {pendingPickups.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: New Bookings Pending Delivery */}
      {activeSection === 'NEW_BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hearth-border pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-hearth-ink">
                Newly Booked Products Pending Delivery ({displayedBookings.length})
              </h2>
              <p className="text-xs text-hearth-taupe">
                Select whether you are assigning a pre-installation site visit for complex products or a standard delivery.
              </p>
            </div>

            {/* Subsection Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-pill bg-hearth-oat border border-hearth-border text-xs">
              <button
                onClick={() => setBookingSubSection('ALL')}
                className={`px-3 py-1 rounded-pill transition-colors ${
                  bookingSubSection === 'ALL'
                    ? 'bg-hearth-card text-hearth-terracotta font-bold shadow-sm'
                    : 'text-hearth-umber hover:text-hearth-ink'
                }`}
              >
                All ({newBookingsPending.length})
              </button>
              <button
                onClick={() => setBookingSubSection('SITE_VISIT')}
                className={`px-3 py-1 rounded-pill transition-colors flex items-center gap-1 ${
                  bookingSubSection === 'SITE_VISIT'
                    ? 'bg-hearth-card text-hearth-terracotta font-bold shadow-sm'
                    : 'text-hearth-umber hover:text-hearth-ink'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Site Visits ({siteVisitBookings.length})</span>
              </button>
              <button
                onClick={() => setBookingSubSection('DELIVERY')}
                className={`px-3 py-1 rounded-pill transition-colors flex items-center gap-1 ${
                  bookingSubSection === 'DELIVERY'
                    ? 'bg-hearth-card text-hearth-terracotta font-bold shadow-sm'
                    : 'text-hearth-umber hover:text-hearth-ink'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Deliveries ({deliveryBookings.length})</span>
              </button>
            </div>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
              No new bookings pending technician assignment in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayedBookings.map((b) => {
                const product = masterProducts.find((p) => p.id === b.productId);
                const isComplex = b.workflowType === 'SITE_VISIT_MULTI_STEP';
                const needsSiteVisit =
                  isComplex &&
                  (!b.siteVisit || !b.siteVisit.status.includes('Completed'));
                const assignedTech =
                  b.deliveryAssignment?.technicianName ||
                  b.siteVisit?.assignedTechnician;

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth space-y-3.5 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {product && (
                            <img
                              src={product.lifestyleImage}
                              alt={b.productTitle}
                              className="w-14 h-14 rounded-2xl object-cover border border-hearth-border shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-hearth-ink">
                                {b.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-pill text-[10px] font-semibold ${
                                  needsSiteVisit
                                    ? 'bg-hearth-apricot text-hearth-terracotta border border-hearth-terracotta/30'
                                    : 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                                }`}
                              >
                                {needsSiteVisit
                                  ? 'Site Visit Required'
                                  : 'Standard Delivery'}
                              </span>
                              <span className="px-2 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[10px] font-medium text-hearth-taupe">
                                {b.status}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-sm text-hearth-ink mt-0.5">
                              {b.productTitle}
                            </h3>
                            <div className="text-[11px] text-hearth-taupe">
                              Customer: <strong>{b.customerName}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-hearth-oat/60 border border-hearth-border space-y-1 text-[11px]">
                        <div className="flex items-start gap-1.5 text-hearth-umber">
                          <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0 mt-0.5" />
                          <span>{b.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-hearth-taupe font-mono">
                          <Calendar className="w-3.5 h-3.5 text-hearth-sage shrink-0" />
                          <span>
                            Tenure: {b.tenureMonths} Months ({b.startDate} → {b.endDate})
                          </span>
                        </div>
                      </div>

                      {assignedTech && (
                        <div className="p-2.5 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assigned: {assignedTech}</span>
                          </span>
                          <span className="font-mono text-[10px]">
                            {b.deliveryAssignment?.scheduledDate ||
                              b.siteVisit?.scheduledDate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-hearth-border flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-hearth-taupe">
                        {needsSiteVisit
                          ? 'Step 1: Measurement'
                          : 'Step 2: Dispatch & Setup'}
                      </span>
                      <button
                        onClick={() =>
                          openAssignModal({
                            taskId: b.id,
                            taskType: needsSiteVisit ? 'SITE_VISIT' : 'DELIVERY',
                            title: needsSiteVisit
                              ? 'Assign Home Measurement Technician'
                              : 'Assign Delivery & Setup Technician',
                            productTitle: b.productTitle,
                            customerName: b.customerName,
                            address: b.deliveryAddress,
                            currentAssignedName: assignedTech,
                          })
                        }
                        className="spring-btn px-4 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{assignedTech ? 'Reassign Staff' : 'Assign Staff'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Maintenance Requests */}
      {activeSection === 'MAINTENANCE' && (
        <div className="space-y-4">
          <div className="border-b border-hearth-border pb-3">
            <h2 className="font-serif text-lg font-bold text-hearth-ink">
              Maintenance & Repair Requests ({pendingMaintenance.length})
            </h2>
            <p className="text-xs text-hearth-taupe">
              Assign service technicians to customer maintenance or item swap requests.
            </p>
          </div>

          {pendingMaintenance.length === 0 ? (
            <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
              No pending maintenance requests for this partner.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingMaintenance.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth space-y-3.5 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-hearth-ink">
                          {ticket.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-pill bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                          Maintenance
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-pill bg-hearth-oat text-hearth-taupe font-semibold text-[10px]">
                        {ticket.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm text-hearth-ink">
                        {ticket.productTitle}
                      </h3>
                      <div className="text-[11px] text-hearth-taupe mt-0.5 font-mono">
                        Serial: {ticket.currentAssetSerial} • Order: {ticket.bookingId}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-1">
                      <div className="text-[11px] font-semibold text-hearth-ink">
                        Issue Reported by {ticket.customerName}:
                      </div>
                      <p className="text-[11px] text-hearth-umber leading-relaxed">
                        "{ticket.issueDescription}"
                      </p>
                    </div>

                    {ticket.assignedTechnicianName && (
                      <div className="p-2.5 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assigned: {ticket.assignedTechnicianName}</span>
                        </span>
                        <span className="font-mono text-[10px]">
                          {ticket.scheduledDate} {ticket.scheduledTimeSlot}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-hearth-border flex items-center justify-between">
                    <span className="text-[10px] text-hearth-taupe">
                      {ticket.replacementRequested
                        ? 'Replacement unit requested'
                        : 'On-site service requested'}
                    </span>
                    <button
                      onClick={() =>
                        openAssignModal({
                          taskId: ticket.id,
                          taskType: 'MAINTENANCE',
                          title: 'Assign Maintenance Technician',
                          productTitle: ticket.productTitle,
                          customerName: ticket.customerName,
                          address: 'Customer Premises',
                          currentAssignedName: ticket.assignedTechnicianName,
                        })
                      }
                      className="spring-btn px-4 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>
                        {ticket.assignedTechnicianName ? 'Reassign Staff' : 'Assign Staff'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Pickup Requests */}
      {activeSection === 'PICKUP' && (
        <div className="space-y-4">
          <div className="border-b border-hearth-border pb-3">
            <h2 className="font-serif text-lg font-bold text-hearth-ink">
              Return Pickup Requests ({pendingPickups.length})
            </h2>
            <p className="text-xs text-hearth-taupe">
              Assign field staff to collect items at customer doorsteps and capture verified handover photos.
            </p>
          </div>

          {pendingPickups.length === 0 ? (
            <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
              No return pickup requests pending assignment for this partner.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingPickups.map((b) => {
                const assignedStaff = b.returnRecord?.assignedPickupStaff;
                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth space-y-3.5 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-hearth-ink">
                            {b.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA] text-[10px] font-semibold">
                            Pickup Request
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-pill bg-hearth-oat text-hearth-taupe font-semibold text-[10px]">
                          {b.returnRecord?.pickupStatus || 'Requested'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-bold text-sm text-hearth-ink">
                          {b.productTitle}
                        </h3>
                        <div className="text-[11px] text-hearth-taupe mt-0.5">
                          Customer: <strong>{b.customerName}</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-hearth-oat/70 border border-hearth-border space-y-1 text-[11px]">
                        <div className="flex items-start gap-1.5 text-hearth-umber">
                          <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0 mt-0.5" />
                          <span>{b.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-hearth-taupe">
                          <Clock className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
                          <span>
                            Slot: {b.returnRecord?.preferredPickupSlot || 'Flexible'}
                          </span>
                        </div>
                      </div>

                      {assignedStaff && (
                        <div className="p-2.5 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#166534] text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assigned Staff: {assignedStaff}</span>
                          </span>
                          <span className="font-mono text-[10px]">
                            {b.returnRecord?.scheduledDate ||
                              b.returnRecord?.preferredPickupSlot}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-hearth-border flex items-center justify-between">
                      <span className="text-[10px] text-hearth-taupe">
                        Doorstep photo required on collection
                      </span>
                      <button
                        onClick={() =>
                          openAssignModal({
                            taskId: b.id,
                            taskType: 'PICKUP',
                            title: 'Assign Return Pickup Staff',
                            productTitle: b.productTitle,
                            customerName: b.customerName,
                            address: b.deliveryAddress,
                            currentAssignedName: assignedStaff,
                          })
                        }
                        className="spring-btn px-4 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{assignedStaff ? 'Reassign Staff' : 'Assign Staff'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assignment Modal with Date/Time + Available Technicians Filter */}
      {assigningTask && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  {assigningTask.title}
                </h3>
                <p className="text-xs text-hearth-taupe mt-0.5">
                  Order / Ticket: <strong className="font-mono">{assigningTask.taskId}</strong> • {assigningTask.productTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningTask(null)}
                className="p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignError && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-medium">
                {assignError}
              </div>
            )}

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              {/* Task Overview Strip */}
              <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border space-y-1">
                <div className="flex items-center justify-between text-[11px] text-hearth-taupe">
                  <span>Customer: <strong>{assigningTask.customerName}</strong></span>
                  <span className="font-semibold text-hearth-terracotta">
                    {assigningTask.taskType}
                  </span>
                </div>
                <div className="text-hearth-umber flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0 mt-0.5" />
                  <span>{assigningTask.address}</span>
                </div>
              </div>

              {/* Step 1: Select Date & Time Slot */}
              <div className="space-y-3 p-4 rounded-2xl bg-hearth-card border border-hearth-border">
                <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-hearth-terracotta" />
                  <span>1. Select Schedule Date & Time Slot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTechId('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                      Preferred Time Window *
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => {
                        setSelectedSlot(e.target.value);
                        setSelectedTechId('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Available Technicians Filter (Only available shown!) */}
              <div className="space-y-3 p-4 rounded-2xl bg-hearth-card border border-hearth-border">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-hearth-ink flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-hearth-sage" />
                    <span>2. Available Field Technicians for this Window</span>
                  </div>
                  <span className="text-[11px] font-mono text-hearth-sage font-bold">
                    {availableTechnicians.length} Available
                  </span>
                </div>

                <p className="text-[11px] text-hearth-taupe leading-snug">
                  Only technicians with zero schedule conflicts on <strong>{selectedDate} ({selectedSlot})</strong> are displayed below.
                </p>

                {availableTechnicians.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      All registered technicians are currently booked for other visits during this time slot. Please choose another date or time slot.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {availableTechnicians.map((tech) => {
                      const isSelected = selectedTechId === tech.id;
                      return (
                        <label
                          key={tech.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-hearth-apricot/80 border-hearth-terracotta shadow-sm'
                              : 'bg-hearth-oat/70 hover:bg-hearth-oat border-hearth-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="assignedTech"
                              value={tech.id}
                              checked={isSelected}
                              onChange={() => setSelectedTechId(tech.id)}
                              className="text-hearth-terracotta focus:ring-hearth-terracotta"
                            />
                            <img
                              src={tech.photoUrl}
                              alt={tech.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-hearth-border shrink-0"
                            />
                            <div>
                              <div className="font-bold text-hearth-ink text-xs">
                                {tech.fullName}
                              </div>
                              <div className="text-[11px] text-hearth-taupe flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-hearth-terracotta" />
                                <span>{tech.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold">
                              Available
                            </span>
                            <div className="text-[10px] text-hearth-taupe mt-0.5">
                              {tech.id}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Instructions & Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                  Dispatch Notes or Access Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Call customer 15 mins prior to arrival; carry 3m copper kit."
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta"
                />
              </div>

              {/* Customer Receipt Notice */}
              <div className="p-3 rounded-2xl bg-hearth-oat/60 border border-hearth-border text-[11px] text-hearth-umber leading-relaxed">
                ℹ️ <strong>Customer Update:</strong> Once confirmed, the customer will instantly receive the technician's photo, full name, contact phone, scheduled date, and time window on their dashboard and notification center.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-hearth-border">
                <button
                  type="button"
                  onClick={() => setAssigningTask(null)}
                  className="px-4 py-2 rounded-pill bg-hearth-card border border-hearth-border text-xs font-semibold text-hearth-umber"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingLatency || !selectedTechId}
                  className="spring-btn px-5 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Assign Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
