import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  XCircle,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import { mandatoryReasonSchema } from '../../lib/validation';

export const AdminGovernanceView: React.FC = () => {
  const {
    virtualInventory,
    vendors,
    masterProducts,
    bookings,
    depositLedgers,
    blacklist,
    resolveStagedInventoryRequest,
    updateMasterProductPricing,
    reviewVendorApplication,
    terminateVendorAndAssignContinuity,
    isSimulatingLatency,
    addToast,
  } = useKaroRentStore();

  // Inventory Decision State
  const [adminReasonByInv, setAdminReasonByInv] = useState<Record<string, string>>({
    'INV-502':
      'Reassigning inventory to Oak & Loom Studio so Split AC stays available in the catalog.',
    'INV-503':
      'Verified stock count and product photos; approved for catalog.',
  });
  const [targetVendorByInv, setTargetVendorByInv] = useState<Record<string, string>>({
    'INV-502': 'VEN-202',
    'INV-503': 'VEN-201',
  });

  // Partner Reassignment State
  const [directSwitchInvId, setDirectSwitchInvId] = useState<string>('INV-501');
  const [directSwitchNewVendorId, setDirectSwitchNewVendorId] = useState<string>('VEN-202');
  const [directSwitchReason, setDirectSwitchReason] = useState<string>(
    'Balancing delivery load in Indiranagar.'
  );

  // Product Pricing Editor State
  const [selectedPricingProductId, setSelectedPricingProductId] =
    useState<string>('PRD-02');
  const selectedProd =
    masterProducts.find((p) => p.id === selectedPricingProductId) ||
    masterProducts[0];
  const [editRent, setEditRent] = useState<number>(selectedProd.baseMonthlyRent);
  const [editDepositMult, setEditDepositMult] = useState<number>(
    selectedProd.depositMonthsMultiple
  );
  const [editVisitFee, setEditVisitFee] = useState<number>(
    selectedProd.siteVisitFee
  );
  const [editPipeRate, setEditPipeRate] = useState<number>(850);
  const [pricingReason, setPricingReason] = useState<string>(
    'Quarterly pricing update.'
  );

  // End Contract Modal State
  const [terminatingVendorId, setTerminatingVendorId] = useState<string | null>(
    null
  );
  const [continuityAssignee, setContinuityAssignee] = useState<string>(
    'Oak & Loom Studio (VEN-202)'
  );
  const [terminationReason, setTerminationReason] = useState<string>(
    'Ending partner contract due to repeated service delays.'
  );

  const stagedItems = virtualInventory.filter((i) => i.pendingStagedRequest);
  const eligibleVendors = vendors.filter(
    (v) => v.status === 'Approved' && v.agreementState === 'Signed'
  );
  const totalVaultBalance = depositLedgers.reduce(
    (acc, d) => acc + d.heldBalance,
    0
  );

  const handleSelectPricingProduct = (id: string) => {
    setSelectedPricingProductId(id);
    const found = masterProducts.find((p) => p.id === id);
    if (found) {
      setEditRent(found.baseMonthlyRent);
      setEditDepositMult(found.depositMonthsMultiple);
      setEditVisitFee(found.siteVisitFee);
      const pipe = found.installationRateCard.find(
        (r) => r.code === 'RC-PIPE-CU'
      );
      if (pipe) setEditPipeRate(pipe.ratePerUnit);
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Pending Stock Updates
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-terracotta mt-1 font-ledger">
            {stagedItems.length} Pending
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Awaiting catalog approval
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Blocked Accounts
          </div>
          <div className="font-serif text-3xl font-bold text-[#991B1B] mt-1 font-ledger">
            {blacklist.filter((b) => b.status === 'Active Blacklist').length} Active
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            {bookings.filter((b) => b.status === 'Flagged — Blacklist Review').length}{' '}
            order(s) held for review
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Active Returns
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-ink mt-1 font-ledger">
            {bookings.filter((b) => b.returnRecord).length} Returns
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Scheduled or under inspection
          </div>
        </div>

        <div className="rounded-3xl bg-hearth-card border border-hearth-border p-5 shadow-hearth">
          <div className="text-[11px] font-mono uppercase text-hearth-taupe">
            Deposits Held
          </div>
          <div className="font-serif text-3xl font-bold text-hearth-sage mt-1 font-ledger">
            ₹{totalVaultBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-hearth-umber mt-1">
            Refundable customer deposits
          </div>
        </div>
      </div>

      {/* SECTION 1: Pending Inventory Updates */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hearth-border pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-hearth-ink">
              Pending Inventory Updates
            </h2>
            <p className="text-xs text-hearth-umber">
              Review stock and availability updates submitted by partner vendors.
            </p>
          </div>
        </div>

        {stagedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-hearth-oat text-center text-xs text-hearth-taupe">
            All pending inventory updates have been reviewed.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stagedItems.map((inv) => {
              const req = inv.pendingStagedRequest!;
              const reasonVal =
                adminReasonByInv[inv.id] ||
                'Reviewed vendor inventory update.';
              const targetVenId =
                targetVendorByInv[inv.id] ||
                eligibleVendors.find((v) => v.id !== inv.owningVendorId)?.id ||
                'VEN-202';

              return (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-hearth-parchment border-2 border-hearth-terracotta/40 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.uploadedImages[0] || inv.itemImages[0]}
                        alt={inv.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-hearth-border"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-hearth-ink">
                            {inv.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-pill bg-[#FFEDD5] text-[#9A3412] text-[10px] font-semibold">
                            Pending Review
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-hearth-ink mt-0.5">
                          {inv.productTitle}
                        </h3>
                        <div className="text-[11px] text-hearth-taupe">
                          Partner: <strong>{req.vendorName}</strong> ({req.submittedAt})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current vs Requested */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0]">
                      <div className="text-[10px] font-mono uppercase text-[#166534] font-bold">
                        Current Status
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        {inv.livePublicEnabled ? 'Active' : 'Paused'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Stock: {inv.declaredQuantity} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe">
                        Partner: {inv.owningVendorName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFEDD5]/60 border border-[#FED7AA]">
                      <div className="text-[10px] font-mono uppercase text-[#9A3412] font-bold">
                        Requested Update
                      </div>
                      <div className="font-semibold text-hearth-ink mt-1">
                        {req.requestedPublicEnabled ? 'Active' : 'Pause Listing'}
                      </div>
                      <div className="text-[11px] text-hearth-umber">
                        Stock: {req.requestedDeclaredStock} units
                      </div>
                      <div className="text-[10px] text-hearth-taupe truncate">
                        "{req.vendorNotes}"
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  <div className="space-y-3 pt-2 border-t border-hearth-border text-xs">
                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Reassign to Another Partner (Optional):
                      </label>
                      <select
                        value={targetVenId}
                        onChange={(e) =>
                          setTargetVendorByInv({
                            ...targetVendorByInv,
                            [inv.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-medium"
                      >
                        {eligibleVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.displayName} ({v.id}) — {v.serviceAreas.join(', ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-hearth-ink mb-1">
                        Notes *
                      </label>
                      <input
                        type="text"
                        value={reasonVal}
                        onChange={(e) =>
                          setAdminReasonByInv({
                            ...adminReasonByInv,
                            [inv.id]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'APPROVE',
                            adminReason: reasonVal,
                          })
                        }
                        className="spring-btn px-3.5 py-2 rounded-pill bg-hearth-sage text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'REASSIGN_SOURCE',
                            newSourceVendorId: targetVenId,
                            adminReason: reasonVal,
                          })
                        }
                        className="spring-btn px-3.5 py-2 rounded-pill bg-hearth-terracotta text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Reassign Partner</span>
                      </button>

                      <button
                        disabled={isSimulatingLatency}
                        onClick={() =>
                          resolveStagedInventoryRequest({
                            inventoryId: inv.id,
                            decision: 'REJECT',
                            adminReason: reasonVal,
                          })
                        }
                        className="px-3.5 py-2 rounded-pill bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Change Fulfilling Partner Tool */}
        <div className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-3">
          <div className="text-xs font-bold text-hearth-ink flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-hearth-terracotta" />
            <span>Change Fulfilling Partner</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Product
              </label>
              <select
                value={directSwitchInvId}
                onChange={(e) => setDirectSwitchInvId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              >
                {virtualInventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.productTitle.slice(0, 22)} ({i.owningVendorName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                New Partner
              </label>
              <select
                value={directSwitchNewVendorId}
                onChange={(e) => setDirectSwitchNewVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              >
                {eligibleVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.displayName} ({v.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Notes *
              </label>
              <input
                type="text"
                value={directSwitchReason}
                onChange={(e) => setDirectSwitchReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
              />
            </div>
            <button
              onClick={() =>
                resolveStagedInventoryRequest({
                  inventoryId: directSwitchInvId,
                  decision: 'REASSIGN_SOURCE',
                  newSourceVendorId: directSwitchNewVendorId,
                  adminReason: directSwitchReason,
                })
              }
              className="spring-btn py-2 px-4 rounded-pill bg-hearth-ink text-hearth-canvas font-semibold"
            >
              Update Partner
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Product Pricing & Partner Vendors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
        <div className="xl:col-span-5 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-hearth-ink">
                Product Pricing
              </h3>
            </div>
            <Sliders className="w-5 h-5 text-hearth-terracotta" />
          </div>

          <p className="text-xs text-hearth-umber">
            Manage monthly rental prices, security deposits, and home installation fees.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Select Product
              </label>
              <select
                value={selectedPricingProductId}
                onChange={(e) => handleSelectPricingProduct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-medium"
              >
                {masterProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  value={editRent}
                  onChange={(e) => setEditRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                />
              </div>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Deposit (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={editDepositMult}
                  onChange={(e) => setEditDepositMult(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                />
              </div>
            </div>

            {selectedProd.workflowType === 'SITE_VISIT_MULTI_STEP' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Home Visit Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editVisitFee}
                    onChange={(e) => setEditVisitFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-hearth-ink mb-1">
                    Copper Pipe Rate (₹/m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPipeRate}
                    onChange={(e) => setEditPipeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border font-ledger"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-hearth-ink mb-1">
                Notes *
              </label>
              <input
                type="text"
                value={pricingReason}
                onChange={(e) => setPricingReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-hearth-oat border border-hearth-border"
              />
            </div>

            <button
              onClick={() =>
                updateMasterProductPricing({
                  productId: selectedPricingProductId,
                  baseMonthlyRent: editRent,
                  depositMonthsMultiple: editDepositMult,
                  siteVisitFee: editVisitFee,
                  copperPipeRate: editPipeRate,
                  reason: pricingReason,
                })
              }
              className="spring-btn w-full py-2.5 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white font-semibold shadow-sm"
            >
              Save Pricing
            </button>
          </div>
        </div>

        {/* SECTION 3: Partner Vendors */}
        <div className="xl:col-span-7 rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-hearth-ink">
                Partner Vendors
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {vendors.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  v.blacklistMatchWarning
                    ? 'bg-[#FEE2E2]/40 border-2 border-[#DC2626]'
                    : 'bg-hearth-oat/60 border-hearth-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-hearth-ink">
                        {v.id}
                      </span>
                      <span className="font-serif font-bold text-sm text-hearth-ink">
                        {v.legalBusinessName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-pill text-[10px] font-semibold ${
                          v.status === 'Approved'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : v.status.includes('Terminat')
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FFEDD5] text-[#9A3412]'
                        }`}
                      >
                        {v.status === 'Terminating — Continuity Active'
                          ? 'Contract Ended'
                          : v.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-hearth-taupe mt-0.5">
                      GSTIN: {v.taxIdGstin} • PAN: {v.panNumber} • Bank: {v.bankAccountMasked}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() =>
                            reviewVendorApplication(
                              v.id,
                              'Approved',
                              'Approved partner registration.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-hearth-sage text-white text-[11px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            reviewVendorApplication(
                              v.id,
                              'Rejected',
                              'Rejected due to match with a previously blocked vendor.'
                            )
                          }
                          className="px-3 py-1.5 rounded-pill bg-[#991B1B] text-white text-[11px] font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {v.status === 'Approved' && (
                      <button
                        onClick={() => setTerminatingVendorId(v.id)}
                        className="px-3 py-1.5 rounded-pill bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border border-[#FECACA] text-[11px] font-semibold"
                      >
                        End Contract
                      </button>
                    )}
                  </div>
                </div>

                {/* Duplicate Match Warning */}
                {v.blacklistMatchWarning && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        Matches Blocked Vendor ({v.blacklistMatchWarning.matchedVendorId})
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <strong>Matched Details:</strong>{' '}
                      {v.blacklistMatchWarning.matchedFields.join(' • ')}
                    </div>
                    <div className="text-[11px]">
                      <strong>Reason:</strong>{' '}
                      {v.blacklistMatchWarning.priorTerminationReason}
                    </div>
                  </div>
                )}

                {v.continuityManager && (
                  <div className="text-[11px] font-mono text-[#9A3412] bg-[#FFEDD5] px-3 py-1.5 rounded-xl">
                    Replacement Partner: {v.continuityManager} | Held Payout: ₹{v.settlementHoldAmount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Partner Contract Modal */}
      {terminatingVendorId && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth-lg space-y-4">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">
                End Partner Contract
              </h3>
            </div>
            <p className="text-xs text-hearth-umber leading-relaxed">
              Ending the contract for <strong>{terminatingVendorId}</strong> will pause their public listings, hold pending payouts until active rentals finish, and add the account to Blocked Accounts.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Replacement Partner for Active Rentals *
                </label>
                <input
                  type="text"
                  value={continuityAssignee}
                  onChange={(e) => setContinuityAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                />
              </div>
              <div>
                <label className="block font-semibold text-hearth-ink mb-1">
                  Reason *
                </label>
                <textarea
                  rows={2}
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTerminatingVendorId(null)}
                className="px-4 py-2 rounded-pill bg-hearth-oat text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const valid = mandatoryReasonSchema.safeParse(terminationReason);
                  if (!valid.success) {
                    addToast({
                      title: 'Reason Required',
                      description: valid.error.errors[0].message,
                      variant: 'error',
                    });
                    return;
                  }
                  await terminateVendorAndAssignContinuity(
                    terminatingVendorId,
                    continuityAssignee,
                    terminationReason
                  );
                  setTerminatingVendorId(null);
                }}
                className="px-5 py-2 rounded-pill bg-[#991B1B] text-white text-xs font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
