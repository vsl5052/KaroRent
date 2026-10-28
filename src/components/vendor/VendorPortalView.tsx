import React, { useState } from 'react';
import {
  AlertOctagon,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lock,
  PackagePlus,
  ShieldAlert,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { vendorOnboardingSchema } from '../../lib/validation';

export const VendorPortalView: React.FC = () => {
  const {
    activePersona,
    vendors,
    virtualInventory,
    masterProducts,
    bookings,
    submitVendorStagedInventoryChange,
    submitNewVendorApplication,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  const activeVendorId = activePersona.vendorId || 'VEN-201';
  const currentVendor =
    vendors.find((v) => v.id === activeVendorId) || vendors[0];
  const isReadOnlyTerminated =
    currentVendor.status === 'Terminating — Continuity Active' ||
    currentVendor.status === 'Terminated' ||
    Boolean(activePersona.isTerminatedVendor);

  // Scope inventory & bookings strictly to owning vendor (BR-012)
  const vendorInventory = virtualInventory.filter(
    (i) => i.owningVendorId === currentVendor.id
  );
  const vendorBookings = bookings.filter(
    (b) => b.fulfillingVendorId === currentVendor.id
  );

  // Staged Inventory Edit State
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [reqEnabled, setReqEnabled] = useState<boolean>(true);
  const [reqStock, setReqStock] = useState<number>(12);
  const [reqImageUrl, setReqImageUrl] = useState<string>('');
  const [reqNotes, setReqNotes] = useState<string>(
    'Updated warehouse physical count & uploaded fresh daylight studio image.'
  );

  // New Vendor Onboarding Application Simulator (FR-VEN-001 / FR-VEN-002 / EX-031)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [appLegalName, setAppLegalName] = useState(
    'HearthCraft Home Appliances Pvt Ltd'
  );
  const [appDisplayName, setAppDisplayName] = useState('HearthCraft Living');
  const [appGstin, setAppGstin] = useState('29AABCH9911K1Z4');
  const [appPan, setAppPan] = useState('AABCH9911K');
  const [appPhone, setAppPhone] = useState('+91 98451 66778');
  const [appEmail, setAppEmail] = useState('onboarding@hearthcraft.in');
  const [appContact, setAppContact] = useState('Kiran Rao');
  const [appBank, setAppBank] = useState('HDFC •••• 6102 (IFSC: HDFC0000240)');
  const [appAreas, setAppAreas] = useState('Indiranagar, Whitefield, Jayanagar');
  const [appClauseAccepted, setAppClauseAccepted] = useState(true);
  const [appErrors, setAppErrors] = useState<string[]>([]);

  const autofillBlacklistedVendorIdentifiers = () => {
    // Prefills identifiers matching terminated vendor VEN-203 (Apex Urban Rentals) to test FR-VEN-002 / FR-BLK-003!
    setAppLegalName('MetroBreeze Cooling Solutions LLP');
    setAppDisplayName('MetroBreeze Appliances');
    setAppGstin('27AAAAP0091E1Z5'); // Matches blacklisted VEN-203!
    setAppPan('AAAAP0091E'); // Matches blacklisted VEN-203!
    setAppPhone('+91 80999 00112');
    setAppEmail('suresh.reapply@metrobreeze.in');
    setAppContact('Suresh Menon');
    setAppBank('AXIS •••• 4921 (IFSC: UTIB0000119)');
    setAppAreas('HSR Layout, Indiranagar');
    setAppClauseAccepted(true);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppErrors([]);

    const parsed = vendorOnboardingSchema.safeParse({
      legalBusinessName: appLegalName,
      displayName: appDisplayName,
      taxIdGstin: appGstin,
      panNumber: appPan,
      registeredPhone: appPhone,
      email: appEmail,
      authorisedContactName: appContact,
      bankAccountMasked: appBank,
      serviceAreas: appAreas,
      mandatoryPickupPhotoClauseAccepted: appClauseAccepted,
    });

    if (!parsed.success) {
      setAppErrors(parsed.error.errors.map((err) => err.message));
      return;
    }

    await submitNewVendorApplication({
      legalBusinessName: appLegalName,
      displayName: appDisplayName,
      taxIdGstin: appGstin,
      panNumber: appPan,
      registeredPhone: appPhone,
      email: appEmail,
      authorisedContactName: appContact,
      bankAccountMasked: appBank,
      serviceAreas: appAreas,
    });

    setShowOnboardingModal(false);
  };

  return (
    <div className="space-y-7">
      {/* Editorial Vendor Showroom Header Banner using local asset */}
      <div className="relative rounded-3xl overflow-hidden border border-hearth-border shadow-hearth bg-[#F5EFE6]">
        <img
          src="assets/vendor_showroom_hero.jpg"
          alt="Partner Vendor Showroom"
          className="w-full h-56 object-cover object-right opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent flex items-center p-6 sm:p-8">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-hearth-card border border-hearth-border text-[11px] font-mono text-hearth-terracotta font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                Partner Vendor Workspace • {currentVendor.id} • Partner-Scoped View
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              {currentVendor.legalBusinessName}
            </h1>
            <p className="text-xs text-[#44403C]">
              Agreement: <strong>{currentVendor.agreementVersion}</strong> ({currentVendor.agreementState}) • Service Zones: {currentVendor.serviceAreas.join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowOnboardingModal(true)}
                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>New Partner Onboarding & Verification</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Termination Read-Only Restriction Banner */}
      {isReadOnlyTerminated && (
        <div className="p-5 rounded-3xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <AlertOctagon className="w-5 h-5" />
              <span>
                Post-Termination Read-Only Portal Mode Active
              </span>
            </div>
            <span className="px-3 py-1 rounded-pill bg-[#991B1B] text-white text-xs font-mono font-semibold">
              Escrow Hold: ₹{currentVendor.settlementHoldAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            Your Platform–Vendor Agreement has been terminated. Public listings have been delisted or re-routed, and all catalogue/inventory editing permissions are revoked. You retain read-only visibility into active rental returns, inspection records, and your settlement hold ledger.
          </p>
          <div className="text-xs font-mono bg-white/70 px-3 py-1.5 rounded-xl border border-[#FECACA]">
            Assigned Continuity Manager: <strong>{currentVendor.continuityManager}</strong>
          </div>
        </div>
      )}

      {/* Staged Inventory Governance & Platform Pricing Lock Explanation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
          <Clock className="w-5 h-5 text-hearth-terracotta shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Staged Inventory Governance
            </div>
            <p className="text-hearth-umber leading-relaxed">
              When you add, update, enable, or disable an inventory item below, the change is staged in <strong>Pending Admin Approval</strong> and never directly alters the live customer catalog until the Platform Manager approves or reassigns the vendor source.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-hearth-card border border-hearth-border flex items-start gap-3">
          <Lock className="w-5 h-5 text-hearth-sage shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-serif font-bold text-hearth-ink">
              Platform-Controlled Rental Pricing & Rate Cards
            </div>
            <p className="text-hearth-umber leading-relaxed">
              Monthly rental rates, 4× security deposit multiples, ₹499 site visit fees, and per-meter AC installation rates are centrally governed by KaroRent and locked in the vendor portal.
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Virtual Inventory & Staged Edit Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-hearth-ink">
          Your Scoped Virtual Inventory & Staged Change Requests ({vendorInventory.length})
        </h2>

        {vendorInventory.length === 0 ? (
          <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
            No active inventory items assigned to {currentVendor.displayName}. (Items from terminated vendor VEN-203 were re-routed to VEN-201).
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vendorInventory.map((inv) => {
              const masterProd = masterProducts.find(
                (p) => p.id === inv.productId
              )!;
              const isEditing = editingInvId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={inv.itemImages[0]}
                          alt={inv.productTitle}
                          className="w-16 h-16 rounded-2xl object-cover border border-hearth-border shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-hearth-ink">
                              {inv.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                                inv.livePublicEnabled
                                  ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                                  : 'bg-hearth-oat text-hearth-taupe border border-hearth-border'
                              }`}
                            >
                              Live Catalog: {inv.livePublicEnabled ? 'ENABLED' : 'DISABLED'}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-base text-hearth-ink mt-1">
                            {inv.productTitle}
                          </h3>
                          <div className="text-[11px] text-hearth-taupe">
                            Hub: {inv.serviceLocation} • Grade: {inv.conditionGrade}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Locked Platform Rate Card Strip (FR-PRC-001) */}
                    <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-hearth-umber">
                        <Lock className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>
                          Platform Base Rent:{' '}
                          <strong className="font-ledger text-hearth-ink">
                            ₹{masterProd.baseMonthlyRent}/mo
                          </strong>{' '}
                          • 4x Deposit:{' '}
                          <strong className="font-ledger">
                            ₹{masterProd.baseMonthlyRent * masterProd.depositMonthsMultiple}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-hearth-taupe">
                        Read-Only (Platform Rate)
                      </span>
                    </div>

                    {/* Virtual Stock Telemetry Grid (FR-INV-002 / FR-INV-007) */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-hearth-oat/60 border border-hearth-border">
                        <div className="text-[10px] text-hearth-taupe">Declared</div>
                        <div className="font-ledger font-bold text-sm text-hearth-ink">
                          {inv.declaredQuantity}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0]">
                        <div className="text-[10px] text-[#166534]">Available</div>
                        <div className="font-ledger font-bold text-sm text-[#166534]">
                          {inv.availableQuantity}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FFEDD5]/50 border border-[#FED7AA]">
                        <div className="text-[10px] text-[#9A3412]">Reserved</div>
                        <div className="font-ledger font-bold text-sm text-[#9A3412]">
                          {inv.reservedQuantity}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-hearth-apricot border border-hearth-terracotta/30">
                        <div className="text-[10px] text-hearth-terracotta">Dispatched</div>
                        <div className="font-ledger font-bold text-sm text-hearth-terracotta">
                          {inv.rentedQuantity}
                        </div>
                      </div>
                    </div>

                    {/* Active Pending Staged Request Banner (FR-INV-010) */}
                    {inv.pendingStagedRequest && (
                      <div className="p-3.5 rounded-2xl bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412] text-xs space-y-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>
                            Staged Request {inv.pendingStagedRequest.id}:{' '}
                            {inv.pendingStagedRequest.requestType}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-pill bg-white/80">
                            Pending Admin Approval
                          </span>
                        </div>
                        <p className="text-[11px]">
                          Requested Display:{' '}
                          <strong>
                            {inv.pendingStagedRequest.requestedPublicEnabled
                              ? 'ENABLE'
                              : 'DISABLE'}
                          </strong>{' '}
                          | Requested Stock:{' '}
                          <strong>
                            {inv.pendingStagedRequest.requestedDeclaredStock} units
                          </strong>
                        </p>
                        <p className="text-[10px] italic">
                          Note: "{inv.pendingStagedRequest.vendorNotes}" — Live catalog remains unchanged until Platform Manager review.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Staged Edit Trigger / Form */}
                  {!isReadOnlyTerminated && (
                    <div className="pt-3 border-t border-hearth-border">
                      {!isEditing ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setEditingInvId(inv.id);
                              setReqEnabled(!inv.livePublicEnabled);
                              setReqStock(inv.declaredQuantity);
                              setReqImageUrl('');
                            }}
                            className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold"
                          >
                            Submit Staged Enable/Disable or Stock Update
                          </button>
                          <span className="text-[10px] font-mono text-hearth-taupe">
                            {inv.serializedAssets.length} Serialized Assets Tracked
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-3">
                          <div className="text-xs font-bold text-hearth-ink">
                            Stage Inventory Change for Platform Manager Approval
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                                Requested Display Status
                              </label>
                              <select
                                value={reqEnabled ? 'ENABLE' : 'DISABLE'}
                                onChange={(e) =>
                                  setReqEnabled(e.target.value === 'ENABLE')
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                              >
                                <option value="ENABLE">
                                  Request Enable on Public Platform
                                </option>
                                <option value="DISABLE">
                                  Request Disable (Triggers Admin Source Switch Option)
                                </option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                                Declared Stock Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={reqStock}
                                onChange={(e) => setReqStock(Number(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs font-ledger"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                              Upload New Item Image URL (Optional)
                            </label>
                            <input
                              type="text"
                              value={reqImageUrl}
                              onChange={(e) => setReqImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                              Reason / Operational Notes for Platform Manager *
                            </label>
                            <input
                              type="text"
                              value={reqNotes}
                              onChange={(e) => setReqNotes(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingInvId(null)}
                              className="px-3.5 py-1.5 rounded-pill bg-hearth-card border border-hearth-border text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={isSimulatingLatency}
                              onClick={async () => {
                                await submitVendorStagedInventoryChange({
                                  inventoryId: inv.id,
                                  requestedPublicEnabled: reqEnabled,
                                  requestedDeclaredStock: reqStock,
                                  uploadedImageUrl: reqImageUrl.trim() || undefined,
                                  vendorNotes: reqNotes,
                                });
                                setEditingInvId(null);
                              }}
                              className="px-4 py-1.5 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold"
                            >
                              Submit to Pending Admin Approval
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Vendor Onboarding & Blacklist Detection Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Vendor Onboarding & Blacklist Duplicate Detection
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Evaluates GSTIN, PAN, Phone, Email, and Bank Payout Account against the Unified Vendor Blacklist.
                </p>
              </div>
              <button
                type="button"
                onClick={autofillBlacklistedVendorIdentifiers}
                className="px-3 py-1.5 rounded-pill bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] text-[11px] font-semibold shrink-0"
              >
                Autofill Terminated Vendor Match
              </button>
            </div>

            {appErrors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
                {appErrors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleOnboardingSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    value={appLegalName}
                    onChange={(e) => setAppLegalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Storefront Display Name *
                  </label>
                  <input
                    type="text"
                    value={appDisplayName}
                    onChange={(e) => setAppDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    15-Digit GSTIN / Tax ID *
                  </label>
                  <input
                    type="text"
                    value={appGstin}
                    onChange={(e) => setAppGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    10-Character PAN *
                  </label>
                  <input
                    type="text"
                    value={appPan}
                    onChange={(e) => setAppPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Registered Mobile *
                  </label>
                  <input
                    type="text"
                    value={appPhone}
                    onChange={(e) => setAppPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    value={appEmail}
                    onChange={(e) => setAppEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Authorised Contact Person *
                  </label>
                  <input
                    type="text"
                    value={appContact}
                    onChange={(e) => setAppContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Bank Payout Account & IFSC *
                  </label>
                  <input
                    type="text"
                    value={appBank}
                    onChange={(e) => setAppBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Service Coverage Areas (Comma Separated) *
                </label>
                <input
                  type="text"
                  value={appAreas}
                  onChange={(e) => setAppAreas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                />
              </div>

              <label className="flex items-start gap-2 p-3 rounded-xl bg-hearth-sageLight border border-hearth-sage/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appClauseAccepted}
                  onChange={(e) => setAppClauseAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-hearth-sage"
                />
                <span>
                  <strong>Mandatory Operational Clause:</strong> We agree that our pickup personnel will capture a verified timestamped photograph of every returned product at the customer's premises before pickup, and accept that undocumented warehouse damage cannot be charged to the customer.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-hearth-border">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-4 py-2 rounded-pill bg-hearth-oat"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingLatency}
                  className="px-5 py-2 rounded-pill bg-hearth-terracotta text-white font-semibold"
                >
                  Submit Application & Run Blacklist Cross-Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
