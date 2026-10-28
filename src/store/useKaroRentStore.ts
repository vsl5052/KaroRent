import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActivePersona,
  AuditLogEntry,
  BlacklistEntry,
  BookingOrder,
  CustomerAccount,
  DisputeCaseRecord,
  FinancialInvoiceDocument,
  NavigationTab,
  OpenBusinessDecisionItem,
  PlatformMasterProduct,
  PlatformNotification,
  ProductCategory,
  RentalAgreementRecord,
  SegregatedDepositLedger,
  ServiceMaintenanceTicket,
  SupportComplaintTicket,
  VendorRecord,
  VendorSettlementStatement,
  VirtualInventoryItem,
} from '../types/srs';
import {
  DEMO_PERSONAS,
  INITIAL_AGREEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BLACKLIST,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_DEPOSIT_LEDGERS,
  INITIAL_DISPUTE_CASES,
  INITIAL_INVOICES,
  INITIAL_MASTER_PRODUCTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OBD_DECISIONS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_SETTLEMENTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_VENDORS,
  INITIAL_VIRTUAL_INVENTORY,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  ruleCode?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

interface KaroRentState {
  // UI & Navigation State
  darkMode: boolean;
  activeTab: NavigationTab;
  activePersona: ActivePersona;
  personas: ActivePersona[];
  isSimulatingLatency: boolean;
  latencyActionLabel: string | null;
  toasts: ToastMessage[];

  // Marketplace Filters
  selectedLocation: string;
  searchQuery: string;
  selectedCategory: ProductCategory | 'All';
  selectedWorkflowFilter: 'ALL' | 'DIRECT_1_STEP' | 'SITE_VISIT_MULTI_STEP';
  selectedTenureMonths: 3 | 6 | 12 | 24;
  comparisonProductIds: string[];
  activeAgreementModalBookingId: string | null;
  activeCheckoutProductId: string | null;

  // Core SRS v4.0 Domain Entities
  customers: CustomerAccount[];
  vendors: VendorRecord[];
  masterProducts: PlatformMasterProduct[];
  virtualInventory: VirtualInventoryItem[];
  bookings: BookingOrder[];
  agreements: RentalAgreementRecord[];
  invoices: FinancialInvoiceDocument[];
  depositLedgers: SegregatedDepositLedger[];
  disputeCases: DisputeCaseRecord[];
  serviceTickets: ServiceMaintenanceTicket[];
  supportTickets: SupportComplaintTicket[];
  settlements: VendorSettlementStatement[];
  blacklist: BlacklistEntry[];
  notifications: PlatformNotification[];
  auditLogs: AuditLogEntry[];
  obdDecisions: OpenBusinessDecisionItem[];

  // UI Actions
  toggleDarkMode: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  switchPersona: (personaId: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  setSelectedWorkflowFilter: (wf: 'ALL' | 'DIRECT_1_STEP' | 'SITE_VISIT_MULTI_STEP') => void;
  setSelectedTenureMonths: (months: 3 | 6 | 12 | 24) => void;
  toggleCompareProduct: (productId: string) => void;
  setActiveAgreementModalBookingId: (bookingId: string | null) => void;
  setActiveCheckoutProductId: (productId: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoState: () => void;

  // Async Business Workflow Mutations (Simulated 250–450ms Latency)
  // 1. Booking & Dual-Path Checkout (WF-04, FR-BKG-001 to 009, FR-BLK-005)
  createBookingOrder: (payload: {
    productId: string;
    quantity: number;
    tenureMonths: 3 | 6 | 12 | 24;
    startDate: string;
    deliveryAddress: string;
  }) => Promise<{ bookingId: string; interceptedByBlacklist: boolean }>;

  // 2. Field Technician AC Pre-Installation Site Visit Metrics (FR-FUL-008, FR-PRC-008, EX-030)
  submitSiteVisitMetrics: (payload: {
    bookingId: string;
    feasible: boolean;
    unfeasibleReason?: string;
    measuredCopperPipeMeters: number;
    coreCuttingRequired: boolean;
    outdoorBracketRequired: boolean;
    drainageExtensionMeters: number;
    technicianNotes: string;
    sitePhotoUrl: string;
  }) => Promise<void>;

  // 3. Customer Accepts or Rejects Post-Visit Final Quote (FR-PRC-008, EX-030)
  respondToPostVisitQuote: (bookingId: string, decision: 'Accepted' | 'Rejected') => Promise<void>;

  // 4. Customer Signs Electronic Rental Agreement (FR-AGR-001 to 009)
  signRentalAgreement: (bookingId: string, otpCode: string, signerAuthorityNote?: string) => Promise<void>;

  // 5. Customer Pays Invoice (Idempotent Reconciliation FR-PAY-001 to 011)
  payInvoiceDocument: (invoiceId: string) => Promise<void>;

  // 6. Field Dispatch & Delivery Activation (FR-FUL-002 to 007)
  completeDeliveryAndActivate: (bookingId: string, serialNumber: string, photoUrl: string) => Promise<void>;

  // 7. Customer Requests Renewal / Extension or Return Pickup (FR-LIF-003, FR-RET-001)
  requestRentalRenewal: (bookingId: string, additionalMonths: 3 | 6) => Promise<void>;
  initiateReturnPickupRequest: (bookingId: string, preferredSlot: string) => Promise<void>;

  // 8. Field Staff Mandatory EXIF Pickup Photo Gate (FR-RET-002, BR-026, EX-029)
  completeCustomerPremisePickupWithPhoto: (payload: {
    bookingId: string;
    photoUrl: string;
    exifTimestamp: string;
    geoTag: string;
  }) => Promise<void>;

  // 9. Three-Way Warehouse Return Inspection & Deposit Deduction / Dispute (FR-RET-003 to 008, BR-026)
  submitWarehouseInspection: (payload: {
    bookingId: string;
    warehousePhotoUrl: string;
    finding: 'Normal Wear' | 'Customer Damage' | 'Transit Damage (Vendor Fault)' | 'Missing Accessory' | 'Severe Damage / Loss';
    findingDescription: string;
    proposedDeduction: number;
    wasPresentInDoorstepPickupPhoto: boolean;
  }) => Promise<void>;

  customerDisputeInspectionFinding: (bookingId: string, disputeReason: string) => Promise<void>;

  // 10. Platform Mediator Resolves Dispute & Optional Direct Customer Blacklisting (FR-DSP-004, FR-DSP-005, FR-BLK-004)
  resolveDisputeAndSettleDeposit: (payload: {
    bookingId: string;
    finalApprovedDeduction: number;
    mediatorDecisionNotes: string;
    enrollCustomerInBlacklist: boolean;
  }) => Promise<void>;

  // 11. Vendor Submits Staged Inventory Enable/Disable/Stock Edit (FR-INV-010, BR-030)
  submitVendorStagedInventoryChange: (payload: {
    inventoryId: string;
    requestedPublicEnabled: boolean;
    requestedDeclaredStock: number;
    uploadedImageUrl?: string;
    vendorNotes: string;
  }) => Promise<void>;

  // 12. Platform Manager Approves/Rejects Staged Inventory OR Reassigns Vendor Source (FR-INV-009, FR-INV-010, FR-INV-011, BR-031)
  resolveStagedInventoryRequest: (payload: {
    inventoryId: string;
    decision: 'APPROVE' | 'REJECT' | 'REASSIGN_SOURCE';
    newSourceVendorId?: string;
    adminReason: string;
  }) => Promise<void>;

  // 13. Platform Super Admin Updates Master Product Pricing & Rate Card (FR-PRC-001, BR-027)
  updateMasterProductPricing: (payload: {
    productId: string;
    baseMonthlyRent: number;
    depositMonthsMultiple: number;
    siteVisitFee: number;
    copperPipeRate?: number;
    reason: string;
  }) => Promise<void>;

  // 14. Vendor Onboarding, Termination & Continuity Manager Assignment (FR-VEN-001 to 015, FR-BLK-002)
  submitNewVendorApplication: (payload: {
    legalBusinessName: string;
    displayName: string;
    taxIdGstin: string;
    panNumber: string;
    registeredPhone: string;
    email: string;
    authorisedContactName: string;
    bankAccountMasked: string;
    serviceAreas: string;
  }) => Promise<void>;

  reviewVendorApplication: (vendorId: string, decision: 'Approved' | 'Rejected' | 'Clarification Required', reason: string) => Promise<void>;

  terminateVendorAndAssignContinuity: (vendorId: string, continuityManager: string, reason: string) => Promise<void>;

  // 15. Blacklist Exception Override by Super Admin (FR-BLK-008)
  overrideBlacklistEntry: (blacklistId: string, overrideReason: string) => Promise<void>;
  overrideFlaggedBooking: (bookingId: string, overrideReason: string) => Promise<void>;

  // 16. Finance Vendor Settlement Approval (Segregation of Duties FR-SET-008)
  approveAndReleaseVendorSettlement: (settlementId: string) => Promise<void>;

  // 17. Service & Maintenance / Asset Swap (FR-SRV-001 to 006) & Support Escalation (FR-SUP-001 to 005)
  createServiceTicket: (bookingId: string, issueDescription: string, requestAssetSwap: boolean) => Promise<void>;
  executeVendorAssetReplacement: (ticketId: string, replacementSerial: string) => Promise<void>;
  escalateSupportTicket: (ticketId: string, resolutionOrEscalationNote: string) => Promise<void>;
  updateObdDecision: (obdId: string, selectedOption: string) => Promise<void>;
}

const simulateLatency = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIST = () => {
  const d = new Date();
  return `2026-10-28 ${d.toTimeString().slice(0, 8)} IST`;
};

export const useKaroRentStore = create<KaroRentState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      activeTab: 'MARKETPLACE',
      activePersona: DEMO_PERSONAS[0],
      personas: DEMO_PERSONAS,
      isSimulatingLatency: false,
      latencyActionLabel: null,
      toasts: [],

      selectedLocation: 'Indiranagar, Bengaluru (560038)',
      searchQuery: '',
      selectedCategory: 'All',
      selectedWorkflowFilter: 'ALL',
      selectedTenureMonths: 6,
      comparisonProductIds: [],
      activeAgreementModalBookingId: null,
      activeCheckoutProductId: null,

      customers: INITIAL_CUSTOMERS,
      vendors: INITIAL_VENDORS,
      masterProducts: INITIAL_MASTER_PRODUCTS,
      virtualInventory: INITIAL_VIRTUAL_INVENTORY,
      bookings: INITIAL_BOOKINGS,
      agreements: INITIAL_AGREEMENTS,
      invoices: INITIAL_INVOICES,
      depositLedgers: INITIAL_DEPOSIT_LEDGERS,
      disputeCases: INITIAL_DISPUTE_CASES,
      serviceTickets: INITIAL_SERVICE_TICKETS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      settlements: INITIAL_SETTLEMENTS,
      blacklist: INITIAL_BLACKLIST,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      obdDecisions: INITIAL_OBD_DECISIONS,

      toggleDarkMode: () => {
        const next = !get().darkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next);
        }
        set({ darkMode: next });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      switchPersona: (personaId) => {
        const found = get().personas.find((p) => p.id === personaId);
        if (!found) return;
        let defaultTab: NavigationTab = 'MARKETPLACE';
        if (found.role === 'VENDOR_OWNER') defaultTab = 'VENDOR_PORTAL';
        if (found.role === 'FIELD_PERSONNEL') defaultTab = 'FIELD_OPERATIONS';
        if (found.role === 'PLATFORM_ADMIN') defaultTab = 'ADMIN_GOVERNANCE';

        set({ activePersona: found, activeTab: defaultTab });
        get().addToast({
          title: `Switched Role: ${found.name}`,
          description: `${found.roleBadge} — Strict data scoping enforced (BR-012 / BR-013).`,
          ruleCode: 'FR-ADM-002',
          variant: found.isBlacklisted || found.isTerminatedVendor ? 'warning' : 'info',
        });
      },

      setSelectedLocation: (loc) => set({ selectedLocation: loc }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSelectedWorkflowFilter: (wf) => set({ selectedWorkflowFilter: wf }),
      setSelectedTenureMonths: (months) => set({ selectedTenureMonths: months }),

      toggleCompareProduct: (productId) => {
        const current = get().comparisonProductIds;
        if (current.includes(productId)) {
          set({ comparisonProductIds: current.filter((id) => id !== productId) });
        } else {
          if (current.length >= 3) {
            get().addToast({
              title: 'Comparison Tray Full',
              description: 'Compare up to 3 products side by side (FR-CAT-005).',
              ruleCode: 'FR-CAT-005',
              variant: 'warning',
            });
            return;
          }
          set({ comparisonProductIds: [...current, productId] });
        }
      },

      setActiveAgreementModalBookingId: (bookingId) => set({ activeAgreementModalBookingId: bookingId }),
      setActiveCheckoutProductId: (productId) => set({ activeCheckoutProductId: productId }),

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 5500);
      },

      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      resetDemoState: () => {
        set({
          customers: INITIAL_CUSTOMERS,
          vendors: INITIAL_VENDORS,
          masterProducts: INITIAL_MASTER_PRODUCTS,
          virtualInventory: INITIAL_VIRTUAL_INVENTORY,
          bookings: INITIAL_BOOKINGS,
          agreements: INITIAL_AGREEMENTS,
          invoices: INITIAL_INVOICES,
          depositLedgers: INITIAL_DEPOSIT_LEDGERS,
          disputeCases: INITIAL_DISPUTE_CASES,
          serviceTickets: INITIAL_SERVICE_TICKETS,
          supportTickets: INITIAL_SUPPORT_TICKETS,
          settlements: INITIAL_SETTLEMENTS,
          blacklist: INITIAL_BLACKLIST,
          notifications: INITIAL_NOTIFICATIONS,
          auditLogs: INITIAL_AUDIT_LOGS,
          obdDecisions: INITIAL_OBD_DECISIONS,
          activePersona: DEMO_PERSONAS[0],
          activeTab: 'MARKETPLACE',
        });
        get().addToast({
          title: 'Demo Fixtures Reset',
          description: 'All SRS v4.0 ledgers, staged requests, and bookings restored to initial state.',
          ruleCode: 'SRS-v4.0',
          variant: 'info',
        });
      },

      // ========================================================================
      // 1. Create Booking Order (WF-04, FR-BKG-001..009, FR-BLK-005, FR-PAY-011)
      // ========================================================================
      createBookingOrder: async ({ productId, quantity, tenureMonths, startDate, deliveryAddress }) => {
        const state = get();
        if (state.isSimulatingLatency) {
          throw new Error('Duplicate submission blocked (FR-BKG-009).');
        }
        set({ isSimulatingLatency: true, latencyActionLabel: 'Validating Blacklist, Virtual Stock & Generating Invoices...' });
        await simulateLatency(420);

        const product = state.masterProducts.find((p) => p.id === productId)!;
        const inventory = state.virtualInventory.find((i) => i.productId === productId)!;
        const persona = state.activePersona;
        const customer = state.customers.find((c) => c.id === persona.customerId) || state.customers[0];

        const multiplier = product.tenureMultipliers[tenureMonths] || 1;
        const monthlyRentRate = Math.round(product.baseMonthlyRent * multiplier);
        const securityDepositAmount = product.baseMonthlyRent * product.depositMonthsMultiple * quantity;
        const bookingId = `BKG-2026-${Math.floor(9000 + Math.random() * 900)}`;
        const agreementId = `AGR-${bookingId.slice(4)}`;

        const startObj = new Date(startDate);
        startObj.setMonth(startObj.getMonth() + tenureMonths);
        const endDate = startObj.toISOString().split('T')[0];

        // Pre-confirmation Blacklist Check (FR-BKG-002 / FR-BLK-005 / EX-032)
        const matchingBlacklist = state.blacklist.find(
          (b) =>
            b.ledgerType === 'CUSTOMER_BLACKLIST' &&
            b.status === 'Active Blacklist' &&
            (b.entityId === customer.id ||
              b.matchedIdentifiers.phone === customer.verifiedMobile ||
              b.matchedIdentifiers.bankOrPaymentFingerprint === customer.paymentFingerprint)
        );

        if (matchingBlacklist || customer.status === 'Blacklisted / Watchlisted') {
          const flaggedBooking: BookingOrder = {
            id: bookingId,
            customerId: customer.id,
            customerName: customer.fullName,
            customerType: customer.accountType,
            productId: product.id,
            productTitle: product.title,
            category: product.category,
            workflowType: product.workflowType,
            inventoryId: inventory.id,
            fulfillingVendorId: inventory.owningVendorId,
            fulfillingVendorName: inventory.owningVendorName,
            serviceLocation: inventory.serviceLocation,
            quantity,
            tenureMonths,
            startDate,
            endDate,
            deliveryAddress,
            status: 'Flagged — Blacklist Review',
            monthlyRentRate,
            securityDepositAmount,
            deliveryFee: product.standardDeliveryFee,
            siteVisitFee: product.siteVisitFee,
            installationMaterialFee: 0,
            gstPercent: 18,
            blacklistFlagReason: `Intercepted by FR-BLK-005 / EX-032: Customer matches active Blacklist (${matchingBlacklist?.id || 'Watchlist'}) for ${matchingBlacklist?.categoryReason || 'Prior Default'}. Inventory allocation & vendor dispatch blocked pending Super Admin review.`,
            agreementId,
            createdAt: '2026-10-28',
          };

          const auditEntry: AuditLogEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: nowIST(),
            actorName: customer.fullName,
            actorRole: persona.roleBadge,
            moduleCode: 'FR-BLK-005 / EX-032',
            actionSummary: `Intercepted booking attempt ${bookingId} by blacklisted client`,
            affectedRecordId: bookingId,
            priorValue: 'Pre-Confirmation Check',
            newValue: 'Status: Flagged — Blacklist Review (Stock Not Allocated)',
            mandatoryReason: 'Automatic Customer Blacklist cross-booking protection.',
          };

          set((s) => ({
            isSimulatingLatency: false,
            latencyActionLabel: null,
            bookings: [flaggedBooking, ...s.bookings],
            blacklist: s.blacklist.map((b) =>
              b.entityId === customer.id ? { ...b, blockedAttemptsCount: b.blockedAttemptsCount + 1 } : b
            ),
            auditLogs: [auditEntry, ...s.auditLogs],
            notifications: [
              {
                id: `NTF-${Date.now()}`,
                eventCode: 'FR-BLK-005 / EX-032',
                title: `Blacklist Intercept: Booking ${bookingId} Blocked`,
                message: `${customer.fullName} attempted to book ${product.title}. Held in Flagged — Blacklist Review.`,
                recipientRole: 'PLATFORM_ADMIN',
                category: 'Blacklist Alert',
                priority: 'critical',
                read: false,
                timestamp: 'Just now',
                linkedView: 'BLACKLIST_REGISTRY',
              },
              ...s.notifications,
            ],
          }));

          get().addToast({
            title: 'Booking Intercepted — Blacklist Review (FR-BLK-005)',
            description: `${bookingId} placed in Flagged — Blacklist Review. Stock was NOT allocated and Platform Admin has been alerted.`,
            ruleCode: 'EX-032',
            variant: 'error',
          });

          return { bookingId, interceptedByBlacklist: true };
        }

        // Standard Validated Booking Flow (Path A: 1-Step Direct vs Path B: Multi-Step Site Visit)
        const isMultiStep = product.workflowType === 'SITE_VISIT_MULTI_STEP';
        const initialStatus = isMultiStep ? 'Awaiting Site Visit Payment' : 'Awaiting Customer Agreement';

        const newBooking: BookingOrder = {
          id: bookingId,
          customerId: customer.id,
          customerName: customer.companyName ? `${customer.companyName} (${customer.fullName})` : customer.fullName,
          customerType: customer.accountType,
          productId: product.id,
          productTitle: product.title,
          category: product.category,
          workflowType: product.workflowType,
          inventoryId: inventory.id,
          fulfillingVendorId: inventory.owningVendorId,
          fulfillingVendorName: inventory.owningVendorName,
          serviceLocation: inventory.serviceLocation,
          quantity,
          tenureMonths,
          startDate,
          endDate,
          deliveryAddress,
          status: initialStatus,
          monthlyRentRate: monthlyRentRate * quantity,
          securityDepositAmount,
          deliveryFee: product.standardDeliveryFee,
          siteVisitFee: product.siteVisitFee,
          installationMaterialFee: 0,
          gstPercent: 18,
          reservationHoldExpiresAt: '15:00 mins (OBD-01 Hold Active)',
          siteVisit: isMultiStep
            ? {
                scheduledDate: 'Pending ₹499 Site Visit Payment',
                assignedTechnician: 'Rajan Kumar (Field Service)',
                status: 'Scheduled',
                measuredCopperPipeMeters: 3.0,
                coreCuttingRequired: false,
                outdoorBracketRequired: false,
                drainageExtensionMeters: 1.0,
                sitePhotographs: [],
                technicianNotes: 'Awaiting pre-installation feasibility & metric inspection.',
                calculatedMaterialCharges: 0,
              }
            : undefined,
          agreementId,
          createdAt: '2026-10-28',
        };

        const newAgreement: RentalAgreementRecord = {
          id: agreementId,
          bookingId,
          templateVersion:
            customer.accountType === 'Business'
              ? 'KR-CORP-AGR-v4.0 (B2B Signatory Edition)'
              : 'KR-CUST-AGR-v4.0 (Tri-Partite Platform Contracting Standard)',
          status: 'Awaiting Signature',
          customerName: newBooking.customerName,
          authorisedSignatory: customer.authorisedSignatoryName,
          vendorSnapshotName: `${inventory.owningVendorName} (${inventory.owningVendorId})`,
          productTitle: product.title,
          tenureMonths,
          startDate,
          endDate,
          lockedMonthlyRent: monthlyRentRate * quantity,
          lockedDepositAmount: securityDepositAmount,
          lockedInstallationCharge: product.standardDeliveryFee,
          mandatoryPickupPhotoClause:
            'Clause 9.4 (BR-026 Mandatory Doorstep Pickup Photo): Vendor pickup staff must capture a verified timestamped photo at customer premises before return removal.',
          amendments: [],
        };

        // Generate Separate Invoices by Charge Type (FR-PAY-011)
        const newInvoices: FinancialInvoiceDocument[] = [];
        if (isMultiStep) {
          newInvoices.push({
            id: `INV-SV-${bookingId.slice(9)}`,
            bookingId,
            customerId: customer.id,
            customerName: newBooking.customerName,
            vendorId: inventory.owningVendorId,
            chargeType: 'SITE_VISIT_INVOICE',
            title: `1. Pre-Installation Site Feasibility Visit Invoice — ${product.title}`,
            baseAmount: 423,
            taxAmount: 76,
            totalPayable: product.siteVisitFee,
            paymentState: 'Pending',
            dueDate: '2026-10-28',
          });
        } else {
          const rentBase = monthlyRentRate * quantity;
          const rentTax = Math.round(rentBase * 0.18);
          const delivBase = product.standardDeliveryFee;
          const delivTax = Math.round(delivBase * 0.18);

          newInvoices.push(
            {
              id: `INV-IN-${bookingId.slice(9)}`,
              bookingId,
              customerId: customer.id,
              customerName: newBooking.customerName,
              vendorId: inventory.owningVendorId,
              chargeType: 'INSTALLATION_MATERIAL_INVOICE',
              title: `2. Standard Delivery & Setup Rate-Card Invoice`,
              baseAmount: delivBase,
              taxAmount: delivTax,
              totalPayable: delivBase + delivTax,
              paymentState: 'Pending',
              dueDate: '2026-10-28',
            },
            {
              id: `INV-RN-${bookingId.slice(9)}`,
              bookingId,
              customerId: customer.id,
              customerName: newBooking.customerName,
              vendorId: inventory.owningVendorId,
              chargeType: 'PERIODIC_RENTAL_INVOICE',
              title: `3. Periodic Monthly Rental Charge Invoice — Cycle 1 of ${tenureMonths}`,
              cycleNumber: 1,
              baseAmount: rentBase,
              taxAmount: rentTax,
              totalPayable: rentBase + rentTax,
              paymentState: 'Pending',
              dueDate: '2026-10-28',
            },
            {
              id: `INV-DP-${bookingId.slice(9)}`,
              bookingId,
              customerId: customer.id,
              customerName: newBooking.customerName,
              vendorId: inventory.owningVendorId,
              chargeType: 'SECURITY_DEPOSIT_COLLECTION_NOTE',
              title: `4. Refundable Security Deposit Collection Note [4× Base Rent • Segregated Vault]`,
              baseAmount: securityDepositAmount,
              taxAmount: 0,
              totalPayable: securityDepositAmount,
              paymentState: 'Pending',
              dueDate: '2026-10-28',
            }
          );
        }

        const newDepositLedger: SegregatedDepositLedger = {
          id: `DEP-LED-${bookingId.slice(9)}`,
          bookingId,
          customerId: customer.id,
          customerName: newBooking.customerName,
          vendorId: inventory.owningVendorId,
          productTitle: product.title,
          expectedDeposit: securityDepositAmount,
          collectedDeposit: 0,
          heldBalance: 0,
          proposedDeduction: 0,
          approvedDeduction: 0,
          disputedAmount: 0,
          netRefundableAmount: 0,
          refundedAmount: 0,
          refundStatus: 'Held in Vault',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: [newBooking, ...s.bookings],
          agreements: [newAgreement, ...s.agreements],
          invoices: [...newInvoices, ...s.invoices],
          depositLedgers: [newDepositLedger, ...s.depositLedgers],
          virtualInventory: s.virtualInventory.map((inv) =>
            inv.id === inventory.id
              ? {
                  ...inv,
                  availableQuantity: Math.max(0, inv.availableQuantity - quantity),
                  reservedQuantity: inv.reservedQuantity + quantity,
                }
              : inv
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: newBooking.customerName,
              actorRole: persona.roleBadge,
              moduleCode: isMultiStep ? 'WF-04 Path B / FR-PRC-008' : 'WF-04 Path A / FR-BKG-001',
              actionSummary: `Created booking ${bookingId} (${isMultiStep ? 'Multi-Step Site Visit' : '1-Step Direct'}) with reservation hold`,
              affectedRecordId: bookingId,
              priorValue: `Available Stock: ${inventory.availableQuantity}`,
              newValue: `Reserved: ${quantity} unit(s) • Status: ${initialStatus}`,
              mandatoryReason: 'Customer checkout submission.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: isMultiStep
            ? `Multi-Step Booking ${bookingId} Created`
            : `1-Step Booking ${bookingId} Created`,
          description: isMultiStep
            ? `Pay ₹${product.siteVisitFee} Site Visit Invoice to schedule your home measurement visit (FR-PRC-008).`
            : `Sign your e-agreement and complete invoice payment to trigger dispatch (WF-04).`,
          ruleCode: 'WF-04',
          variant: 'success',
        });

        return { bookingId, interceptedByBlacklist: false };
      },

      // ========================================================================
      // 2. Field Technician Submits Site Visit Metrics (FR-FUL-008, FR-PRC-008, EX-030)
      // ========================================================================
      submitSiteVisitMetrics: async (payload) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Calculating Platform Rate-Card Final Quote...' });
        await simulateLatency(380);

        const state = get();
        const booking = state.bookings.find((b) => b.id === payload.bookingId);
        if (!booking) return;

        // Calculate strictly from Platform Rate Card (FR-PRC-004 / BR-027)
        const extraPipeMeters = Math.max(0, payload.measuredCopperPipeMeters - 3);
        const pipeCharge = Math.round(extraPipeMeters * 850);
        const bracketCharge = payload.outdoorBracketRequired ? 750 : 0;
        const coreCutCharge = payload.coreCuttingRequired ? 500 : 0;
        const extraDrainMeters = Math.max(0, payload.drainageExtensionMeters - 2);
        const drainCharge = Math.round(extraDrainMeters * 180);
        const totalMaterialCharges = pipeCharge + bracketCharge + coreCutCharge + drainCharge;

        if (!payload.feasible) {
          // EX-030: Site Unfeasible -> Cancel without charging rent/deposit; release inventory hold!
          set((s) => ({
            isSimulatingLatency: false,
            latencyActionLabel: null,
            bookings: s.bookings.map((b) =>
              b.id === payload.bookingId
                ? {
                    ...b,
                    status: 'Site Unfeasible — Cancelled',
                    siteVisit: {
                      scheduledDate: b.siteVisit?.scheduledDate || nowIST(),
                      assignedTechnician: 'Rajan Kumar (Field Service)',
                      status: 'Completed — Not Feasible',
                      unfeasibleReason: payload.unfeasibleReason || 'Structural/electrical constraints prevent safe installation.',
                      measuredCopperPipeMeters: 0,
                      coreCuttingRequired: false,
                      outdoorBracketRequired: false,
                      drainageExtensionMeters: 0,
                      sitePhotographs: [payload.sitePhotoUrl],
                      technicianNotes: payload.technicianNotes,
                      calculatedMaterialCharges: 0,
                      completedAt: nowIST(),
                    },
                  }
                : b
            ),
            virtualInventory: s.virtualInventory.map((inv) =>
              inv.id === booking.inventoryId
                ? {
                    ...inv,
                    availableQuantity: inv.availableQuantity + booking.quantity,
                    reservedQuantity: Math.max(0, inv.reservedQuantity - booking.quantity),
                  }
                : inv
            ),
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                timestamp: nowIST(),
                actorName: 'Rajan Kumar (Field Service)',
                actorRole: 'Field Personnel',
                moduleCode: 'EX-030 / FR-FUL-008',
                actionSummary: `Site visit marked Not Feasible for ${booking.id}; released inventory hold`,
                affectedRecordId: booking.id,
                priorValue: 'Status: Site Visit Scheduled',
                newValue: 'Status: Site Unfeasible — Cancelled (Rent/Deposit Not Charged)',
                mandatoryReason: payload.unfeasibleReason || payload.technicianNotes,
              },
              ...s.auditLogs,
            ],
          }));

          get().addToast({
            title: 'Site Unfeasible — Booking Cancelled (EX-030)',
            description: 'Inventory hold released. Customer is not charged rent or security deposit.',
            ruleCode: 'EX-030',
            variant: 'warning',
          });
          return;
        }

        // Feasible -> Generate Final Charges & Separate Invoices (FR-PRC-008, FR-PAY-011)
        const suffix = booking.id.slice(9);
        const installBase = booking.deliveryFee + totalMaterialCharges;
        const installTax = Math.round(installBase * 0.18);
        const rentBase = booking.monthlyRentRate;
        const rentTax = Math.round(rentBase * 0.18);

        const newGeneratedInvoices: FinancialInvoiceDocument[] = [
          {
            id: `INV-IN-${suffix}`,
            bookingId: booking.id,
            customerId: booking.customerId,
            customerName: booking.customerName,
            vendorId: booking.fulfillingVendorId,
            chargeType: 'INSTALLATION_MATERIAL_INVOICE',
            title: `2. Installation & Measured Rate-Card Invoice (${payload.measuredCopperPipeMeters}m Pipe, Bracket: ${payload.outdoorBracketRequired ? 'Yes' : 'No'})`,
            baseAmount: installBase,
            taxAmount: installTax,
            totalPayable: installBase + installTax,
            paymentState: 'Pending',
            dueDate: '2026-10-30',
          },
          {
            id: `INV-RN-${suffix}`,
            bookingId: booking.id,
            customerId: booking.customerId,
            customerName: booking.customerName,
            vendorId: booking.fulfillingVendorId,
            chargeType: 'PERIODIC_RENTAL_INVOICE',
            title: `3. Periodic Monthly Rental Charge Invoice — Cycle 1 of ${booking.tenureMonths}`,
            cycleNumber: 1,
            baseAmount: rentBase,
            taxAmount: rentTax,
            totalPayable: rentBase + rentTax,
            paymentState: 'Pending',
            dueDate: '2026-10-30',
          },
          {
            id: `INV-DP-${suffix}`,
            bookingId: booking.id,
            customerId: booking.customerId,
            customerName: booking.customerName,
            vendorId: booking.fulfillingVendorId,
            chargeType: 'SECURITY_DEPOSIT_COLLECTION_NOTE',
            title: `4. Refundable Security Deposit Collection Note [4× Base Rent • Tax-Exempt Vault]`,
            baseAmount: booking.securityDepositAmount,
            taxAmount: 0,
            totalPayable: booking.securityDepositAmount,
            paymentState: 'Pending',
            dueDate: '2026-10-30',
          },
        ];

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === payload.bookingId
              ? {
                  ...b,
                  status: 'Final Bill Sent',
                  installationMaterialFee: totalMaterialCharges,
                  siteVisit: {
                    scheduledDate: b.siteVisit?.scheduledDate || nowIST(),
                    assignedTechnician: 'Rajan Kumar (Field Service)',
                    status: 'Completed — Feasible',
                    measuredCopperPipeMeters: payload.measuredCopperPipeMeters,
                    coreCuttingRequired: payload.coreCuttingRequired,
                    outdoorBracketRequired: payload.outdoorBracketRequired,
                    drainageExtensionMeters: payload.drainageExtensionMeters,
                    sitePhotographs: [payload.sitePhotoUrl],
                    technicianNotes: payload.technicianNotes,
                    calculatedMaterialCharges: totalMaterialCharges,
                    completedAt: nowIST(),
                    customerQuoteDecision: 'Pending',
                  },
                }
              : b
          ),
          agreements: s.agreements.map((a) =>
            a.bookingId === payload.bookingId
              ? {
                  ...a,
                  lockedInstallationCharge: booking.deliveryFee + totalMaterialCharges,
                  amendments: [
                    ...a.amendments,
                    {
                      id: `AMD-${Date.now()}`,
                      version: 'v1.1 — Post-Site Visit Rate Card Addendum',
                      reason: `Measured ${payload.measuredCopperPipeMeters}m copper pipe + installation accessories via Platform Rate Card.`,
                      changedFieldsSummary: `Measured Material Fee locked at ₹${totalMaterialCharges.toLocaleString('en-IN')}`,
                      createdAt: nowIST(),
                      signedByCustomer: false,
                    },
                  ],
                }
              : a
          ),
          invoices: [
            ...newGeneratedInvoices,
            ...s.invoices.filter(
              (inv) => !(inv.bookingId === booking.id && inv.chargeType !== 'SITE_VISIT_INVOICE')
            ),
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: 'Rajan Kumar (Field Service)',
              actorRole: 'Field Personnel',
              moduleCode: 'FR-FUL-008 / FR-PRC-008',
              actionSummary: `Recorded site visit metrics for ${booking.id}; auto-calculated ₹${totalMaterialCharges} material charges`,
              affectedRecordId: booking.id,
              priorValue: 'Status: Site Visit Scheduled',
              newValue: `Status: Final Bill Sent (Material Fee: ₹${totalMaterialCharges})`,
              mandatoryReason: payload.technicianNotes,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Site Metrics Logged & Final Bill Sent (FR-PRC-008)',
          description: `Calculated ₹${totalMaterialCharges.toLocaleString('en-IN')} from Platform Rate Card and generated segregated invoices.`,
          ruleCode: 'FR-FUL-008',
          variant: 'success',
        });
      },

      // ========================================================================
      // 3. Customer Accepts or Rejects Post-Visit Final Quote (FR-PRC-008, EX-030)
      // ========================================================================
      respondToPostVisitQuote: async (bookingId, decision) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Quote Decision...' });
        await simulateLatency(300);

        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        if (decision === 'Rejected') {
          set((s) => ({
            isSimulatingLatency: false,
            latencyActionLabel: null,
            bookings: s.bookings.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    status: 'Cancelled',
                    siteVisit: b.siteVisit ? { ...b.siteVisit, customerQuoteDecision: 'Rejected' } : undefined,
                  }
                : b
            ),
            virtualInventory: s.virtualInventory.map((inv) =>
              inv.id === booking.inventoryId
                ? {
                    ...inv,
                    availableQuantity: inv.availableQuantity + booking.quantity,
                    reservedQuantity: Math.max(0, inv.reservedQuantity - booking.quantity),
                  }
                : inv
            ),
            invoices: s.invoices.map((inv) =>
              inv.bookingId === bookingId && inv.chargeType !== 'SITE_VISIT_INVOICE'
                ? { ...inv, paymentState: 'Cancelled' }
                : inv
            ),
          }));

          get().addToast({
            title: 'Post-Visit Quote Rejected (EX-030)',
            description: 'Booking cancelled without charging rental or security deposit. Inventory hold released.',
            ruleCode: 'EX-030',
            variant: 'warning',
          });
          return;
        }

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'Awaiting Customer Agreement',
                  siteVisit: b.siteVisit ? { ...b.siteVisit, customerQuoteDecision: 'Accepted' } : undefined,
                }
              : b
          ),
        }));

        get().addToast({
          title: 'Final Transparent Quote Accepted!',
          description: 'Please e-sign the updated Platform–Customer Rental Agreement to proceed.',
          ruleCode: 'FR-PRC-008',
          variant: 'success',
        });
      },

      // ========================================================================
      // 4. Sign Rental Agreement (FR-AGR-001 to 009, BR-002)
      // ========================================================================
      signRentalAgreement: async (bookingId, otpCode, signerAuthorityNote) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Cryptographically Sealing E-Signature & Consent...' });
        await simulateLatency(400);

        const hash = `SHA256:${Math.random().toString(16).slice(2, 10)}e91b...${otpCode} [Verified OTP • ${nowIST()}]`;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          agreements: s.agreements.map((a) =>
            a.bookingId === bookingId
              ? {
                  ...a,
                  status: 'Signed',
                  signerIdentityMethod: a.authorisedSignatory ? 'Corporate DSC / Signatory OTP' : 'Aadhaar OTP E-Sign',
                   authorisedSignatory: signerAuthorityNote || a.authorisedSignatory,
                  signatureHash: hash,
                  signedAt: nowIST(),
                  amendments: a.amendments.map((am) => ({ ...am, signedByCustomer: true, signedAt: nowIST() })),
                }
              : a
          ),
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'Awaiting Payment',
                }
              : b
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'FR-AGR-004 / BR-002',
              actionSummary: `Electronically signed rental agreement for ${bookingId}`,
              affectedRecordId: bookingId,
              priorValue: 'Agreement: Awaiting Signature',
              newValue: `Signed (${hash.slice(0, 26)}...)`,
              mandatoryReason: 'Customer online electronic signature consent.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Agreement E-Signed & Sealed (FR-AGR-004)',
          description: 'Immutable copy generated with Sage-Green OTP verification stamp.',
          ruleCode: 'BR-002',
          variant: 'success',
        });
      },

      // ========================================================================
      // 5. Pay Invoice Document (FR-PAY-001 to 011, BR-008)
      // ========================================================================
      payInvoiceDocument: async (invoiceId) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === invoiceId);
        if (!inv || inv.paymentState === 'Successful') {
          get().addToast({
            title: 'Idempotency Guard (FR-PAY-003)',
            description: 'This invoice is already reconciled as Paid. Duplicate charge prevented.',
            ruleCode: 'FR-PAY-003',
            variant: 'info',
          });
          return;
        }

        set({ isSimulatingLatency: true, latencyActionLabel: `Reconciling Payment for ${inv.id} with Provider...` });
        await simulateLatency(380);

        const providerRef = `RZP_${inv.chargeType.slice(0, 4)}_${Math.floor(100000 + Math.random() * 899999)}`;

        set((s) => {
          const updatedInvoices = s.invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  paymentState: 'Successful' as const,
                  providerReference: providerRef,
                  paidAt: nowIST(),
                }
              : i
          );

          const bookingInvoices = updatedInvoices.filter((i) => i.bookingId === inv.bookingId);
          const allPaid = bookingInvoices.every((i) => i.paymentState === 'Successful');
          const isSiteVisitOnlyPaid =
            inv.chargeType === 'SITE_VISIT_INVOICE' && bookingInvoices.length === 1;

          return {
            isSimulatingLatency: false,
            latencyActionLabel: null,
            invoices: updatedInvoices,
            depositLedgers:
              inv.chargeType === 'SECURITY_DEPOSIT_COLLECTION_NOTE'
                ? s.depositLedgers.map((d) =>
                    d.bookingId === inv.bookingId
                      ? {
                          ...d,
                          collectedDeposit: inv.totalPayable,
                          heldBalance: inv.totalPayable,
                          netRefundableAmount: inv.totalPayable,
                        }
                      : d
                  )
                : s.depositLedgers,
            bookings: s.bookings.map((b) => {
              if (b.id !== inv.bookingId) return b;
              if (isSiteVisitOnlyPaid) {
                return {
                  ...b,
                  status: 'Site Visit Scheduled',
                  siteVisit: b.siteVisit
                    ? { ...b.siteVisit, scheduledDate: '2026-10-29 • 11:00 AM IST' }
                    : undefined,
                };
              }
              if (allPaid) {
                return { ...b, status: 'Confirmed' };
              }
              return b;
            }),
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                timestamp: nowIST(),
                actorName: s.activePersona.name,
                actorRole: s.activePersona.roleBadge,
                moduleCode: 'FR-PAY-001 / BR-008',
                actionSummary: `Reconciled payment of ₹${inv.totalPayable.toLocaleString('en-IN')} for ${inv.id}`,
                affectedRecordId: inv.id,
                priorValue: 'Payment: Pending',
                newValue: `Payment: Successful (Ref: ${providerRef})`,
                mandatoryReason: 'Verified payment gateway webhook reconciliation.',
              },
              ...s.auditLogs,
            ],
          };
        });

        get().addToast({
          title: `Payment Reconciled: ₹${inv.totalPayable.toLocaleString('en-IN')}`,
          description: `Provider Ref ${providerRef} linked to ${inv.bookingId}.`,
          ruleCode: 'FR-PAY-001',
          variant: 'success',
        });
      },

      // ========================================================================
      // 6. Field Dispatch & Delivery Activation (FR-FUL-002 to 007)
      // ========================================================================
      completeDeliveryAndActivate: async (bookingId, serialNumber, photoUrl) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Proof-of-Delivery & Activating Rental...' });
        await simulateLatency(350);

        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'Active Rental',
                  allocatedSerial: serialNumber,
                  deliveryCompletedAt: nowIST(),
                  deliveryEvidencePhoto: photoUrl,
                }
              : b
          ),
          agreements: s.agreements.map((a) =>
            a.bookingId === bookingId
              ? { ...a, status: 'Active', allocatedSerialNumber: serialNumber }
              : a
          ),
          virtualInventory: s.virtualInventory.map((inv) =>
            inv.id === booking.inventoryId
              ? {
                  ...inv,
                  reservedQuantity: Math.max(0, inv.reservedQuantity - booking.quantity),
                  rentedQuantity: inv.rentedQuantity + booking.quantity,
                }
              : inv
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: 'Rajan Kumar (Field Service)',
              actorRole: 'Field Personnel',
              moduleCode: 'FR-FUL-007 / OBD-21',
              actionSummary: `Delivered asset ${serialNumber} and activated rental ${bookingId}`,
              affectedRecordId: bookingId,
              priorValue: 'Status: Confirmed',
              newValue: `Status: Active Rental (Serial: ${serialNumber})`,
              mandatoryReason: 'Customer delivery & installation acknowledgement captured.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Rental ${bookingId} Activated (FR-FUL-007)`,
          description: `Asset ${serialNumber} delivered and acknowledged at customer premises.`,
          ruleCode: 'FR-FUL-007',
          variant: 'success',
        });
      },

      // ========================================================================
      // 7. Renewal Request & Return Pickup Request (FR-LIF-003, FR-RET-001)
      // ========================================================================
      requestRentalRenewal: async (bookingId, additionalMonths) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Checking Virtual Stock & Extending Rental Tenure...' });
        await simulateLatency(320);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            const currentEnd = new Date(b.endDate);
            currentEnd.setMonth(currentEnd.getMonth() + additionalMonths);
            return {
              ...b,
              endDate: currentEnd.toISOString().split('T')[0],
            };
          }),
          agreements: s.agreements.map((a) =>
            a.bookingId === bookingId
              ? {
                  ...a,
                  status: 'Amended',
                  amendments: [
                    ...a.amendments,
                    {
                      id: `AMD-${Date.now()}`,
                      version: `v1.${a.amendments.length + 1} — Tenure Extension Addendum`,
                      reason: `Customer requested ${additionalMonths}-month renewal extension (FR-LIF-003).`,
                      changedFieldsSummary: `Extended rental tenure by +${additionalMonths} months at Platform Rate.`,
                      createdAt: nowIST(),
                      signedByCustomer: true,
                      signedAt: nowIST(),
                    },
                  ],
                }
              : a
          ),
        }));

        get().addToast({
          title: `Rental Extended by +${additionalMonths} Months (FR-LIF-005)`,
          description: 'Agreement addendum generated and return due date updated.',
          ruleCode: 'FR-LIF-003',
          variant: 'success',
        });
      },

      initiateReturnPickupRequest: async (bookingId, preferredSlot) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Scheduling Return Pickup & Preparing EXIF Gate...' });
        await simulateLatency(320);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'Pickup Scheduled',
                  returnRecord: {
                    returnRequestedAt: nowIST(),
                    preferredPickupSlot: preferredSlot,
                    assignedPickupStaff: 'Rajan Kumar (Field Service)',
                    pickupStatus: 'Scheduled',
                    preDispatchPhoto:
                      b.deliveryEvidencePhoto ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
                    preDispatchNotes: 'Verified mint condition at dispatch.',
                    proposedDeductionAmount: 0,
                    approvedDeductionAmount: 0,
                    transitDamageBlockedByBR026: false,
                    customerResponse: 'Pending Customer Review',
                  },
                }
              : b
          ),
        }));

        get().addToast({
          title: 'Return Pickup Scheduled (FR-RET-001)',
          description: `Field staff assigned for ${preferredSlot}. Mandatory doorstep EXIF photo gate armed (BR-026).`,
          ruleCode: 'FR-RET-001',
          variant: 'info',
        });
      },

      // ========================================================================
      // 8. Mandatory Customer-Premise EXIF Pickup Photo Gate (FR-RET-002, BR-026, EX-029)
      // ========================================================================
      completeCustomerPremisePickupWithPhoto: async ({ bookingId, photoUrl, exifTimestamp, geoTag }) => {
        if (!photoUrl || !exifTimestamp) {
          get().addToast({
            title: 'Transition Blocked by BR-026 / EX-029',
            description: 'Cannot mark return as Picked Up without a verified timestamped photo at the customer premises.',
            ruleCode: 'BR-026',
            variant: 'error',
          });
          return;
        }

        set({ isSimulatingLatency: true, latencyActionLabel: 'Verifying EXIF Timestamp & Unlocking Picked Up Status...' });
        await simulateLatency(380);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId && b.returnRecord
              ? {
                  ...b,
                  status: 'Picked Up — Under Inspection',
                  returnRecord: {
                    ...b.returnRecord,
                    pickupStatus: 'Picked Up',
                    customerPremisePickupPhoto: photoUrl,
                    pickupPhotoExifTimestamp: `${exifTimestamp} [EXIF Geo: ${geoTag} Verified]`,
                    pickupPhotoGeoTag: geoTag,
                  },
                }
              : b
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: 'Rajan Kumar (Field Service)',
              actorRole: 'Field Personnel',
              moduleCode: 'FR-RET-002 / BR-026',
              actionSummary: `Captured mandatory doorstep EXIF pickup photo for ${bookingId}; unlocked Picked Up state`,
              affectedRecordId: bookingId,
              priorValue: 'Return: Scheduled (Pickup Gate Locked)',
              newValue: `Return: Picked Up (EXIF: ${exifTimestamp})`,
              mandatoryReason: 'Contractual doorstep handover evidence captured.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'EXIF Doorstep Pickup Photo Verified (FR-RET-002)',
          description: 'Status transitioned to Picked Up — Under Inspection. Ready for 3-Way Comparison.',
          ruleCode: 'BR-026',
          variant: 'success',
        });
      },

      // ========================================================================
      // 9. Three-Way Warehouse Return Inspection (FR-RET-003 to 008, BR-026)
      // ========================================================================
      submitWarehouseInspection: async ({
        bookingId,
        warehousePhotoUrl,
        finding,
        findingDescription,
        proposedDeduction,
        wasPresentInDoorstepPickupPhoto,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Running Three-Way Evidence Comparison (BR-026)...' });
        await simulateLatency(400);

        // Enforce BR-026: If damage reported at warehouse was NOT present in doorstep pickup photo,
        // it is presumed vendor transit damage and CANNOT be deducted from customer's security deposit!
        const blockedByBR026 =
          proposedDeduction > 0 &&
          (finding === 'Transit Damage (Vendor Fault)' || !wasPresentInDoorstepPickupPhoto);

        const effectiveProposedDeduction = blockedByBR026 ? 0 : proposedDeduction;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId && b.returnRecord
              ? {
                  ...b,
                  status: effectiveProposedDeduction > 0 ? 'Settlement Pending' : 'Completed',
                  returnRecord: {
                    ...b.returnRecord,
                    pickupStatus: effectiveProposedDeduction > 0 ? 'Under Inspection' : 'Finalised',
                    warehouseReturnPhoto: warehousePhotoUrl,
                    warehouseInspectionFinding: blockedByBR026
                      ? 'Transit Damage (Vendor Fault)'
                      : finding,
                    findingDescription: blockedByBR026
                      ? `${findingDescription} — [AUTOMATIC BR-026 PROTECTION: Damage was NOT visible in the verified doorstep pickup photo. Presumed vendor transit damage; ₹${proposedDeduction} deduction blocked against customer deposit.]`
                      : findingDescription,
                    proposedDeductionAmount: effectiveProposedDeduction,
                    approvedDeductionAmount: 0,
                    transitDamageBlockedByBR026: blockedByBR026,
                    customerResponse:
                      effectiveProposedDeduction > 0 ? 'Pending Customer Review' : 'Accepted',
                  },
                }
              : b
          ),
          depositLedgers: s.depositLedgers.map((d) =>
            d.bookingId === bookingId
              ? {
                  ...d,
                  proposedDeduction: effectiveProposedDeduction,
                  netRefundableAmount: Math.max(0, d.collectedDeposit - effectiveProposedDeduction),
                  refundStatus:
                    effectiveProposedDeduction > 0
                      ? 'Inspection Pending'
                      : 'Scheduled (14-Day Window)',
                  settlementDueDate: '2026-11-11 (14 Days Post-Settlement per FR-DEP-006)',
                }
              : d
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'FR-RET-003 / BR-026',
              actionSummary: blockedByBR026
                ? `BR-026 blocked ₹${proposedDeduction} transit damage claim on ${bookingId}`
                : `Recorded 3-way inspection for ${bookingId} (${finding})`,
              affectedRecordId: bookingId,
              priorValue: `Proposed: ₹${proposedDeduction}`,
              newValue: `Effective Proposed Deduction: ₹${effectiveProposedDeduction}`,
              mandatoryReason: findingDescription,
            },
            ...s.auditLogs,
          ],
        }));

        if (blockedByBR026) {
          get().addToast({
            title: 'Customer Protected by BR-026 (Transit Damage Blocked)',
            description: `Because the damage was not present in the doorstep EXIF pickup photo, ₹${proposedDeduction.toLocaleString('en-IN')} cannot be deducted from the customer's deposit.`,
            ruleCode: 'BR-026',
            variant: 'warning',
          });
        } else {
          get().addToast({
            title: '3-Way Inspection Recorded (FR-RET-003)',
            description:
              effectiveProposedDeduction > 0
                ? `Proposed deduction of ₹${effectiveProposedDeduction.toLocaleString('en-IN')} sent to customer with dispute window.`
                : 'Zero deduction! Full deposit scheduled for refund within 14 days.',
            ruleCode: 'FR-RET-003',
            variant: 'success',
          });
        }
      },

      customerDisputeInspectionFinding: async (bookingId, disputeReason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Opening Formal Dispute Case & Freezing Deduction...' });
        await simulateLatency(350);

        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking || !booking.returnRecord) return;

        const caseId = `DSP-2026-${Math.floor(500 + Math.random() * 400)}`;
        const proposed = booking.returnRecord.proposedDeductionAmount;

        const newDispute: DisputeCaseRecord = {
          id: caseId,
          bookingId: booking.id,
          customerId: booking.customerId,
          customerName: booking.customerName,
          vendorId: booking.fulfillingVendorId,
          vendorName: booking.fulfillingVendorName,
          productTitle: booking.productTitle,
          caseType: 'Return Damage Deduction',
          status: 'Under Platform Review',
          allegationSummary: booking.returnRecord.findingDescription || 'Disputed return inspection charge.',
          policyClauseCited: 'FR-RET-005 / FR-DSP-003 (Customer Inspection Dispute & Deposit Hold)',
          proposedChargeAmount: proposed,
          preDispatchPhoto: booking.returnRecord.preDispatchPhoto,
          pickupHandoverPhoto: booking.returnRecord.customerPremisePickupPhoto,
          warehouseReturnPhoto:
            booking.returnRecord.warehouseReturnPhoto || booking.returnRecord.preDispatchPhoto,
          customerResponseText: disputeReason,
          vendorRecommendation: `Maintain ₹${proposed} deduction pending mediator review.`,
          dueDate: '2026-11-02',
          createdAt: '2026-10-28',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          disputeCases: [newDispute, ...s.disputeCases],
          bookings: s.bookings.map((b) =>
            b.id === bookingId && b.returnRecord
              ? {
                  ...b,
                  status: 'Disputed',
                  returnRecord: {
                    ...b.returnRecord,
                    pickupStatus: 'Disputed',
                    customerResponse: 'Disputed',
                    customerDisputeNotes: disputeReason,
                    disputeCaseId: caseId,
                  },
                }
              : b
          ),
          depositLedgers: s.depositLedgers.map((d) =>
            d.bookingId === bookingId
              ? {
                  ...d,
                  disputedAmount: proposed,
                  refundStatus: 'Deduction Disputed',
                }
              : d
          ),
        }));

        get().addToast({
          title: `Dispute Case ${caseId} Opened (FR-DSP-001)`,
          description: 'Proposed deduction is frozen and cannot be automatically deducted while under review.',
          ruleCode: 'FR-DEP-006',
          variant: 'warning',
        });
      },

      // ========================================================================
      // 10. Platform Mediator Resolves Dispute & Settles Deposit (FR-DSP-004, FR-BLK-004)
      // ========================================================================
      resolveDisputeAndSettleDeposit: async ({
        bookingId,
        finalApprovedDeduction,
        mediatorDecisionNotes,
        enrollCustomerInBlacklist,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Mediator Ruling & Reconciling Deposit Vault...' });
        await simulateLatency(400);

        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        const ledger = state.depositLedgers.find((d) => d.bookingId === bookingId);
        if (!booking || !ledger) return;

        // Cap deduction at collected deposit; any excess generates a separate Post-Return Adjustment Invoice (FR-DEP-006 / FR-PAY-009)
        const cappedDeduction = Math.min(ledger.collectedDeposit, finalApprovedDeduction);
        const excessDamageBalance = Math.max(0, finalApprovedDeduction - ledger.collectedDeposit);
        const netRefund = Math.max(0, ledger.collectedDeposit - cappedDeduction);

        const newInvoices: FinancialInvoiceDocument[] = [];
        if (excessDamageBalance > 0) {
          newInvoices.push({
            id: `INV-ADJ-${bookingId.slice(9)}`,
            bookingId: booking.id,
            customerId: booking.customerId,
            customerName: booking.customerName,
            vendorId: booking.fulfillingVendorId,
            chargeType: 'POST_RETURN_ADJUSTMENT_INVOICE',
            title: `5. Post-Return Unrecovered Damage Balance Invoice (Exceeds Collected Deposit per FR-DEP-006)`,
            baseAmount: Math.round(excessDamageBalance / 1.18),
            taxAmount: excessDamageBalance - Math.round(excessDamageBalance / 1.18),
            totalPayable: excessDamageBalance,
            paymentState: 'Pending',
            dueDate: '2026-11-05',
          });
        }

        const newBlacklistEntries: BlacklistEntry[] = [];
        if (enrollCustomerInBlacklist) {
          const customer = state.customers.find((c) => c.id === booking.customerId);
          newBlacklistEntries.push({
            id: `BLK-C-${Date.now().toString().slice(-3)}`,
            ledgerType: 'CUSTOMER_BLACKLIST',
            entityId: booking.customerId,
            entityName: booking.customerName,
            categoryReason: 'Heavy Asset Damage / Loss',
            triggeringCaseOrBookingId: booking.id,
            matchedIdentifiers: {
              phone: customer?.verifiedMobile || '+91 98450 11223',
              email: customer?.email || 'customer@mail.in',
              kycOrPan: customer?.kycDocumentId || 'KYC-VERIFIED',
              bankOrPaymentFingerprint: customer?.paymentFingerprint || 'FP-VERIFIED',
              addressSnippet: booking.deliveryAddress,
            },
            evidenceSummary: `Enrolled directly from Dispute Resolution (FR-DSP-005 / FR-BLK-004): ${mediatorDecisionNotes}`,
            outstandingDuesAmount: excessDamageBalance,
            blockedAttemptsCount: 0,
            status: 'Active Blacklist',
            effectiveTimestamp: nowIST(),
            enrolledByActor: state.activePersona.name,
          });
        }

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'Completed',
                  returnRecord: b.returnRecord
                    ? {
                        ...b.returnRecord,
                        pickupStatus: 'Finalised',
                        approvedDeductionAmount: cappedDeduction,
                        customerResponse: 'Accepted',
                      }
                    : undefined,
                }
              : b
          ),
          depositLedgers: s.depositLedgers.map((d) =>
            d.bookingId === bookingId
              ? {
                  ...d,
                  approvedDeduction: cappedDeduction,
                  disputedAmount: 0,
                  netRefundableAmount: netRefund,
                  refundedAmount: netRefund,
                  refundStatus: 'Refund Processed',
                  refundProviderRef: `RZP_REFUND_${Math.floor(10000 + Math.random() * 89999)}`,
                  settlementDueDate: 'Completed & Reconciled (14-Day Vault SLA Met)',
                }
              : d
          ),
          disputeCases: s.disputeCases.map((c) =>
            c.bookingId === bookingId
              ? {
                  ...c,
                  status: 'Decided',
                  finalApprovedAmount: finalApprovedDeduction,
                  platformMediatorDecision: mediatorDecisionNotes,
                  severeViolationBlacklistTriggered: enrollCustomerInBlacklist,
                }
              : c
          ),
          invoices: [...newInvoices, ...s.invoices],
          blacklist: [...newBlacklistEntries, ...s.blacklist],
          customers: enrollCustomerInBlacklist
            ? s.customers.map((c) =>
                c.id === booking.customerId ? { ...c, status: 'Blacklisted / Watchlisted' } : c
              )
            : s.customers,
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: enrollCustomerInBlacklist ? 'FR-DSP-005 / FR-BLK-004' : 'FR-DEP-005 / FR-DSP-004',
              actionSummary: `Settled deposit for ${bookingId}: Deducted ₹${cappedDeduction}, Refunded ₹${netRefund}${enrollCustomerInBlacklist ? ' + Enrolled Client in Blacklist' : ''}`,
              affectedRecordId: bookingId,
              priorValue: `Held Deposit: ₹${ledger.collectedDeposit}`,
              newValue: `Net Refunded: ₹${netRefund} • Approved Deduction: ₹${cappedDeduction}`,
              mandatoryReason: mediatorDecisionNotes,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Deposit Settled: ₹${netRefund.toLocaleString('en-IN')} Refunded`,
          description: enrollCustomerInBlacklist
            ? 'Customer also enrolled into Unified Customer Blacklist (FR-DSP-005).'
            : 'Segregated deposit ledger balanced and closed (FR-DEP-002).',
          ruleCode: 'FR-DEP-005',
          variant: 'success',
        });
      },

      // ========================================================================
      // 11. Vendor Submits Staged Inventory Change (FR-INV-010, BR-030)
      // ========================================================================
      submitVendorStagedInventoryChange: async ({
        inventoryId,
        requestedPublicEnabled,
        requestedDeclaredStock,
        uploadedImageUrl,
        vendorNotes,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Staging Inventory Request for Platform Manager Approval...' });
        await simulateLatency(360);

        const inv = get().virtualInventory.find((i) => i.id === inventoryId);
        if (!inv) return;

        const reqType =
          requestedPublicEnabled !== inv.livePublicEnabled
            ? requestedPublicEnabled
              ? 'ENABLE_ITEM'
              : 'DISABLE_ITEM'
            : 'UPDATE_STOCK_AND_IMAGES';

        const stagedReqId = `STG-${Math.floor(910 + Math.random() * 89)}`;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          // CRITICAL BR-030 / FR-INV-010: Do NOT alter livePublicEnabled or live declaredQuantity!
          virtualInventory: s.virtualInventory.map((item) =>
            item.id === inventoryId
              ? {
                  ...item,
                  pendingStagedRequest: {
                    id: stagedReqId,
                    inventoryId: item.id,
                    vendorId: item.owningVendorId,
                    vendorName: item.owningVendorName,
                    requestType: reqType,
                    priorPublicEnabled: item.livePublicEnabled,
                    requestedPublicEnabled,
                    priorDeclaredStock: item.declaredQuantity,
                    requestedDeclaredStock,
                    uploadedImages: uploadedImageUrl
                      ? [uploadedImageUrl, ...item.itemImages]
                      : item.itemImages,
                    vendorNotes,
                    submittedAt: nowIST(),
                    status: 'Pending Admin Approval',
                  },
                }
              : item
          ),
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: 'FR-INV-010 / BR-030',
              title: `Vendor Staged Inventory Request (${stagedReqId})`,
              message: `${inv.owningVendorName} requested ${reqType} on "${inv.productTitle}". Live display remains unchanged pending your decision.`,
              recipientRole: 'PLATFORM_ADMIN',
              category: 'Inventory Approval',
              priority: 'high',
              read: false,
              timestamp: 'Just now',
              linkedView: 'ADMIN_GOVERNANCE',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'FR-INV-010 / BR-030',
              actionSummary: `Vendor submitted staged ${reqType} for ${inventoryId} (Live status untouched)`,
              affectedRecordId: `${inventoryId} / ${stagedReqId}`,
              priorValue: `Live Enabled: ${inv.livePublicEnabled} (Stock: ${inv.declaredQuantity})`,
              newValue: `Staged Request: Enabled=${requestedPublicEnabled}, Stock=${requestedDeclaredStock}`,
              mandatoryReason: vendorNotes,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Staged for Platform Manager Approval (FR-INV-010)',
          description:
            'Per BR-030, your change is saved in Pending Admin Approval and has NOT altered the live customer catalog yet.',
          ruleCode: 'BR-030',
          variant: 'info',
        });
      },

      // ========================================================================
      // 12. Platform Manager Resolves Staged Inventory OR Reassigns Source (FR-INV-009..011)
      // ========================================================================
      resolveStagedInventoryRequest: async ({
        inventoryId,
        decision,
        newSourceVendorId,
        adminReason,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Applying Platform Manager Inventory Governance...' });
        await simulateLatency(380);

        const state = get();
        const inv = state.virtualInventory.find((i) => i.id === inventoryId);
        if (!inv) return;

        if (decision === 'REASSIGN_SOURCE' && newSourceVendorId) {
          const newVendor = state.vendors.find((v) => v.id === newSourceVendorId);
          if (!newVendor) return;

          set((s) => ({
            isSimulatingLatency: false,
            latencyActionLabel: null,
            virtualInventory: s.virtualInventory.map((item) =>
              item.id === inventoryId
                ? {
                    ...item,
                    previousVendorSourceName: `${item.owningVendorName} (${item.owningVendorId})`,
                    owningVendorId: newVendor.id,
                    owningVendorName: newVendor.displayName,
                    livePublicEnabled: true, // Keeps item enabled on platform without interruption (WF-02 Option B)!
                    lastSourceChangedAt: nowIST(),
                    pendingStagedRequest: undefined,
                  }
                : item
            ),
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                timestamp: nowIST(),
                actorName: s.activePersona.name,
                actorRole: 'Platform Super Admin',
                moduleCode: 'FR-INV-011 / BR-031 / EX-034',
                actionSummary: `Reassigned inventory source for ${inv.productTitle} (${inv.id})`,
                affectedRecordId: inv.id,
                priorValue: `Source: ${inv.owningVendorName} (${inv.owningVendorId})`,
                newValue: `Source: ${newVendor.displayName} (${newVendor.id}) • Live: Enabled`,
                mandatoryReason: adminReason,
              },
              ...s.auditLogs,
            ],
          }));

          get().addToast({
            title: `Inventory Source Reassigned to ${newVendor.displayName}`,
            description:
              'Future bookings route to the new vendor source while existing active rentals retain their original vendor snapshot (FR-INV-011 / BR-031).',
            ruleCode: 'FR-INV-011',
            variant: 'success',
          });
          return;
        }

        if (decision === 'APPROVE' && inv.pendingStagedRequest) {
          const req = inv.pendingStagedRequest;
          const stockDiff = req.requestedDeclaredStock - inv.declaredQuantity;

          set((s) => ({
            isSimulatingLatency: false,
            latencyActionLabel: null,
            virtualInventory: s.virtualInventory.map((item) =>
              item.id === inventoryId
                ? {
                    ...item,
                    livePublicEnabled: req.requestedPublicEnabled,
                    declaredQuantity: req.requestedDeclaredStock,
                    availableQuantity: Math.max(0, item.availableQuantity + stockDiff),
                    itemImages: req.uploadedImages,
                    pendingStagedRequest: undefined,
                  }
                : item
            ),
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                timestamp: nowIST(),
                actorName: s.activePersona.name,
                actorRole: 'Platform Super Admin',
                moduleCode: 'FR-INV-009 / FR-INV-010',
                actionSummary: `Approved staged inventory update for ${inv.id}`,
                affectedRecordId: inv.id,
                priorValue: `Live Enabled: ${inv.livePublicEnabled}, Stock: ${inv.declaredQuantity}`,
                newValue: `Live Enabled: ${req.requestedPublicEnabled}, Stock: ${req.requestedDeclaredStock}`,
                mandatoryReason: adminReason,
              },
              ...s.auditLogs,
            ],
          }));

          get().addToast({
            title: 'Staged Inventory Update Approved & Live',
            description: `${inv.productTitle} is now ${req.requestedPublicEnabled ? 'ENABLED' : 'DISABLED'} on the live customer marketplace.`,
            ruleCode: 'FR-INV-009',
            variant: 'success',
          });
          return;
        }

        // REJECT
        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          virtualInventory: s.virtualInventory.map((item) =>
            item.id === inventoryId ? { ...item, pendingStagedRequest: undefined } : item
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-INV-010',
              actionSummary: `Rejected staged inventory request for ${inv.id}; live status unchanged`,
              affectedRecordId: inv.id,
              priorValue: 'Staged Request Pending',
              newValue: 'Rejected (Live State Preserved)',
              mandatoryReason: adminReason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Staged Inventory Request Rejected',
          description: 'Live platform status remains untouched and vendor has been notified with your reason.',
          ruleCode: 'FR-INV-010',
          variant: 'warning',
        });
      },

      // ========================================================================
      // 13. Update Master Platform Pricing & Rate Card (FR-PRC-001, BR-027)
      // ========================================================================
      updateMasterProductPricing: async ({
        productId,
        baseMonthlyRent,
        depositMonthsMultiple,
        siteVisitFee,
        copperPipeRate,
        reason,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Updating Master Platform Rate Card (BR-027)...' });
        await simulateLatency(340);

        const oldProd = get().masterProducts.find((p) => p.id === productId);
        if (!oldProd) return;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          masterProducts: s.masterProducts.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  baseMonthlyRent,
                  depositMonthsMultiple,
                  siteVisitFee,
                  installationRateCard:
                    copperPipeRate !== undefined
                      ? p.installationRateCard.map((rc) =>
                          rc.code === 'RC-PIPE-CU' ? { ...rc, ratePerUnit: copperPipeRate } : rc
                        )
                      : p.installationRateCard,
                }
              : p
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-PRC-001 / BR-027',
              actionSummary: `Updated master platform rate card for ${oldProd.title}`,
              affectedRecordId: productId,
              priorValue: `Rent: ₹${oldProd.baseMonthlyRent}/mo • Deposit: ${oldProd.depositMonthsMultiple}x`,
              newValue: `Rent: ₹${baseMonthlyRent}/mo • Deposit: ${depositMonthsMultiple}x • Visit: ₹${siteVisitFee}`,
              mandatoryReason: reason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Master Platform Rate Card Updated (BR-027)',
          description: 'New bookings will use the updated rate; existing accepted agreements retain their historical price snapshots (BR-006).',
          ruleCode: 'FR-PRC-001',
          variant: 'success',
        });
      },

      // ========================================================================
      // 14. Vendor Onboarding, Duplicate/Blacklist Check & Termination (FR-VEN-001..015)
      // ========================================================================
      submitNewVendorApplication: async (payload) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Cross-Checking Vendor Blacklist & Tax Identifiers (FR-VEN-002)...' });
        await simulateLatency(420);

        const state = get();
        // Cross-check against Vendor Blacklist (FR-VEN-002 / FR-BLK-003 / EX-031)
        const matchedBlacklist = state.blacklist.find(
          (b) =>
            b.ledgerType === 'VENDOR_BLACKLIST' &&
            (b.matchedIdentifiers.taxIdOrGstin?.toLowerCase() === payload.taxIdGstin.toLowerCase() ||
              b.matchedIdentifiers.kycOrPan?.toLowerCase() === payload.panNumber.toLowerCase() ||
              b.matchedIdentifiers.phone === payload.registeredPhone ||
              b.matchedIdentifiers.bankOrPaymentFingerprint.toLowerCase().includes(payload.bankAccountMasked.slice(-4).toLowerCase()))
        );

        const newVendorId = `VEN-${Math.floor(205 + Math.random() * 90)}`;
        const matchedFields: string[] = [];
        if (matchedBlacklist) {
          if (matchedBlacklist.matchedIdentifiers.taxIdOrGstin?.toLowerCase() === payload.taxIdGstin.toLowerCase()) {
            matchedFields.push(`GSTIN (${payload.taxIdGstin})`);
          }
          if (matchedBlacklist.matchedIdentifiers.kycOrPan?.toLowerCase() === payload.panNumber.toLowerCase()) {
            matchedFields.push(`PAN (${payload.panNumber})`);
          }
          if (matchedBlacklist.matchedIdentifiers.phone === payload.registeredPhone) {
            matchedFields.push(`Phone (${payload.registeredPhone})`);
          }
          matchedFields.push('Identifier Cross-Match (FR-BLK-003)');
        }

        const newVendor: VendorRecord = {
          id: newVendorId,
          legalBusinessName: payload.legalBusinessName,
          displayName: payload.displayName,
          taxIdGstin: payload.taxIdGstin,
          panNumber: payload.panNumber,
          registeredPhone: payload.registeredPhone,
          email: payload.email,
          authorisedContactName: payload.authorisedContactName,
          bankAccountMasked: payload.bankAccountMasked,
          serviceAreas: payload.serviceAreas.split(',').map((s) => s.trim()),
          categories: ['Living Room', 'Cooling & Air'],
          operatingHours: 'Mon–Sat • 09:00 AM – 07:00 PM',
          status: 'Submitted',
          agreementState: 'Draft',
          agreementVersion: 'PVA-v4.0-2026 (Includes Mandatory Doorstep Pickup Photo Clause)',
          agreementExpiryDate: '2027-10-28',
          mandatoryPickupPhotoClauseAccepted: true,
          blacklistMatchWarning: matchedBlacklist
            ? {
                matchedVendorId: matchedBlacklist.entityId,
                matchedVendorName: matchedBlacklist.entityName,
                matchedFields,
                priorTerminationReason: matchedBlacklist.evidenceSummary,
              }
            : undefined,
          settlementHoldAmount: 0,
          commissionRatePercent: 12,
          submittedAt: '2026-10-28',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          vendors: [newVendor, ...s.vendors],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: payload.authorisedContactName,
              actorRole: 'Vendor Applicant',
              moduleCode: matchedBlacklist ? 'FR-VEN-002 / FR-BLK-003 / EX-031' : 'FR-VEN-001',
              actionSummary: matchedBlacklist
                ? `Flagged vendor application ${newVendorId} (${payload.displayName}) — Blacklist Match Detected!`
                : `Submitted new vendor application ${newVendorId} (${payload.displayName})`,
              affectedRecordId: newVendorId,
              priorValue: 'New Application',
              newValue: matchedBlacklist ? 'Status: Submitted [BLACKLIST MATCH WARNING]' : 'Status: Submitted',
              mandatoryReason: 'Vendor onboarding submission.',
            },
            ...s.auditLogs,
          ],
        }));

        if (matchedBlacklist) {
          get().addToast({
            title: 'Blacklist Match — Terminated Vendor Detected! (FR-BLK-003)',
            description: `Application ${newVendorId} matched identifiers of ${matchedBlacklist.entityName}. Flagged for Super Admin review.`,
            ruleCode: 'EX-031',
            variant: 'error',
          });
        } else {
          get().addToast({
            title: `Vendor Application ${newVendorId} Submitted`,
            description: 'Awaiting Platform Administrator review and Platform–Vendor Agreement execution (FR-VEN-006).',
            ruleCode: 'FR-VEN-001',
            variant: 'success',
          });
        }
      },

      reviewVendorApplication: async (vendorId, decision, reason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Vendor Onboarding Decision...' });
        await simulateLatency(320);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          vendors: s.vendors.map((v) =>
            v.id === vendorId
              ? {
                  ...v,
                  status: decision,
                  agreementState: decision === 'Approved' ? 'Signed' : v.agreementState,
                  agreementSignedAt: decision === 'Approved' ? nowIST() : undefined,
                  decisionNotes: reason,
                }
              : v
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-VEN-004 / FR-VEN-006',
              actionSummary: `Marked vendor ${vendorId} as ${decision}`,
              affectedRecordId: vendorId,
              priorValue: 'Status: Submitted',
              newValue: `Status: ${decision}`,
              mandatoryReason: reason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Vendor ${vendorId}: ${decision}`,
          description: reason,
          ruleCode: 'FR-VEN-004',
          variant: decision === 'Approved' ? 'success' : 'warning',
        });
      },

      terminateVendorAndAssignContinuity: async (vendorId, continuityManager, reason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Executing Trading Cutoff, Settlement Hold & Blacklist Enrollment...' });
        await simulateLatency(420);

        const vendor = get().vendors.find((v) => v.id === vendorId);
        if (!vendor) return;

        const newBlacklistEntry: BlacklistEntry = {
          id: `BLK-V-${Date.now().toString().slice(-3)}`,
          ledgerType: 'VENDOR_BLACKLIST',
          entityId: vendor.id,
          entityName: `${vendor.legalBusinessName} (${vendor.authorisedContactName})`,
          categoryReason: 'Terminated Contract',
          triggeringCaseOrBookingId: `TERM-${vendor.id}`,
          matchedIdentifiers: {
            phone: vendor.registeredPhone,
            email: vendor.email,
            taxIdOrGstin: vendor.taxIdGstin,
            kycOrPan: vendor.panNumber,
            bankOrPaymentFingerprint: vendor.bankAccountMasked,
            addressSnippet: vendor.serviceAreas.join(', '),
          },
          evidenceSummary: `Auto-enrolled upon vendor termination initiation (FR-VEN-015 / FR-BLK-002): ${reason}`,
          outstandingDuesAmount: 35000,
          blockedAttemptsCount: 0,
          status: 'Active Blacklist',
          effectiveTimestamp: nowIST(),
          enrolledByActor: 'System Automatic Enrollment (FR-BLK-002)',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          vendors: s.vendors.map((v) =>
            v.id === vendorId
              ? {
                  ...v,
                  status: 'Terminating — Continuity Active',
                  agreementState: 'Terminated',
                  continuityManager,
                  settlementHoldAmount: 35000,
                  decisionNotes: reason,
                }
              : v
          ),
          // FR-VEN-010: Delist public listings unless reassigned
          virtualInventory: s.virtualInventory.map((inv) =>
            inv.owningVendorId === vendorId ? { ...inv, livePublicEnabled: false } : inv
          ),
          // FR-VEN-013: Place automated hold on pending settlements
          settlements: s.settlements.map((st) =>
            st.vendorId === vendorId && st.status !== 'Paid'
              ? {
                  ...st,
                  status: 'On Hold — Vendor Termination',
                  terminationHoldbackAmount: st.netVendorPayable,
                  netVendorPayable: 0,
                }
              : st
          ),
          blacklist: [newBlacklistEntry, ...s.blacklist],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-VEN-010..015 / FR-BLK-002',
              actionSummary: `Terminated vendor ${vendor.displayName}, assigned Continuity Manager (${continuityManager}), held payouts & enrolled in Vendor Blacklist`,
              affectedRecordId: vendorId,
              priorValue: `Status: ${vendor.status}`,
              newValue: 'Status: Terminating — Continuity Active • Enrolled in Vendor Blacklist',
              mandatoryReason: reason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Vendor ${vendor.displayName} Terminated & Blacklisted (FR-BLK-002)`,
          description: `Public listings delisted, payouts placed on escrow hold (FR-VEN-013), and Continuity Manager assigned.`,
          ruleCode: 'FR-VEN-015',
          variant: 'error',
        });
      },

      // ========================================================================
      // 15. Super Admin Blacklist Exception Override (FR-BLK-008)
      // ========================================================================
      overrideBlacklistEntry: async (blacklistId, overrideReason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Super Admin Exception Override (FR-BLK-008)...' });
        await simulateLatency(350);

        const entry = get().blacklist.find((b) => b.id === blacklistId);
        if (!entry) return;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          blacklist: s.blacklist.map((b) =>
            b.id === blacklistId
              ? {
                  ...b,
                  status: 'Whitelisted / Exception Override',
                  overrideHistory: {
                    overriddenByAdmin: s.activePersona.name,
                    overrideReason,
                    timestamp: nowIST(),
                  },
                }
              : b
          ),
          customers:
            entry.ledgerType === 'CUSTOMER_BLACKLIST'
              ? s.customers.map((c) =>
                  c.id === entry.entityId ? { ...c, status: 'Active' } : c
                )
              : s.customers,
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-BLK-008 / FR-ADM-004',
              actionSummary: `Approved Blacklist Exception Override for ${entry.entityName} (${entry.id})`,
              affectedRecordId: entry.id,
              priorValue: 'Status: Active Blacklist',
              newValue: 'Status: Whitelisted / Exception Override',
              mandatoryReason: overrideReason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Blacklist Exception Override Logged (FR-BLK-008)',
          description: `${entry.entityName} cleared with mandatory audit justification.`,
          ruleCode: 'FR-BLK-008',
          variant: 'success',
        });
      },

      overrideFlaggedBooking: async (bookingId, overrideReason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Clearing Flagged Booking Override...' });
        await simulateLatency(340);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status:
                    b.workflowType === 'SITE_VISIT_MULTI_STEP'
                      ? 'Awaiting Site Visit Payment'
                      : 'Awaiting Customer Agreement',
                  blacklistFlagReason: `Overridden by Super Admin (${s.activePersona.name}): ${overrideReason}`,
                }
              : b
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: 'FR-BLK-008',
              actionSummary: `Approved one-time booking override for flagged order ${bookingId}`,
              affectedRecordId: bookingId,
              priorValue: 'Status: Flagged — Blacklist Review',
              newValue: 'Status: Cleared for Checkout Progression',
              mandatoryReason: overrideReason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Booking ${bookingId} Override Approved`,
          description: 'Order released from Blacklist Review with immutable audit trail.',
          ruleCode: 'FR-BLK-008',
          variant: 'success',
        });
      },

      // ========================================================================
      // 16. Finance Vendor Settlement Approval (Segregation of Duties FR-SET-008)
      // ========================================================================
      approveAndReleaseVendorSettlement: async (settlementId) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Verifying Segregation of Duties & Executing Payout...' });
        await simulateLatency(380);

        const st = get().settlements.find((s) => s.id === settlementId);
        if (!st) return;

        const utr = `NEFT_UTR_HDFC261028${Math.floor(10000 + Math.random() * 89999)}`;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          settlements: s.settlements.map((item) =>
            item.id === settlementId
              ? {
                  ...item,
                  status: 'Paid',
                  approvedByActor: `${s.activePersona.name} (Verified Distinct Approver — FR-SET-008)`,
                  payoutReference: utr,
                }
              : item
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'FR-SET-005 / FR-SET-008',
              actionSummary: `Approved & released vendor settlement ${settlementId} (₹${st.netVendorPayable.toLocaleString('en-IN')})`,
              affectedRecordId: settlementId,
              priorValue: `Status: ${st.status} (Prepared by: ${st.preparedByActor})`,
              newValue: `Status: Paid (UTR: ${utr})`,
              mandatoryReason: 'Reconciled eligible customer collections less 12% platform commission.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Vendor Payout Executed: ₹${st.netVendorPayable.toLocaleString('en-IN')}`,
          description: `Segregation of duties verified (Preparer ≠ Approver). UTR: ${utr}`,
          ruleCode: 'FR-SET-008',
          variant: 'success',
        });
      },

      // ========================================================================
      // 17. Service Tickets, Asset Swap & Support Escalations (FR-SRV, FR-SUP, OBD)
      // ========================================================================
      createServiceTicket: async (bookingId, issueDescription, requestAssetSwap) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Logging Maintenance / Asset Swap Ticket...' });
        await simulateLatency(300);

        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        const ticketId = `SRV-2026-${Math.floor(310 + Math.random() * 90)}`;
        const newTicket: ServiceMaintenanceTicket = {
          id: ticketId,
          bookingId: booking.id,
          customerId: booking.customerId,
          customerName: booking.customerName,
          vendorId: booking.fulfillingVendorId,
          vendorName: booking.fulfillingVendorName,
          productTitle: booking.productTitle,
          currentAssetSerial: booking.allocatedSerial || 'SN-ALLOCATED-01',
          issueDescription,
          status: 'New',
          replacementRequested: requestAssetSwap,
          customerReplacementConsent: requestAssetSwap,
          downtimeCreditAmount: 0,
          createdAt: '2026-10-28',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          serviceTickets: [newTicket, ...s.serviceTickets],
        }));

        get().addToast({
          title: `Service Ticket ${ticketId} Created (FR-SRV-001)`,
          description: requestAssetSwap
            ? 'Asset replacement requested with customer consent recorded (FR-SRV-004).'
            : 'Assigned to fulfilling vendor service team.',
          ruleCode: 'FR-SRV-001',
          variant: 'success',
        });
      },

      executeVendorAssetReplacement: async (ticketId, replacementSerial) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Swapping Serialized Asset & Amending Agreement...' });
        await simulateLatency(340);

        const ticket = get().serviceTickets.find((t) => t.id === ticketId);
        if (!ticket) return;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          serviceTickets: s.serviceTickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: 'Resolved',
                  replacementAssetSerial: replacementSerial,
                  downtimeCreditAmount: 250,
                }
              : t
          ),
          bookings: s.bookings.map((b) =>
            b.id === ticket.bookingId ? { ...b, allocatedSerial: replacementSerial } : b
          ),
          agreements: s.agreements.map((a) =>
            a.bookingId === ticket.bookingId
              ? {
                  ...a,
                  allocatedSerialNumber: replacementSerial,
                  amendments: [
                    ...a.amendments,
                    {
                      id: `AMD-${Date.now()}`,
                      version: `v1.${a.amendments.length + 1} — Serialized Asset Swap Addendum`,
                      reason: `Replaced unit ${ticket.currentAssetSerial} with ${replacementSerial} under ticket ${ticket.id} (FR-SRV-004).`,
                      changedFieldsSummary: `Asset Serial updated: ${ticket.currentAssetSerial} → ${replacementSerial}`,
                      createdAt: nowIST(),
                      signedByCustomer: true,
                      signedAt: nowIST(),
                    },
                  ],
                }
              : a
          ),
        }));

        get().addToast({
          title: `Asset Swapped to ${replacementSerial} (FR-SRV-004)`,
          description: 'Agreement amended with new serial number and ₹250 downtime credit applied.',
          ruleCode: 'FR-SRV-004',
          variant: 'success',
        });
      },

      escalateSupportTicket: async (ticketId, resolutionOrEscalationNote) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Updating Support Ticket & SLA Log...' });
        await simulateLatency(280);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          supportTickets: s.supportTickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status:
                    s.activePersona.role === 'PLATFORM_ADMIN'
                      ? 'Resolved'
                      : 'Escalated to Platform Review',
                  resolutionSummary: resolutionOrEscalationNote,
                  publicCommunicationLog: [
                    ...t.publicCommunicationLog,
                    {
                      author: s.activePersona.name,
                      role: s.activePersona.roleBadge,
                      message: resolutionOrEscalationNote,
                      timestamp: nowIST(),
                    },
                  ],
                }
              : t
          ),
        }));

        get().addToast({
          title: 'Support Ticket Updated (FR-SUP-004)',
          description: resolutionOrEscalationNote,
          ruleCode: 'FR-SUP-004',
          variant: 'info',
        });
      },

      updateObdDecision: async (obdId, selectedOption) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Versioning Stakeholder OBD Policy...' });
        await simulateLatency(260);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          obdDecisions: s.obdDecisions.map((o) =>
            o.id === obdId ? { ...o, selectedOption, effectiveDate: '2026-10-28' } : o
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Super Admin',
              moduleCode: `FR-ADM-006 / ${obdId}`,
              actionSummary: `Updated Open Business Decision ${obdId} policy configuration`,
              affectedRecordId: obdId,
              priorValue: 'Prior Policy Version',
              newValue: selectedOption,
              mandatoryReason: 'Stakeholder workshop policy sign-off (Section 18).',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `${obdId} Policy Updated (FR-ADM-006)`,
          description: `Effective for new transactions; historical accepted transactions preserved.`,
          ruleCode: obdId,
          variant: 'success',
        });
      },
    }),
    {
      name: 'karorent-srs-v4-terracotta-hearth-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        customers: state.customers,
        vendors: state.vendors,
        masterProducts: state.masterProducts,
        virtualInventory: state.virtualInventory,
        bookings: state.bookings,
        agreements: state.agreements,
        invoices: state.invoices,
        depositLedgers: state.depositLedgers,
        disputeCases: state.disputeCases,
        serviceTickets: state.serviceTickets,
        supportTickets: state.supportTickets,
        settlements: state.settlements,
        blacklist: state.blacklist,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
        obdDecisions: state.obdDecisions,
      }),
    }
  )
);
