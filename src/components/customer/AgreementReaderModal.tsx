import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSignature,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { RentalAgreementRecord } from '../../types/srs';

export const AgreementReaderModal: React.FC<{ inlineMode?: boolean }> = ({
  inlineMode = false,
}) => {
  const {
    activeAgreementModalBookingId,
    setActiveAgreementModalBookingId,
    agreements,
    bookings,
    masterProducts,
    activePersona,
    signRentalAgreement,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [otpInput, setOtpInput] = useState('482910');
  const [authorityDeclaration, setAuthorityDeclaration] = useState(
    'Customer / Authorised Signatory'
  );
  const [consentChecked, setConsentChecked] = useState(true);

  const handleDownloadCertificate = (targetAgreement: RentalAgreementRecord) => {
    const content = [
      `====================================================================`,
      `KARORENT RENTAL AGREEMENT`,
      `====================================================================`,
      `Agreement ID     : ${targetAgreement.id}`,
      `Order ID         : ${targetAgreement.bookingId}`,
      `Status           : ${targetAgreement.status}`,
      `Customer         : ${targetAgreement.customerName}`,
      `Product          : ${targetAgreement.productTitle}`,
      `Rental Duration  : ${targetAgreement.tenureMonths} Months (${targetAgreement.startDate} to ${targetAgreement.endDate})`,
      `Monthly Rent     : INR ${targetAgreement.lockedMonthlyRent} / month`,
      `Security Deposit : INR ${targetAgreement.lockedDepositAmount} (Refundable)`,
      `Pickup Policy    : ${targetAgreement.mandatoryPickupPhotoClause}`,
      `Signature Ref    : ${targetAgreement.signatureHash || 'Pending Signature'}`,
      `====================================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetAgreement.id}_Rental_Agreement.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: `Downloaded ${targetAgreement.id}`,
      description: 'Rental agreement copy downloaded.',
      variant: 'success',
    });
  };

  // When rendered as the Agreements tab (inlineMode === true), show a My Orders-style list of product agreement cards
  if (inlineMode) {
    const scopedBookings =
      activePersona.role === 'PLATFORM_ADMIN'
        ? bookings
        : bookings.filter(
            (b) => b.customerId === (activePersona.customerId || 'CUS-1001')
          );

    return (
      <div className="space-y-7">
        {/* Top Header */}
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth">
          <h1 className="font-serif text-2xl font-bold text-hearth-ink">
            Agreements
          </h1>
          <p className="text-xs text-hearth-umber mt-0.5">
            Review, sign, and download the rental agreements for each of your products.
          </p>
        </div>

        {/* Agreements against each product (My Orders style) */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-hearth-ink">
            Product Agreements ({scopedBookings.length})
          </h2>

          <div className="space-y-4">
            {scopedBookings.map((booking) => {
              const agreement = agreements.find(
                (a) => a.bookingId === booking.id
              );
              const product = masterProducts.find(
                (p) => p.id === booking.productId
              );

              if (!agreement) return null;

              const isSigned =
                agreement.status === 'Signed' ||
                agreement.status === 'Active' ||
                agreement.status === 'Amended' ||
                agreement.status === 'Completed';

              return (
                <div
                  key={agreement.id}
                  className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {product && (
                        <img
                          src={product.lifestyleImage}
                          alt={agreement.productTitle}
                          className="w-20 h-20 rounded-2xl object-cover border border-hearth-border shrink-0 hidden sm:block"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                            {agreement.id}
                          </span>
                          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-pill bg-hearth-parchment border border-hearth-border text-hearth-taupe">
                            Order: {booking.id}
                          </span>
                          <span
                            className={`text-xs font-semibold px-3 py-0.5 rounded-pill border ${
                              isSigned
                                ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                                : 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]'
                            }`}
                          >
                            {agreement.status}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-hearth-ink">
                          {agreement.productTitle}
                        </h3>
                        <p className="text-xs text-hearth-umber">
                          Duration: <strong>{agreement.tenureMonths} Months</strong> (
                          {agreement.startDate} to {agreement.endDate})
                        </p>
                        <p className="text-[11px] text-hearth-taupe">
                          Unit Serial:{' '}
                          <span className="font-mono text-hearth-ink">
                            {agreement.allocatedSerialNumber || 'Assigned at Delivery'}
                          </span>
                          {agreement.signedAt && (
                            <span> • Signed on {agreement.signedAt}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right Financial Summary */}
                    <div className="rounded-2xl bg-hearth-oat border border-hearth-border px-4 py-3 text-right space-y-1">
                      <div className="text-xs text-hearth-taupe">
                        Monthly Rent:{' '}
                        <strong className="font-ledger text-hearth-ink">
                          ₹{agreement.lockedMonthlyRent.toLocaleString('en-IN')}/mo
                        </strong>
                      </div>
                      <div className="text-xs text-hearth-sage font-semibold">
                        Refundable Deposit:{' '}
                        <span className="font-ledger">
                          ₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {agreement.lockedInstallationCharge > 0 && (
                        <div className="text-[11px] text-hearth-terracotta font-mono">
                          Installation Cost: ₹{agreement.lockedInstallationCharge}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amendments / Updates if any */}
                  {agreement.amendments.length > 0 && (
                    <div className="rounded-2xl bg-hearth-parchment border border-hearth-border p-3.5 space-y-2">
                      <div className="text-[11px] font-semibold text-hearth-terracotta">
                        Agreement Updates
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {agreement.amendments.map((am) => (
                          <div
                            key={am.id}
                            className="p-2.5 rounded-xl bg-hearth-card border border-hearth-border text-[11px] space-y-0.5"
                          >
                            <div className="font-semibold text-hearth-ink">
                              {am.version} — {am.reason}
                            </div>
                            <div className="text-hearth-umber">
                              {am.changedFieldsSummary}
                            </div>
                            <div className="text-[10px] text-hearth-taupe">
                              {am.createdAt}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Ribbon */}
                  <div className="pt-3 border-t border-hearth-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {isSigned ? (
                        <span className="text-hearth-sage font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified Electronic Signature on File</span>
                        </span>
                      ) : (
                        <span className="text-[#9A3412] font-semibold">
                          Signature required before delivery dispatch
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDownloadCertificate(agreement)}
                        className="px-3.5 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-umber flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveAgreementModalBookingId(booking.id)
                        }
                        className={`spring-btn px-4 py-1.5 rounded-pill text-xs font-semibold flex items-center gap-1.5 ${
                          isSigned
                            ? 'bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-hearth-ink'
                            : 'bg-hearth-terracotta hover:bg-hearth-kiln text-white shadow-sm'
                        }`}
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>
                          {isSigned ? 'View Full Agreement' : 'Sign Agreement'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Modal Mode (when activeAgreementModalBookingId is set)
  if (!activeAgreementModalBookingId) return null;

  const agreement =
    agreements.find((a) => a.bookingId === activeAgreementModalBookingId) ||
    agreements[0];
  const booking =
    bookings.find((b) => b.id === agreement?.bookingId) || bookings[0];

  if (!agreement || !booking) return null;

  const isSigned =
    agreement.status === 'Signed' ||
    agreement.status === 'Active' ||
    agreement.status === 'Amended' ||
    agreement.status === 'Completed';

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={() => setActiveAgreementModalBookingId(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="border-b border-hearth-border pb-4 pr-10">
            <span className="text-[11px] font-semibold text-hearth-terracotta">
              Rental Agreement • {agreement.id}
            </span>
            <h2 className="font-serif text-xl font-bold text-hearth-ink mt-0.5">
              {agreement.productTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Columns: Summary Box */}
            <div className="lg:col-span-5 rounded-2xl bg-[#EFECE4] dark:bg-hearth-oat border border-hearth-border p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-hearth-ink">
                  Agreement Summary
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta">
                  {agreement.bookingId}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-hearth-umber list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Customer:</strong> {agreement.customerName}
                </li>
                <li>
                  <strong>Pricing:</strong> Monthly Rent of{' '}
                  <strong className="font-ledger">
                    ₹{agreement.lockedMonthlyRent.toLocaleString('en-IN')}/mo
                  </strong>{' '}
                  + Refundable Deposit of{' '}
                  <strong className="font-ledger">
                    ₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}
                  </strong>
                  .
                </li>
                <li>
                  <strong>Doorstep Pickup Protection:</strong> Our pickup team
                  takes a photo of your item at your doorstep during return
                  pickup. Any transit damage after pickup is never deducted from
                  your deposit.
                </li>
                <li>
                  <strong>Deposit Refund:</strong> Refunded within 14 days of
                  return completion.
                </li>
              </ul>

              {agreement.amendments.length > 0 && (
                <div className="pt-3 border-t border-hearth-border space-y-2">
                  <div className="text-[11px] font-semibold text-hearth-terracotta">
                    Agreement Updates
                  </div>
                  {agreement.amendments.map((am) => (
                    <div
                      key={am.id}
                      className="p-2.5 rounded-xl bg-hearth-card border border-hearth-border text-[11px] space-y-0.5"
                    >
                      <div className="font-semibold text-hearth-ink">
                        {am.version}
                      </div>
                      <div className="text-hearth-umber">
                        {am.changedFieldsSummary}
                      </div>
                      <div className="text-[10px] text-hearth-taupe">
                        {am.createdAt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 7 Columns: Terms + Signature */}
            <div className="lg:col-span-7 rounded-2xl bg-hearth-card border border-hearth-border p-6 space-y-4 relative">
              <div className="flex items-start justify-between gap-3 border-b border-hearth-border pb-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-hearth-ink">
                    Terms & Conditions
                  </h3>
                </div>
                <button
                  onClick={() => handleDownloadCertificate(agreement)}
                  className="spring-btn px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-ink flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
                  <span>Download</span>
                </button>
              </div>

              <div className="space-y-3 text-xs text-hearth-umber leading-relaxed max-h-64 overflow-y-auto pr-2">
                <p>
                  <strong>1. Overview:</strong> This Rental Agreement is between{' '}
                  <strong>KaroRent</strong> and{' '}
                  <strong>{agreement.customerName}</strong>. All delivery,
                  installation, and maintenance services are managed directly by
                  KaroRent.
                </p>
                <p>
                  <strong>2. Item & Duration:</strong> Product:{' '}
                  <strong>{agreement.productTitle}</strong> (Serial:{' '}
                  <span className="font-mono">
                    {agreement.allocatedSerialNumber || 'Assigned at Delivery'}
                  </span>
                  ) for a duration of{' '}
                  <strong>{agreement.tenureMonths} Months</strong> (
                  {agreement.startDate} to {agreement.endDate}).
                </p>
                <p>
                  <strong>3. Security Deposit:</strong> Your refundable deposit
                  of{' '}
                  <strong>
                    ₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}
                  </strong>{' '}
                  is held safely and refunded within 14 days after your return
                  inspection is completed.
                </p>
                <p className="p-3 rounded-xl bg-hearth-sageLight border border-hearth-sage/25 text-hearth-ink">
                  <strong>4. Return Condition Policy:</strong>{' '}
                  {agreement.mandatoryPickupPhotoClause}
                </p>
              </div>

              {isSigned ? (
                <div className="pt-4 border-t border-hearth-border flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-hearth-sage flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Signed Electronically</span>
                    </div>
                    <div className="font-mono text-[11px] text-hearth-taupe break-all">
                      {agreement.signatureHash}
                    </div>
                  </div>

                  <div className="animate-stamp w-24 h-24 rounded-full border-2 border-dashed border-[#2F5233] bg-[#EFF6F0]/90 flex flex-col items-center justify-center text-center p-2 shadow-sm select-none">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#2F5233] font-bold">
                      Verified
                    </span>
                    <span className="font-serif text-xs font-bold text-[#166534] leading-tight mt-0.5">
                      Signed Agreement
                    </span>
                    <span className="text-[9px] font-mono text-[#2F5233] mt-0.5">
                      OTP Confirmed
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-hearth-border space-y-3 bg-hearth-apricot/70 p-4 rounded-2xl border border-hearth-terracotta/30">
                  <div className="text-xs font-bold text-hearth-terracotta flex items-center gap-1.5">
                    <FileSignature className="w-4 h-4" />
                    <span>Sign Agreement to Confirm Order</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                        Full Name / Title
                      </label>
                      <input
                        type="text"
                        value={authorityDeclaration}
                        onChange={(e) =>
                          setAuthorityDeclaration(e.target.value)
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs font-mono"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-hearth-umber cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="rounded text-hearth-terracotta"
                    />
                    <span>I agree to the rental terms and conditions.</span>
                  </label>
                  <button
                    disabled={
                      !consentChecked ||
                      otpInput.trim().length < 4 ||
                      isSimulatingLatency
                    }
                    onClick={() =>
                      signRentalAgreement(
                        agreement.bookingId,
                        otpInput,
                        authorityDeclaration
                      )
                    }
                    className="spring-btn w-full py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSimulatingLatency ? 'Signing...' : 'Sign & Confirm'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
