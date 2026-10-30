import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Layers,
  Printer,
  ReceiptIndianRupee,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { DefaultNoticeRecord, InvoiceChargeType } from '../../types/srs';

const CHARGE_TYPE_BADGES: Record<
  InvoiceChargeType,
  { label: string; colorClass: string }
> = {
  SITE_VISIT_INVOICE: {
    label: 'Home Visit',
    colorClass: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
  },
  INSTALLATION_MATERIAL_INVOICE: {
    label: 'Installation',
    colorClass: 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]',
  },
  PERIODIC_RENTAL_INVOICE: {
    label: 'Monthly Rent',
    colorClass: 'bg-hearth-apricot text-hearth-terracotta border-hearth-terracotta/30',
  },
  SECURITY_DEPOSIT_COLLECTION_NOTE: {
    label: 'Security Deposit',
    colorClass: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  },
  POST_RETURN_ADJUSTMENT_INVOICE: {
    label: 'Return Adjustment',
    colorClass: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  },
};

export const FiveInvoiceLedgerView: React.FC = () => {
  const {
    bookings,
    masterProducts,
    invoices,
    depositLedgers,
    activePersona,
    payInvoiceDocument,
    curePaymentDefault,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [selectedNoticeModal, setSelectedNoticeModal] = useState<DefaultNoticeRecord | null>(null);
  const [selectedChargeFilter, setSelectedChargeFilter] = useState<
    InvoiceChargeType | 'ALL'
  >('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  const scopedInvoices = invoices.filter((inv) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (activePersona.vendorId) return inv.vendorId === activePersona.vendorId;
    if (activePersona.customerId) return inv.customerId === activePersona.customerId;
    return true;
  });

  const scopedDepositLedgers = depositLedgers.filter((d) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (activePersona.vendorId) return d.vendorId === activePersona.vendorId;
    if (activePersona.customerId) return d.customerId === activePersona.customerId;
    return true;
  });

  const scopedBookings = bookings.filter((b) => {
    if (activePersona.role === 'PLATFORM_ADMIN') return true;
    if (activePersona.vendorId) return b.fulfillingVendorId === activePersona.vendorId;
    if (activePersona.customerId) return b.customerId === activePersona.customerId;
    return true;
  });

  // Collect all unique bookingIds across scopedBookings, scopedDepositLedgers, and scopedInvoices
  const allBookingIds = Array.from(
    new Set([
      ...scopedBookings.map((b) => b.id),
      ...scopedDepositLedgers.map((d) => d.bookingId),
      ...scopedInvoices.map((i) => i.bookingId),
    ])
  );

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-hearth-ink">
            Payments & Deposits
          </h1>
          <p className="text-xs text-hearth-umber mt-0.5">
            View security deposits, invoices, and payment receipts for each of your products.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedChargeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                selectedChargeFilter === 'ALL'
                  ? 'bg-hearth-terracotta text-white border-hearth-terracotta font-semibold'
                  : 'bg-hearth-oat text-hearth-umber border-hearth-border'
              }`}
            >
              All ({scopedInvoices.length})
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
                {CHARGE_TYPE_BADGES[type].label}
              </button>
            ))}
          </div>

          {/* Select Product Dropdown */}
          {allBookingIds.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-hearth-ink">
                Select Product:
              </label>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="px-4 py-2 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
              >
                <option value="ALL" className="bg-white text-hearth-ink font-sans font-normal">
                  All Products ({allBookingIds.length})
                </option>
                {allBookingIds.map((bId) => {
                  const b = bookings.find((bk) => bk.id === bId);
                  const l = scopedDepositLedgers.find((d) => d.bookingId === bId);
                  const title = b?.productTitle || l?.productTitle || bId;
                  return (
                    <option key={bId} value={bId} className="bg-white text-hearth-ink font-sans font-normal">
                      {bId} — {title.slice(0, 26)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Unified Product Cards combining Security Deposits + Invoices & Receipts */}
      <div className="space-y-6">
        {allBookingIds
          .filter(
            (bookingId) =>
              selectedProductFilter === 'ALL' || bookingId === selectedProductFilter
          )
          .map((bookingId) => {
          const booking = bookings.find((b) => b.id === bookingId);
          const ledger = scopedDepositLedgers.find((d) => d.bookingId === bookingId);
          const productInvoices = scopedInvoices.filter(
            (inv) =>
              inv.bookingId === bookingId &&
              (selectedChargeFilter === 'ALL' ||
                inv.chargeType === selectedChargeFilter)
          );

          if (selectedChargeFilter !== 'ALL' && productInvoices.length === 0) {
            return null;
          }

          const product = booking
            ? masterProducts.find((p) => p.id === booking.productId)
            : undefined;

          const productTitle =
            booking?.productTitle ||
            ledger?.productTitle ||
            productInvoices[0]?.title ||
            `Order ${bookingId}`;

          return (
            <div
              key={bookingId}
              className="rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth overflow-hidden"
            >
              {/* Product Card Header */}
              <div className="p-6 border-b border-hearth-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {product && (
                    <img
                      src={product.lifestyleImage}
                      alt={productTitle}
                      className="w-16 h-16 rounded-2xl object-cover border border-hearth-border shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                        {bookingId}
                      </span>
                      {booking && (
                        <span className="px-2.5 py-0.5 rounded-pill bg-hearth-parchment border border-hearth-border text-[11px] font-semibold text-hearth-umber">
                          {booking.status === 'Flagged — Blacklist Review' &&
                          activePersona.role !== 'PLATFORM_ADMIN'
                            ? 'Order Processing'
                            : booking.status}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-lg font-bold text-hearth-ink">
                      {productTitle}
                    </h2>
                    {booking && (
                      <p className="text-xs text-hearth-taupe">
                        Plan: {booking.tenureMonths} Months ({booking.startDate} to{' '}
                        {booking.endDate})
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Deposit Summary inside the Product Card */}
                {ledger && (
                  <div className="w-full lg:w-auto rounded-2xl bg-hearth-oat border border-hearth-border p-4 space-y-2 min-w-[280px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-serif font-bold text-hearth-ink flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-hearth-sage" />
                        <span>Security Deposit</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold">
                        {ledger.refundStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                      <div>
                        <div className="text-[10px] text-hearth-taupe">
                          Deposit Paid
                        </div>
                        <div className="font-ledger font-bold text-hearth-ink">
                          ₹{ledger.collectedDeposit.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-hearth-taupe">
                          Under Review
                        </div>
                        <div className="font-ledger font-semibold text-[#9A3412]">
                          ₹
                          {(
                            ledger.proposedDeduction || ledger.disputedAmount
                          ).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-hearth-taupe">
                          Deductions
                        </div>
                        <div className="font-ledger font-semibold text-hearth-ink">
                          ₹{ledger.approvedDeduction.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-hearth-sage font-semibold">
                          Refundable Balance
                        </div>
                        <div className="font-ledger font-bold text-hearth-sage">
                          ₹{ledger.netRefundableAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {ledger.settlementDueDate && (
                      <div className="text-[10px] text-hearth-sage bg-hearth-sageLight px-2.5 py-1 rounded-lg">
                        {ledger.settlementDueDate}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4-Tier Waterfall Security Deposit Drawdown Card (Section 6.2 BR-033) */}
              {booking?.waterfallSettlement && (
                <div className="p-6 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border-b border-hearth-border space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-hearth-terracotta/15 flex items-center justify-center text-hearth-terracotta">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-hearth-ink">
                          Statutory 4-Tier Security Deposit Drawdown (BR-033)
                        </h4>
                        <p className="text-[11px] text-hearth-taupe">
                          Settled on {booking.waterfallSettlement.settledAt} pursuant to Section 6.2 recovery priority.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-pill text-xs font-bold border ${
                        booking.waterfallSettlement.outcome === 'SURPLUS_REFUND'
                          ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                          : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                      }`}
                    >
                      {booking.waterfallSettlement.outcome === 'SURPLUS_REFUND'
                        ? 'Scenario A: Surplus Refund Approved'
                        : 'Scenario B: Deficit Forfeit & Adjustment Invoice Issued'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-hearth-card/80 p-4 rounded-2xl border border-hearth-border text-xs">
                    <div>
                      <div className="text-[10px] text-hearth-taupe uppercase font-semibold">1. Unpaid Base Rent</div>
                      <div className="font-ledger font-bold text-[#991B1B] text-sm">
                        -₹{booking.waterfallSettlement.unpaidBaseRent.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">Priority Tier 1</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-hearth-taupe uppercase font-semibold">2. Logistics / De-install</div>
                      <div className="font-ledger font-bold text-[#991B1B] text-sm">
                        -₹{booking.waterfallSettlement.logisticsDeinstallationFee.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">Priority Tier 2 (Standard)</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-hearth-taupe uppercase font-semibold">3. Verified Damage</div>
                      <div className="font-ledger font-bold text-[#991B1B] text-sm">
                        -₹{booking.waterfallSettlement.verifiedDamageFee.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">Priority Tier 3</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-hearth-taupe uppercase font-semibold">4. Contractual Late Fees</div>
                      <div className="font-ledger font-bold text-[#991B1B] text-sm">
                        -₹{booking.waterfallSettlement.contractualLateFees.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">Priority Tier 4 (BR-032)</div>
                    </div>

                    <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-hearth-border pt-2 md:pt-0 md:pl-3">
                      <div className="text-[10px] text-hearth-taupe uppercase font-semibold">
                        {booking.waterfallSettlement.netBalance >= 0 ? 'Surplus Refund' : 'Deficit Demand'}
                      </div>
                      <div
                        className={`font-ledger font-black text-base ${
                          booking.waterfallSettlement.netBalance >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'
                        }`}
                      >
                        {booking.waterfallSettlement.netBalance >= 0 ? '+' : '-'}₹
                        {Math.abs(booking.waterfallSettlement.netBalance).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">
                        {booking.waterfallSettlement.netBalance >= 0
                          ? '14-Day Vault Payout'
                          : `Invoice: ${booking.waterfallSettlement.deficitInvoiceId || 'Pending'}`}
                      </div>
                    </div>
                  </div>

                  {booking.waterfallSettlement.mediatorNotes && (
                    <div className="text-xs text-hearth-umber bg-hearth-card/90 px-3.5 py-2 rounded-xl border border-hearth-border flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-hearth-terracotta shrink-0 mt-0.5" />
                      <span>{booking.waterfallSettlement.mediatorNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Invoices & Receipts for this Product */}
              <div className="p-6 space-y-3 bg-hearth-parchment/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-hearth-ink flex items-center gap-1.5">
                    <ReceiptIndianRupee className="w-4 h-4 text-hearth-terracotta" />
                    <span>Invoices & Receipts ({productInvoices.length})</span>
                  </h3>
                </div>

                {productInvoices.length === 0 ? (
                  <p className="text-xs text-hearth-taupe py-2">
                    No invoices found for this filter.
                  </p>
                ) : (
                  <div className="divide-y divide-hearth-border rounded-2xl bg-hearth-card border border-hearth-border overflow-hidden">
                    {productInvoices.map((inv) => {
                      const badge = CHARGE_TYPE_BADGES[inv.chargeType];
                      const isPaid = inv.paymentState === 'Successful';

                      return (
                        <div
                          key={inv.id}
                          className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-hearth-oat/40 transition-colors text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-hearth-ink">
                                {inv.id}
                              </span>
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-pill border text-[10px] font-semibold ${badge.colorClass}`}
                              >
                                {badge.label}
                              </span>
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                                  isPaid
                                    ? 'bg-[#DCFCE7] text-[#166534]'
                                    : inv.paymentState === 'Failed'
                                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                                    : 'bg-[#FFEDD5] text-[#9A3412]'
                                }`}
                              >
                                {isPaid ? 'Paid' : inv.paymentState}
                              </span>

                              {inv.overdueStage && inv.overdueStage !== 'NONE' && (
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-pill text-[10px] font-bold border ${
                                    inv.overdueStage === 'NOTICE_1'
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : inv.overdueStage === 'NOTICE_2'
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : 'bg-red-700 text-white border-red-800'
                                  }`}
                                >
                                  {inv.overdueStage === 'NOTICE_1'
                                    ? 'Notice 1 (T+1 Reminder)'
                                    : inv.overdueStage === 'NOTICE_2'
                                    ? `Notice 2 (T+5 Default${inv.lateFeeAssessed ? ` • +₹${inv.lateFeeAssessed} Fee` : ''})`
                                    : 'Notice 3 (T+11 Terminated)'}
                                </span>
                              )}
                            </div>

                            <div className="font-semibold text-hearth-ink">
                              {inv.title}
                            </div>

                            {/* Legal Notice Action Buttons matching default stages */}
                            {(() => {
                              const invoiceNotices = (booking?.defaultNotices || []).filter(
                                (n) => n.invoiceId === inv.id || n.bookingId === inv.bookingId
                              );

                              if (invoiceNotices.length === 0) return null;

                              return (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {invoiceNotices.map((n) => {
                                    const isCurrentStage = inv.overdueStage
                                      ? n.noticeType === inv.overdueStage
                                      : n.id === invoiceNotices[invoiceNotices.length - 1].id;
                                    return (
                                      <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => setSelectedNoticeModal(n)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-semibold transition-all ${
                                          isCurrentStage
                                            ? n.noticeType === 'NOTICE_3'
                                              ? 'bg-red-700 hover:bg-red-800 text-white shadow-sm ring-1 ring-red-400 font-bold'
                                              : n.noticeType === 'NOTICE_2'
                                              ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold shadow-sm'
                                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold shadow-sm'
                                            : 'bg-hearth-oat hover:bg-rose-50 text-hearth-umber border border-hearth-border'
                                        }`}
                                        title={`Click to view ${n.noticeTitle}`}
                                      >
                                        <FileText
                                          className={`w-3 h-3 ${
                                            isCurrentStage && n.noticeType === 'NOTICE_3'
                                              ? 'text-white'
                                              : isCurrentStage && n.noticeType === 'NOTICE_2'
                                              ? 'text-rose-700'
                                              : isCurrentStage
                                              ? 'text-amber-700'
                                              : 'text-rose-600'
                                          }`}
                                        />
                                        <span>
                                          {n.noticeType === 'NOTICE_1'
                                            ? 'Notice 1 (T+1)'
                                            : n.noticeType === 'NOTICE_2'
                                            ? 'Notice 2 (T+5)'
                                            : 'Notice 3 (T+11)'}
                                          {isCurrentStage ? ' • Current' : ''}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                            <div className="text-[11px] text-hearth-taupe">
                              Due: {inv.dueDate}
                              {inv.paidAt && ` • Paid on ${inv.paidAt}`}
                            </div>
                            {inv.correctionReason && (
                              <div className="text-[10px] text-[#991B1B] font-medium">
                                Note: {inv.correctionReason}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 ml-auto">
                            <div className="text-right">
                              <div className="text-[11px] text-hearth-taupe font-ledger">
                                Base ₹{inv.baseAmount.toLocaleString('en-IN')} + GST ₹
                                {inv.taxAmount.toLocaleString('en-IN')}
                              </div>
                              <div className="font-ledger font-bold text-sm text-hearth-ink">
                                ₹{inv.totalPayable.toLocaleString('en-IN')}
                              </div>
                            </div>

                            {!isPaid ? (
                              <button
                                disabled={isSimulatingLatency}
                                onClick={() => {
                                  if (inv.overdueStage && inv.overdueStage !== 'NONE') {
                                    curePaymentDefault({ bookingId: inv.bookingId, invoiceId: inv.id });
                                  } else {
                                    payInvoiceDocument(inv.id);
                                  }
                                }}
                                className={`spring-btn px-4 py-2 rounded-pill text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 ${
                                  inv.overdueStage && inv.overdueStage !== 'NONE'
                                    ? 'bg-[#166534] hover:bg-[#14532D]'
                                    : 'bg-hearth-terracotta hover:bg-hearth-kiln'
                                }`}
                              >
                                {inv.overdueStage && inv.overdueStage !== 'NONE' ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Pay & Cure Default ₹{inv.totalPayable.toLocaleString('en-IN')}</span>
                                  </>
                                ) : (
                                  <span>Pay ₹{inv.totalPayable.toLocaleString('en-IN')}</span>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  addToast({
                                    title: `Receipt ${inv.id} Downloaded`,
                                    description: `Payment reference ${inv.providerReference} saved.`,
                                    variant: 'info',
                                  })
                                }
                                className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber inline-flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal Notice Modal */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-hearth-card border border-hearth-border rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-pill bg-white/20 text-white text-[11px] font-bold font-mono">
                    {selectedNoticeModal.noticeType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-pill bg-amber-400 text-amber-950 text-[10px] font-bold">
                    Statutory Notice
                  </span>
                  {selectedNoticeModal.agentAuthCode && (
                    <span className="px-2.5 py-0.5 rounded-pill bg-red-400 text-red-950 text-[10px] font-bold font-mono">
                      Auth Code: {selectedNoticeModal.agentAuthCode}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold">
                  {selectedNoticeModal.noticeTitle}
                </h3>
                <p className="text-xs text-rose-200">
                  Issued: {selectedNoticeModal.issuedAt} • Deadline: {selectedNoticeModal.dueOrCureDeadline}
                </p>
              </div>

              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-Stage Notice Switcher Tabs */}
            {(() => {
              const modalBooking = bookings.find(
                (b) =>
                  b.id === selectedNoticeModal.bookingId ||
                  b.defaultNotices?.some((n) => n.id === selectedNoticeModal.id)
              );
              const allBookingNotices = (modalBooking?.defaultNotices || []).filter(
                (n) =>
                  n.invoiceId === selectedNoticeModal.invoiceId ||
                  n.bookingId === selectedNoticeModal.bookingId
              );

              if (allBookingNotices.length <= 1) return null;

              return (
                <div className="flex items-center gap-2 px-6 py-2.5 bg-hearth-oat/90 border-b border-hearth-border overflow-x-auto">
                  <span className="text-[11px] font-semibold text-hearth-taupe whitespace-nowrap">
                    Switch Notice Stage:
                  </span>
                  {allBookingNotices.map((n) => {
                    const isSelected = selectedNoticeModal.id === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setSelectedNoticeModal(n)}
                        className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-400 font-bold'
                            : 'bg-white hover:bg-rose-50 text-hearth-ink border border-hearth-border'
                        }`}
                      >
                        <span>
                          {n.noticeType === 'NOTICE_1'
                            ? 'Notice 1 (T+1 Reminder)'
                            : n.noticeType === 'NOTICE_2'
                            ? 'Notice 2 (T+5 Formal Default)'
                            : 'Notice 3 (T+11 Repossession)'}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Notice Summary Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-hearth-oat border-b border-hearth-border text-xs">
              <div>
                <div className="text-[10px] text-hearth-taupe font-semibold uppercase">Principal Rent</div>
                <div className="font-ledger font-bold text-hearth-ink">
                  ₹{selectedNoticeModal.principalAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-hearth-taupe font-semibold uppercase">Late Fee (BR-032)</div>
                <div className="font-ledger font-bold text-[#991B1B]">
                  ₹{selectedNoticeModal.lateFeeAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-hearth-taupe font-semibold uppercase">Total Payable to Cure</div>
                <div className="font-ledger font-bold text-hearth-terracotta">
                  ₹{selectedNoticeModal.totalPayable.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Notice Text Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3 bg-hearth-parchment/60 font-mono text-xs text-hearth-ink leading-relaxed whitespace-pre-wrap border-b border-hearth-border">
              {selectedNoticeModal.fullNoticeText}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-hearth-card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNoticeModal.fullNoticeText);
                    addToast({
                      title: 'Notice Copied',
                      description: 'Full legal notice text copied to clipboard.',
                      variant: 'success',
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber inline-flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>

                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="px-5 py-2 rounded-pill bg-hearth-ink text-white hover:bg-hearth-umber text-xs font-semibold shadow-sm transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
