import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Package,
  Truck,
  Sparkles,
} from 'lucide-react';
import { VendorRecord } from '../../types/srs';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { DEFAULT_BUFFER_TURNAROUND_DAYS } from '../../lib/temporalCalendar';

interface VendorBufferShieldPanelProps {
  vendor: VendorRecord;
}

export const VendorBufferShieldPanel: React.FC<VendorBufferShieldPanelProps> = ({
  vendor,
}) => {
  const {
    bookings,
    virtualInventory,
    triggerLateReturnCascadingReassignment,
    isSimulatingLatency,
  } = useKaroRentStore();

  const vendorBookings = bookings.filter(
    (b) => b.fulfillingVendorId === vendor.id && b.status !== 'Cancelled'
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    vendorBookings[0]?.id || ''
  );
  const [delayHours, setDelayHours] = useState<number>(24);
  const [simulationLog, setSimulationLog] = useState<
    Array<{
      timestamp: string;
      bookingId: string;
      delayHours: number;
      outcome: 'ABSORBED' | 'CASCADED';
      detail: string;
    }>
  >([]);

  const selectedBooking = vendorBookings.find((b) => b.id === selectedBookingId);

  const handleSimulateLateReturn = async () => {
    if (!selectedBookingId) return;

    const result = await triggerLateReturnCascadingReassignment(
      selectedBookingId,
      delayHours
    );

    const now = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (delayHours <= 48) {
      setSimulationLog((prev) => [
        {
          timestamp: now,
          bookingId: selectedBookingId,
          delayHours,
          outcome: 'ABSORBED',
          detail: `Delay of ${delayHours}h absorbed by 48-Hour Buffer Window. Downstream rental is 100% protected.`,
        },
        ...prev,
      ]);
    } else {
      setSimulationLog((prev) => [
        {
          timestamp: now,
          bookingId: selectedBookingId,
          delayHours,
          outcome: 'CASCADED',
          detail: `Delay of ${delayHours}h exceeded 48h buffer. Automated cascading reassignment shifted downstream booking to buffer stock/partner vendor.`,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#061712] border border-[#1E4E40] text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] text-black flex items-center justify-center font-bold shadow-md">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-white">
                  Late Return Cascading Buffer Shield & Operational Quarantine
                </h2>
                <span className="px-2.5 py-0.5 rounded-pill bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-mono text-[10px] font-bold">
                  Operational Buffer Active
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Mandatory 48-Hour Operational Quarantine window between consecutive rentals: Day 1 Reverse Transit & Intake; Day 2 Inspection, Sanitization & Bench Testing.
              </p>
            </div>
          </div>
        </div>

        {/* 48-Hour Operational Quarantine Breakdown Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Day 1 Card */}
          <div className="p-4 rounded-2xl bg-[#0C231C] border border-[#1E4E40] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#10B981] text-emerald-950 font-bold text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <span className="font-bold text-xs text-white">
                  Day 1: Reverse Transit & Warehouse Intake
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Hours 0 - 24</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Doorstep pickup by certified two-man field crew, safe packing, transit to central hub, return barcode scan, and security deposit inspection sign-off.
            </p>
          </div>

          {/* Day 2 Card */}
          <div className="p-4 rounded-2xl bg-[#0C231C] border border-[#1E4E40] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F59E0B] text-black font-bold text-xs flex items-center justify-center font-mono">
                  2
                </span>
                <span className="font-bold text-xs text-white">
                  Day 2: 3-Way Inspection, Deep Sanitization & Bench-Testing
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">Hours 24 - 48</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Three-way structural inspection, industrial steam sanitization, electrical/motor bench-testing, re-boxing, and dispatch staging for next tenant.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Schedule Window Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap text-xs text-amber-800 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Operational Buffer Schedule:</strong>{' '}
            <span className="font-sans text-amber-900 dark:text-amber-200">
              Automatic 48-hour quarantine block added to every concluded rental before subsequent customer dispatch.
            </span>
          </span>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-300">
          Enforced across all active, scheduled, & turnaround units
        </span>
      </div>

      {/* Customer Return Buffer Capacity & Cascading Reassignment Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E4E40] pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
              <span>Customer Return Buffer Absorption & Reassignment</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              48-hour quarantine window absorbs minor customer delays, while delays &gt;48h automatically initiate stock reassignment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Active Rental:
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-semibold text-slate-900 dark:text-white"
            >
              {vendorBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.productTitle} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Delay Window:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[24, 48, 72].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDelayHours(hours)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                    delayHours === hours
                      ? hours <= 48
                        ? 'bg-[#10B981] text-emerald-950 shadow-md'
                        : 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#061712] dark:hover:bg-[#13332A] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  +{hours}h {hours <= 48 ? '(Safe)' : '(Breach)'}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handleSimulateLateReturn}
              disabled={isSimulatingLatency || !selectedBookingId}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                delayHours <= 48
                  ? 'bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSimulatingLatency ? 'animate-spin' : ''}`}
              />
              <span>
                {isSimulatingLatency
                  ? 'Processing...'
                  : delayHours <= 48
                  ? 'Evaluate Buffer Capacity'
                  : 'Trigger Stock Reassignment'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Simulation Explanation */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            delayHours <= 48
              ? 'bg-emerald-50 dark:bg-[#061712] border-[#10B981]'
              : 'bg-amber-50 dark:bg-[#1a0c0c] border-amber-500'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-slate-900 dark:text-white">
            {delayHours <= 48 ? (
              <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            )}
            <span>
              {delayHours <= 48
                ? `Operational Buffer Safe (${delayHours}h <= 48h Buffer)`
                : `Operational Buffer Exceeded (${delayHours}h > 48h Buffer)`}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {delayHours <= 48
              ? `Minor delays up to 48 hours are absorbed completely by KaroRent's mandatory operational quarantine window. The downstream tenant's scheduled delivery remains 100% on schedule with zero customer notification required.`
              : `A return delay of ${delayHours} hours exceeds the 48-hour buffer window. The Cascading Buffer Shield automatically reallocates the downstream booking to an unreserved buffer unit (or platform emergency partner vendor) with 0 cancellation and 0 service delay.`}
          </p>
        </div>

        {/* Real-time simulation event stream */}
        {simulationLog.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Recent Buffer Shield Simulation Log:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {simulationLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold ${
                        log.outcome === 'ABSORBED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {log.outcome} (+{log.delayHours}h)
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {log.detail}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-slate-500">
                    {log.bookingId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fleet Turnaround Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
          Active Fleet Rentals & Quarantine Release Schedule
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1E4E40] text-[11px] font-mono text-slate-400">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Product Title</th>
                <th className="py-2.5 px-3">Rental Status</th>
                <th className="py-2.5 px-3">Rental End Date</th>
                <th className="py-2.5 px-3">48h Buffer Quarantine Ends</th>
                <th className="py-2.5 px-3">Shield Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E4E40]/60">
              {vendorBookings.map((b) => {
                const quarantineDate =
                  b.quarantineBlockedUntil ||
                  (b.endDate
                    ? `${b.endDate} + 48h`
                    : '2027-04-17');

                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-[#061712]/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {b.id}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {b.productTitle}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-pill bg-slate-100 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {b.endDate || '2027-04-15'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#059669] dark:text-[#10B981]">
                      {quarantineDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-pill bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Buffer Shielded</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
