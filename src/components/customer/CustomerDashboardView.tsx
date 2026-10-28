import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  FileSignature,
  HelpCircle,
  MapPin,
  ReceiptIndianRupee,
  RefreshCw,
  Ruler,
  ShieldAlert,
  Sparkles,
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
  const [showClosureCheckModal, setShowClosureCheckModal] = useState(false);

  // Scope rentals strictly to customer unless Platform Admin (BR-013)
  const scopedBookings =
    activePersona.role === 'PLATFORM_ADMIN'
      ? bookings
      : bookings.filter((b) => b.customerId === (activePersona.customerId || 'CUS-1001'));

  const currentCustomer =
    customers.find((c) => c.id === (activePersona.customerId || 'CUS-1001')) ||
    customers[0];

  const featuredMultiStepBooking =
    scopedBookings.find((b) => b.workflowType === 'SITE_VISIT_MULTI_STEP') ||
    bookings[0];

  const activeRentalBlockers = scopedBookings.filter(
    (b) =>
      b.status === 'Active Rental' ||
      b.status === 'Picked Up — Under Inspection' ||
      b.status === 'Disputed' ||
      b.status === 'Flagged — Blacklist Review'
  );

  return (
    <div className="space-y-7">
      {/* Top Header & Guided AC Site-Visit Storyboard */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              KaroRent Customer & Support Mediator Lifecycle Console
            </h1>
            <p className="text-xs text-hearth-umber mt-0.5">
              Warm Editorial Lifestyle & Human-Centric Hospitality • Consolidated Multi-Vendor View
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClosureCheckModal(true)}
              className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber"
            >
              Check Account Closure Eligibility
            </button>
          </div>
        </div>

        {/* 4-Stage Horizontal AC Site-Visit Milestone Stepper */}
        <div className="rounded-2xl bg-hearth-parchment border border-hearth-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-hearth-ink flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-hearth-terracotta" />
              <span>
                Guided Multi-Step Appliance Journey ({featuredMultiStepBooking.id} — {featuredMultiStepBooking.productTitle})
              </span>
            </span>
            <span className="text-[11px] font-mono text-hearth-terracotta font-semibold">
              Multi-Step Installation • Status: {featuredMultiStepBooking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#658361] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-hearth-ink">Site Visit</div>
                <div className="text-[11px] text-hearth-umber">
                  Paid (₹{featuredMultiStepBooking.siteVisitFee || 499})
                </div>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-pill bg-[#658361] text-white text-[10px] font-semibold">
                  Completed
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#658361] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-hearth-ink">
                  Home Metrics Measured
                </div>
                <div className="text-[11px] text-hearth-umber">
                  ({featuredMultiStepBooking.siteVisit?.measuredCopperPipeMeters || 3.5}m Copper Pipe)
                </div>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                  {featuredMultiStepBooking.siteVisit?.status.includes('Completed')
                    ? 'Completed'
                    : 'Scheduled'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#658361] text-[#2F5233] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-hearth-ink">
                  Final Transparent
                </div>
                <div className="text-[11px] text-hearth-umber">Quote Accepted</div>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                  {featuredMultiStepBooking.siteVisit?.customerQuoteDecision === 'Accepted'
                    ? 'Completed'
                    : 'Action Needed'}
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-hearth-terracotta text-hearth-terracotta font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <div>
                <div className="text-xs font-bold text-hearth-ink">
                  E-Agreement Signed
                </div>
                <div className="text-[11px] text-hearth-umber">& Setup Scheduled</div>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-pill bg-[#B85D3B] text-white text-[10px] font-semibold">
                  {featuredMultiStepBooking.status === 'Active Rental'
                    ? 'Completed'
                    : featuredMultiStepBooking.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Account & Corporate Signatory Metadata Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-hearth-card border border-hearth-border p-4 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-hearth-terracotta shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Account Authority & KYC
            </div>
            <div className="text-hearth-umber">
              <strong>{currentCustomer.fullName}</strong> ({currentCustomer.accountType})
            </div>
            {currentCustomer.companyName && (
              <div className="text-[11px] text-hearth-terracotta font-medium">
                {currentCustomer.companyName} • GSTIN: {currentCustomer.gstinOrTaxId}
              </div>
            )}
            {currentCustomer.authorisedSignatoryName && (
              <div className="text-[10px] text-hearth-taupe">
                Signatory: {currentCustomer.authorisedSignatoryName} | Recipient: {currentCustomer.operationalRecipientName}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-hearth-card border border-hearth-border p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-hearth-sage shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Verified Delivery Addresses
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
              Stationery Agreements & 5-Invoice Vault
            </div>
            <p className="text-[11px] text-hearth-umber">
              Download immutable e-signed contracts or review segregated deposit balances.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('INVOICES_DEPOSITS')}
            className="spring-btn shrink-0 px-3.5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
          >
            Open Vault
          </button>
        </div>
      </div>

      {/* Consolidated Multi-Vendor Rental & Booking Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-hearth-ink">
            Consolidated Bookings & Active Rentals Across All Partner Vendors ({scopedBookings.length})
          </h2>
          <span className="text-xs font-mono text-hearth-taupe">
            Account-Scoped View
          </span>
        </div>

        <div className="space-y-4">
          {scopedBookings.map((booking) => {
            const agreement = agreements.find((a) => a.bookingId === booking.id);
            const isFlaggedBlacklist =
              booking.status === 'Flagged — Blacklist Review';
            const isFinalBillSent = booking.status === 'Final Bill Sent';

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
                      <span className="text-[11px] font-mono text-hearth-taupe">
                        Fulfilled by: <strong>{booking.fulfillingVendorName}</strong> ({booking.fulfillingVendorId})
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-hearth-ink">
                      {booking.productTitle}
                    </h3>
                    <p className="text-xs text-hearth-umber">
                      Tenure: <strong>{booking.tenureMonths} Months</strong> ({booking.startDate} to {booking.endDate}) • Serial:{' '}
                      <span className="font-mono font-semibold">
                        {booking.allocatedSerial || 'Allocated at Dispatch'}
                      </span>
                    </p>
                    <p className="text-[11px] text-hearth-taupe">
                      Snapshot Address: {booking.deliveryAddress}
                    </p>
                  </div>

                  {/* Right Financial Summary Pill */}
                  <div className="rounded-2xl bg-hearth-oat border border-hearth-border px-4 py-3 text-right space-y-1">
                    <div className="text-xs text-hearth-taupe">
                      Locked Platform Rate:{' '}
                      <strong className="font-ledger text-hearth-ink">
                        ₹{booking.monthlyRentRate.toLocaleString('en-IN')}/mo
                      </strong>
                    </div>
                    <div className="text-xs text-hearth-sage font-semibold">
                      Segregated 4x Deposit:{' '}
                      <span className="font-ledger">
                        ₹{booking.securityDepositAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {booking.installationMaterialFee > 0 && (
                      <div className="text-[11px] text-hearth-terracotta font-mono">
                        Measured Rate-Card Setup: ₹{booking.installationMaterialFee}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blacklist Interception Alert Banner */}
                {isFlaggedBlacklist && (
                  <div className="p-4 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">
                        Booking Intercepted by Pre-Confirmation Risk Gate
                      </div>
                      <p>{booking.blacklistFlagReason}</p>
                    </div>
                  </div>
                )}

                {/* Post-Site Visit Final Quote Acceptance Banner */}
                {isFinalBillSent && booking.siteVisit && (
                  <div className="p-4 rounded-2xl bg-hearth-apricot border-2 border-hearth-terracotta/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-hearth-terracotta uppercase font-mono">
                          Action Required — Accept or Reject Post-Site Visit Final Charges
                        </div>
                        <p className="text-xs text-hearth-ink mt-0.5">
                          Field technician measured <strong>{booking.siteVisit.measuredCopperPipeMeters}m copper pipe</strong> • Calculated Installation Material Charge:{' '}
                          <strong className="font-ledger">
                            ₹{booking.siteVisit.calculatedMaterialCharges.toLocaleString('en-IN')}
                          </strong>{' '}
                          (strictly per Platform Rate Card).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            respondToPostVisitQuote(booking.id, 'Accepted')
                          }
                          className="spring-btn px-4 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold"
                        >
                          Accept Final Quote
                        </button>
                        <button
                          onClick={() =>
                            respondToPostVisitQuote(booking.id, 'Rejected')
                          }
                          className="px-4 py-2 rounded-pill bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-semibold"
                        >
                          Reject & Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Ribbon for each Booking */}
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
                          ? 'Review & E-Sign Agreement (Mandatory)'
                          : `View Signed E-Agreement (${agreement?.id})`}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('INVOICES_DEPOSITS')}
                      className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber flex items-center gap-1.5"
                    >
                      <ReceiptIndianRupee className="w-3.5 h-3.5 text-hearth-sage" />
                      <span>5-Invoice Split & Deposit Ledger</span>
                    </button>

                    {booking.returnRecord && (
                      <button
                        onClick={() => setActiveTab('THREE_WAY_INSPECTION')}
                        className="px-3.5 py-1.5 rounded-pill bg-hearth-sageLight text-hearth-sage border border-hearth-sage/30 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>View 3-Way Return Inspection</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lifecycle Actions for Active Rentals */}
                  {booking.status === 'Active Rental' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => requestRentalRenewal(booking.id, 3)}
                        className="px-3 py-1.5 rounded-pill bg-hearth-apricot hover:bg-hearth-terracotta hover:text-white border border-hearth-terracotta/30 text-hearth-terracotta text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Extend +3 Mo</span>
                      </button>

                      <button
                        onClick={() => setServiceModalBookingId(booking.id)}
                        className="px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>Maintenance / Swap</span>
                      </button>

                      <button
                        onClick={() => setReturnModalBookingId(booking.id)}
                        className="px-3.5 py-1.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Request Return Pickup</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Pickup Request Modal */}
      {returnModalBookingId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <h3 className="font-serif text-lg font-bold text-hearth-ink">
              Schedule Return Pickup
            </h3>
            <p className="text-xs text-hearth-umber">
              Under our <strong>Doorstep Handover Protection Policy</strong>, our field staff will capture a mandatory timestamped photograph of your item at your doorstep before pickup to guarantee fair deposit settlement.
            </p>
            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                Preferred Doorstep Pickup Slot *
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
                Confirm Return Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service / Asset Replacement Request Modal */}
      {serviceModalBookingId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <h3 className="font-serif text-lg font-bold text-hearth-ink">
              Raise Maintenance or Asset Swap Ticket
            </h3>
            <div>
              <label className="block text-xs font-semibold text-hearth-ink mb-1">
                Describe Issue or Service Requirement *
              </label>
              <textarea
                rows={3}
                value={serviceIssueText}
                onChange={(e) => setServiceIssueText(e.target.value)}
                placeholder="e.g., Requesting filter replacement or unit swap due to compressor vibration..."
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
              <span>
                Request Replacement Asset Swap & Consent to Serial Addendum
              </span>
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
                      title: 'Issue Description Required',
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
                Submit Service Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Closure Blocker Validation Modal */}
      {showClosureCheckModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <div className="flex items-center gap-2.5 text-[#991B1B]">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">
                Account Closure Pre-Flight Check
              </h3>
            </div>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Under our <strong>Account Retention & Deposit Protection Policy</strong>, an account with active rentals, open return inspections, or unresolved deposit settlements cannot undergo immediate destructive closure, and signed contracts/invoices must be retained for statutory audit.
            </p>
            <div className="p-3.5 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] space-y-1.5 text-xs text-[#991B1B]">
              <div className="font-bold">
                Active Closure Blockers Detected ({activeRentalBlockers.length}):
              </div>
              {activeRentalBlockers.map((b) => (
                <div key={b.id} className="font-mono text-[11px]">
                  • {b.id}: {b.productTitle} — Status: <strong>{b.status}</strong>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowClosureCheckModal(false)}
                className="px-5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
