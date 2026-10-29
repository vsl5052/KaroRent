import React, { useState } from 'react';
import {
  Download,
  ReceiptIndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { InvoiceChargeType } from '../../types/srs';

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
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [selectedChargeFilter, setSelectedChargeFilter] = useState<
    InvoiceChargeType | 'ALL'
  >('ALL');

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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
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
      </div>

      {/* Unified Product Cards combining Security Deposits + Invoices & Receipts */}
      <div className="space-y-6">
        {allBookingIds.map((bookingId) => {
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
                            </div>

                            <div className="font-semibold text-hearth-ink">
                              {inv.title}
                            </div>
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
                                onClick={() => payInvoiceDocument(inv.id)}
                                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm"
                              >
                                Pay ₹{inv.totalPayable.toLocaleString('en-IN')}
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
    </div>
  );
};
