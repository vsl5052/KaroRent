import React, { useState } from 'react';
import {
  AlertOctagon,
  Building2,
  Lock,
  PackagePlus,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { vendorOnboardingSchema } from '../../lib/validation';

export const VendorPortalView: React.FC = () => {
  const {
    activePersona,
    vendors,
    virtualInventory,
    masterProducts,
    submitVendorStagedInventoryChange,
    submitNewVendorApplication,
    isSimulatingLatency,
  } = useKaroRentStore();

  const activeVendorId = activePersona.vendorId || 'VEN-201';
  const currentVendor =
    vendors.find((v) => v.id === activeVendorId) || vendors[0];
  const isReadOnlyTerminated =
    currentVendor.status === 'Terminating — Continuity Active' ||
    currentVendor.status === 'Terminated' ||
    Boolean(activePersona.isTerminatedVendor);

  const vendorInventory = virtualInventory.filter(
    (i) => i.owningVendorId === currentVendor.id
  );

  // Inventory Edit State
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [reqEnabled, setReqEnabled] = useState<boolean>(true);
  const [reqStock, setReqStock] = useState<number>(12);
  const [reqImageUrl, setReqImageUrl] = useState<string>('');
  const [reqNotes, setReqNotes] = useState<string>(
    'Updated warehouse stock count and product photos.'
  );

  // Partner Registration Modal
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

  const autofillSampleDetails = () => {
    setAppLegalName('MetroBreeze Cooling Solutions LLP');
    setAppDisplayName('MetroBreeze Appliances');
    setAppGstin('27AAAAP0091E1Z5');
    setAppPan('AAAAP0091E');
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
      {/* Header Banner */}
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
              <span>Vendor Portal • {currentVendor.id}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              {currentVendor.legalBusinessName}
            </h1>
            <p className="text-xs text-[#44403C]">
              Service Areas: {currentVendor.serviceAreas.join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowOnboardingModal(true)}
                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Register New Partner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restricted Banner */}
      {isReadOnlyTerminated && (
        <div className="p-5 rounded-3xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <AlertOctagon className="w-5 h-5" />
              <span>Account Restricted (Read-Only)</span>
            </div>
            <span className="px-3 py-1 rounded-pill bg-[#991B1B] text-white text-xs font-mono font-semibold">
              Held Payout: ₹{currentVendor.settlementHoldAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            Your partner agreement has ended. Catalog editing is disabled, and you have read-only access to active returns and payout statements.
          </p>
        </div>
      )}

      {/* Vendor Inventory Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-hearth-ink">
          Inventory ({vendorInventory.length})
        </h2>

        {vendorInventory.length === 0 ? (
          <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
            No active inventory items assigned to {currentVendor.displayName}.
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
                              {inv.livePublicEnabled ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-base text-hearth-ink mt-1">
                            {inv.productTitle}
                          </h3>
                          <div className="text-[11px] text-hearth-taupe">
                            {inv.serviceLocation} • Condition: {inv.conditionGrade}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rate Strip */}
                    <div className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-hearth-umber">
                        <Lock className="w-3.5 h-3.5 text-hearth-terracotta" />
                        <span>
                          Monthly Rent:{' '}
                          <strong className="font-ledger text-hearth-ink">
                            ₹{masterProd.baseMonthlyRent}/mo
                          </strong>{' '}
                          • Security Deposit:{' '}
                          <strong className="font-ledger">
                            ₹{masterProd.baseMonthlyRent * masterProd.depositMonthsMultiple}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-hearth-taupe">
                        Standard Pricing
                      </span>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-hearth-oat/60 border border-hearth-border">
                        <div className="text-[10px] text-hearth-taupe">Total</div>
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
                        <div className="text-[10px] text-hearth-terracotta">Rented</div>
                        <div className="font-ledger font-bold text-sm text-hearth-terracotta">
                          {inv.rentedQuantity}
                        </div>
                      </div>
                    </div>

                    {/* Pending Request Banner */}
                    {inv.pendingStagedRequest && (
                      <div className="p-3.5 rounded-2xl bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412] text-xs space-y-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>Update Request ({inv.pendingStagedRequest.id})</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-pill bg-white/80">
                            Pending Approval
                          </span>
                        </div>
                        <p className="text-[11px]">
                          Requested Status:{' '}
                          <strong>
                            {inv.pendingStagedRequest.requestedPublicEnabled
                              ? 'Active'
                              : 'Paused'}
                          </strong>{' '}
                          | Stock:{' '}
                          <strong>
                            {inv.pendingStagedRequest.requestedDeclaredStock} units
                          </strong>
                        </p>
                        <p className="text-[10px] italic">
                          "{inv.pendingStagedRequest.vendorNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit Trigger / Form */}
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
                            Update Stock or Status
                          </button>
                          <span className="text-[10px] font-mono text-hearth-taupe">
                            {inv.serializedAssets.length} Units Tracked
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-3">
                          <div className="text-xs font-bold text-hearth-ink">
                            Update Stock or Availability
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                                Catalog Status
                              </label>
                              <select
                                value={reqEnabled ? 'ENABLE' : 'DISABLE'}
                                onChange={(e) =>
                                  setReqEnabled(e.target.value === 'ENABLE')
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                              >
                                <option value="ENABLE">Active in Catalog</option>
                                <option value="DISABLE">Pause Listing</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-hearth-ink mb-1">
                                Total Stock Quantity
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
                              New Product Image URL (Optional)
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
                              Notes *
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
                              Save Changes
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

      {/* Partner Registration Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Partner Registration
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Submit business and payout details to register as a rental partner.
                </p>
              </div>
              <button
                type="button"
                onClick={autofillSampleDetails}
                className="px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot text-hearth-ink border border-hearth-border text-[11px] font-semibold shrink-0"
              >
                Fill Sample Details
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
                    Display Name *
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
                    GSTIN *
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
                    PAN *
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
                    Mobile Number *
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
                    Contact Person *
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
                    Bank Account & IFSC *
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
                  Service Areas (Comma Separated) *
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
                  We agree to take a photo of every returned item at the customer's doorstep before pickup.
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
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
