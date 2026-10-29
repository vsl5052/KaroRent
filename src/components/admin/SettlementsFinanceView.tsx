import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Download,
  PackageCheck,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { VendorSettlementStatement } from '../../types/srs';

export const SettlementsFinanceView: React.FC = () => {
  const {
    vendors,
    virtualInventory,
    vendorProductRates,
    settlements,
    activePersona,
    approveAndReleaseVendorSettlement,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [selectedAdminVendorId, setSelectedAdminVendorId] = useState<string>(
    activePersona.vendorId || 'VEN-201'
  );

  const targetVendorId =
    activePersona.role === 'PLATFORM_ADMIN'
      ? selectedAdminVendorId
      : activePersona.vendorId || 'VEN-201';

  const currentVendor =
    vendors.find((v) => v.id === targetVendorId) || vendors[0];

  const vendorInventory = virtualInventory.filter(
    (i) => i.owningVendorId === targetVendorId
  );

  const vendorRates = vendorProductRates.filter(
    (r) => r.vendorId === targetVendorId
  );

  // Build aggregate rows for Card 1 (no customer info)
  const currentlyRentedRows = vendorInventory
    .filter((inv) => inv.rentedQuantity > 0)
    .map((inv) => {
      const rateRec = vendorRates.find((r) => r.inventoryId === inv.id);
      const agreedRate = rateRec?.agreedMonthlyRate || 1200;
      return {
        id: inv.id,
        productTitle: inv.productTitle,
        quantity: inv.rentedQuantity,
        agreedRate,
        totalAmount: inv.rentedQuantity * agreedRate,
      };
    });

  const returnedProductRows = vendorRates
    .filter((r) => r.returnedUnitCount > 0)
    .map((r) => ({
      id: r.id,
      productTitle: r.productTitle,
      quantity: r.returnedUnitCount,
      agreedRate: r.agreedMonthlyRate,
      totalAmount: r.returnedUnitCount * r.agreedMonthlyRate,
    }));

  const returnInProgressRows = vendorRates
    .filter((r) => r.returnInProgressCount > 0)
    .map((r) => ({
      id: r.id,
      productTitle: r.productTitle,
      quantity: r.returnInProgressCount,
      agreedRate: r.agreedMonthlyRate,
      totalAmount: r.returnInProgressCount * r.agreedMonthlyRate,
    }));

  const totalRentedAmount = currentlyRentedRows.reduce(
    (acc, r) => acc + r.totalAmount,
    0
  );
  const totalReturnedAmount = returnedProductRows.reduce(
    (acc, r) => acc + r.totalAmount,
    0
  );
  const totalInProgressAmount = returnInProgressRows.reduce(
    (acc, r) => acc + r.totalAmount,
    0
  );
  const totalPossiblePayout =
    totalRentedAmount + totalReturnedAmount + totalInProgressAmount;

  const pendingSettlement = settlements.find(
    (s) => s.vendorId === targetVendorId && s.status === 'Pending Approval'
  );

  const pastPaidSettlements = settlements.filter(
    (s) => s.vendorId === targetVendorId && s.status === 'Paid'
  );

  const handleDownloadReceipt = (st: VendorSettlementStatement) => {
    const content = [
      `====================================================================`,
      `KARORENT PARTNER PAYOUT RECEIPT`,
      `====================================================================`,
      `Receipt ID       : ${st.id}`,
      `Partner          : ${st.vendorName} (${st.vendorId})`,
      `Billing Period   : ${st.periodLabel}`,
      `Paid Date        : ${st.createdAt}`,
      `Payment Ref      : ${st.payoutReference || 'NEFT_SETTLED'}`,
      `Disbursed Amount : INR ${st.netVendorPayable.toLocaleString('en-IN')}`,
      `Status           : ${st.status}`,
      `====================================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${st.id}_Payout_Receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: `Receipt ${st.id} Downloaded`,
      description: `Saved payout receipt (${st.payoutReference}).`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-hearth-ink">
            Payouts
          </h1>
          <p className="text-xs text-hearth-umber mt-0.5">
            Review current possible payouts at agreed partner rates and download past payout receipts.
          </p>
        </div>

        {activePersona.role === 'PLATFORM_ADMIN' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-hearth-ink">
              Select Partner:
            </label>
            <select
              value={selectedAdminVendorId}
              onChange={(e) => setSelectedAdminVendorId(e.target.value)}
              className="px-4 py-2 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="bg-white text-hearth-ink font-sans font-normal">
                  {v.id} — {v.displayName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Platform Operator Only: Restricted Vendor Hold Banner */}
      {activePersona.role === 'PLATFORM_ADMIN' &&
        (currentVendor.status.includes('Terminat') ||
          currentVendor.settlementHoldAmount > 0) && (
          <div className="p-5 rounded-3xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] space-y-2 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-serif font-bold text-base">
                <AlertOctagon className="w-5 h-5" />
                <span>Restricted / Blacklisted Vendor Payout Hold (Operator View Only)</span>
              </div>
              <span className="px-3 py-1 rounded-pill bg-[#991B1B] text-white text-xs font-mono font-semibold">
                Held Payout: ₹
                {currentVendor.settlementHoldAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {currentVendor.displayName} is restricted/blacklisted. The vendor sees normal payout calculations without any restriction alert, while disbursements remain held by the Platform Operator.
            </p>
          </div>
        )}

      {/* CARD 1: Current Possible Payouts */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hearth-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-hearth-apricot border border-hearth-terracotta/30 text-hearth-terracotta flex items-center justify-center">
              <WalletCards className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-hearth-ink">
                Current Possible Payouts
              </h2>
              <p className="text-xs text-hearth-taupe">
                Aggregate product quantities and agreed platform–partner rates for{' '}
                <strong>{currentVendor.displayName}</strong>
              </p>
            </div>
          </div>

          {activePersona.role === 'PLATFORM_ADMIN' && pendingSettlement && (
            <button
              disabled={isSimulatingLatency}
              onClick={() =>
                approveAndReleaseVendorSettlement(pendingSettlement.id)
              }
              className="spring-btn px-5 py-2.5 rounded-pill bg-hearth-sage hover:bg-[#233E26] text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve & Release Payout</span>
            </button>
          )}
        </div>

        {/* 1. Currently Rented Products */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-hearth-ink flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-hearth-sage" />
              <span>1. Currently Rented Products</span>
            </h3>
            <span className="text-xs font-ledger font-semibold text-hearth-sage">
              Subtotal: ₹{totalRentedAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {currentlyRentedRows.length === 0 ? (
            <div className="p-4 rounded-2xl bg-hearth-oat text-xs text-hearth-taupe">
              No currently rented units in this cycle.
            </div>
          ) : (
            <div className="rounded-2xl border border-hearth-border overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-hearth-oat border-b border-hearth-border text-[11px] font-mono uppercase text-hearth-taupe">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">Rented Quantity</th>
                    <th className="py-3 px-4 text-right">
                      Agreed Rate (Per Unit)
                    </th>
                    <th className="py-3 px-4 text-right">Agreed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hearth-border bg-hearth-parchment/40">
                  {currentlyRentedRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-4 font-semibold text-hearth-ink">
                        {row.productTitle}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-hearth-ink">
                        {row.quantity} {row.quantity === 1 ? 'unit' : 'units'}
                      </td>
                      <td className="py-3 px-4 text-right font-ledger text-hearth-umber">
                        ₹{row.agreedRate.toLocaleString('en-IN')} / mo
                      </td>
                      <td className="py-3 px-4 text-right font-ledger font-bold text-hearth-ink">
                        ₹{row.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. Returned Products */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-hearth-ink flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-hearth-terracotta" />
              <span>2. Returned Products</span>
            </h3>
            <span className="text-xs font-ledger font-semibold text-hearth-ink">
              Subtotal: ₹{totalReturnedAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {returnedProductRows.length === 0 ? (
            <div className="p-4 rounded-2xl bg-hearth-oat text-xs text-hearth-taupe">
              No returned products recorded in this cycle.
            </div>
          ) : (
            <div className="rounded-2xl border border-hearth-border overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-hearth-oat border-b border-hearth-border text-[11px] font-mono uppercase text-hearth-taupe">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">Returned Quantity</th>
                    <th className="py-3 px-4 text-right">
                      Agreed Rate (Per Unit)
                    </th>
                    <th className="py-3 px-4 text-right">Agreed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hearth-border bg-hearth-parchment/40">
                  {returnedProductRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-4 font-semibold text-hearth-ink">
                        {row.productTitle}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-hearth-ink">
                        {row.quantity} {row.quantity === 1 ? 'unit' : 'units'}
                      </td>
                      <td className="py-3 px-4 text-right font-ledger text-hearth-umber">
                        ₹{row.agreedRate.toLocaleString('en-IN')} / mo
                      </td>
                      <td className="py-3 px-4 text-right font-ledger font-bold text-hearth-ink">
                        ₹{row.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Returns in Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-hearth-ink flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#9A3412]" />
              <span>3. Returns in Progress</span>
            </h3>
            <span className="text-xs font-ledger font-semibold text-[#9A3412]">
              Subtotal: ₹{totalInProgressAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {returnInProgressRows.length === 0 ? (
            <div className="p-4 rounded-2xl bg-hearth-oat text-xs text-hearth-taupe">
              No returns currently in progress.
            </div>
          ) : (
            <div className="rounded-2xl border border-hearth-border overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-hearth-oat border-b border-hearth-border text-[11px] font-mono uppercase text-hearth-taupe">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">
                      In-Progress Quantity
                    </th>
                    <th className="py-3 px-4 text-right">
                      Agreed Rate (Per Unit)
                    </th>
                    <th className="py-3 px-4 text-right">Agreed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hearth-border bg-hearth-parchment/40">
                  {returnInProgressRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-4 font-semibold text-hearth-ink">
                        {row.productTitle}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#9A3412]">
                        {row.quantity} {row.quantity === 1 ? 'unit' : 'units'}
                      </td>
                      <td className="py-3 px-4 text-right font-ledger text-hearth-umber">
                        ₹{row.agreedRate.toLocaleString('en-IN')} / mo
                      </td>
                      <td className="py-3 px-4 text-right font-ledger font-bold text-[#9A3412]">
                        ₹{row.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer Strip */}
        <div className="p-5 rounded-2xl bg-hearth-oat border border-hearth-border grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <div className="text-[11px] text-hearth-taupe">
              Currently Rented
            </div>
            <div className="font-ledger font-bold text-sm text-hearth-ink">
              ₹{totalRentedAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-hearth-taupe">
              Returned Products
            </div>
            <div className="font-ledger font-bold text-sm text-hearth-ink">
              ₹{totalReturnedAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-hearth-taupe">
              Returns in Progress
            </div>
            <div className="font-ledger font-bold text-sm text-[#9A3412]">
              ₹{totalInProgressAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-hearth-border">
            <div className="text-xs font-semibold text-hearth-sage">
              Total Possible Payout
            </div>
            <div className="font-serif font-bold text-2xl text-hearth-sage font-ledger">
              ₹{totalPossiblePayout.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Past Payouts (Receipts) */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
        <div className="flex items-center gap-2.5 border-b border-hearth-border pb-4">
          <div className="w-9 h-9 rounded-xl bg-hearth-sageLight border border-hearth-sage/30 text-hearth-sage flex items-center justify-center">
            <ReceiptIndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              Past Payouts & Receipts ({pastPaidSettlements.length})
            </h2>
            <p className="text-xs text-hearth-taupe">
              Completed payout disbursements and downloadable settlement receipts.
            </p>
          </div>
        </div>

        {pastPaidSettlements.length === 0 ? (
          <div className="p-6 rounded-2xl bg-hearth-oat text-center text-xs text-hearth-taupe">
            No past completed payout receipts found for this partner.
          </div>
        ) : (
          <div className="divide-y divide-hearth-border rounded-2xl border border-hearth-border bg-hearth-parchment/40 overflow-hidden">
            {pastPaidSettlements.map((st) => (
              <div
                key={st.id}
                className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-hearth-oat/40 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-hearth-ink">
                      {st.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Paid</span>
                    </span>
                    <span className="font-semibold text-hearth-ink">
                      {st.periodLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-hearth-taupe font-mono">
                    Ref: {st.payoutReference} • Disbursed on {st.createdAt}
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-right">
                    <div className="text-[10px] text-hearth-taupe">
                      Amount Disbursed
                    </div>
                    <div className="font-ledger font-bold text-base text-hearth-sage">
                      ₹{st.netVendorPayable.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(st)}
                    className="spring-btn px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-semibold text-hearth-ink inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
