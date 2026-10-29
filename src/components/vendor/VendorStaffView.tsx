import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

const PRESET_AVATARS = [
  {
    label: 'Technician 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Technician 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Technician 3',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Technician 4',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Technician 5',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Technician 6',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
];

export const VendorStaffView: React.FC = () => {
  const {
    activePersona,
    vendors,
    fieldTechnicians,
    bookings,
    serviceTickets,
    addFieldTechnician,
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

  // Add Technician Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0].url);
  const [serviceAreas, setServiceAreas] = useState(
    currentVendor.serviceAreas.join(', ')
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddTechnicianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full Name is mandatory.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Mobile Number is mandatory.');
      return;
    }
    if (!photoUrl.trim()) {
      setFormError('Technician Photo is mandatory.');
      return;
    }

    await addFieldTechnician({
      fullName: fullName.trim(),
      phone: phone.trim(),
      photoUrl: photoUrl.trim(),
      serviceAreas: serviceAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setFullName('');
    setPhone('');
    setPhotoUrl(PRESET_AVATARS[0].url);
    setShowAddModal(false);
  };

  // Helper to collect all assigned tasks for a given technician
  const getTechnicianAssignedTasks = (techName: string, techId: string) => {
    const tasks: {
      id: string;
      orderOrTicketId: string;
      type: 'Delivery' | 'Site Visit' | 'Return Pickup' | 'Maintenance';
      productTitle: string;
      customerName: string;
      serviceAddress: string;
      scheduledDate: string;
      scheduledTimeSlot?: string;
    }[] = [];

    // 1. Deliveries assigned
    bookings.forEach((b) => {
      if (
        b.deliveryAssignment &&
        (b.deliveryAssignment.technicianId === techId ||
          b.deliveryAssignment.technicianName.toLowerCase() ===
            techName.toLowerCase())
      ) {
        tasks.push({
          id: `TASK-DEL-${b.id}`,
          orderOrTicketId: b.id,
          type: 'Delivery',
          productTitle: b.productTitle,
          customerName: b.customerName,
          serviceAddress: b.deliveryAddress,
          scheduledDate: b.deliveryAssignment.scheduledDate,
          scheduledTimeSlot: b.deliveryAssignment.scheduledTimeSlot,
        });
      }
    });

    // 2. Site visits assigned
    bookings.forEach((b) => {
      if (
        b.siteVisit &&
        b.siteVisit.assignedTechnician &&
        b.siteVisit.assignedTechnician.toLowerCase().includes(techName.toLowerCase()) &&
        !tasks.some((t) => t.orderOrTicketId === b.id && t.type === 'Site Visit')
      ) {
        tasks.push({
          id: `TASK-SV-${b.id}`,
          orderOrTicketId: b.id,
          type: 'Site Visit',
          productTitle: b.productTitle,
          customerName: b.customerName,
          serviceAddress: b.deliveryAddress,
          scheduledDate: b.siteVisit.scheduledDate,
        });
      }
    });

    // 3. Return pickups assigned
    bookings.forEach((b) => {
      if (
        b.returnRecord &&
        b.returnRecord.assignedPickupStaff &&
        (b.returnRecord.assignedStaffId === techId ||
          b.returnRecord.assignedPickupStaff
            .toLowerCase()
            .includes(techName.toLowerCase()))
      ) {
        tasks.push({
          id: `TASK-RET-${b.id}`,
          orderOrTicketId: b.id,
          type: 'Return Pickup',
          productTitle: b.productTitle,
          customerName: b.customerName,
          serviceAddress: b.deliveryAddress,
          scheduledDate:
            b.returnRecord.scheduledDate || b.returnRecord.preferredPickupSlot,
          scheduledTimeSlot: b.returnRecord.scheduledTimeSlot,
        });
      }
    });

    // 4. Maintenance requests assigned
    serviceTickets.forEach((t) => {
      if (
        (t.assignedTechnicianId === techId ||
          (t.assignedTechnicianName &&
            t.assignedTechnicianName
              .toLowerCase()
              .includes(techName.toLowerCase()))) &&
        t.status !== 'Resolved' &&
        t.status !== 'Closed'
      ) {
        tasks.push({
          id: `TASK-SRV-${t.id}`,
          orderOrTicketId: t.id,
          type: 'Maintenance',
          productTitle: t.productTitle,
          customerName: t.customerName,
          serviceAddress: 'Customer Premises',
          scheduledDate: t.scheduledDate || 'Scheduled Visit',
          scheduledTimeSlot: t.scheduledTimeSlot,
        });
      }
    });

    return tasks;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-hearth-apricot text-hearth-terracotta flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              Field Technician Staff
            </h1>
          </div>
          <p className="text-xs text-hearth-umber mt-1">
            Manage your registered field personnel and view current assigned deliveries, site visits, pickups, and maintenance jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activePersona.role === 'PLATFORM_ADMIN' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-hearth-ink">
                Partner:
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

          <button
            onClick={() => setShowAddModal(true)}
            className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Field Technician</span>
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-hearth-ink">
            Registered Technicians ({vendorTechs.length})
          </h2>
          <span className="text-xs text-hearth-taupe font-mono">
            {currentVendor.displayName}
          </span>
        </div>

        {vendorTechs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center space-y-3">
            <Users className="w-10 h-10 text-hearth-taupe mx-auto" />
            <p className="text-xs text-hearth-umber">
              No field technicians registered yet under {currentVendor.displayName}.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Technician</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {vendorTechs.map((tech) => {
              const assignedTasks = getTechnicianAssignedTasks(
                tech.fullName,
                tech.id
              );

              return (
                <div
                  key={tech.id}
                  className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header profile info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={tech.photoUrl}
                          alt={tech.fullName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-hearth-border shrink-0 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-hearth-ink">
                              {tech.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{tech.status}</span>
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-hearth-ink mt-0.5">
                            {tech.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-hearth-umber mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-hearth-terracotta" />
                            <span className="font-mono">{tech.phone}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-medium text-hearth-taupe">
                        {assignedTasks.length} Assigned {assignedTasks.length === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>

                    {/* Service areas */}
                    <div className="flex items-center gap-1.5 text-xs text-hearth-taupe flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-hearth-terracotta shrink-0" />
                      <span>Coverage: {tech.serviceAreas.join(', ')}</span>
                    </div>

                    {/* Assigned Tasks Section */}
                    <div className="space-y-2.5 pt-2 border-t border-hearth-border">
                      <div className="text-xs font-bold text-hearth-ink uppercase tracking-wider flex items-center justify-between">
                        <span>Current Assigned Tasks</span>
                        <span className="text-[11px] text-hearth-taupe font-normal lowercase">
                          ({assignedTasks.length} active)
                        </span>
                      </div>

                      {assignedTasks.length === 0 ? (
                        <div className="p-3.5 rounded-2xl bg-hearth-oat/70 border border-hearth-border text-xs text-hearth-taupe flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-hearth-sage shrink-0" />
                          <span>
                            Available • No active deliveries or visits currently assigned to this technician.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {assignedTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 rounded-2xl bg-hearth-parchment/70 border border-hearth-border space-y-1.5 text-xs hover:border-hearth-terracotta/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-pill text-[10px] font-semibold ${
                                      task.type === 'Delivery'
                                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                                        : task.type === 'Site Visit'
                                        ? 'bg-hearth-apricot text-hearth-terracotta border border-hearth-terracotta/30'
                                        : task.type === 'Return Pickup'
                                        ? 'bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]'
                                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                                    }`}
                                  >
                                    {task.type}
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-hearth-ink">
                                    {task.orderOrTicketId}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-hearth-umber flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-hearth-taupe" />
                                  <span>{task.scheduledDate}</span>
                                  {task.scheduledTimeSlot && (
                                    <span>• {task.scheduledTimeSlot}</span>
                                  )}
                                </div>
                              </div>

                              <div className="font-semibold text-hearth-ink truncate">
                                {task.productTitle}
                              </div>

                              <div className="text-[11px] text-hearth-taupe flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-hearth-terracotta shrink-0 mt-0.5" />
                                <span className="line-clamp-1">
                                  {task.serviceAddress} • Customer: {task.customerName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Field Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Add Field Technician
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Register a verified technician for {currentVendor.displayName}. All fields below are mandatory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddTechnicianSubmit} className="space-y-4">
              {/* Photo (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-hearth-ink">
                  Technician Photo * <span className="text-hearth-terracotta">(Mandatory)</span>
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-hearth-terracotta shrink-0 shadow-sm"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta"
                      required
                    />
                    <div className="text-[10px] text-hearth-taupe">
                      Or select a verified portrait avatar below:
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Selection Strip */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(av.url)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                        photoUrl === av.url
                          ? 'border-hearth-terracotta scale-105 shadow-sm'
                          : 'border-hearth-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Full Name * <span className="text-hearth-terracotta">(Mandatory)</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta"
                  required
                />
              </div>

              {/* Mobile Number (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Mobile Number * <span className="text-hearth-terracotta">(Mandatory)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98450 12345"
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-mono focus:outline-none focus:border-hearth-terracotta"
                  required
                />
                <span className="text-[10px] text-hearth-taupe mt-0.5 block">
                  Customers receive this contact number upon technician assignment.
                </span>
              </div>

              {/* Account & Role Auto-Creation Notice */}
              <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border text-[11px] text-hearth-umber leading-relaxed">
                🔐 <strong>Automatic Website Account & Role:</strong> Registering this technician automatically creates their <strong>Field Technician</strong> account on the website. They can immediately log in using this mobile number to view and fulfill their assigned deliveries and visits.
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Assigned Delivery & Service Areas
                </label>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  placeholder="e.g. Indiranagar, Whitefield, Koramangala"
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs focus:outline-none focus:border-hearth-terracotta"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-hearth-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-pill bg-hearth-card border border-hearth-border text-xs font-semibold text-hearth-umber"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingLatency}
                  className="spring-btn px-5 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
