import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { mandatoryReasonSchema } from '../../lib/validation';

export const BlacklistRegistryView: React.FC = () => {
  const {
    blacklist,
    bookings,
    overrideBlacklistEntry,
    overrideFlaggedBooking,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [ledgerFilter, setLedgerFilter] = useState<
    'ALL' | 'VENDOR_BLACKLIST' | 'CUSTOMER_BLACKLIST'
  >('ALL');
  const [overrideTargetId, setOverrideTargetId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState(
    'Verified full settlement of ₹12,600 past-due damage invoice via NEFT UTR #994120; approved Super Admin exception override under FR-BLK-008.'
  );
  const [bookingOverrideReason, setBookingOverrideReason] = useState(
    'Customer cleared prior default balance and deposited additional security buffer; approved one-time booking release (FR-BLK-008).'
  );

  const filteredBlacklist =
    ledgerFilter === 'ALL'
      ? blacklist
      : blacklist.filter((b) => b.ledgerType === ledgerFilter);

  const flaggedBookings = bookings.filter(
    (b) => b.status === 'Flagged — Blacklist Review'
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-[#FEE2E2] text-[#991B1B] font-semibold">
              Section 7.20 • FR-BLK-001 to FR-BLK-008 • WF-16
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink mt-1">
              Unified Vendor & Client Blacklist Registry & Evasion Radar
            </h1>
            <p className="text-xs text-hearth-umber">
              Maintains two segregated, auditable risk ledgers: (1) <strong>Vendor Blacklist</strong> (auto-enrolled on contract termination per FR-BLK-002) and (2) <strong>Customer Blacklist</strong> (severe payment default, heavy asset damage, or extreme policy breach per FR-BLK-004).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'VENDOR_BLACKLIST', 'CUSTOMER_BLACKLIST'] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setLedgerFilter(f)}
                  className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold border transition-all ${
                    ledgerFilter === f
                      ? 'bg-hearth-terracotta text-white border-hearth-terracotta'
                      : 'bg-hearth-oat text-hearth-umber border-hearth-border'
                  }`}
                >
                  {f === 'ALL'
                    ? `All Ledgers (${blacklist.length})`
                    : f === 'VENDOR_BLACKLIST'
                    ? '1. Vendor Blacklist'
                    : '2. Customer Blacklist'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Intercepted Client Bookings Queue (FR-BLK-005 / EX-032) */}
      {flaggedBookings.length > 0 && (
        <div className="rounded-3xl bg-[#FEE2E2]/35 border-2 border-[#DC2626] p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold">
                Intercepted Client Bookings Held in “Flagged — Blacklist Review” (FR-BLK-005 / EX-032)
              </h2>
            </div>
            <span className="text-xs font-mono text-[#991B1B] font-semibold">
              Inventory Allocation & Vendor Dispatch Blocked
            </span>
          </div>

          <div className="space-y-3">
            {flaggedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-hearth-card border border-[#FECACA] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-hearth-ink">
                      {b.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-[#FEE2E2] text-[#991B1B] font-semibold text-[10px]">
                      {b.status}
                    </span>
                    <span className="font-bold text-hearth-ink">
                      Customer: {b.customerName} ({b.customerId})
                    </span>
                  </div>
                  <div className="font-serif font-semibold text-sm text-hearth-ink">
                    Attempted Product: {b.productTitle} (Deposit: ₹{b.securityDepositAmount.toLocaleString('en-IN')})
                  </div>
                  <div className="text-[#991B1B] text-[11px]">
                    {b.blacklistFlagReason}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={bookingOverrideReason}
                    onChange={(e) => setBookingOverrideReason(e.target.value)}
                    placeholder="Mandatory Super Admin override reason..."
                    className="px-3 py-1.5 rounded-xl bg-hearth-oat border border-hearth-border text-xs w-full sm:w-64"
                  />
                  <button
                    disabled={isSimulatingLatency}
                    onClick={() =>
                      overrideFlaggedBooking(b.id, bookingOverrideReason)
                    }
                    className="spring-btn px-4 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold shrink-0"
                  >
                    Approve One-Time Override (FR-BLK-008)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified Blacklist Cards with Identifier Fingerprints (FR-BLK-001, FR-BLK-006) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBlacklist.map((entry) => (
          <div
            key={entry.id}
            className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-hearth-ink">
                      {entry.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-pill text-[10px] font-mono font-semibold ${
                        entry.ledgerType === 'VENDOR_BLACKLIST'
                          ? 'bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]'
                          : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                      }`}
                    >
                      {entry.ledgerType.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                        entry.status === 'Active Blacklist'
                          ? 'bg-[#991B1B] text-white'
                          : 'bg-[#DCFCE7] text-[#166534]'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                    {entry.entityName} ({entry.entityId})
                  </h3>
                  <div className="text-xs text-hearth-terracotta font-semibold">
                    Trigger Category: {entry.categoryReason} • Case/Ref: {entry.triggeringCaseOrBookingId}
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[#991B1B] font-bold">
                    Dues/Hold: ₹{entry.outstandingDuesAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-hearth-taupe">
                    Blocked Attempts: {entry.blockedAttemptsCount}
                  </div>
                </div>
              </div>

              <p className="text-xs text-hearth-umber leading-relaxed bg-hearth-oat/60 p-3 rounded-2xl border border-hearth-border">
                {entry.evidenceSummary}
              </p>

              {/* Evasion & Duplicate Account Identifier Matrix (FR-BLK-002 / FR-BLK-006) */}
              <div className="p-3.5 rounded-2xl bg-hearth-parchment border border-hearth-border space-y-1.5 text-[11px] font-mono">
                <div className="text-hearth-ink font-sans font-bold text-xs flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-hearth-terracotta" />
                  <span>
                    Cross-Checked Evasion Identifiers (FR-BLK-002 / FR-BLK-006)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-hearth-umber">
                  <div>• Mobile: {entry.matchedIdentifiers.phone}</div>
                  <div>• Email: {entry.matchedIdentifiers.email}</div>
                  {entry.matchedIdentifiers.taxIdOrGstin && (
                    <div>• GSTIN: {entry.matchedIdentifiers.taxIdOrGstin}</div>
                  )}
                  {entry.matchedIdentifiers.kycOrPan && (
                    <div>• PAN/KYC: {entry.matchedIdentifiers.kycOrPan}</div>
                  )}
                  <div className="sm:col-span-2">
                    • Bank / Payment Instrument Fingerprint:{' '}
                    <strong>{entry.matchedIdentifiers.bankOrPaymentFingerprint}</strong>
                  </div>
                </div>
              </div>

              {entry.overrideHistory && (
                <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs">
                  <strong>Whitelisted / Overridden by {entry.overrideHistory.overriddenByAdmin}:</strong>{' '}
                  {entry.overrideHistory.overrideReason} ({entry.overrideHistory.timestamp})
                </div>
              )}
            </div>

            {/* Super Admin Exception Override Controls (FR-BLK-008) */}
            {entry.status === 'Active Blacklist' && (
              <div className="pt-3 border-t border-hearth-border">
                {overrideTargetId !== entry.id ? (
                  <button
                    onClick={() => setOverrideTargetId(entry.id)}
                    className="px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-semibold text-hearth-ink flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-hearth-terracotta" />
                    <span>Super Admin Exception Override / Whitelist (FR-BLK-008)</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-hearth-ink">
                      Mandatory Super Admin Justification & Debt Clearance Proof (FR-BLK-008) *
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-hearth-oat border border-hearth-border text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setOverrideTargetId(null)}
                        className="px-3 py-1 rounded-pill bg-hearth-oat text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSimulatingLatency}
                        onClick={async () => {
                          const valid = mandatoryReasonSchema.safeParse(overrideReason);
                          if (!valid.success) {
                            addToast({
                              title: 'Mandatory Override Reason Required',
                              description: valid.error.errors[0].message,
                              variant: 'error',
                            });
                            return;
                          }
                          await overrideBlacklistEntry(entry.id, overrideReason);
                          setOverrideTargetId(null);
                        }}
                        className="px-4 py-1.5 rounded-pill bg-hearth-sage text-white text-xs font-semibold"
                      >
                        Confirm Override & Log Audit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
