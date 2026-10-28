import React from 'react';
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const SettlementsFinanceView: React.FC = () => {
  const {
    settlements,
    activePersona,
    approveAndReleaseVendorSettlement,
    isSimulatingLatency,
  } = useKaroRentStore();

  // Scope settlements for Vendor vs Platform Admin (BR-012)
  const scopedSettlements =
    activePersona.role === 'PLATFORM_ADMIN'
      ? settlements
      : settlements.filter((s) => s.vendorId === (activePersona.vendorId || 'VEN-201'));

  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-2">
        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-hearth-sageLight text-hearth-sage font-semibold">
          Section 7.15 • FR-SET-001 to FR-SET-008 • FR-VEN-013
        </span>
        <h1 className="font-serif text-2xl font-bold text-hearth-ink">
          Platform Commission, Vendor Settlements & Termination Escrow Holds
        </h1>
        <p className="text-xs text-hearth-umber">
          Vendor payable is calculated from reconciled customer rental collections less approved 12% platform commission (OBD-08). Enforces <strong>Segregation of Duties (FR-SET-008)</strong> where the preparer cannot be the sole approver, and automatically locks payouts for terminating vendors (FR-VEN-013).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {scopedSettlements.map((st) => {
          const isHeld = st.status === 'On Hold — Vendor Termination';
          const isPaid = st.status === 'Paid';

          return (
            <div
              key={st.id}
              className={`rounded-3xl bg-hearth-card border p-6 shadow-hearth space-y-4 ${
                isHeld
                  ? 'border-2 border-[#DC2626] bg-[#FEE2E2]/20'
                  : 'border-hearth-border'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-hearth-ink">
                      {st.id}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-pill text-xs font-semibold ${
                        isPaid
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : isHeld
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : 'bg-[#FFEDD5] text-[#9A3412]'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                    {st.vendorName} ({st.vendorId}) — {st.periodLabel}
                  </h3>
                  <div className="text-[11px] font-mono text-hearth-taupe">
                    Prepared by: {st.preparedByActor}
                    {st.approvedByActor && ` • Approved by: ${st.approvedByActor}`}
                  </div>
                </div>

                {activePersona.role === 'PLATFORM_ADMIN' &&
                  st.status === 'Pending Approval' && (
                    <button
                      disabled={isSimulatingLatency}
                      onClick={() => approveAndReleaseVendorSettlement(st.id)}
                      className="spring-btn px-5 py-2.5 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Approve & Execute NEFT Payout (FR-SET-008 Segregation Verified)
                      </span>
                    </button>
                  )}
              </div>

              {/* Itemised Settlement Statement Breakdown (FR-SET-004) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border">
                  <div className="text-[10px] text-hearth-taupe">
                    Gross Eligible Rent
                  </div>
                  <div className="font-ledger font-bold text-sm text-hearth-ink mt-0.5">
                    ₹{st.grossEligibleCollections.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border">
                  <div className="text-[10px] text-hearth-taupe">
                    Platform Fee ({st.platformCommissionPercent}%)
                  </div>
                  <div className="font-ledger font-bold text-sm text-hearth-terracotta mt-0.5">
                    -₹{st.platformCommissionFee.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border">
                  <div className="text-[10px] text-hearth-taupe">
                    Refunds / Adjustments
                  </div>
                  <div className="font-ledger font-bold text-sm text-hearth-ink mt-0.5">
                    ₹{st.refundsAndChargebacks.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FEE2E2]/50 border border-[#FECACA]">
                  <div className="text-[10px] text-[#991B1B]">
                    Termination Hold (FR-VEN-013)
                  </div>
                  <div className="font-ledger font-bold text-sm text-[#991B1B] mt-0.5">
                    -₹{st.terminationHoldbackAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0]">
                  <div className="text-[10px] text-[#166534] font-semibold">
                    Net Vendor Payable
                  </div>
                  <div className="font-ledger font-bold text-base text-[#166534] mt-0.5">
                    ₹{st.netVendorPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {st.payoutReference && (
                <div className="text-[11px] font-mono text-hearth-sage">
                  Reconciled Payout Reference (FR-SET-006): <strong>{st.payoutReference}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
