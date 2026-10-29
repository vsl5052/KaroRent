import React, { useState } from 'react';
import {
  AlertTriangle,
  Ruler,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { bookingCheckoutSchema } from '../../lib/validation';

export const BookingCheckoutModal: React.FC = () => {
  const {
    activeCheckoutProductId,
    setActiveCheckoutProductId,
    masterProducts,
    virtualInventory,
    selectedTenureMonths,
    activePersona,
    customers,
    createBookingOrder,
    setActiveTab,
    setActiveAgreementModalBookingId,
    isSimulatingLatency,
  } = useKaroRentStore();

  const product = masterProducts.find((p) => p.id === activeCheckoutProductId);
  const inv = virtualInventory.find((i) => i.productId === activeCheckoutProductId);
  const customer =
    customers.find((c) => c.id === activePersona.customerId) || customers[0];

  const [quantity, setQuantity] = useState(1);
  const [tenure, setTenure] = useState<1 | 3 | 6 | 12 | 24>(selectedTenureMonths);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [selectedAddress, setSelectedAddress] = useState(
    customer.addresses[0]
      ? `${customer.addresses[0].line1}, ${customer.addresses[0].area}, ${customer.addresses[0].city} ${customer.addresses[0].pinCode}`
      : 'Flat 302, Terracotta Courtyards, Indiranagar, Bengaluru 560038'
  );
  const [recipientPhone, setRecipientPhone] = useState(customer.verifiedMobile);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!product || !inv) return null;

  const isMultiStep = product.workflowType === 'SITE_VISIT_MULTI_STEP';
  const multiplier = product.tenureMultipliers[tenure] || 1;
  const unitMonthlyRent = Math.round(product.baseMonthlyRent * multiplier);
  const totalMonthlyRent = unitMonthlyRent * quantity;
  const gstOnRent = Math.round(totalMonthlyRent * 0.18);
  const refundableDeposit = product.baseMonthlyRent * product.depositMonthsMultiple * quantity;
  const deliveryFee = product.standardDeliveryFee;
  const gstOnDelivery = Math.round(deliveryFee * 0.18);

  const upfrontTotalDueNow = isMultiStep
    ? product.siteVisitFee
    : totalMonthlyRent + gstOnRent + refundableDeposit + deliveryFee + gstOnDelivery;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const parseResult = bookingCheckoutSchema.safeParse({
      quantity,
      maxAvailable: inv.availableQuantity,
      startDate,
      tenureMonths: tenure,
      deliveryAddress: selectedAddress,
      recipientPhone,
    });

    if (!parseResult.success) {
      setValidationErrors(parseResult.error.errors.map((err) => err.message));
      return;
    }

    const result = await createBookingOrder({
      productId: product.id,
      quantity,
      tenureMonths: tenure,
      startDate,
      deliveryAddress: selectedAddress,
    });

    setActiveCheckoutProductId(null);

    if (result.interceptedByBlacklist) {
      setActiveTab('MY_RENTALS');
    } else if (isMultiStep) {
      setActiveTab('INVOICES_DEPOSITS');
    } else {
      setActiveAgreementModalBookingId(result.bookingId);
      setActiveTab('MY_RENTALS');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-hearth-oat border-b border-hearth-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-hearth-terracotta">
              {isMultiStep ? 'Home Measurement & Rental' : 'Rental Checkout'}
            </span>
            <h2 className="font-serif text-xl font-bold text-hearth-ink mt-0.5">
              {product.title}
            </h2>
          </div>
          <button
            onClick={() => setActiveCheckoutProductId(null)}
            className="p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleCheckoutSubmit} className="p-6 overflow-y-auto space-y-5">
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Please check the following details:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Booking Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                  Rental Duration *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 3, 6, 12, 24] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setTenure(m)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                        tenure === m
                          ? 'bg-hearth-terracotta text-white border-hearth-terracotta font-semibold shadow-sm'
                          : 'bg-hearth-card text-hearth-umber border-hearth-border hover:bg-hearth-oat'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1">
                    Quantity (Max {inv.availableQuantity}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={inv.availableQuantity + 2}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-ledger text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-ledger text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-ledger text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-hearth-ink mb-1">
                  Delivery Address *
                </label>
                <textarea
                  rows={2}
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column: Price Summary */}
            <div className="rounded-2xl bg-hearth-oat border border-hearth-border p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="border-b border-hearth-border pb-2">
                  <span className="font-serif font-bold text-sm text-hearth-ink">
                    Price Summary
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-hearth-umber">
                  <div className="flex justify-between">
                    <span>
                      Monthly Rent ({quantity} × ₹{unitMonthlyRent}/mo):
                    </span>
                    <span className="font-ledger font-semibold">
                      ₹{totalMonthlyRent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span className="font-ledger">₹{gstOnRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery & Setup:</span>
                    <span className="font-ledger">
                      ₹{(deliveryFee + gstOnDelivery).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Refundable Deposit */}
                  <div className="p-2.5 rounded-xl bg-hearth-sageLight border border-hearth-sage/25 my-2">
                    <div className="flex justify-between font-semibold text-hearth-sage">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Refundable Security Deposit:</span>
                      </span>
                      <span className="font-ledger">
                        ₹{refundableDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-hearth-taupe mt-0.5">
                      100% refundable after item return.
                    </p>
                  </div>

                  {isMultiStep && (
                    <div className="p-2.5 rounded-xl bg-hearth-apricot border border-hearth-terracotta/40 text-[11px] space-y-1">
                      <div className="font-semibold text-hearth-terracotta flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Home Measurement Visit Fee</span>
                        </span>
                        <span className="font-ledger font-bold">₹{product.siteVisitFee}</span>
                      </div>
                      <p className="text-hearth-umber">
                        Pay only <strong>₹{product.siteVisitFee}</strong> now to book a technician visit. Monthly rent and deposit are paid after you approve the installation estimate.
                      </p>
                    </div>
                  )}

                  {product.installationRateCard.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-hearth-card border border-hearth-border text-[11px] space-y-1.5">
                      <div className="font-semibold text-hearth-ink">
                        Standard Installation Rates
                      </div>
                      <div className="divide-y divide-hearth-border/60">
                        {product.installationRateCard.map((rate) => (
                          <div
                            key={rate.code}
                            className="py-1 flex items-center justify-between gap-2 text-hearth-umber"
                          >
                            <span>{rate.label}</span>
                            <span className="font-ledger font-semibold text-hearth-ink shrink-0">
                              ₹{rate.ratePerUnit} / {rate.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-hearth-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-hearth-ink">
                    Total Due Now:
                  </span>
                  <span className="font-serif text-2xl font-bold text-hearth-terracotta font-ledger">
                    ₹{upfrontTotalDueNow.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="pt-4 border-t border-hearth-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setActiveCheckoutProductId(null)}
              className="px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-card border border-hearth-border text-xs font-medium text-hearth-umber"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSimulatingLatency}
              className="spring-btn px-6 py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {isSimulatingLatency
                ? 'Processing...'
                : isMultiStep
                ? `Book Home Visit (₹${product.siteVisitFee})`
                : 'Confirm & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
