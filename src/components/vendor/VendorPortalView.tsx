import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Handshake,
  Lock,
  LogOut,
  PackagePlus,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { ProductCategory } from '../../types/srs';

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Living Room',
  'Cooling & Air',
  'Water Purifiers',
  'Study & WFH',
  'Kitchen & Appliances',
  'IT & AV Equipment',
];

export const VendorPortalView: React.FC = () => {
  const {
    activePersona,
    vendors,
    virtualInventory,
    vendorProductRates,
    bookings,
    submitVendorStagedInventoryChange,
    registerNewVendorProduct,
    initiateVendorVoluntaryOffboarding,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [selectedAdminVendorId, setSelectedAdminVendorId] = useState<string>(
    activePersona.vendorId || 'VEN-201'
  );

  const activeVendorId =
    activePersona.role === 'PLATFORM_ADMIN'
      ? selectedAdminVendorId
      : activePersona.vendorId || 'VEN-201';
  const currentVendor =
    vendors.find((v) => v.id === activeVendorId) || vendors[0];

  const isRunOffVendor = currentVendor.status === 'Offboarding - Run-Off';
  const isClosedVendor = currentVendor.status === 'Closed / Offboarded';
  const isAdverselyTerminated =
    currentVendor.status === 'Adversely Terminated / Blacklisted' ||
    currentVendor.status === 'Terminated';
  const isScopedMode = isRunOffVendor || isClosedVendor || isAdverselyTerminated;

  const isRestrictedVendor =
    currentVendor.status === 'Terminating — Continuity Active' ||
    isScopedMode ||
    Boolean(activePersona.isTerminatedVendor);
  const showRestrictionToAdmin =
    isRestrictedVendor && activePersona.role === 'PLATFORM_ADMIN';

  const activeRentals = bookings.filter(
    (b) =>
      b.fulfillingVendorId === currentVendor.id &&
      b.status !== 'Returned & Closed' &&
      b.status !== 'Cancelled'
  );
  const activeRentalsCount = activeRentals.length;

  const vendorInventory = virtualInventory.filter(
    (i) => i.owningVendorId === currentVendor.id
  );

  // Voluntary Offboarding Modal State
  const [showOffboardingModal, setShowOffboardingModal] = useState(false);
  const [offboardingAffirmation, setOffboardingAffirmation] = useState(false);

  // Inventory Edit State
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [reqEnabled, setReqEnabled] = useState<boolean>(true);
  const [reqStock, setReqStock] = useState<number>(12);
  const [reqImageUrl, setReqImageUrl] = useState<string>('');
  const [reqNotes, setReqNotes] = useState<string>(
    'Updated warehouse stock count and product photos.'
  );

  // Register New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState(
    'Scandinavian Ashwood 6-Seater Dining Table Set'
  );
  const [newCategory, setNewCategory] =
    useState<ProductCategory>('Living Room');
  const [newAgreedRate, setNewAgreedRate] = useState<number>(1550);
  const [newQuantity, setNewQuantity] = useState<number>(10);
  const [newCondition, setNewCondition] = useState<
    'Brand New' | 'Certified Mint' | 'Good — Refurbished'
  >('Brand New');
  const [newLocation, setNewLocation] = useState(
    'Indiranagar & East Bengaluru Hub'
  );
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=85'
  );
  const [newNotes, setNewNotes] = useState(
    'Solid ashwood dining table with 6 upholstered chairs. Agreed partner rate locked with KaroRent.'
  );
  const [formError, setFormError] = useState<string | null>(null);

  const autofillSampleProduct = () => {
    setNewTitle('Smart Front-Load 8kg Inverter Washing Machine');
    setNewCategory('Kitchen & Appliances');
    setNewAgreedRate(1180);
    setNewQuantity(14);
    setNewCondition('Brand New');
    setNewLocation('Indiranagar, HSR & Whitefield Hub');
    setNewImageUrl(
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85'
    );
    setNewNotes(
      '8kg steam-wash inverter drum with inlet/drain hose kit. Ready for immediate dispatch.'
    );
    setFormError(null);
  };

  const handleRegisterProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !newTitle.trim() ||
      newAgreedRate <= 0 ||
      newQuantity <= 0 ||
      !newLocation.trim()
    ) {
      setFormError(
        'Please provide a valid product name, agreed monthly rate, stock quantity, and service location.'
      );
      return;
    }

    await registerNewVendorProduct({
      productTitle: newTitle.trim(),
      category: newCategory,
      agreedMonthlyRate: newAgreedRate,
      declaredQuantity: newQuantity,
      conditionGrade: newCondition,
      serviceLocation: newLocation.trim(),
      imageUrl: newImageUrl.trim(),
      vendorNotes: newNotes.trim(),
    });

    setShowNewProductModal(false);
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
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-hearth-card border border-hearth-border text-[11px] font-mono text-hearth-terracotta font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Vendor Inventory • {currentVendor.id}</span>
              </div>
              <span
                className={`px-3 py-0.5 rounded-pill text-[11px] font-mono font-bold border ${
                  isRunOffVendor
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : isClosedVendor
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                    : isAdverselyTerminated
                    ? 'bg-red-700 text-white border-red-800'
                    : 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                }`}
              >
                {currentVendor.status}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              {currentVendor.legalBusinessName}
            </h1>
            <p className="text-xs text-[#44403C]">
              Service Areas: {currentVendor.serviceAreas.join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activePersona.role !== 'PLATFORM_ADMIN' && (
                <>
                  {isScopedMode ? (
                    <span className="px-3.5 py-2 rounded-pill bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Listing Additions Locked (Run-Off Mode)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowNewProductModal(true)}
                      className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>Register New Product</span>
                    </button>
                  )}

                  {!isScopedMode && currentVendor.status === 'Approved' && (
                    <button
                      onClick={() => setShowOffboardingModal(true)}
                      className="spring-btn px-4 py-2 rounded-pill bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Request Voluntary Exit (Option A)</span>
                    </button>
                  )}
                </>
              )}

              {activePersona.role === 'PLATFORM_ADMIN' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-hearth-taupe">Vendor:</span>
                  <select
                    value={selectedAdminVendorId}
                    onChange={(e) => setSelectedAdminVendorId(e.target.value)}
                    className="px-3.5 py-2 rounded-pill bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-mono font-bold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white text-hearth-ink font-sans font-normal">
                        {v.id} — {v.displayName} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voluntary Offboarding Run-Off to Expiry Banner (FR-VEN-009 / FR-VEN-011) */}
      {isRunOffVendor && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-950 dark:text-amber-100 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <span>Voluntary Offboarding — Run-Off to Expiry (Option A)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-pill bg-amber-200 text-amber-950 text-xs font-mono font-bold">
                Run-Off Phase Active
              </span>
              <span className="px-3 py-1 rounded-pill bg-white/90 border border-amber-300 text-amber-950 text-xs font-mono font-bold">
                Held Reserve: ₹
                {(
                  currentVendor.settlementReserveHeldAmount ||
                  currentVendor.settlementHoldAmount ||
                  15000
                ).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <strong>Trading Cutoff Active (FR-VEN-010):</strong> All public listings are delisted and new product registration is locked.
            Under <strong>BR-034 (Run-Off Operational Duty)</strong>, your team remains contractually bound to fulfill all active customer rentals, breakdown repairs, and doorstep return pickup inspections (`FR-RET-002`) until final contract maturity.
            Completing all obligations guarantees <strong>Amicable Offboarding Blacklist Immunity (BR-035)</strong>.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 border-t border-amber-200 dark:border-amber-900">
            <span>Remaining Active Rentals in Field: <strong>{activeRentalsCount}</strong></span>
            <span>Target Completion: <strong>{currentVendor.runOffTargetCompletionDate || '2027-04-15'}</strong></span>
          </div>
        </div>
      )}

      {/* Amicable Closure Banner (FR-VEN-015) */}
      {isClosedVendor && (
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-emerald-950 dark:text-emerald-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Partner Account Formally Closed & Offboarded (FR-VEN-015)</span>
            </div>
            <span className="px-3 py-1 rounded-pill bg-emerald-200 text-emerald-900 text-xs font-mono font-bold">
              Blacklist Immunity Confirmed (BR-035)
            </span>
          </div>
          <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
            All customer rentals reached completed maturity with verified return condition sign-offs. All customer security deposits have been settled and your accrued payout reserve has been disbursed.
          </p>
        </div>
      )}

      {/* Adverse Termination / Breach Takeover Banner (EX-036) */}
      {isAdverselyTerminated && (
        <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-950 dark:text-red-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              <span>Adversely Terminated & Blacklisted (EX-036 Breach Takeover)</span>
            </div>
            <span className="px-3 py-1 rounded-pill bg-red-700 text-white text-xs font-mono font-bold">
              Reserve Forfeited (FR-BLK-002)
            </span>
          </div>
          <p className="text-xs leading-relaxed text-red-900 dark:text-red-200">
            {currentVendor.breachTakeoverReason ||
              'Material breach: Vendor abandoned field servicing / return pickup obligations during run-off (BR-034). Platform emergency fleet reassigned and settlement reserve forfeited.'}
          </p>
        </div>
      )}

      {/* Restricted Banner (Platform Operator Only) */}
      {showRestrictionToAdmin && (
        <div className="p-5 rounded-3xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] space-y-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-serif font-bold text-base">
              <AlertOctagon className="w-5 h-5" />
              <span>Restricted / Blacklisted Vendor (Operator View Only)</span>
            </div>
            <span className="px-3 py-1 rounded-pill bg-[#991B1B] text-white text-xs font-mono font-semibold">
              Held Payout: ₹
              {currentVendor.settlementHoldAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            This vendor is restricted in the platform registry. The vendor sees a standard dashboard without restriction notices, while public catalog updates and payouts remain held pending operator review.
          </p>
        </div>
      )}

      {/* Vendor Inventory Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-hearth-ink">
          Registered Products ({vendorInventory.length})
        </h2>

        {vendorInventory.length === 0 ? (
          <div className="p-8 rounded-3xl bg-hearth-card border border-hearth-border text-center text-xs text-hearth-taupe">
            No active inventory items assigned to {currentVendor.displayName}.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vendorInventory.map((inv) => {
              const rateEntry = vendorProductRates.find(
                (r) => r.inventoryId === inv.id
              );
              const agreedRate = rateEntry?.agreedMonthlyRate || 1200;
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
                            <span className="px-2 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-[10px] font-medium text-hearth-umber">
                              {inv.category}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                                isScopedMode
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : inv.livePublicEnabled ||
                                    (isRestrictedVendor &&
                                      activePersona.role !== 'PLATFORM_ADMIN')
                                  ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                                  : 'bg-hearth-oat text-hearth-taupe border border-hearth-border'
                              }`}
                            >
                              {isScopedMode
                                ? 'Delisted (Run-Off)'
                                : inv.livePublicEnabled ||
                                (isRestrictedVendor &&
                                  activePersona.role !== 'PLATFORM_ADMIN')
                                ? 'Active'
                                : 'Paused'}
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

                    {/* Platform-Vendor Agreed Rate Strip (Separate from Website Retail Rent) */}
                    <div className="p-3.5 rounded-2xl bg-hearth-oat border border-hearth-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-hearth-umber">
                        <Handshake className="w-4 h-4 text-hearth-terracotta shrink-0" />
                        <span>
                          Agreed Platform–Vendor Rate:{' '}
                          <strong className="font-ledger text-sm text-hearth-ink">
                            ₹{agreedRate.toLocaleString('en-IN')} / unit / mo
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-pill bg-hearth-card border border-hearth-border text-hearth-terracotta font-semibold">
                        Partner Rate DB ({rateEntry?.id || 'VPR'})
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

                  {/* Edit Trigger / Form (Vendor only; Admin is read-only) */}
                  <div className="pt-3 border-t border-hearth-border">
                    {activePersona.role === 'PLATFORM_ADMIN' ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hearth-sand text-hearth-taupe text-[11px] font-medium border border-hearth-border">
                          Read-Only View (Vendor Managed)
                        </span>
                        <span className="text-[10px] font-mono text-hearth-taupe">
                          Monthly Active Value: ₹
                          {(inv.rentedQuantity * agreedRate).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : isScopedMode ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-sm">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Catalog Updates Locked (Run-Off Active)</span>
                        </span>
                        <span className="text-[10px] font-mono text-hearth-taupe">
                          Monthly Active Value: ₹
                          {(inv.rentedQuantity * agreedRate).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : !isEditing ? (
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
                          Monthly Active Value: ₹
                          {(inv.rentedQuantity * agreedRate).toLocaleString('en-IN')}
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
                                Product Status
                              </label>
                              <select
                                value={reqEnabled ? 'ENABLE' : 'DISABLE'}
                                onChange={(e) =>
                                  setReqEnabled(e.target.value === 'ENABLE')
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-semibold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                              >
                                <option value="ENABLE" className="bg-white text-hearth-ink font-sans font-normal">Active</option>
                                <option value="DISABLE" className="bg-white text-hearth-ink font-sans font-normal">Paused</option>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Register New Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-hearth-parchment border border-hearth-border shadow-hearth-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-hearth-border pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-hearth-ink">
                  Register New Product
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Add a new product to your inventory with the monthly rate agreed with KaroRent.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={autofillSampleProduct}
                  className="px-3 py-1.5 rounded-pill bg-hearth-oat hover:bg-hearth-apricot text-hearth-ink border border-hearth-border text-[11px] font-semibold shrink-0"
                >
                  Fill Sample Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="p-1.5 rounded-pill bg-hearth-card hover:bg-hearth-apricot border border-hearth-border"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleRegisterProductSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as ProductCategory)
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-semibold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white text-hearth-ink font-sans font-normal">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Agreed Platform–Vendor Rate (₹ / unit / mo) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={newAgreedRate}
                    onChange={(e) => setNewAgreedRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border font-ledger font-bold text-hearth-ink"
                  />
                  <span className="text-[10px] text-hearth-taupe">
                    Stored in the Partner Rate Database (separate from customer website pricing)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Initial Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border font-ledger text-hearth-ink"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Condition Grade *
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] text-xs font-semibold text-[#166534] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#166534]/30 cursor-pointer transition-all"
                  >
                    <option value="Brand New" className="bg-white text-hearth-ink font-sans font-normal">Brand New</option>
                    <option value="Certified Mint" className="bg-white text-hearth-ink font-sans font-normal">Certified Mint</option>
                    <option value="Good — Refurbished" className="bg-white text-hearth-ink font-sans font-normal">Good — Refurbished</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Warehouse / Service Hub *
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Product Image URL *
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border font-mono text-hearth-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Product Specifications & Notes *
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-hearth-border">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 rounded-pill bg-hearth-oat text-hearth-umber font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulatingLatency}
                  className="spring-btn px-5 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white font-semibold shadow-sm"
                >
                  {isSimulatingLatency ? 'Registering...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Voluntary Offboarding Request Modal (Option A: Run-Off to Expiry / WF-14) */}
      {showOffboardingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-hearth-card border border-hearth-border rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Workflow WF-14 • Run-Off to Expiry</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-hearth-ink">
                  Voluntary Partner Offboarding Request
                </h3>
                <p className="text-xs text-hearth-taupe">
                  Partner: <strong className="text-hearth-ink">{currentVendor.legalBusinessName} ({currentVendor.id})</strong>
                </p>
              </div>
              <button
                onClick={() => setShowOffboardingModal(false)}
                className="text-hearth-taupe hover:text-hearth-ink text-lg font-bold p-1 rounded-lg hover:bg-hearth-oat"
              >
                ✕
              </button>
            </div>

            {/* Core Regulatory Specifications Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-950 dark:text-amber-100 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>FR-VEN-010: Immediate Catalog Trading Cutoff</span>
                </div>
                <p className="leading-relaxed">
                  Upon submission, all public listings for your warehouse inventory will be delisted immediately from the KaroRent storefront. No new customer bookings can be placed for your assets.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-300 text-blue-950 dark:text-blue-100 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>BR-034 & FR-VEN-011: Operational Duty Continuity in Scoped Mode</span>
                </div>
                <p className="leading-relaxed">
                  Your partner portal will enter <strong>Scoped Operations Mode</strong>. Under business rule <strong>BR-034</strong>, your organization remains contractually bound to service breakdown tickets, deliver replacement items, and execute authorized return pickup photo inspections (FR-RET-002) until every customer booking reaches maturity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-hearth-oat border border-hearth-border space-y-1">
                  <div className="text-hearth-taupe text-[11px] font-medium">Segregated Reserve Hold (FR-VEN-013)</div>
                  <div className="font-ledger text-lg font-bold text-hearth-ink">
                    ₹{(currentVendor.settlementReserveHeldAmount || currentVendor.settlementHoldAmount || 15000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-hearth-taupe leading-snug">
                    Held in segregated platform ledger until final return inspections & deposit refunds are settled.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 space-y-1">
                  <div className="text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">Blacklist Immunity (BR-035)</div>
                  <div className="font-serif text-sm font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Amicable Exit Guaranteed</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-snug">
                    Honoring all active rentals ensures 100% immunity from platform blacklist and full reserve release.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Rentals Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-hearth-ink">
                <span>Active Customer Rentals to Run-Off ({activeRentalsCount})</span>
                <span className="text-[11px] text-hearth-taupe font-mono">Service Continuity Guaranteed</span>
              </div>
              {activeRentals.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-hearth-oat text-xs text-hearth-taupe text-center">
                  No active customer rentals currently linked to this vendor. Immediate amicable closure can proceed.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeRentals.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-hearth-oat border border-hearth-border flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-hearth-ink">{b.productTitle}</div>
                        <div className="text-[11px] text-hearth-taupe font-mono">
                          Booking {b.id} • Customer: {b.customerId}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[10px] font-semibold">
                          {b.tenureMonths} Mo Tenure
                        </span>
                        <div className="text-[10px] text-hearth-taupe font-ledger mt-0.5">
                          ₹{b.monthlyRentRate.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Affirmation Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offboardingAffirmation}
                  onChange={(e) => setOffboardingAffirmation(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-hearth-terracotta border-amber-300 focus:ring-hearth-terracotta"
                />
                <span className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                  <strong>Mandatory Legal Affirmation (Option A — Run-Off to Expiry):</strong> I hereby formally request voluntary offboarding for {currentVendor.legalBusinessName}. I acknowledge our contractual duty under <strong>BR-034</strong> to service all active customer rentals, honor maintenance visits, and complete authorized return pickup inspections. I understand that breach or abandonment of service will trigger <strong>EX-036 Emergency Fleet Takeover</strong>, forfeiture of our held reserve (₹{(currentVendor.settlementReserveHeldAmount || currentVendor.settlementHoldAmount || 15000).toLocaleString('en-IN')}), and immediate enrollment into the Unified Blacklist (FR-BLK-002).
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-hearth-border">
              <button
                type="button"
                onClick={() => setShowOffboardingModal(false)}
                className="px-4 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-sand text-hearth-umber text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!offboardingAffirmation || isSimulatingLatency}
                onClick={async () => {
                  await initiateVendorVoluntaryOffboarding(currentVendor.id);
                  setShowOffboardingModal(false);
                }}
                className={`spring-btn px-5 py-2.5 rounded-pill text-xs font-bold flex items-center gap-2 shadow-sm ${
                  offboardingAffirmation && !isSimulatingLatency
                    ? 'bg-amber-700 hover:bg-amber-800 text-white'
                    : 'bg-hearth-oat text-hearth-taupe cursor-not-allowed border border-hearth-border'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>
                  {isSimulatingLatency
                    ? 'Initiating Run-Off...'
                    : 'Confirm & Initiate Run-Off to Expiry'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
