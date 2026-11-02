import React, { useState } from 'react';
import {
  CalendarPlus,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { BookingOrder } from '../../types/srs';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { checkTenureExtensionCollision } from '../../lib/temporalCalendar';

interface TenureExtensionModalProps {
  booking: BookingOrder;
  onClose: () => void;
}

export const TenureExtensionModal: React.FC<TenureExtensionModalProps> = ({
  booking,
  onClose,
}) => {
  const {
    bookings,
    virtualInventory,
    extendRentalWithCollisionCheck,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [months, setMonths] = useState<1 | 3 | 6>(3);

  // Live real-time collision diagnostic
  const collisionResult = checkTenureExtensionCollision(
    booking,
    months,
    bookings,
    virtualInventory
  );

  const handleConfirmExtension = async () => {
    await extendRentalWithCollisionCheck(booking.id, months);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#061712] border-b border-slate-200 dark:border-[#1E4E40] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-emerald-950 flex items-center justify-center font-bold shadow-sm">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
                Lease Extension
              </span>
              <h3 className="font-serif text-lg font-bold">
                Extend Rental Tenancy
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-[#13332A] text-slate-500 dark:text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active Product & Order Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Order {booking.id}
              </span>
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {booking.productTitle}
              </h4>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Current Lease Expiry: <strong className="text-slate-900 dark:text-white font-mono">{booking.endDate}</strong>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-pill bg-[#10B981]/20 text-[#10B981] font-mono font-bold text-[10px]">
              Active Lease
            </span>
          </div>

          {/* Extension Duration Selector */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800 dark:text-slate-200">
              Select Additional Months:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 3, 6] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    months === m
                      ? 'bg-[#10B981] text-emerald-950 border-[#10B981] shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#061712] dark:hover:bg-[#13332A] border-slate-200 dark:border-[#1E4E40] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  +{m} {m === 1 ? 'Month' : 'Months'}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Window Preview */}
          <div className="p-4 rounded-2xl bg-[#061712] border border-[#1E4E40] text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span>Schedule & Turnaround Buffer Window</span>
              <span className="text-[10px] bg-[#10B981]/20 px-2 py-0.5 rounded-pill font-sans font-semibold">
                Verified Availability
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#1E4E40]">
              <div className="p-2 rounded-xl bg-[#0C231C]">
                <span className="text-[10px] text-slate-400 block">Current End</span>
                <span className="font-mono font-bold text-white text-xs">
                  {collisionResult.currentEnd}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0C231C]">
                <span className="text-[10px] text-slate-400 block">Requested New End</span>
                <span className="font-mono font-bold text-[#10B981] text-xs">
                  {collisionResult.requestedNewEnd}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0C231C]">
                <span className="text-[10px] text-slate-400 block">48h Buffer Release</span>
                <span className="font-mono font-bold text-[#F59E0B] text-xs">
                  {collisionResult.bufferEndDate}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Feedback Card */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-2 transition-all ${
              !collisionResult.hasCollision
                ? 'bg-emerald-50 dark:bg-[#061712] border-[#10B981]'
                : collisionResult.shieldActivated
                ? 'bg-amber-50 dark:bg-[#132219] border-amber-500'
                : 'bg-rose-50 dark:bg-[#1a0c0c] border-rose-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                {!collisionResult.hasCollision ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
                ) : collisionResult.shieldActivated ? (
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                )}
                <span>
                  {!collisionResult.hasCollision
                    ? 'Extension Available (0 Schedule Conflicts)'
                    : collisionResult.shieldActivated
                    ? 'Seamless Extension (Protected by Buffer Stock)'
                    : 'Tenancy Extension Currently Unavailable'}
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded-pill text-[10px] font-mono font-bold ${
                  !collisionResult.hasCollision
                    ? 'bg-[#10B981] text-emerald-950'
                    : collisionResult.shieldActivated
                    ? 'bg-amber-500 text-black'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {!collisionResult.hasCollision
                  ? 'Approved'
                  : collisionResult.shieldActivated
                  ? 'Buffer Stock Active'
                  : 'Unavailable'}
              </span>
            </div>

            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {collisionResult.message}
            </p>

            {collisionResult.shieldActivated && (
              <div className="pt-2 border-t border-amber-300 dark:border-amber-800/60 text-[10px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  Cascading Buffer Shield guarantees you keep your current unit at home without disruption!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#061712] border-t border-slate-200 dark:border-[#1E4E40] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">Monthly Rent: </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              ₹{booking.monthlyRentRate.toLocaleString('en-IN')}/mo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#0C231C] dark:hover:bg-[#13332A] text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmExtension}
              disabled={isSimulatingLatency || collisionResult.resolutionType === 'COLLISION_BLOCKED'}
              className="spring-btn px-5 py-2.5 rounded-pill bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {isSimulatingLatency
                  ? 'Amending Agreement...'
                  : `Confirm +${months}M Extension`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
