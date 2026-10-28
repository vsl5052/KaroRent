import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSignature,
  Lock,
  ShieldCheck,
  Sparkles,
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
    'Authorised Corporate Signatory / Verified Lessee (FR-CUS-003)'
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
      `KARORENT PLATFORM–CUSTOMER RENTAL AGREEMENT CERTIFICATE (FR-AGR-008)`,
      `====================================================================`,
      `Agreement ID     : ${agreement.id}`,
      `Parent Booking   : ${agreement.bookingId}`,
      `Template Version : ${agreement.templateVersion}`,
      `Status           : ${agreement.status}`,
      `Customer / Lessee: ${agreement.customerName}`,
      `Signatory Role   : ${agreement.authorisedSignatory || 'Verified Individual Customer'}`,
      `Vendor Snapshot  : ${agreement.vendorSnapshotName} (BR-006)`,
      `Product & Serial : ${agreement.productTitle} (${agreement.allocatedSerialNumber || 'Allocated at Dispatch'})`,
      `Rental Tenure    : ${agreement.tenureMonths} Months (${agreement.startDate} to ${agreement.endDate})`,
      `Locked Base Rent : INR ${agreement.lockedMonthlyRent} / month`,
      `Segregated Vault : INR ${agreement.lockedDepositAmount} (4x Refundable Deposit — BR-011)`,
      `Mandatory Clause : ${agreement.mandatoryPickupPhotoClause}`,
      `Signature Proof  : ${agreement.signatureHash || 'Pending Signature'}`,
      `====================================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agreement.id}_Signed_Rental_Agreement.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: `Downloaded ${agreement.id} (FR-AGR-008)`,
      description: 'Immutable signed contract certificate saved with cryptographic OTP evidence.',
      ruleCode: 'FR-AGR-008',
      variant: 'success',
    });
  };

  const renderPaperContent = () => (
    <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Top Document selector when in inline tab mode */}
      {inlineMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-hearth-border">
          <div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              Rental Agreement & E-Signature Reader (FR-AGR-001 to 009)
            </h2>
            <p className="text-xs text-hearth-taupe">
              Stationery-grade contract viewer with immutable version history and Sage-Green Aadhaar/Corporate OTP verification seal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-hearth-umber font-medium">Select Contract:</span>
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

      {/* Stationery Contract Card (Exact Match to Theme 3 Screen B Left Panel!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Sticky Key Terms Summary Box */}
        <div className="lg:col-span-5 rounded-2xl bg-[#EFECE4] dark:bg-hearth-oat border border-hearth-border p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-hearth-ink">
              Key Terms Summary (BR-006 Snapshot)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta">
              {agreement.id}
            </span>
          </div>

          <ul className="space-y-2 text-xs text-hearth-umber list-disc pl-4 leading-relaxed">
            <li>
              <strong>Contracting Party (Section 1):</strong> KaroRent Marketplace Platform contracts directly with <strong>{agreement.customerName}</strong>.
            </li>
            <li>
              <strong>Fulfilling Partner Snapshot:</strong> {agreement.vendorSnapshotName}.
            </li>
            <li>
              <strong>Locked Financial Terms (FR-PRC-005):</strong> Monthly Rent of{' '}
              <strong className="font-ledger">₹{agreement.lockedMonthlyRent.toLocaleString('en-IN')}/mo</strong> + Segregated 4-Month Security Deposit of{' '}
              <strong className="font-ledger">₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}</strong>.
            </li>
            <li>
              <strong>Mandatory Doorstep Pickup Photo (Clause 9.4 / BR-026):</strong> Field pickup personnel MUST capture a verified EXIF timestamped photo at your premises. Undocumented warehouse scuffs cannot be deducted from your deposit.
            </li>
            <li>
              <strong>14-Day Vault Settlement (FR-DEP-006):</strong> Deposit refunds within 14 days of rental closure.
            </li>
          </ul>

          {/* Amendment Trail (FR-AGR-006) */}
          {agreement.amendments.length > 0 && (
            <div className="pt-3 border-t border-hearth-border space-y-2">
              <div className="text-[11px] font-mono uppercase text-hearth-terracotta font-semibold">
                Traceable Amendments (FR-AGR-006)
              </div>
              {agreement.amendments.map((am) => (
                <div
                  key={am.id}
                  className="p-2.5 rounded-xl bg-hearth-card border border-hearth-border text-[11px] space-y-0.5"
                >
                  <div className="font-semibold text-hearth-ink">{am.version}</div>
                  <div className="text-hearth-umber">{am.changedFieldsSummary}</div>
                  <div className="text-[10px] font-mono text-hearth-taupe">
                    {am.createdAt} • {am.signedByCustomer ? 'Signed & Active' : 'Awaiting Consent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 7 Columns: Full Legal Clauses + Sage-Green Circular Seal Stamp */}
        <div className="lg:col-span-7 rounded-2xl bg-hearth-card border border-hearth-border p-6 space-y-4 relative">
          <div className="flex items-start justify-between gap-3 border-b border-hearth-border pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-hearth-taupe">
                {agreement.templateVersion}
              </div>
              <h3 className="font-serif text-xl font-bold text-hearth-ink mt-0.5">
                Tri-Partite Platform–Customer Rental Agreement
              </h3>
            </div>
            <button
              onClick={handleDownloadCertificate}
              className="spring-btn px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-medium text-hearth-ink flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
              <span>Download Copy</span>
            </button>
          </div>

          <div className="space-y-3 text-xs text-hearth-umber leading-relaxed max-h-64 overflow-y-auto pr-2">
            <p>
              <strong>1. Parties & Scope (FR-AGR-002):</strong> This Rental Agreement is executed between <strong>KaroRent Platform Operator</strong> ("Contracting Party & Invoice Issuer") and <strong>{agreement.customerName}</strong> ("Customer"). Physical custody and doorstep fulfilment are performed by approved partner <strong>{agreement.vendorSnapshotName}</strong> under a separate Platform–Vendor Agreement.
            </p>
            <p>
              <strong>2. Leased Asset & Tenure:</strong> Product: <strong>{agreement.productTitle}</strong> (Serial: <span className="font-mono">{agreement.allocatedSerialNumber || 'Assigned at Dispatch'}</span>) for a minimum tenure of <strong>{agreement.tenureMonths} Months</strong> ({agreement.startDate} through {agreement.endDate}).
            </p>
            <p>
              <strong>3. Segregated Security Deposit Vault (FR-DEP-002 / BR-011):</strong> The Customer’s refundable deposit of <strong>₹{agreement.lockedDepositAmount.toLocaleString('en-IN')}</strong> is held in a segregated ledger distinct from rental revenue and shall be refunded within 14 days following return inspection settlement.
            </p>
            <p className="p-3 rounded-xl bg-hearth-sageLight border border-hearth-sage/25 text-hearth-ink">
              <strong>4. Mandatory Customer-Premise Pickup Photo Protection (FR-VEN-005 / BR-026):</strong> {agreement.mandatoryPickupPhotoClause}
            </p>
          </div>

          {/* Signed State vs. Interactive E-Signature Pad (FR-AGR-004 / FR-AGR-005) */}
          {isSigned ? (
            <div className="pt-4 border-t border-hearth-border flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-hearth-sage flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cryptographic Electronic Signature Verified (FR-AGR-004)</span>
                </div>
                <div className="font-mono text-[11px] text-hearth-taupe break-all">
                  {agreement.signatureHash}
                </div>
              </div>

              {/* Exact Circular Sage-Green Stamp from Theme 3 Screen B Mockup! */}
              <div className="animate-stamp w-28 h-28 rounded-full border-2 border-dashed border-[#2F5233] bg-[#EFF6F0]/90 flex flex-col items-center justify-center text-center p-2 shadow-sm select-none">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#2F5233] font-bold">
                  Sage-Green
                </span>
                <span className="font-serif text-xs font-bold text-[#166534] leading-tight mt-0.5">
                  Verified E-Signature
                </span>
                <span className="text-[9px] font-mono text-[#2F5233] mt-0.5">
                  • Aadhaar OTP Signed •
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-hearth-border space-y-3 bg-hearth-apricot/70 p-4 rounded-2xl border border-hearth-terracotta/30">
              <div className="text-xs font-bold text-hearth-terracotta flex items-center gap-1.5">
                <FileSignature className="w-4 h-4" />
                <span>Activation Gate (FR-AGR-005): Complete E-Signature to Unlock Rental</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                    Signer Authority / Designation (FR-CUS-003)
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
                    6-Digit Aadhaar / Corporate OTP Code
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
                  I have reviewed the complete agreement, price snapshot, and Clause 9.4 (BR-026) and consent to sign electronically.
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
                {isSimulatingLatency
                  ? 'Sealing Cryptographic Consent...'
                  : 'Apply Verified OTP E-Signature & Seal Contract'}
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
