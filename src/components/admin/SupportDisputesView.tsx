import React, { useState } from 'react';
import {
  Lock,
  MessageSquare,
  MessageSquareWarning,
  Send,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const SupportDisputesView: React.FC = () => {
  const {
    supportTickets,
    activePersona,
    escalateSupportTicket,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null
  );
  const [replyTextByTicket, setReplyTextByTicket] = useState<
    Record<string, string>
  >({});

  const selectedInquiry = supportTickets.find(
    (st) => st.id === selectedInquiryId
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-2">
        <h1 className="font-serif text-2xl font-bold text-hearth-ink">
          Support
        </h1>
        <p className="text-xs text-hearth-umber">
          Manage and resolve customer support inquiries and operational tickets.
        </p>
      </div>

      <div className="w-full">
        {/* Customer Inquiries */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-hearth-sage" />
              <span>Customer Inquiries ({supportTickets.length})</span>
            </h2>
            <span className="text-[11px] text-hearth-taupe">
              Click an inquiry to view chat & reply
            </span>
          </div>

          <div className="space-y-3">
            {supportTickets.map((st) => {
              const lastMsg =
                st.publicCommunicationLog[
                  st.publicCommunicationLog.length - 1
                ];

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedInquiryId(st.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedInquiryId(st.id);
                    }
                  }}
                  className="p-4 rounded-2xl bg-hearth-oat hover:bg-hearth-apricot/60 border border-hearth-border hover:border-hearth-terracotta/50 transition-all cursor-pointer space-y-2 text-xs group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-hearth-ink">
                        {st.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-[10px] font-semibold text-hearth-umber">
                        {st.category}
                      </span>
                      {st.bookingId && (
                        <span className="font-mono text-[10px] text-hearth-taupe">
                          Order: {st.bookingId}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-pill font-semibold text-[10px] ${
                        st.status === 'Resolved'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FFEDD5] text-[#9A3412]'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>

                  <p className="text-hearth-ink font-medium line-clamp-2">
                    {st.description}
                  </p>

                  {lastMsg && (
                    <p className="text-[11px] text-hearth-taupe truncate">
                      Latest ({lastMsg.author}): {lastMsg.message}
                    </p>
                  )}

                  <div className="pt-1.5 border-t border-hearth-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-hearth-taupe flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-hearth-sage" />
                      <span>
                        {st.publicCommunicationLog.length}{' '}
                        {st.publicCommunicationLog.length === 1
                          ? 'message'
                          : 'messages'}
                      </span>
                    </span>
                    <span className="font-semibold text-hearth-terracotta group-hover:underline">
                      Open Chat & Reply →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inquiry Chat & Reply Popup Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedInquiryId(null)}
        >
          <div
            className="w-full max-w-xl rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-hearth-oat border-b border-hearth-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-hearth-terracotta">
                    {selectedInquiry.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-[10px] font-semibold text-hearth-ink">
                    {selectedInquiry.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-pill font-semibold text-[10px] ${
                      selectedInquiry.status === 'Resolved'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#FFEDD5] text-[#9A3412]'
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-hearth-ink mt-1">
                  {selectedInquiry.description}
                </h3>
                {selectedInquiry.bookingId && (
                  <p className="text-[11px] text-hearth-taupe mt-0.5">
                    Order: <span className="font-mono">{selectedInquiry.bookingId}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryId(null)}
                className="p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation History */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activePersona.role === 'PLATFORM_ADMIN' &&
                selectedInquiry.internalAdminNotes && (
                  <div className="p-3 rounded-xl bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412] text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>{selectedInquiry.internalAdminNotes}</span>
                  </div>
                )}

              <div className="space-y-3">
                {selectedInquiry.publicCommunicationLog.map((msg, i) => {
                  const isSupport =
                    msg.role.toLowerCase().includes('support') ||
                    msg.role.toLowerCase().includes('admin') ||
                    msg.role.toLowerCase().includes('ops');

                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        isSupport
                          ? 'bg-hearth-sageLight/70 border-hearth-sage/30 ml-4'
                          : 'bg-hearth-card border-hearth-border mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-hearth-ink">
                          {msg.author}{' '}
                          <span className="font-normal text-hearth-taupe">
                            ({msg.role})
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-hearth-taupe">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-hearth-umber leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Footer */}
            <div className="px-6 py-4 bg-hearth-oat border-t border-hearth-border">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const replyVal =
                    replyTextByTicket[selectedInquiry.id] ??
                    'We have reviewed your request and confirmed your details.';
                  if (!replyVal.trim()) return;
                  await escalateSupportTicket(selectedInquiry.id, replyVal);
                  setReplyTextByTicket({
                    ...replyTextByTicket,
                    [selectedInquiry.id]: '',
                  });
                }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  placeholder="Write your reply..."
                  value={
                    replyTextByTicket[selectedInquiry.id] ??
                    'We have reviewed your request and confirmed your details.'
                  }
                  onChange={(e) =>
                    setReplyTextByTicket({
                      ...replyTextByTicket,
                      [selectedInquiry.id]: e.target.value,
                    })
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSimulatingLatency}
                  className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
