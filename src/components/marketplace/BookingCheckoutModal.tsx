import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  const [tenure, setTenure] = useState<3 | 6 | 12 | 24>(selectedTenureMonths);
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
    ? product.siteVisitFee // Multi-step pays ₹499 Site Visit Fee first!
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-semibold border border-hearth-terracotta/30">
                {isMultiStep
                  ? 'Multi-Step Site Visit Required'
                  : '1-Step Direct Home Booking'}
              </span>
              <span className="text-[10px] font-mono text-hearth-taupe flex items-center gap-1">
                <Clock className="w-3 h-3 text-hearth-terracotta" />
                Reservation Hold: 15:00m
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink mt-1">
              Reserve & Configure: {product.title}
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
          {/* Active Blacklist Warning Banner if user switched to Vikram Mehta */}
          {activePersona.isBlacklisted && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold">
                  Restricted Customer Profile Detected ({activePersona.name})
                </div>
                <p>
                  Submitting this booking will trigger pre-confirmation interception, place the order in{' '}
                  <strong>Flagged — Blacklist Review</strong>, prevent virtual stock allocation, and alert the Platform Super Administrator.
                </p>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Please resolve the following validation errors:</span>
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
                  Rental Duration Plan *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([3, 6, 12, 24] as const).map((m) => (
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
                    Requested Start Date *
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
                  Verified Recipient Mobile *
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
                  Snapshot Delivery Address *
                </label>
                <textarea
                  rows={2}
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                />
                <p className="text-[10px] text-hearth-taupe mt-1">
                  Address snapshot is locked into the agreement & invoice even if your profile address changes later.
                </p>
              </div>
            </div>

            {/* Right Column: Transparent Itemised Quote Receipt */}
            <div className="rounded-2xl bg-hearth-oat border border-hearth-border p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-hearth-border pb-2">
                  <span className="font-serif font-bold text-sm text-hearth-ink">
                    Itemised Platform Quote
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta">
                    Rate Locked
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-hearth-umber">
                  <div className="flex justify-between">
                    <span>
                      Cycle 1 Platform Rent ({quantity} × ₹{unitMonthlyRent}/mo):
                    </span>
                    <span className="font-ledger font-semibold">
                      ₹{totalMonthlyRent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST on Rental (18%):</span>
                    <span className="font-ledger">₹{gstOnRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Delivery & Setup (incl. 18% GST):</span>
                    <span className="font-ledger">
                      ₹{(deliveryFee + gstOnDelivery).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Segregated Security Deposit Box */}
                  <div className="p-2.5 rounded-xl bg-hearth-sageLight border border-hearth-sage/25 my-2">
                    <div className="flex justify-between font-semibold text-hearth-sage">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Segregated Security Deposit [4× Mo]:</span>
                      </span>
                      <span className="font-ledger">
                        ₹{refundableDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-hearth-taupe mt-0.5">
                      Tax-exempt (₹0 GST). Never conflated with rental revenue; refunded within 14 days of return closure.
                    </p>
                  </div>

                  {isMultiStep && (
                    <div className="p-2.5 rounded-xl bg-hearth-apricot border border-hearth-terracotta/40 text-[11px] space-y-1">
                      <div className="font-semibold text-hearth-terracotta flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Step 1 Upfront: Site Visit Fee</span>
                        </span>
                        <span className="font-ledger font-bold">₹{product.siteVisitFee}</span>
                      </div>
                      <p className="text-hearth-umber">
                        For complex installations, you pay only the <strong>₹{product.siteVisitFee} Site Visit Fee</strong> now. Rent, measured copper pipe/brackets, and the 4-month deposit are billed only after you accept the post-visit quote!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-hearth-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-hearth-ink">
                    {isMultiStep ? 'Payable Now (Site Visit Invoice):' : 'Total Checkout Payable (3 Separate Docs):'}
                  </span>
                  <span className="font-serif text-2xl font-bold text-hearth-terracotta font-ledger">
                    ₹{upfrontTotalDueNow.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-hearth-taupe mt-1">
                  Generates distinct financial documents for rent, deposit, and delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="pt-4 border-t border-hearth-border flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-hearth-taupe flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-hearth-sage" />
              <span>Duplicate-submission protection active</span>
            </div>
            <div className="flex items-center gap-2.5">
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
                  ? 'Validating & Allocating Hold...'
                  : isMultiStep
                  ? `Submit Request & Generate ₹${product.siteVisitFee} Site Visit Invoice`
                  : 'Confirm Reservation & Proceed to E-Agreement'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
