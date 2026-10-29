import React, { useState } from 'react';
import {
  AlertOctagon,
  Building2,
  Handshake,
  PackagePlus,
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
    submitVendorStagedInventoryChange,
    registerNewVendorProduct,
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
  const isRestrictedVendor =
    currentVendor.status === 'Terminating — Continuity Active' ||
    currentVendor.status === 'Terminated' ||
    Boolean(activePersona.isTerminatedVendor);
  const showRestrictionToAdmin =
    isRestrictedVendor && activePersona.role === 'PLATFORM_ADMIN';

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-hearth-card border border-hearth-border text-[11px] font-mono text-hearth-terracotta font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendor Inventory • {currentVendor.id}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              {currentVendor.legalBusinessName}
            </h1>
            <p className="text-xs text-[#44403C]">
              Service Areas: {currentVendor.serviceAreas.join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setShowNewProductModal(true)}
                className="spring-btn px-4 py-2 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Register New Product</span>
              </button>

              {activePersona.role === 'PLATFORM_ADMIN' && (
                <select
                  value={selectedAdminVendorId}
                  onChange={(e) => setSelectedAdminVendorId(e.target.value)}
                  className="px-3.5 py-2 rounded-pill bg-hearth-card border border-hearth-border text-xs font-mono font-semibold text-hearth-ink focus:outline-none"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} — {v.displayName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

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
                                inv.livePublicEnabled ||
                                (isRestrictedVendor &&
                                  activePersona.role !== 'PLATFORM_ADMIN')
                                  ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                                  : 'bg-hearth-oat text-hearth-taupe border border-hearth-border'
                              }`}
                            >
                              {inv.livePublicEnabled ||
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

                  {/* Edit Trigger / Form */}
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
                                className="w-full px-3 py-1.5 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                              >
                                <option value="ENABLE">Active</option>
                                <option value="DISABLE">Paused</option>
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
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
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
                    className="w-full px-3.5 py-2 rounded-xl bg-hearth-card border border-hearth-border text-hearth-ink"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Certified Mint">Certified Mint</option>
                    <option value="Good — Refurbished">Good — Refurbished</option>
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
    </div>
  );
};
