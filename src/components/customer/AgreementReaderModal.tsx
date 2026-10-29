import React, { useState } from 'react';
import {
  Download,
  FileSignature,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const AgreementReaderModal: React.FC<{ inlineMode?: boolean }> = ({
  inlineMode = false,
}) => {
  const {
    activeAgreementModalBookingId,
    setActiveAgreementModalBookingId,
    agreements,
    bookings,
    signRentalAgreement,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    activeAgreementModalBookingId || bookings[0]?.id || 'BKG-2026-8841'
  );
  const [otpInput, setOtpInput] = useState('482910');
  const [authorityDeclaration, setAuthorityDeclaration] = useState(
    'Customer / Authorised Signatory'
  );
  const [consentChecked, setConsentChecked] = useState(true);

  const effectiveBookingId = inlineMode
    ? selectedBookingId
    : activeAgreementModalBookingId;

  if (!inlineMode && !effectiveBookingId) return null;

  const agreement =
    agreements.find((a) => a.bookingId === effectiveBookingId) || agreements[0];
  const booking =
    bookings.find((b) => b.id === agreement?.bookingId) || bookings[0];

  if (!agreement || !booking) return null;

  const isSigned =
    agreement.status === 'Signed' ||
    agreement.status === 'Active' ||
    agreement.status === 'Amended' ||
    agreement.status === 'Completed';

  const handleDownloadCertificate = () => {
    const content = [
      `====================================================================`,
      `KARORENT RENTAL AGREEMENT`,
      `====================================================================`,
      `Agreement ID     : ${agreement.id}`,
      `Order ID         : ${agreement.bookingId}`,
      `Status           : ${agreement.status}`,
      `Customer         : ${agreement.customerName}`,
      `Partner Vendor   : ${agreement.vendorSnapshotName}`,
      `Product          : ${agreement.productTitle}`,
      `Rental Duration  : ${agreement.tenureMonths} Months (${agreement.startDate} to ${agreement.endDate})`,
      `Monthly Rent     : INR ${agreement.lockedMonthlyRent} / month`,
      `Security Deposit : INR ${agreement.lockedDepositAmount} (Refundable)`,
      `Pickup Policy    : ${agreement.mandatoryPickupPhotoClause}`,
      `Signature Ref    : ${agreement.signatureHash || 'Pending Signature'}`,
      `====================================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agreement.id}_Rental_Agreement.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: `Downloaded ${agreement.id}`,
      description: 'Rental agreement copy downloaded.',
      variant: 'success',
    });
  };

  const renderPaperContent = () => (
    <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Top selector when in inline tab mode */}
      {inlineMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-hearth-border">
          <div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              Rental Agreements
            </h2>
            <p className="text-xs text-hearth-taupe">
              Review and sign your rental agreements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-hearth-umber font-medium">Select Order:</span>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="px-3.5 py-2 rounded-pill bg-hearth-card border border-hearth-border text-xs font-mono text-hearth-ink"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.productTitle.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Agreement Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Summary Box */}
        <div className="lg:col-span-5 rounded-2xl bg-[#EFECE4] dark:bg-hearth-oat border border-hearth-border p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-hearth-ink">
              Agreement Summary
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta">
              {agreement.id}
            </span>
          </div>

          <ul className="space-y-2 text-xs text-hearth-umber list-disc pl-4 leading-relaxed">
            <li>
              <strong>Customer:</strong> {agreement.customerName}
            </li>
            <li>
              <strong>Fulfilling Partner:</strong> {agreement.vendorSnapshotName}
            </li>
            <li>
              <strong>Pricing:</strong> Monthly Rent of{' '}
              <strong className="font-ledger">₹{agreement.lockedMonthlyRent.toLocaleString('en-IN')}/mo</strong> + Refundable Deposit of{' '}
              <strong className="font-ledger">₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}</strong>.
            </li>
            <li>
              <strong>Doorstep Pickup Protection:</strong> Our pickup team takes a photo of your item at your doorstep during return pickup. Any transit damage after pickup is never deducted from your deposit.
            </li>
            <li>
              <strong>Deposit Refund:</strong> Refunded within 14 days of return completion.
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
                  <div className="font-semibold text-hearth-ink">{am.version}</div>
                  <div className="text-hearth-umber">{am.changedFieldsSummary}</div>
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
              onClick={handleDownloadCertificate}
              className="spring-btn px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-ink flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
              <span>Download</span>
            </button>
          </div>

          <div className="space-y-3 text-xs text-hearth-umber leading-relaxed max-h-64 overflow-y-auto pr-2">
            <p>
              <strong>1. Overview:</strong> This Rental Agreement is between <strong>KaroRent</strong> and <strong>{agreement.customerName}</strong>. Delivery and maintenance are fulfilled by our partner <strong>{agreement.vendorSnapshotName}</strong>.
            </p>
            <p>
              <strong>2. Item & Duration:</strong> Product: <strong>{agreement.productTitle}</strong> (Serial: <span className="font-mono">{agreement.allocatedSerialNumber || 'Assigned at Delivery'}</span>) for a duration of <strong>{agreement.tenureMonths} Months</strong> ({agreement.startDate} to {agreement.endDate}).
            </p>
            <p>
              <strong>3. Security Deposit:</strong> Your refundable deposit of <strong>₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}</strong> is held safely and refunded within 14 days after your return inspection is completed.
            </p>
            <p className="p-3 rounded-xl bg-hearth-sageLight border border-hearth-sage/25 text-hearth-ink">
              <strong>4. Return Condition Policy:</strong> {agreement.mandatoryPickupPhotoClause}
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
                    onChange={(e) => setAuthorityDeclaration(e.target.value)}
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
                <span>
                  I agree to the rental terms and conditions.
                </span>
              </label>
              <button
                disabled={!consentChecked || otpInput.trim().length < 4 || isSimulatingLatency}
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
  );

  if (inlineMode) {
    return renderPaperContent();
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={() => setActiveAgreementModalBookingId(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
        {renderPaperContent()}
      </div>
    </div>
  );
};
