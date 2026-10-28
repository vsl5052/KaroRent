import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Lock,
  ReceiptIndianRupee,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { InvoiceChargeType } from '../../types/srs';

const CHARGE_TYPE_BADGES: Record<
  InvoiceChargeType,
  { label: string; colorClass: string }
> = {
  SITE_VISIT_INVOICE: {
    label: '1. Site Visit Invoice',
    colorClass: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
  },
  INSTALLATION_MATERIAL_INVOICE: {
    label: '2. Installation & Material Rate-Card Invoice',
    colorClass: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]',
  },
  PERIODIC_RENTAL_INVOICE: {
    label: '3. Periodic / Upfront Rental Charge Invoice',
    colorClass: 'bg-hearth-apricot text-hearth-terracotta border-hearth-terracotta/30',
  },
  SECURITY_DEPOSIT_COLLECTION_NOTE: {
    label: '4. Security Deposit Collection Note (Tax-Exempt Vault)',
    colorClass: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  },
  POST_RETURN_ADJUSTMENT_INVOICE: {
    label: '5. Post-Return / Ancillary Adjustment Invoice',
    colorClass: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  },
};

export const FiveInvoiceLedgerView: React.FC = () => {
  const {
    invoices,
    depositLedgers,
    activePersona,
    payInvoiceDocument,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [selectedChargeFilter, setSelectedChargeFilter] = useState<
    InvoiceChargeType | 'ALL'
  >('ALL');

  // Scope financial records by role (BR-012 / BR-013)
  const scopedInvoices = invoices.filter((inv) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (activePersona.vendorId) return inv.vendorId === activePersona.vendorId;
    if (activePersona.customerId) return inv.customerId === activePersona.customerId;
    return true;
  });

  const filteredInvoices =
    selectedChargeFilter === 'ALL'
      ? scopedInvoices
      : scopedInvoices.filter((i) => i.chargeType === selectedChargeFilter);

  const scopedDepositLedgers = depositLedgers.filter((d) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (activePersona.vendorId) return d.vendorId === activePersona.vendorId;
    if (activePersona.customerId) return d.customerId === activePersona.customerId;
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-pill bg-hearth-sageLight text-hearth-sage font-semibold">
              Multi-Document Financial Segregation
            </span>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink mt-1">
              5-Document Financial Split & Segregated Security Deposit Vault
            </h1>
            <p className="text-xs text-hearth-umber">
              KaroRent never conflates refundable security deposits with taxable rental revenue. Every booking generates distinct, auditable financial instruments.
            </p>
          </div>
        </div>

        {/* 5-Charge-Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setSelectedChargeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-pill text-xs font-medium border transition-all ${
              selectedChargeFilter === 'ALL'
                ? 'bg-hearth-terracotta text-white border-hearth-terracotta font-semibold'
                : 'bg-hearth-oat text-hearth-umber border-hearth-border'
            }`}
          >
            All 5 Document Types ({scopedInvoices.length})
          </button>
          {(Object.keys(CHARGE_TYPE_BADGES) as InvoiceChargeType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedChargeFilter(type)}
              className={`px-3 py-1.5 rounded-pill text-[11px] font-medium border transition-all ${
                selectedChargeFilter === type
                  ? 'bg-hearth-ink text-hearth-canvas border-hearth-ink font-semibold'
                  : 'bg-hearth-card text-hearth-umber border-hearth-border hover:bg-hearth-oat'
              }`}
            >
              {CHARGE_TYPE_BADGES[type].label.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Segregated Security Deposit Vault Ledgers */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-hearth-ink flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-hearth-sage" />
          <span>Segregated Security Deposit Vault Ledgers (4× Monthly Rent • 14-Day Refund Guarantee)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scopedDepositLedgers.map((ledger) => (
            <div
              key={ledger.id}
              className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-hearth-ink">
                  {ledger.id} ({ledger.bookingId})
                </span>
                <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold">
                  {ledger.refundStatus}
                </span>
              </div>
              <div className="font-serif font-semibold text-sm text-hearth-ink">
                {ledger.productTitle}
              </div>
              <div className="text-[11px] text-hearth-taupe">
                Customer: {ledger.customerName}
              </div>

              <div className="rounded-2xl bg-hearth-oat p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-hearth-umber">Collected Vault Deposit:</span>
                  <span className="font-ledger font-bold text-hearth-ink">
                    ₹{ledger.collectedDeposit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hearth-umber">Proposed / Disputed Hold:</span>
                  <span className="font-ledger text-[#9A3412]">
                    ₹{(ledger.proposedDeduction || ledger.disputedAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-hearth-umber">Approved Deductions:</span>
                  <span className="font-ledger">
                    ₹{ledger.approvedDeduction.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-hearth-border flex justify-between font-bold text-hearth-sage">
                  <span>Net Refundable Balance:</span>
                  <span className="font-ledger">
                    ₹{ledger.netRefundableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {ledger.settlementDueDate && (
                <div className="text-[10px] font-mono text-hearth-sage bg-hearth-sageLight px-3 py-1.5 rounded-xl">
                  SLA: {ledger.settlementDueDate}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5-Invoice Financial Split Table */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth overflow-hidden">
        <div className="px-6 py-4 bg-hearth-oat border-b border-hearth-border flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-hearth-ink">
              Itemised Invoices, Deposit Notes & Adjustments
            </h3>
            <p className="text-[11px] text-hearth-taupe">
              Idempotent payment reconciliation prevents duplicate charges on retry.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-hearth-border bg-hearth-oat/50 text-[11px] font-mono uppercase text-hearth-taupe">
                <th className="py-3 px-4">Doc ID & Booking</th>
                <th className="py-3 px-4">Document Charge Type</th>
                <th className="py-3 px-4">Description & Customer</th>
                <th className="py-3 px-4 text-right">Base</th>
                <th className="py-3 px-4 text-right">GST</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4">Status & Provider Ref</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hearth-border">
              {filteredInvoices.map((inv) => {
                const badge = CHARGE_TYPE_BADGES[inv.chargeType];
                const isPaid = inv.paymentState === 'Successful';
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-hearth-oat/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-hearth-ink">{inv.id}</div>
                      <div className="text-[10px] text-hearth-taupe">{inv.bookingId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-pill border text-[10px] font-semibold ${badge.colorClass}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-hearth-ink">{inv.title}</div>
                      <div className="text-[11px] text-hearth-taupe">
                        {inv.customerName} • Due: {inv.dueDate}
                      </div>
                      {inv.correctionReason && (
                        <div className="text-[10px] text-[#991B1B] mt-0.5 font-medium">
                          Note: {inv.correctionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-ledger">
                      ₹{inv.baseAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-ledger text-hearth-taupe">
                      ₹{inv.taxAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-ledger font-bold text-hearth-ink">
                      ₹{inv.totalPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                          isPaid
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : inv.paymentState === 'Failed'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FFEDD5] text-[#9A3412]'
                        }`}
                      >
                        {inv.paymentState}
                      </span>
                      {inv.providerReference && (
                        <div className="text-[10px] font-mono text-hearth-taupe mt-0.5">
                          {inv.providerReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isPaid ? (
                        <button
                          disabled={isSimulatingLatency}
                          onClick={() => payInvoiceDocument(inv.id)}
                          className="spring-btn px-3.5 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-[11px] font-semibold shadow-sm"
                        >
                          Pay ₹{inv.totalPayable.toLocaleString('en-IN')}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            addToast({
                              title: `Receipt ${inv.id} Downloaded`,
                              description: `Provider Ref ${inv.providerReference} verified.`,
                              variant: 'info',
                            })
                          }
                          className="px-3 py-1 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-[11px] font-medium text-hearth-umber inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      )}
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
