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
        <h1 className="font-serif text-2xl font-bold text-hearth-ink">
          Support
        </h1>
        <p className="text-xs text-hearth-umber">
          Manage maintenance requests, item replacements, and customer inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance & Replacements */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
            <Wrench className="w-5 h-5 text-hearth-terracotta" />
            <span>
              Maintenance & Replacements ({serviceTickets.length})
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
                  {t.productTitle} — Serial: {t.currentAssetSerial}
                </div>
                <p className="text-hearth-umber">{t.issueDescription}</p>

                {t.replacementAssetSerial && (
                  <div className="p-2.5 rounded-xl bg-[#DCFCE7] text-[#166534] font-mono text-[11px]">
                    ✓ Replaced with {t.replacementAssetSerial} • Credit: ₹{t.downtimeCreditAmount}
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
                        <span>Replace Item</span>
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer Inquiries */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-hearth-sage" />
            <span>
              Customer Inquiries ({supportTickets.length})
            </span>
          </h2>

          <div className="space-y-3">
            {supportTickets.map((st) => {
              const replyVal =
                replyTextByTicket[st.id] ||
                'We have reviewed your request and confirmed your details.';

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
                      {st.status}
                    </span>
                  </div>
                  <p className="text-hearth-umber font-medium">{st.description}</p>

                  {activePersona.role === 'PLATFORM_ADMIN' && (
                    <div className="p-2.5 rounded-xl bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412] text-[11px] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{st.internalAdminNotes}</span>
                    </div>
                  )}

                  {/* Messages */}
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
                      Send Reply
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
