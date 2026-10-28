import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Lock,
  MessageSquareWarning,
  Wrench,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const SupportDisputesView: React.FC = () => {
  const {
    serviceTickets,
    supportTickets,
    disputeCases,
    activePersona,
    executeVendorAssetReplacement,
    escalateSupportTicket,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [swapSerialInput, setSwapSerialInput] = useState('SN-AC15-2026-108');
  const [replyTextByTicket, setReplyTextByTicket] = useState<
    Record<string, string>
  >({});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-2">
        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold">
          FR-SRV-001..006 • FR-SUP-001..005 • FR-DSP-001..007
        </span>
        <h1 className="font-serif text-2xl font-bold text-hearth-ink">
          Maintenance, Asset Replacement Swaps & Support SLA Concierge
        </h1>
        <p className="text-xs text-hearth-umber">
          Tracks serialized asset replacements with automatic contract addendum generation (FR-SRV-004) and enforces support privacy rules where internal platform notes remain hidden from customers and vendors (FR-SUP-002).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance & Asset Replacement Tickets (FR-SRV-001 to 006) */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
            <Wrench className="w-5 h-5 text-hearth-terracotta" />
            <span>
              Maintenance & Serialized Asset Swap Tickets ({serviceTickets.length})
            </span>
          </h2>

          <div className="space-y-3">
            {serviceTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-hearth-ink">
                    {t.id} ({t.bookingId})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold text-[10px]">
                    {t.status}
                  </span>
                </div>
                <div className="font-serif font-bold text-sm text-hearth-ink">
                  {t.productTitle} — Current Serial: {t.currentAssetSerial}
                </div>
                <p className="text-hearth-umber">{t.issueDescription}</p>

                {t.replacementAssetSerial && (
                  <div className="p-2.5 rounded-xl bg-[#DCFCE7] text-[#166534] font-mono text-[11px]">
                    ✓ Swapped to Serial {t.replacementAssetSerial} • Downtime Credit: ₹{t.downtimeCreditAmount} (FR-SRV-005)
                  </div>
                )}

                {t.status !== 'Resolved' &&
                  (activePersona.role === 'VENDOR_OWNER' ||
                    activePersona.role === 'PLATFORM_ADMIN') && (
                    <div className="pt-2 border-t border-hearth-border flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={swapSerialInput}
                        onChange={(e) => setSwapSerialInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border font-mono text-xs"
                      />
                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          executeVendorAssetReplacement(t.id, swapSerialInput)
                        }
                        className="spring-btn px-3.5 py-1.5 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Execute Asset Swap & Amend Contract (FR-SRV-004)</span>
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer Support & SLA Escalation Tickets (FR-SUP-001 to 005) */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-hearth-sage" />
            <span>
              Customer Support & SLA Escalation Desk ({supportTickets.length})
            </span>
          </h2>

          <div className="space-y-3">
            {supportTickets.map((st) => {
              const replyVal =
                replyTextByTicket[st.id] ||
                'Escalated/resolved under FR-SUP-004 with verified ledger confirmation.';

              return (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-hearth-ink">
                      {st.id} • {st.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] font-semibold text-[10px]">
                      {st.status} • SLA: {st.slaDeadline}
                    </span>
                  </div>
                  <p className="text-hearth-umber font-medium">{st.description}</p>

                  {/* Internal Admin Notes — Strictly Hidden from Customers/Vendors per FR-SUP-002! */}
                  {activePersona.role === 'PLATFORM_ADMIN' && (
                    <div className="p-2.5 rounded-xl bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412] text-[11px] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{st.internalAdminNotes}</span>
                    </div>
                  )}

                  {/* Public Communication Thread */}
                  <div className="space-y-1.5 pl-3 border-l-2 border-hearth-terracotta/40">
                    {st.publicCommunicationLog.map((msg, i) => (
                      <div key={i} className="text-[11px]">
                        <strong className="text-hearth-ink">
                          {msg.author} ({msg.role}):
                        </strong>{' '}
                        <span className="text-hearth-umber">{msg.message}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={replyVal}
                      onChange={(e) =>
                        setReplyTextByTicket({
                          ...replyTextByTicket,
                          [st.id]: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                    />
                    <button
                      onClick={() => escalateSupportTicket(st.id, replyVal)}
                      className="px-4 py-1.5 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold shrink-0"
                    >
                      Post Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
