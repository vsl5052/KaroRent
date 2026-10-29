import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  FileSignature,
  MapPin,
  ReceiptIndianRupee,
  Ruler,
  ShieldAlert,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const CustomerDashboardView: React.FC = () => {
  const {
    activePersona,
    customers,
    bookings,
    agreements,
    masterProducts,
    respondToPostVisitQuote,
    setActiveAgreementModalBookingId,
    setActiveTab,
    requestRentalRenewal,
    initiateReturnPickupRequest,
    createServiceTicket,
    addToast,
  } = useKaroRentStore();

  const [selectedReturnSlot, setSelectedReturnSlot] = useState(
    '2026-10-30 • 02:00 PM – 05:00 PM'
  );
  const [returnModalBookingId, setReturnModalBookingId] = useState<string | null>(null);
  const [serviceModalBookingId, setServiceModalBookingId] = useState<string | null>(null);
  const [serviceIssueText, setServiceIssueText] = useState('');
  const [requestSwap, setRequestSwap] = useState(false);
  const [expandedRateBookingId, setExpandedRateBookingId] = useState<string | null>(null);

  const scopedBookings =
    activePersona.role === 'PLATFORM_ADMIN'
      ? bookings
      : bookings.filter((b) => b.customerId === (activePersona.customerId || 'CUS-1001'));

  const currentCustomer =
    customers.find((c) => c.id === (activePersona.customerId || 'CUS-1001')) ||
    customers[0];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth">
        <h1 className="font-serif text-2xl font-bold text-hearth-ink">
          My Rentals
        </h1>
        <p className="text-xs text-hearth-umber mt-0.5">
          Track your active rentals, deliveries, and home installation progress.
        </p>
      </div>

      {/* Customer Account Summary Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-hearth-card border border-hearth-border p-4 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-hearth-terracotta shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Account Details
            </div>
            <div className="text-hearth-umber">
              <strong>{currentCustomer.fullName}</strong> ({currentCustomer.accountType})
            </div>
            {currentCustomer.companyName && (
              <div className="text-[11px] text-hearth-terracotta font-medium">
                {currentCustomer.companyName} • GSTIN: {currentCustomer.gstinOrTaxId}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-hearth-card border border-hearth-border p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-hearth-sage shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Saved Addresses
            </div>
            {currentCustomer.addresses.map((addr) => (
              <div key={addr.id} className="text-[11px] text-hearth-umber">
                <span className="font-semibold">{addr.label}:</span> {addr.line1}, {addr.area} ({addr.pinCode})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-hearth-card border border-hearth-border p-4 flex items-center justify-between gap-3">
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Payments & Deposits
            </div>
            <p className="text-[11px] text-hearth-umber">
              View your invoices, receipts, and refundable security deposits.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('INVOICES_DEPOSITS')}
            className="spring-btn shrink-0 px-3.5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
          >
            View Payments
          </button>
        </div>
      </div>

      {/* My Orders Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-hearth-ink">
          My Orders ({scopedBookings.length})
        </h2>

        <div className="space-y-4">
          {scopedBookings.map((booking) => {
            const agreement = agreements.find((a) => a.bookingId === booking.id);
            const product = masterProducts.find((p) => p.id === booking.productId);
            const isFlaggedBlacklist =
              booking.status === 'Flagged — Blacklist Review';
            const isFinalBillSent = booking.status === 'Final Bill Sent';
            const isMultiStep = booking.workflowType === 'SITE_VISIT_MULTI_STEP';

            return (
              <div
                key={booking.id}
                className={`rounded-3xl bg-hearth-card border p-6 shadow-hearth space-y-4 ${
                  isFlaggedBlacklist
                    ? 'border-2 border-[#DC2626] bg-[#FEE2E2]/20'
                    : 'border-hearth-border'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {product && (
                      <img
                        src={product.lifestyleImage}
                        alt={booking.productTitle}
                        className="w-20 h-20 rounded-2xl object-cover border border-hearth-border shrink-0 hidden sm:block"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                          {booking.id}
                        </span>
                        <span
                          className={`text-xs font-semibold px-3 py-0.5 rounded-pill border ${
                            isFlaggedBlacklist
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                              : booking.status === 'Active Rental' ||
                                booking.status === 'Completed'
                              ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                              : 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-hearth-ink">
                        {booking.productTitle}
                      </h3>
                      <p className="text-xs text-hearth-umber">
                        Plan: <strong>{booking.tenureMonths} Months</strong> ({booking.startDate} to {booking.endDate})
                      </p>
                      <p className="text-[11px] text-hearth-taupe">
                        Address: {booking.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  {/* Right Financial Summary */}
                  <div className="rounded-2xl bg-hearth-oat border border-hearth-border px-4 py-3 text-right space-y-1">
                    <div className="text-xs text-hearth-taupe">
                      Monthly Rent:{' '}
                      <strong className="font-ledger text-hearth-ink">
                        ₹{booking.monthlyRentRate.toLocaleString('en-IN')}/mo
                      </strong>
                    </div>
                    <div className="text-xs text-hearth-sage font-semibold">
                      Refundable Deposit:{' '}
                      <span className="font-ledger">
                        ₹{booking.securityDepositAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {booking.installationMaterialFee > 0 && (
                      <div className="text-[11px] text-hearth-terracotta font-mono">
                        Installation Cost: ₹{booking.installationMaterialFee}
                      </div>
                    )}
                  </div>
                </div>

                {/* Installation Progress inside the Product Order Card */}
                {isMultiStep && (
                  <div className="rounded-2xl bg-hearth-parchment border border-hearth-border p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-hearth-ink flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-hearth-terracotta" />
                        <span>Installation Progress</span>
                      </span>
                      {product && product.installationRateCard.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRateBookingId(
                              expandedRateBookingId === booking.id ? null : booking.id
                            )
                          }
                          className="text-[11px] font-semibold text-hearth-terracotta hover:underline"
                        >
                          {expandedRateBookingId === booking.id
                            ? 'Hide Installation Rates'
                            : 'View Standard Installation Rates'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-center">
                      {/* Step 1 */}
                      <div className="p-3 rounded-xl bg-hearth-card border border-hearth-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#658361] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-hearth-ink">
                            Home Visit Booked
                          </div>
                          <div className="text-[11px] text-hearth-umber">
                            Paid (₹{booking.siteVisitFee || 499})
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-pill bg-[#658361] text-white text-[10px] font-semibold">
                            Completed
                          </span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 rounded-xl bg-hearth-card border border-hearth-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#658361] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-hearth-ink">
                            Measurements Taken
                          </div>
                          <div className="text-[11px] text-hearth-umber">
                            {booking.siteVisit?.measuredCopperPipeMeters
                              ? `${booking.siteVisit.measuredCopperPipeMeters}m Piping`
                              : 'Technician Assessment'}
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                            {booking.siteVisit?.status.includes('Completed')
                              ? 'Completed'
                              : 'Scheduled'}
                          </span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 rounded-xl bg-hearth-card border border-hearth-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full border-2 border-[#658361] text-[#2F5233] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <div className="text-xs font-bold text-hearth-ink">
                            Estimate Approved
                          </div>
                          <div className="text-[11px] text-hearth-umber">
                            Installation Quote
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                            {booking.siteVisit?.customerQuoteDecision === 'Accepted'
                              ? 'Completed'
                              : 'Action Needed'}
                          </span>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3 rounded-xl bg-hearth-card border border-hearth-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full border-2 border-hearth-terracotta text-hearth-terracotta font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <div className="text-xs font-bold text-hearth-ink">
                            Agreement & Setup
                          </div>
                          <div className="text-[11px] text-hearth-umber">
                            Delivery & Activation
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                            {booking.status === 'Active Rental'
                              ? 'Active'
                              : booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedRateBookingId === booking.id &&
                      product &&
                      product.installationRateCard.length > 0 && (
                        <div className="p-3 rounded-xl bg-hearth-card border border-hearth-border text-xs space-y-1.5">
                          <div className="font-semibold text-hearth-ink">
                            Standard Installation Rates
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            {product.installationRateCard.map((rate) => (
                              <div
                                key={rate.code}
                                className="flex items-center justify-between py-1 border-b border-hearth-border/50 text-[11px]"
                              >
                                <span className="text-hearth-umber">{rate.label}</span>
                                <span className="font-ledger font-semibold text-hearth-ink">
                                  ₹{rate.ratePerUnit} / {rate.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Account Review Banner */}
                {isFlaggedBlacklist && (
                  <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">Order Held for Account Review</div>
                      <p>{booking.blacklistFlagReason}</p>
                    </div>
                  </div>
                )}

                {/* Post-Visit Quote Acceptance Banner */}
                {isFinalBillSent && booking.siteVisit && (
                  <div className="p-4 rounded-2xl bg-hearth-apricot border-2 border-hearth-terracotta/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-hearth-terracotta">
                          Installation Estimate Ready
                        </div>
                        <p className="text-xs text-hearth-ink mt-0.5">
                          Technician measured <strong>{booking.siteVisit.measuredCopperPipeMeters}m piping</strong> • Installation cost:{' '}
                          <strong className="font-ledger">
                            ₹{booking.siteVisit.calculatedMaterialCharges.toLocaleString('en-IN')}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            respondToPostVisitQuote(booking.id, 'Accepted')
                          }
                          className="spring-btn px-4 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold"
                        >
                          Approve Estimate
                        </button>
                        <button
                          onClick={() =>
                            respondToPostVisitQuote(booking.id, 'Rejected')
                          }
                          className="px-4 py-2 rounded-pill bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-semibold"
                        >
                          Decline & Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Ribbon */}
                <div className="pt-3 border-t border-hearth-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveAgreementModalBookingId(booking.id);
                      }}
                      className="spring-btn px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-semibold text-hearth-ink flex items-center gap-1.5"
                    >
                      <FileSignature className="w-3.5 h-3.5 text-hearth-terracotta" />
                      <span>
                        {agreement?.status === 'Awaiting Signature'
                          ? 'Sign Agreement'
                          : 'View Agreement'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('INVOICES_DEPOSITS')}
                      className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber flex items-center gap-1.5"
                    >
                      <ReceiptIndianRupee className="w-3.5 h-3.5 text-hearth-sage" />
                      <span>View Invoices</span>
                    </button>

                    {booking.returnRecord && (
                      <button
                        onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
                        className="px-3.5 py-1.5 rounded-pill bg-hearth-sageLight text-hearth-sage border border-hearth-sage/30 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>Return Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Active Rental Actions */}
                  {booking.status === 'Active Rental' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => requestRentalRenewal(booking.id, 3)}
                        className="px-3 py-1.5 rounded-pill bg-hearth-apricot hover:bg-hearth-terracotta hover:text-white border border-hearth-terracotta/30 text-hearth-terracotta text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Extend Plan (+3M)</span>
                      </button>

                      <button
                        onClick={() => setServiceModalBookingId(booking.id)}
                        className="px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>Request Support</span>
                      </button>

                      <button
                        onClick={() => setReturnModalBookingId(booking.id)}
                        className="px-3.5 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Schedule Return</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Return Modal */}
      {returnModalBookingId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <h3 className="font-serif text-lg font-bold text-hearth-ink">
              Schedule Return Pickup
            </h3>
            <p className="text-xs text-hearth-umber">
              Our pickup team will take a photo of the item at your doorstep during pickup to ensure a smooth deposit refund.
            </p>
            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                Preferred Pickup Time *
              </label>
              <input
                type="text"
                value={selectedReturnSlot}
                onChange={(e) => setSelectedReturnSlot(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnModalBookingId(null)}
                className="px-4 py-2 rounded-pill bg-hearth-oat text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await initiateReturnPickupRequest(
                    returnModalBookingId,
                    selectedReturnSlot
                  );
                  setReturnModalBookingId(null);
                }}
                className="px-5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
              >
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Support Modal */}
      {serviceModalBookingId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <h3 className="font-serif text-lg font-bold text-hearth-ink">
              Request Maintenance or Replacement
            </h3>
            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                How can we help? *
              </label>
              <textarea
                rows={3}
                value={serviceIssueText}
                onChange={(e) => setServiceIssueText(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-hearth-umber cursor-pointer">
              <input
                type="checkbox"
                checked={requestSwap}
                onChange={(e) => setRequestSwap(e.target.checked)}
                className="rounded border-hearth-border text-hearth-terracotta"
              />
              <span>Request a replacement unit</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setServiceModalBookingId(null)}
                className="px-4 py-2 rounded-pill bg-hearth-oat text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (serviceIssueText.trim().length < 5) {
                    addToast({
                      title: 'Description Required',
                      description: 'Please enter at least 5 characters.',
                      variant: 'error',
                    });
                    return;
                  }
                  await createServiceTicket(
                    serviceModalBookingId,
                    serviceIssueText,
                    requestSwap
                  );
                  setServiceIssueText('');
                  setServiceModalBookingId(null);
                }}
                className="px-5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
