import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActivePersona,
  AuditLogEntry,
  BlacklistEntry,
  BookingOrder,
  CustomPayoutAdjustment,
  CustomerAccount,
  DefaultNoticeRecord,
  DefaultNoticeStage,
  DeliveryAssignment,
  DepositWaterfallSettlement,
  DisputeCaseRecord,
  FieldTechnician,
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
  VendorProductRateEntry,
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
  INITIAL_FIELD_TECHNICIANS,
  INITIAL_INVOICES,
  INITIAL_MASTER_PRODUCTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OBD_DECISIONS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_SETTLEMENTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_VENDOR_PRODUCT_RATES,
  INITIAL_VENDORS,
  INITIAL_VIRTUAL_INVENTORY,
} from '../data/mockData';
import { generateNotice1, generateNotice2, generateNotice3 } from '../lib/noticeTemplates';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  ruleCode?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

interface KaroRentState {
  darkMode: boolean;
  activeTab: NavigationTab;
  activePersona: ActivePersona;
  personas: ActivePersona[];
  isSimulatingLatency: boolean;
  latencyActionLabel: string | null;
  toasts: ToastMessage[];

  selectedLocation: string;
  searchQuery: string;
  selectedCategory: ProductCategory | 'All';
  selectedWorkflowFilter: 'ALL' | 'DIRECT_1_STEP' | 'SITE_VISIT_MULTI_STEP';
  selectedTenureMonths: 1 | 3 | 6 | 12 | 24;
  comparisonProductIds: string[];
  activeAgreementModalBookingId: string | null;
  activeCheckoutProductId: string | null;

  customers: CustomerAccount[];
  vendors: VendorRecord[];
  masterProducts: PlatformMasterProduct[];
  virtualInventory: VirtualInventoryItem[];
  vendorProductRates: VendorProductRateEntry[];
  fieldTechnicians: FieldTechnician[];
  bookings: BookingOrder[];
  agreements: RentalAgreementRecord[];
  invoices: FinancialInvoiceDocument[];
  depositLedgers: SegregatedDepositLedger[];
  disputeCases: DisputeCaseRecord[];
  serviceTickets: ServiceMaintenanceTicket[];
  supportTickets: SupportComplaintTicket[];
  settlements: VendorSettlementStatement[];
  customPayoutAdjustments: Record<string, CustomPayoutAdjustment[]>;
  vendorPayoutVerificationStatus: Record<string, 'DRAFT' | 'AWAITING_VENDOR' | 'VENDOR_AGREED' | 'SETTLED'>;
  blacklist: BlacklistEntry[];
  notifications: PlatformNotification[];
  auditLogs: AuditLogEntry[];
  obdDecisions: OpenBusinessDecisionItem[];

  toggleDarkMode: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  switchPersona: (personaId: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  setSelectedWorkflowFilter: (wf: 'ALL' | 'DIRECT_1_STEP' | 'SITE_VISIT_MULTI_STEP') => void;
  setSelectedTenureMonths: (months: 1 | 3 | 6 | 12 | 24) => void;
  toggleCompareProduct: (productId: string) => void;
  setActiveAgreementModalBookingId: (bookingId: string | null) => void;
  setActiveCheckoutProductId: (productId: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoState: () => void;

  loginWithMobile: (mobileNumber: string) => {
    success: boolean;
    message: string;
    persona?: ActivePersona;
  };

  addFieldTechnician: (payload: {
    fullName: string;
    phone: string;
    photoUrl: string;
    serviceAreas?: string[];
  }) => Promise<void>;

  assignTechnicianToTask: (payload: {
    taskId: string;
    taskType: 'DELIVERY' | 'SITE_VISIT' | 'PICKUP' | 'MAINTENANCE' | 'REPOSSESSION';
    technicianId: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    notes?: string;
  }) => Promise<void>;

  createBookingOrder: (payload: {
    productId: string;
    quantity: number;
    tenureMonths: 1 | 3 | 6 | 12 | 24;
    startDate: string;
    deliveryAddress: string;
  }) => Promise<{ bookingId: string; interceptedByBlacklist: boolean }>;

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

  respondToPostVisitQuote: (bookingId: string, decision: 'Accepted' | 'Rejected') => Promise<void>;
  signRentalAgreement: (bookingId: string, otpCode: string, signerAuthorityNote?: string) => Promise<void>;
  payInvoiceDocument: (invoiceId: string) => Promise<void>;
  completeDeliveryAndActivate: (bookingId: string, serialNumber: string, photoUrl: string) => Promise<void>;
  requestRentalRenewal: (bookingId: string, additionalMonths: 3 | 6) => Promise<void>;
  initiateReturnPickupRequest: (bookingId: string, preferredSlot: string) => Promise<void>;

  completeCustomerPremisePickupWithPhoto: (payload: {
    bookingId: string;
    photoUrl: string;
    exifTimestamp: string;
    geoTag: string;
  }) => Promise<void>;

  submitWarehouseInspection: (payload: {
    bookingId: string;
    warehousePhotoUrl: string;
    finding: 'Normal Wear' | 'Customer Damage' | 'Transit Damage (Vendor Fault)' | 'Missing Accessory' | 'Severe Damage / Loss';
    findingDescription: string;
    proposedDeduction: number;
    wasPresentInDoorstepPickupPhoto: boolean;
  }) => Promise<void>;

  customerDisputeInspectionFinding: (bookingId: string, disputeReason: string) => Promise<void>;

  resolveDisputeAndSettleDeposit: (payload: {
    bookingId: string;
    finalApprovedDeduction: number;
    mediatorDecisionNotes: string;
    enrollCustomerInBlacklist: boolean;
  }) => Promise<void>;

  submitVendorStagedInventoryChange: (payload: {
    inventoryId: string;
    requestedPublicEnabled: boolean;
    requestedDeclaredStock: number;
    uploadedImageUrl?: string;
    vendorNotes: string;
  }) => Promise<void>;

  resolveStagedInventoryRequest: (payload: {
    inventoryId: string;
    decision: 'APPROVE' | 'REJECT' | 'REASSIGN_SOURCE';
    newSourceVendorId?: string;
    adminReason: string;
  }) => Promise<void>;

  updateMasterProductPricing: (payload: {
    productId: string;
    baseMonthlyRent: number;
    depositMonthsMultiple: number;
    siteVisitFee: number;
    copperPipeRate?: number;
    reason: string;
  }) => Promise<void>;

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

  registerNewVendorProduct: (payload: {
    productTitle: string;
    category: ProductCategory;
    agreedMonthlyRate: number;
    declaredQuantity: number;
    conditionGrade: 'Brand New' | 'Certified Mint' | 'Good — Refurbished';
    serviceLocation: string;
    imageUrl: string;
    vendorNotes: string;
  }) => Promise<void>;

  reviewVendorApplication: (vendorId: string, decision: 'Approved' | 'Rejected' | 'Clarification Required', reason: string) => Promise<void>;
  terminateVendorAndAssignContinuity: (vendorId: string, continuityManager: string, reason: string) => Promise<void>;
  overrideBlacklistEntry: (blacklistId: string, overrideReason: string) => Promise<void>;
  overrideFlaggedBooking: (bookingId: string, overrideReason: string) => Promise<void>;
  approveAndReleaseVendorSettlement: (settlementId: string) => Promise<void>;
  addCustomPayoutAdjustment: (payload: { vendorId: string; description: string; amount: number }) => Promise<void>;
  removeCustomPayoutAdjustment: (payload: { vendorId: string; adjustmentId: string }) => Promise<void>;
  sendPayoutForVendorVerification: (vendorId: string) => Promise<void>;
  vendorAgreeToPayout: (vendorId: string) => Promise<void>;
  settleAndReleaseVendorPayout: (payload: { vendorId: string; netAmount: number; periodLabel?: string }) => Promise<void>;
  createServiceTicket: (bookingId: string, issueDescription: string, requestAssetSwap: boolean) => Promise<void>;
  executeVendorAssetReplacement: (ticketId: string, replacementSerial: string) => Promise<void>;
  escalateSupportTicket: (ticketId: string, resolutionOrEscalationNote: string) => Promise<void>;
  updateObdDecision: (obdId: string, selectedOption: string) => Promise<void>;
  triggerDefaultNotice: (payload: {
    bookingId: string;
    invoiceId: string;
    targetStage: 1 | 2 | 3;
    scheduledRepossessionDate?: string;
    scheduledRepossessionTimeWindow?: string;
  }) => Promise<void>;
  curePaymentDefault: (payload: {
    bookingId: string;
    invoiceId: string;
  }) => Promise<void>;
  assignRepossessionTask: (payload: {
    bookingId: string;
    technicianId: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    notes?: string;
  }) => Promise<void>;
  completeRepossessionHandover: (payload: {
    bookingId: string;
    photoUrl: string;
    notes?: string;
  }) => Promise<void>;
  reportRepossessionObstruction: (payload: {
    bookingId: string;
    refusalReason: string;
    evidencePhotoUrl?: string;
  }) => Promise<void>;
  executeDepositWaterfallSettlement: (payload: {
    bookingId: string;
    unpaidBaseRent: number;
    logisticsDeinstallationFee: number;
    verifiedDamageFee: number;
    contractualLateFees: number;
    mediatorNotes: string;
  }) => Promise<void>;
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
      selectedTenureMonths: 1,
      comparisonProductIds: [],
      activeAgreementModalBookingId: null,
      activeCheckoutProductId: null,

      customers: INITIAL_CUSTOMERS,
      vendors: INITIAL_VENDORS,
      masterProducts: INITIAL_MASTER_PRODUCTS,
      virtualInventory: INITIAL_VIRTUAL_INVENTORY,
      vendorProductRates: INITIAL_VENDOR_PRODUCT_RATES,
      fieldTechnicians: INITIAL_FIELD_TECHNICIANS,
      bookings: INITIAL_BOOKINGS,
      agreements: INITIAL_AGREEMENTS,
      invoices: INITIAL_INVOICES,
      depositLedgers: INITIAL_DEPOSIT_LEDGERS,
      disputeCases: INITIAL_DISPUTE_CASES,
      serviceTickets: INITIAL_SERVICE_TICKETS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      settlements: INITIAL_SETTLEMENTS,
      customPayoutAdjustments: {},
      vendorPayoutVerificationStatus: {},
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
          title: `Switched Account: ${found.name}`,
          description: `${found.roleBadge} (${found.subtitle})`,
          variant: 'info',
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
              description: 'You can compare up to 3 products side by side.',
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
          vendorProductRates: INITIAL_VENDOR_PRODUCT_RATES,
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
          title: 'Demo Data Reset',
          description: 'All catalogs, bookings, invoices, and ledgers have been restored to their initial state.',
          variant: 'info',
        });
      },

      createBookingOrder: async ({ productId, quantity, tenureMonths, startDate, deliveryAddress }) => {
        const state = get();
        if (state.isSimulatingLatency) {
          throw new Error('Duplicate submission prevented.');
        }
        set({ isSimulatingLatency: true, latencyActionLabel: 'Checking Account Eligibility, Stock & Generating Invoices...' });
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
            blacklistFlagReason: `Account matches an active Trust & Safety Registry record (${matchingBlacklist?.id || 'Watchlist'}) for ${matchingBlacklist?.categoryReason || 'Prior Default'}. Stock allocation and partner dispatch are paused pending Administrator review.`,
            agreementId,
            createdAt: '2026-10-28',
          };

          const auditEntry: AuditLogEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: nowIST(),
            actorName: customer.fullName,
            actorRole: persona.roleBadge,
            moduleCode: 'Risk Protection',
            actionSummary: `Intercepted booking attempt ${bookingId} by watchlisted client`,
            affectedRecordId: bookingId,
            priorValue: 'Pre-Confirmation Check',
            newValue: 'Status: Flagged — Blacklist Review (Stock Not Allocated)',
            mandatoryReason: 'Automatic cross-booking risk protection.',
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
                eventCode: 'Risk Alert',
                title: `Booking ${bookingId} Held for Risk Review`,
                message: `${customer.fullName} attempted to book ${product.title}. Held for Administrator review.`,
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
            title: `Order Received: ${bookingId}`,
            description: `Your rental request for ${product.title} has been received and is being processed.`,
            variant: 'success',
          });

          return { bookingId, interceptedByBlacklist: true };
        }

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
          reservationHoldExpiresAt: '15:00 mins (Reservation Hold Active)',
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
              ? 'KaroRent Commercial Corporate Lease (2026 Edition)'
              : 'KaroRent Standard Residential Lease (2026 Edition)',
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
            'Doorstep Handover Protection: Pickup staff must capture a verified timestamped photo at customer premises before return removal.',
          amendments: [],
        };

        const newInvoices: FinancialInvoiceDocument[] = [];
        if (isMultiStep) {
          newInvoices.push({
            id: `INV-SV-${bookingId.slice(9)}`,
            bookingId,
            customerId: customer.id,
            customerName: newBooking.customerName,
            vendorId: inventory.owningVendorId,
            chargeType: 'SITE_VISIT_INVOICE',
            title: `Home Measurement Visit — ${product.title}`,
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
              title: `Delivery & Setup Charges`,
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
              title: `Monthly Rent — Month 1 of ${tenureMonths}`,
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
              title: `Refundable Security Deposit`,
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
              moduleCode: 'Booking Created',
              actionSummary: `Created booking ${bookingId} with temporary stock reservation`,
              affectedRecordId: bookingId,
              priorValue: `Available Stock: ${inventory.availableQuantity}`,
              newValue: `Reserved: ${quantity} unit(s) • Status: ${initialStatus}`,
              mandatoryReason: 'Customer checkout submission.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Booking ${bookingId} Reserved`,
          description: isMultiStep
            ? `Pay the ₹${product.siteVisitFee} Home Measurement Visit Invoice to schedule your technician visit.`
            : `Please review and sign your digital rental agreement to proceed.`,
          variant: 'success',
        });

        return { bookingId, interceptedByBlacklist: false };
      },

      submitSiteVisitMetrics: async (payload) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Calculating Rate-Card Final Quote...' });
        await simulateLatency(380);

        const state = get();
        const booking = state.bookings.find((b) => b.id === payload.bookingId);
        if (!booking) return;

        const extraPipeMeters = Math.max(0, payload.measuredCopperPipeMeters - 3);
        const pipeCharge = Math.round(extraPipeMeters * 850);
        const bracketCharge = payload.outdoorBracketRequired ? 750 : 0;
        const coreCutCharge = payload.coreCuttingRequired ? 500 : 0;
        const extraDrainMeters = Math.max(0, payload.drainageExtensionMeters - 2);
        const drainCharge = Math.round(extraDrainMeters * 180);
        const totalMaterialCharges = pipeCharge + bracketCharge + coreCutCharge + drainCharge;

        if (!payload.feasible) {
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
                actorRole: 'Field Specialist',
                moduleCode: 'Site Assessment',
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
            title: 'Site Unfeasible — Booking Cancelled',
            description: 'Inventory hold released. Customer is not charged rental or security deposit.',
            variant: 'warning',
          });
          return;
        }

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
            title: `Delivery & Installation Charges (${payload.measuredCopperPipeMeters}m Pipe)`,
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
            title: `Monthly Rent — Month 1 of ${booking.tenureMonths}`,
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
            title: `Refundable Security Deposit`,
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
                      reason: `Measured ${payload.measuredCopperPipeMeters}m copper pipe + installation accessories via Standard Rate Card.`,
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
              actorRole: 'Field Specialist',
              moduleCode: 'Site Assessment',
              actionSummary: `Recorded site visit metrics for ${booking.id}; calculated ₹${totalMaterialCharges} material charges`,
              affectedRecordId: booking.id,
              priorValue: 'Status: Site Visit Scheduled',
              newValue: `Status: Final Bill Sent (Material Fee: ₹${totalMaterialCharges})`,
              mandatoryReason: payload.technicianNotes,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Home Measurement Logged & Final Quote Sent',
          description: `Calculated ₹${totalMaterialCharges.toLocaleString('en-IN')} from the Platform Rate Card and generated itemised invoices.`,
          variant: 'success',
        });
      },

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
            title: 'Post-Visit Quote Declined',
            description: 'Booking cancelled without charging rental or security deposit. Inventory hold released.',
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
          title: 'Final Transparent Quote Accepted',
          description: 'Please e-sign the updated Rental Agreement to proceed.',
          variant: 'success',
        });
      },

      signRentalAgreement: async (bookingId, otpCode, signerAuthorityNote) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Sealing Digital E-Signature & Consent...' });
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
              moduleCode: 'Digital E-Sign',
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
          title: 'Rental Agreement E-Signed & Sealed',
          description: 'Verified copy generated with OTP verification stamp.',
          variant: 'success',
        });
      },

      payInvoiceDocument: async (invoiceId) => {
        const state = get();
        const inv = state.invoices.find((i) => i.id === invoiceId);
        if (!inv || inv.paymentState === 'Successful') {
          get().addToast({
            title: 'Already Paid',
            description: 'This invoice is already reconciled as Paid. Duplicate charge prevented.',
            variant: 'info',
          });
          return;
        }

        set({ isSimulatingLatency: true, latencyActionLabel: `Reconciling Payment for ${inv.id}...` });
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
            customers: s.customers.map((c) => {
              if (c.id !== inv.customerId) return c;
              if (c.status === 'Restricted') {
                const hasOtherOverdue = updatedInvoices.some(
                  (other) =>
                    other.customerId === c.id &&
                    other.id !== inv.id &&
                    (other.overdueStage === 'NOTICE_2' || other.overdueStage === 'NOTICE_1') &&
                    other.paymentState !== 'Successful'
                );
                if (!hasOtherOverdue) {
                  return { ...c, status: 'Active' as const };
                }
              }
              return c;
            }),
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
              if (b.status === 'Payment Overdue') {
                return { ...b, status: 'Delivered & Active' as const };
              }
              if (allPaid && b.status !== 'Delivered & Active' && b.status !== 'Return Requested' && b.status !== 'Returned & Closed') {
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
                moduleCode: 'Billing & Vault',
                actionSummary: `Reconciled payment of ₹${inv.totalPayable.toLocaleString('en-IN')} for ${inv.id}`,
                affectedRecordId: inv.id,
                priorValue: 'Payment: Pending',
                newValue: `Payment: Successful (Ref: ${providerRef})`,
                mandatoryReason: 'Verified payment gateway confirmation.',
              },
              ...s.auditLogs,
            ],
          };
        });

        get().addToast({
          title: `Payment Confirmed: ₹${inv.totalPayable.toLocaleString('en-IN')}`,
          description: `Transaction Reference ${providerRef} linked to ${inv.bookingId}.`,
          variant: 'success',
        });
      },

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
              actorRole: 'Field Specialist',
              moduleCode: 'Delivery & Setup',
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
          title: `Rental ${bookingId} Activated`,
          description: `Asset ${serialNumber} delivered and acknowledged at customer premises.`,
          variant: 'success',
        });
      },

      requestRentalRenewal: async (bookingId, additionalMonths) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Checking Availability & Extending Tenure...' });
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
                      reason: `Customer requested ${additionalMonths}-month renewal extension.`,
                      changedFieldsSummary: `Extended rental tenure by +${additionalMonths} months at locked Platform Rate.`,
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
          title: `Rental Extended by +${additionalMonths} Months`,
          description: 'Agreement addendum generated and return due date updated.',
          variant: 'success',
        });
      },

      initiateReturnPickupRequest: async (bookingId, preferredSlot) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Scheduling Return Pickup...' });
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
          title: 'Return Pickup Scheduled',
          description: `Field specialist assigned for ${preferredSlot}. Doorstep photo verification gate is active.`,
          variant: 'info',
        });
      },

      completeCustomerPremisePickupWithPhoto: async ({ bookingId, photoUrl, exifTimestamp, geoTag }) => {
        if (!photoUrl || !exifTimestamp) {
          get().addToast({
            title: 'Pickup Status Locked',
            description: 'Cannot mark return as Picked Up without a verified timestamped photo at the customer premises.',
            variant: 'error',
          });
          return;
        }

        set({ isSimulatingLatency: true, latencyActionLabel: 'Verifying Doorstep Timestamp & Unlocking Picked Up Status...' });
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
                    customerPremisePickupPhotos: Array.from(
                      new Set([
                        photoUrl,
                        ...(b.returnRecord.customerPremisePickupPhotos || []),
                      ])
                    ),
                    pickupPhotoExifTimestamp: `${exifTimestamp} [GPS: ${geoTag} Verified]`,
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
              actorRole: 'Field Specialist',
              moduleCode: 'Return Handover',
              actionSummary: `Captured mandatory doorstep pickup photo for ${bookingId}; unlocked Picked Up state`,
              affectedRecordId: bookingId,
              priorValue: 'Return: Scheduled (Pickup Gate Locked)',
              newValue: `Return: Picked Up (Timestamp: ${exifTimestamp})`,
              mandatoryReason: 'Doorstep handover photo evidence captured.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Doorstep Pickup Photo Verified',
          description: 'Status transitioned to Picked Up — Under Inspection. Ready for 3-Way Comparison.',
          variant: 'success',
        });
      },

      submitWarehouseInspection: async ({
        bookingId,
        warehousePhotoUrl,
        finding,
        findingDescription,
        proposedDeduction,
        wasPresentInDoorstepPickupPhoto,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Running Three-Way Evidence Comparison...' });
        await simulateLatency(400);

        const blockedByDoorstepProtection =
          proposedDeduction > 0 &&
          (finding === 'Transit Damage (Vendor Fault)' || !wasPresentInDoorstepPickupPhoto);

        const effectiveProposedDeduction = blockedByDoorstepProtection ? 0 : proposedDeduction;

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
                    warehouseReturnPhotos: Array.from(
                      new Set([
                        warehousePhotoUrl,
                        ...(b.returnRecord.warehouseReturnPhotos || []),
                      ])
                    ),
                    warehouseInspectionFinding: blockedByDoorstepProtection
                      ? 'Transit Damage (Vendor Fault)'
                      : finding,
                    findingDescription: blockedByDoorstepProtection
                      ? `${findingDescription} — [DOORSTEP HANDOVER PROTECTION: Damage was NOT visible in the verified doorstep pickup photo. Presumed transit damage; ₹${proposedDeduction} deduction blocked against customer deposit.]`
                      : findingDescription,
                    proposedDeductionAmount: effectiveProposedDeduction,
                    approvedDeductionAmount: 0,
                    transitDamageBlockedByBR026: blockedByDoorstepProtection,
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
                  settlementDueDate: '2026-11-11 (14 Days Post-Settlement)',
                }
              : d
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: '3-Way Inspection',
              actionSummary: blockedByDoorstepProtection
                ? `Doorstep Photo Protection blocked ₹${proposedDeduction} transit damage claim on ${bookingId}`
                : `Recorded 3-way inspection for ${bookingId} (${finding})`,
              affectedRecordId: bookingId,
              priorValue: `Proposed: ₹${proposedDeduction}`,
              newValue: `Effective Proposed Deduction: ₹${effectiveProposedDeduction}`,
              mandatoryReason: findingDescription,
            },
            ...s.auditLogs,
          ],
        }));

        if (blockedByDoorstepProtection) {
          get().addToast({
            title: 'Customer Protected (Transit Damage Blocked)',
            description: `Because the damage was not present in the doorstep pickup photo, ₹${proposedDeduction.toLocaleString('en-IN')} cannot be deducted from the customer's deposit.`,
            variant: 'warning',
          });
        } else {
          get().addToast({
            title: '3-Way Inspection Recorded',
            description:
              effectiveProposedDeduction > 0
                ? `Proposed deduction of ₹${effectiveProposedDeduction.toLocaleString('en-IN')} sent to customer with dispute option.`
                : 'Zero deduction! Full deposit scheduled for refund within 14 days.',
            variant: 'success',
          });
        }
      },

      customerDisputeInspectionFinding: async (bookingId, disputeReason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Opening Dispute Case & Freezing Deduction...' });
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
          policyClauseCited: 'Customer Inspection Dispute & Deposit Hold',
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
          title: `Dispute Case ${caseId} Opened`,
          description: 'Proposed deduction is frozen and cannot be deducted while under Mediator review.',
          variant: 'warning',
        });
      },

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
            title: `5. Post-Return Unrecovered Damage Balance Invoice (Exceeds Collected Deposit)`,
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
            evidenceSummary: `Enrolled from Dispute Resolution: ${mediatorDecisionNotes}`,
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
                  settlementDueDate: 'Completed & Reconciled (14-Day Vault Guarantee Met)',
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
              moduleCode: 'Deposit Settlement',
              actionSummary: `Settled deposit for ${bookingId}: Deducted ₹${cappedDeduction}, Refunded ₹${netRefund}${enrollCustomerInBlacklist ? ' + Added Client to Risk Registry' : ''}`,
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
            ? 'Customer also enrolled into the Trust & Risk Registry.'
            : 'Segregated deposit vault ledger balanced and closed.',
          variant: 'success',
        });
      },

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
              eventCode: 'Catalog Staging',
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
              moduleCode: 'Inventory Staging',
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
          title: 'Staged for Platform Manager Approval',
          description:
            'Your change is saved in Pending Admin Approval and will update the live customer catalog once approved.',
          variant: 'info',
        });
      },

      resolveStagedInventoryRequest: async ({
        inventoryId,
        decision,
        newSourceVendorId,
        adminReason,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Applying Catalog Governance Decision...' });
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
                    livePublicEnabled: true,
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
                actorRole: 'Platform Administrator',
                moduleCode: 'Source Routing',
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
              'Future bookings route to the new partner vendor while existing active rentals retain their original vendor snapshot.',
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
                actorRole: 'Platform Administrator',
                moduleCode: 'Catalog Approval',
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
            variant: 'success',
          });
          return;
        }

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
              actorRole: 'Platform Administrator',
              moduleCode: 'Catalog Review',
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
          title: 'Staged Inventory Request Declined',
          description: 'Live platform status remains untouched and the partner vendor has been notified.',
          variant: 'warning',
        });
      },

      updateMasterProductPricing: async ({
        productId,
        baseMonthlyRent,
        depositMonthsMultiple,
        siteVisitFee,
        copperPipeRate,
        reason,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Updating Master Platform Rate Card...' });
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
              actorRole: 'Platform Administrator',
              moduleCode: 'Master Rate Card',
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
          title: 'Master Platform Rate Card Updated',
          description: 'New bookings will use the updated rate; existing signed agreements retain their original price snapshots.',
          variant: 'success',
        });
      },

      submitNewVendorApplication: async (payload) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Cross-Checking Vendor Risk Registry & Tax Identifiers...' });
        await simulateLatency(420);

        const state = get();
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
          matchedFields.push('Identifier Cross-Match');
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
          agreementVersion: 'Partner Vendor Master Agreement (2026 Edition)',
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
              moduleCode: matchedBlacklist ? 'Vendor Risk Match' : 'Vendor Onboarding',
              actionSummary: matchedBlacklist
                ? `Flagged vendor application ${newVendorId} (${payload.displayName}) — Terminated Vendor Match!`
                : `Submitted new vendor application ${newVendorId} (${payload.displayName})`,
              affectedRecordId: newVendorId,
              priorValue: 'New Application',
              newValue: matchedBlacklist ? 'Status: Submitted [RISK MATCH WARNING]' : 'Status: Submitted',
              mandatoryReason: 'Vendor onboarding submission.',
            },
            ...s.auditLogs,
          ],
        }));

        if (matchedBlacklist) {
          get().addToast({
            title: 'Risk Registry Match — Terminated Vendor Detected!',
            description: `Application ${newVendorId} matched identifiers of ${matchedBlacklist.entityName}. Flagged for Administrator review.`,
            variant: 'error',
          });
        } else {
          get().addToast({
            title: `Vendor Application ${newVendorId} Submitted`,
            description: 'Awaiting Platform Administrator review and Partner Agreement execution.',
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
              actorRole: 'Platform Administrator',
              moduleCode: 'Vendor Review',
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
          variant: decision === 'Approved' ? 'success' : 'warning',
        });
      },

      terminateVendorAndAssignContinuity: async (vendorId, continuityManager, reason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Executing Trading Cutoff, Settlement Hold & Registry Enrollment...' });
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
          evidenceSummary: `Auto-enrolled upon vendor termination initiation: ${reason}`,
          outstandingDuesAmount: 35000,
          blockedAttemptsCount: 0,
          status: 'Active Blacklist',
          effectiveTimestamp: nowIST(),
          enrolledByActor: 'System Automatic Enrollment',
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
          virtualInventory: s.virtualInventory.map((inv) =>
            inv.owningVendorId === vendorId ? { ...inv, livePublicEnabled: false } : inv
          ),
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
              actorRole: 'Platform Administrator',
              moduleCode: 'Vendor Termination',
              actionSummary: `Terminated vendor ${vendor.displayName}, assigned Continuity Manager (${continuityManager}), held payouts & enrolled in Risk Registry`,
              affectedRecordId: vendorId,
              priorValue: `Status: ${vendor.status}`,
              newValue: 'Status: Terminating — Continuity Active • Enrolled in Risk Registry',
              mandatoryReason: reason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Vendor ${vendor.displayName} Terminated`,
          description: `Public listings delisted, payouts placed on escrow hold, and Continuity Manager assigned.`,
          variant: 'error',
        });
      },

      overrideBlacklistEntry: async (blacklistId, overrideReason) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Administrator Exception Override...' });
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
              actorRole: 'Platform Administrator',
              moduleCode: 'Risk Override',
              actionSummary: `Approved Exception Override for ${entry.entityName} (${entry.id})`,
              affectedRecordId: entry.id,
              priorValue: 'Status: Active Blacklist',
              newValue: 'Status: Whitelisted / Exception Override',
              mandatoryReason: overrideReason,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Exception Override Logged',
          description: `${entry.entityName} cleared with documented justification.`,
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
                  blacklistFlagReason: `Overridden by Administrator (${s.activePersona.name}): ${overrideReason}`,
                }
              : b
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: 'Platform Administrator',
              moduleCode: 'Risk Override',
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
          description: 'Order released for checkout progression with audit trail.',
          variant: 'success',
        });
      },

      approveAndReleaseVendorSettlement: async (settlementId) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Verifying Dual-Control Approval & Executing Payout...' });
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
                  approvedByActor: `${s.activePersona.name} (Verified Dual-Control Approver)`,
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
              moduleCode: 'Vendor Payouts',
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
          description: `Dual-control approval verified (Preparer ≠ Approver). UTR: ${utr}`,
          variant: 'success',
        });
      },

      addCustomPayoutAdjustment: async ({ vendorId, description, amount }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Custom Adjustment...' });
        await simulateLatency(250);
        const adj: CustomPayoutAdjustment = {
          id: `ADJ-${Date.now()}`,
          description,
          amount,
          addedBy: get().activePersona.name,
          createdAt: nowIST(),
        };
        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          customPayoutAdjustments: {
            ...s.customPayoutAdjustments,
            [vendorId]: [...(s.customPayoutAdjustments[vendorId] || []), adj],
          },
          vendorPayoutVerificationStatus: {
            ...s.vendorPayoutVerificationStatus,
            [vendorId]: 'DRAFT',
          },
        }));
        get().addToast({
          title: 'Custom Adjustment Added',
          description: `${description} (${amount >= 0 ? '+' : ''}₹${amount.toLocaleString('en-IN')}) added to possible payouts.`,
          variant: 'success',
        });
      },

      removeCustomPayoutAdjustment: async ({ vendorId, adjustmentId }) => {
        set((s) => ({
          customPayoutAdjustments: {
            ...s.customPayoutAdjustments,
            [vendorId]: (s.customPayoutAdjustments[vendorId] || []).filter((a) => a.id !== adjustmentId),
          },
        }));
      },

      sendPayoutForVendorVerification: async (vendorId) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Sending Payout Statement to Partner for Verification...' });
        await simulateLatency(350);
        const vendor = get().vendors.find((v) => v.id === vendorId);
        const vName = vendor?.displayName || vendorId;
        const ntf: PlatformNotification = {
          id: `NTF-${Date.now()}`,
          eventCode: 'Payout Verification Required',
          title: 'Payout Statement Ready for Review',
          message: `Platform has submitted the current monthly payout statement (including custom adjustments) for ${vName}. Please review and agree.`,
          recipientRole: 'VENDOR_OWNER',
          vendorScopeId: vendorId,
          category: 'Deposit & Billing',
          priority: 'high',
          read: false,
          timestamp: 'Just now',
          linkedView: 'SETTLEMENTS_FINANCE',
        };
        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          vendorPayoutVerificationStatus: {
            ...s.vendorPayoutVerificationStatus,
            [vendorId]: 'AWAITING_VENDOR',
          },
          notifications: [ntf, ...s.notifications],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Vendor Payouts',
              actionSummary: `Dispatched payout verification statement to vendor ${vName} (${vendorId})`,
              affectedRecordId: vendorId,
              priorValue: 'Status: Draft',
              newValue: 'Status: Awaiting Vendor Verification',
              mandatoryReason: 'Dual-control payout reconciliation with partner agreement.',
            },
            ...s.auditLogs,
          ],
        }));
        get().addToast({
          title: 'Sent for Vendor Verification',
          description: `Statement sent to ${vName}. Payout can be settled once vendor agrees.`,
          variant: 'info',
        });
      },

      vendorAgreeToPayout: async (vendorId) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Verifying & Agreeing to Payout Statement...' });
        await simulateLatency(350);
        const vendor = get().vendors.find((v) => v.id === vendorId);
        const vName = vendor?.displayName || vendorId;
        const ntf: PlatformNotification = {
          id: `NTF-${Date.now()}`,
          eventCode: 'Payout Agreed',
          title: `Partner Agreed to Payout: ${vName}`,
          message: `${vName} has verified and agreed to the payout statement. Ready for final settlement.`,
          recipientRole: 'PLATFORM_ADMIN',
          category: 'Deposit & Billing',
          priority: 'high',
          read: false,
          timestamp: 'Just now',
          linkedView: 'SETTLEMENTS_FINANCE',
        };
        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          vendorPayoutVerificationStatus: {
            ...s.vendorPayoutVerificationStatus,
            [vendorId]: 'VENDOR_AGREED',
          },
          notifications: [ntf, ...s.notifications],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Vendor Payouts',
              actionSummary: `Vendor ${vName} (${vendorId}) verified and agreed to payout statement.`,
              affectedRecordId: vendorId,
              priorValue: 'Status: Awaiting Vendor Verification',
              newValue: 'Status: Vendor Agreed',
              mandatoryReason: 'Partner confirmed aggregated rental units and adjustments.',
            },
            ...s.auditLogs,
          ],
        }));
        get().addToast({
          title: 'Payout Verified & Agreed',
          description: 'You have agreed to this payout statement. Platform operator will now settle the payout.',
          variant: 'success',
        });
      },

      settleAndReleaseVendorPayout: async ({ vendorId, netAmount, periodLabel = 'October 2026 Billing Cycle' }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Finalizing Payout Settlement & Disbursing Funds...' });
        await simulateLatency(400);

        const state = get();
        const vendor = state.vendors.find((v) => v.id === vendorId);
        const vName = vendor?.displayName || vendorId;
        const utr = `NEFT_UTR_HDFC261028${Math.floor(10000 + Math.random() * 89999)}`;
        const customAdjs = state.customPayoutAdjustments[vendorId] || [];

        const newStatement: VendorSettlementStatement = {
          id: `SET-2026-${Math.floor(200 + Math.random() * 800)}`,
          vendorId,
          vendorName: vName,
          periodLabel,
          grossEligibleCollections: netAmount,
          platformCommissionPercent: 0,
          platformCommissionFee: 0,
          refundsAndChargebacks: 0,
          damageRecoveryCredit: 0,
          terminationHoldbackAmount: 0,
          netVendorPayable: netAmount,
          status: 'Paid',
          preparedByActor: 'Platform Financial Engine',
          approvedByActor: `${state.activePersona.name} (Platform Operator)`,
          payoutReference: utr,
          customAdjustments: customAdjs,
          vendorAgreedAt: nowIST(),
          createdAt: '2026-10-29',
        };

        const ntf: PlatformNotification = {
          id: `NTF-${Date.now()}`,
          eventCode: 'Payout Disbursed',
          title: `Payout Disbursed: ₹${netAmount.toLocaleString('en-IN')}`,
          message: `Payout for ${periodLabel} has been disbursed via ${utr}. Download receipt in Past Payouts.`,
          recipientRole: 'VENDOR_OWNER',
          vendorScopeId: vendorId,
          category: 'Deposit & Billing',
          priority: 'high',
          read: false,
          timestamp: 'Just now',
          linkedView: 'SETTLEMENTS_FINANCE',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          settlements: [newStatement, ...s.settlements],
          customPayoutAdjustments: {
            ...s.customPayoutAdjustments,
            [vendorId]: [],
          },
          vendorPayoutVerificationStatus: {
            ...s.vendorPayoutVerificationStatus,
            [vendorId]: 'SETTLED',
          },
          notifications: [ntf, ...s.notifications],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Vendor Payouts',
              actionSummary: `Settled & disbursed payout ${newStatement.id} for ${vName}: ₹${netAmount.toLocaleString('en-IN')} (UTR: ${utr})`,
              affectedRecordId: newStatement.id,
              priorValue: 'Status: Vendor Agreed',
              newValue: `Status: Paid (UTR: ${utr})`,
              mandatoryReason: 'Vendor agreement verified and payout released by Platform Operator.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Vendor Payout Settled: ₹${netAmount.toLocaleString('en-IN')}`,
          description: `Disbursed to ${vName}. Settlement statement generated with UTR: ${utr}`,
          variant: 'success',
        });
      },

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
          title: `Service Ticket ${ticketId} Created`,
          description: requestAssetSwap
            ? 'Asset replacement requested with customer consent recorded.'
            : 'Assigned to fulfilling partner service team.',
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
                      reason: `Replaced unit ${ticket.currentAssetSerial} with ${replacementSerial} under ticket ${ticket.id}.`,
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
          title: `Asset Swapped to ${replacementSerial}`,
          description: 'Agreement amended with new serial number and ₹250 downtime credit applied.',
          variant: 'success',
        });
      },

      escalateSupportTicket: async (ticketId, resolutionOrEscalationNote) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Updating Support Ticket...' });
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
          title: 'Support Ticket Updated',
          description: resolutionOrEscalationNote,
          variant: 'info',
        });
      },

      updateObdDecision: async (obdId, selectedOption) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Updating Platform Governance Policy...' });
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
              actorRole: 'Platform Administrator',
              moduleCode: 'Policy Update',
              actionSummary: `Updated governance policy ${obdId}`,
              affectedRecordId: obdId,
              priorValue: 'Prior Policy Version',
              newValue: selectedOption,
              mandatoryReason: 'Executive policy update.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Governance Policy Updated',
          description: `Effective for new transactions; historical accepted transactions preserved.`,
          variant: 'success',
        });
      },

      registerNewVendorProduct: async ({
        productTitle,
        category,
        agreedMonthlyRate,
        declaredQuantity,
        conditionGrade,
        serviceLocation,
        imageUrl,
        vendorNotes,
      }) => {
        const state = get();
        if (state.isSimulatingLatency) return;
        set({
          isSimulatingLatency: true,
          latencyActionLabel: 'Registering Product & Agreed Rate...',
        });
        await simulateLatency(360);

        const activeVendorId = state.activePersona.vendorId || 'VEN-201';
        const currentVendor =
          state.vendors.find((v) => v.id === activeVendorId) || state.vendors[0];

        const suffix = Math.floor(510 + Math.random() * 480);
        const newProductId = `PRD-${suffix}`;
        const newInvId = `INV-${suffix}`;
        const newRateId = `VPR-${suffix}`;
        const websiteBaseRent = Math.round(agreedMonthlyRate * 1.3);

        const newMasterProduct: PlatformMasterProduct = {
          id: newProductId,
          sku: `KR-${category.slice(0, 3).toUpperCase()}-${suffix}`,
          title: productTitle,
          category,
          workflowType:
            category === 'Cooling & Air' || category === 'IT & AV Equipment'
              ? 'SITE_VISIT_MULTI_STEP'
              : 'DIRECT_1_STEP',
          description: vendorNotes,
          specifications: [conditionGrade, serviceLocation],
          lifestyleImage:
            imageUrl ||
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
          studioImage:
            imageUrl ||
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
          baseMonthlyRent: websiteBaseRent,
          tenureMultipliers: {
            1: 1.05,
            3: 1.0,
            6: 0.92,
            12: 0.85,
            24: 0.78,
          },
          depositMonthsMultiple: 4,
          standardDeliveryFee: 450,
          siteVisitFee: 499,
          installationRateCard: [],
        };

        const newInventoryItem: VirtualInventoryItem = {
          id: newInvId,
          productId: newProductId,
          productTitle,
          category,
          workflowType: newMasterProduct.workflowType,
          owningVendorId: currentVendor.id,
          owningVendorName: currentVendor.displayName,
          serviceLocation,
          conditionGrade,
          declaredQuantity,
          availableQuantity: declaredQuantity,
          reservedQuantity: 0,
          rentedQuantity: 0,
          maintenanceOrDamagedQuantity: 0,
          physicalCountVerified: declaredQuantity,
          livePublicEnabled: false,
          pendingStagedRequest: {
            id: `STG-${suffix}`,
            inventoryId: newInvId,
            vendorId: currentVendor.id,
            vendorName: currentVendor.displayName,
            requestType: 'NEW_LISTING',
            priorPublicEnabled: false,
            requestedPublicEnabled: true,
            priorDeclaredStock: 0,
            requestedDeclaredStock: declaredQuantity,
            uploadedImages: [newMasterProduct.lifestyleImage],
            vendorNotes,
            submittedAt: nowIST(),
            status: 'Pending Admin Approval',
          },
          itemImages: [newMasterProduct.lifestyleImage],
          serializedAssets: [],
        };

        const newRateEntry: VendorProductRateEntry = {
          id: newRateId,
          inventoryId: newInvId,
          productId: newProductId,
          productTitle,
          category,
          vendorId: currentVendor.id,
          vendorName: currentVendor.displayName,
          agreedMonthlyRate,
          returnedUnitCount: 0,
          returnInProgressCount: 0,
          effectiveDate: '2026-10-29',
        };

        const isRestrictedVendor =
          currentVendor.status.includes('Terminat') ||
          Boolean(state.activePersona.isTerminatedVendor);

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          masterProducts: [newMasterProduct, ...s.masterProducts],
          virtualInventory: [newInventoryItem, ...s.virtualInventory],
          vendorProductRates: [newRateEntry, ...s.vendorProductRates],
          blacklist: isRestrictedVendor
            ? s.blacklist.map((b) =>
                b.entityId === currentVendor.id
                  ? { ...b, blockedAttemptsCount: b.blockedAttemptsCount + 1 }
                  : b
              )
            : s.blacklist,
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: isRestrictedVendor ? 'Risk Alert' : 'New Product',
              title: isRestrictedVendor
                ? `Restricted Vendor Product Held (${newInvId})`
                : `New Product Registered (${newInvId})`,
              message: isRestrictedVendor
                ? `Restricted vendor ${currentVendor.displayName} submitted "${productTitle}". Held for Operator review.`
                : `${currentVendor.displayName} registered "${productTitle}" (${declaredQuantity} units) at an agreed vendor rate of ₹${agreedMonthlyRate}/mo.`,
              recipientRole: 'PLATFORM_ADMIN',
              category: isRestrictedVendor ? 'Blacklist Alert' : 'Inventory Approval',
              priority: isRestrictedVendor ? 'critical' : 'high',
              read: false,
              timestamp: 'Just now',
              linkedView: isRestrictedVendor
                ? 'BLACKLIST_REGISTRY'
                : 'ADMIN_GOVERNANCE',
            },
            ...s.notifications,
          ],
        }));

        get().addToast({
          title: `Product Registered (${newInvId})`,
          description: `"${productTitle}" saved with agreed vendor rate ₹${agreedMonthlyRate.toLocaleString('en-IN')}/mo and sent for catalog activation.`,
          variant: 'success',
        });
      },

      addFieldTechnician: async (payload) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Registering Field Technician...' });
        await simulateLatency(300);

        const state = get();
        const activeVendorId = state.activePersona.vendorId || 'VEN-201';
        const vendor = state.vendors.find((v) => v.id === activeVendorId) || state.vendors[0];
        const newTechId = `TECH-${Math.floor(100 + Math.random() * 899)}`;

        const newTech: FieldTechnician = {
          id: newTechId,
          vendorId: vendor.id,
          vendorName: vendor.displayName,
          fullName: payload.fullName.trim(),
          phone: payload.phone.trim(),
          photoUrl: payload.photoUrl.trim(),
          status: 'Active',
          serviceAreas:
            payload.serviceAreas && payload.serviceAreas.length > 0
              ? payload.serviceAreas
              : vendor.serviceAreas,
          createdAt: nowIST().split(' ')[0],
        };

        const newPersonaId = `persona-${newTech.id}`;
        const newPersona: ActivePersona = {
          id: newPersonaId,
          name: newTech.fullName,
          role: 'FIELD_PERSONNEL',
          roleBadge: 'Field Technician',
          subtitle: `${vendor.displayName} • ${newTech.serviceAreas[0] || 'Bengaluru'}`,
          email: `${newTech.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@karorent.in`,
          phone: newTech.phone,
          vendorId: vendor.id,
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          fieldTechnicians: [newTech, ...s.fieldTechnicians],
          personas: [...s.personas, newPersona],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Staff Management',
              actionSummary: `Registered Field Technician ${newTech.fullName} (${newTech.id})`,
              affectedRecordId: newTech.id,
              priorValue: 'Unregistered',
              newValue: `Active Staff: ${newTech.fullName} (${newTech.phone})`,
              mandatoryReason: 'Vendor onboarding field personnel for deliveries and visits.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Technician ${newTech.fullName} Added`,
          description: `Mobile ${newTech.phone} registered. Ready for delivery & visit assignments.`,
          variant: 'success',
        });
      },

      assignTechnicianToTask: async (payload) => {
        set({
          isSimulatingLatency: true,
          latencyActionLabel: 'Assigning Field Technician & Notifying Customer...',
        });
        await simulateLatency(350);

        const state = get();
        const tech = state.fieldTechnicians.find((t) => t.id === payload.technicianId);
        if (!tech) return;

        let customerId = '';
        let productTitle = '';
        let taskReasonLabel = '';

        if (payload.taskType === 'DELIVERY') {
          taskReasonLabel = 'Delivery & Setup';
          const b = state.bookings.find((item) => item.id === payload.taskId);
          if (b) {
            customerId = b.customerId;
            productTitle = b.productTitle;
          }
        } else if (payload.taskType === 'SITE_VISIT') {
          taskReasonLabel = 'Home Measurement Visit';
          const b = state.bookings.find((item) => item.id === payload.taskId);
          if (b) {
            customerId = b.customerId;
            productTitle = b.productTitle;
          }
        } else if (payload.taskType === 'PICKUP') {
          taskReasonLabel = 'Return Pickup';
          const b = state.bookings.find((item) => item.id === payload.taskId);
          if (b) {
            customerId = b.customerId;
            productTitle = b.productTitle;
          }
        } else if (payload.taskType === 'MAINTENANCE') {
          taskReasonLabel = 'Maintenance & Repair';
          const t = state.serviceTickets.find((item) => item.id === payload.taskId);
          if (t) {
            customerId = t.customerId;
            productTitle = t.productTitle;
          }
        } else if (payload.taskType === 'REPOSSESSION') {
          taskReasonLabel = 'Asset Repossession (Legal Default)';
          const b = state.bookings.find((item) => item.id === payload.taskId);
          if (b) {
            customerId = b.customerId;
            productTitle = b.productTitle;
          }
        }

        const assignment: DeliveryAssignment = {
          technicianId: tech.id,
          technicianName: tech.fullName,
          technicianPhone: tech.phone,
          technicianPhoto: tech.photoUrl,
          scheduledDate: payload.scheduledDate,
          scheduledTimeSlot: payload.scheduledTimeSlot,
          taskType: payload.taskType,
          reason: taskReasonLabel,
          assignedAt: nowIST(),
          notes: payload.notes,
        };

        const newNotification: PlatformNotification = {
          id: `NTF-${Date.now()}`,
          eventCode: 'Staff Assigned',
          title: `Technician Assigned: ${tech.fullName}`,
          message: `${tech.fullName} (${tech.phone}) has been scheduled for your ${productTitle} ${taskReasonLabel.toLowerCase()} on ${payload.scheduledDate} at ${payload.scheduledTimeSlot}.`,
          recipientRole: 'CUSTOMER_INDIVIDUAL',
          customerScopeId: customerId || undefined,
          category: 'Fulfilment & Pickup',
          priority: 'high',
          read: false,
          timestamp: 'Just now',
          linkedView: 'MY_RENTALS',
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== payload.taskId) return b;
            if (payload.taskType === 'DELIVERY') {
              return {
                ...b,
                status: 'Confirmed',
                deliveryAssignment: assignment,
              };
            }
            if (payload.taskType === 'SITE_VISIT') {
              return {
                ...b,
                deliveryAssignment: assignment,
                siteVisit: b.siteVisit
                  ? {
                      ...b.siteVisit,
                      assignedTechnician: tech.fullName,
                      scheduledDate: `${payload.scheduledDate} (${payload.scheduledTimeSlot})`,
                      status: 'Scheduled',
                    }
                  : undefined,
              };
            }
            if (payload.taskType === 'PICKUP') {
              return {
                ...b,
                returnRecord: b.returnRecord
                  ? {
                      ...b.returnRecord,
                      assignedPickupStaff: tech.fullName,
                      assignedStaffId: tech.id,
                      assignedStaffPhone: tech.phone,
                      assignedStaffPhoto: tech.photoUrl,
                      scheduledDate: payload.scheduledDate,
                      scheduledTimeSlot: payload.scheduledTimeSlot,
                      preferredPickupSlot: `${payload.scheduledDate} (${payload.scheduledTimeSlot})`,
                      pickupStatus: 'Scheduled',
                    }
                  : undefined,
              };
            }
            if (payload.taskType === 'REPOSSESSION') {
              return {
                ...b,
                status: 'Asset Recovery — Repossession Scheduled' as const,
                repossessionAssignment: assignment,
              };
            }
            return b;
          }),
          serviceTickets: s.serviceTickets.map((st) => {
            if (st.id !== payload.taskId) return st;
            return {
              ...st,
              status: 'Scheduled',
              assignedTechnicianId: tech.id,
              assignedTechnicianName: tech.fullName,
              assignedTechnicianPhone: tech.phone,
              assignedTechnicianPhoto: tech.photoUrl,
              scheduledDate: payload.scheduledDate,
              scheduledTimeSlot: payload.scheduledTimeSlot,
            };
          }),
          notifications: customerId ? [newNotification, ...s.notifications] : s.notifications,
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Task Assignment',
              actionSummary: `Assigned ${tech.fullName} to ${taskReasonLabel} for order ${payload.taskId} (${payload.scheduledDate} ${payload.scheduledTimeSlot})`,
              affectedRecordId: payload.taskId,
              priorValue: 'Unassigned',
              newValue: `Technician: ${tech.fullName} (${tech.phone}) • ${payload.scheduledDate} ${payload.scheduledTimeSlot}`,
              mandatoryReason: 'Vendor assigned technician for customer fulfillment.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Technician Assigned: ${tech.fullName}`,
          description: `Scheduled for ${taskReasonLabel} on ${payload.scheduledDate} (${payload.scheduledTimeSlot}). Customer has been notified.`,
          variant: 'success',
        });
      },

      triggerDefaultNotice: async ({ bookingId, invoiceId, targetStage, scheduledRepossessionDate, scheduledRepossessionTimeWindow }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: `Issuing Legal Default Notice Stage ${targetStage}...` });
        await simulateLatency(350);

        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        const invoice = state.invoices.find((i) => i.id === invoiceId);
        if (!booking || !invoice) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        const customer = state.customers.find((c) => c.id === booking.customerId);
        const customerMobile = customer?.verifiedMobile || '+91 98860 12345';
        const customerEmail = customer?.email || 'customer@example.com';

        let newRecord: DefaultNoticeRecord;
        let noticeStage: DefaultNoticeStage;
        let newBookingStatus = booking.status;
        let lateFeeToAdd = 0;
        let toastTitle = '';
        let toastDesc = '';

        if (targetStage === 1) {
          noticeStage = 'NOTICE_1';
          const content = generateNotice1({
            booking,
            invoice,
            customerMobile,
            customerEmail,
          });
          newRecord = {
            id: `NOTC-1-${Date.now()}`,
            noticeType: 'NOTICE_1',
            noticeTitle: 'Notice 1: Payment Reminder (Day 1)',
            bookingId: booking.id,
            invoiceId: invoice.id,
            issuedAt: nowIST(),
            dueOrCureDeadline: 'Within 3 business days',
            principalAmount: invoice.totalPayable,
            lateFeeAmount: 0,
            totalPayable: invoice.totalPayable,
            subject: content.subject,
            fullNoticeText: content.body,
          };
          newBookingStatus = 'Payment Overdue';
          toastTitle = 'Notice 1 Issued: Day 1 Payment Reminder';
          toastDesc = `Sent courteous payment reminder for invoice ${invoice.id} to ${booking.customerName}.`;
        } else if (targetStage === 2) {
          noticeStage = 'NOTICE_2';
          lateFeeToAdd = 500;
          const content = generateNotice2({
            booking,
            invoice,
            customerMobile,
            customerEmail,
            lateFeeAmount: 500,
            cureDeadlineDate: 'Within 5 business days',
          });
          newRecord = {
            id: `NOTC-2-${Date.now()}`,
            noticeType: 'NOTICE_2',
            noticeTitle: 'Notice 2: Formal Notice of Default & Late Fee Assessment (Day 5)',
            bookingId: booking.id,
            invoiceId: invoice.id,
            issuedAt: nowIST(),
            dueOrCureDeadline: 'Within 5 business days',
            principalAmount: invoice.totalPayable,
            lateFeeAmount: 500,
            totalPayable: invoice.totalPayable + 500,
            subject: content.subject,
            fullNoticeText: content.body,
          };
          newBookingStatus = 'Payment Overdue';
          toastTitle = 'Notice 2 Issued: Formal Default & ₹500 Late Fee';
          toastDesc = `Formal default declared. ₹500 late fee assessed and customer account restricted.`;
        } else {
          noticeStage = 'NOTICE_3';
          const authCode = `REPO-AUTH-${booking.id.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
          const repoDate = scheduledRepossessionDate || '2026-10-31';
          const repoWindow = scheduledRepossessionTimeWindow || '10:00 AM – 02:00 PM IST';
          const content = generateNotice3({
            booking,
            invoice,
            customerMobile,
            customerEmail,
            lateFeeAmount: invoice.lateFeeAssessed || 500,
            cureDeadlineDate: 'IMMEDIATE SURRENDER',
            repossessionDate: repoDate,
            repossessionTimeWindow: repoWindow,
            agentAuthCode: authCode,
          });
          newRecord = {
            id: `NOTC-3-${Date.now()}`,
            noticeType: 'NOTICE_3',
            noticeTitle: 'Notice 3: Contract Termination & Repossession Demand (Day 11)',
            bookingId: booking.id,
            invoiceId: invoice.id,
            issuedAt: nowIST(),
            dueOrCureDeadline: 'Immediate Surrender',
            principalAmount: invoice.totalPayable,
            lateFeeAmount: invoice.lateFeeAssessed || 500,
            totalPayable: invoice.totalPayable + (invoice.lateFeeAssessed ? 0 : 500),
            agentAuthCode: authCode,
            scheduledRepossessionDate: repoDate,
            scheduledRepossessionTimeWindow: repoWindow,
            subject: content.subject,
            fullNoticeText: content.body,
          };
          newBookingStatus = 'Terminated — Payment Default';
          toastTitle = 'Notice 3 Issued: Contract Terminated';
          toastDesc = `Possessory license revoked. Equipment queued for immediate repossession dispatch.`;
        }

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          invoices: s.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;
            return {
              ...inv,
              overdueStage: noticeStage,
              lateFeeAssessed: lateFeeToAdd > 0 ? (inv.lateFeeAssessed || 0) + lateFeeToAdd : inv.lateFeeAssessed,
              totalPayable: inv.totalPayable + lateFeeToAdd,
              baseAmount: inv.baseAmount + lateFeeToAdd,
            };
          }),
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              status: newBookingStatus,
              defaultNotices: [...(b.defaultNotices || []), newRecord],
            };
          }),
          customers: s.customers.map((c) => {
            if (c.id !== booking.customerId) return c;
            if (targetStage >= 2 && c.status === 'Active') {
              return { ...c, status: 'Restricted' as const };
            }
            return c;
          }),
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: targetStage === 3 ? 'Contract Termination' : 'Legal Default Notice',
              title: newRecord.noticeTitle,
              message: `${newRecord.subject}. Due: ${newRecord.dueOrCureDeadline}.`,
              recipientRole: 'CUSTOMER_INDIVIDUAL',
              customerScopeId: booking.customerId,
              category: 'Deposit & Billing',
              priority: targetStage >= 2 ? 'critical' : 'high',
              read: false,
              timestamp: 'Just now',
              linkedView: 'INVOICES_DEPOSITS',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Legal Escalation',
              actionSummary: `Dispatched ${newRecord.noticeTitle} for Booking ${booking.id} (Invoice ${invoice.id})`,
              affectedRecordId: booking.id,
              priorValue: `Booking Status: ${booking.status}`,
              newValue: `Booking Status: ${newBookingStatus} • Stage: ${noticeStage}`,
              mandatoryReason: `Statutory default progression pursuant to Appendix C framework.`,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: toastTitle,
          description: toastDesc,
          variant: targetStage >= 2 ? 'warning' : 'info',
        });
      },

      curePaymentDefault: async ({ bookingId, invoiceId }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Reconciling Default Cure Payment...' });
        await simulateLatency(350);

        const state = get();
        const invoice = state.invoices.find((i) => i.id === invoiceId);
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!invoice) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        const providerRef = `RZP_CURE_${Math.floor(100000 + Math.random() * 899999)}`;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  paymentState: 'Successful',
                  paidAt: nowIST(),
                  providerReference: providerRef,
                }
              : inv
          ),
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              status: b.status === 'Payment Overdue' ? ('Delivered & Active' as const) : b.status,
            };
          }),
          customers: s.customers.map((c) => {
            if (c.id !== invoice.customerId) return c;
            if (c.status === 'Restricted') {
              const otherOverdue = s.invoices.some(
                (inv) =>
                  inv.customerId === c.id &&
                  inv.id !== invoiceId &&
                  (inv.overdueStage === 'NOTICE_2' || inv.overdueStage === 'NOTICE_1') &&
                  inv.paymentState !== 'Successful'
              );
              if (!otherOverdue) {
                return { ...c, status: 'Active' as const };
              }
            }
            return c;
          }),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Default Cured',
              actionSummary: `Payment received for overdue invoice ${invoice.id}. Default cured and restrictions lifted.`,
              affectedRecordId: invoice.id,
              priorValue: `Overdue Stage: ${invoice.overdueStage || 'NOTICE_2'}`,
              newValue: `Payment: Successful (Ref: ${providerRef})`,
              mandatoryReason: 'Customer settled outstanding balance.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Default Cured: ₹${invoice.totalPayable.toLocaleString('en-IN')}`,
          description: `Invoice ${invoice.id} settled. Account restrictions have been lifted.`,
          variant: 'success',
        });
      },

      assignRepossessionTask: async ({ bookingId, technicianId, scheduledDate, scheduledTimeSlot, notes }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Dispatching Repossession Order to Technician...' });
        await simulateLatency(350);

        const state = get();
        const tech = state.fieldTechnicians.find((t) => t.id === technicianId);
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!tech || !booking) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        const assignment: DeliveryAssignment = {
          technicianId: tech.id,
          technicianName: tech.fullName,
          technicianPhone: tech.phone,
          technicianPhoto: tech.photoUrl,
          scheduledDate,
          scheduledTimeSlot,
          taskType: 'REPOSSESSION',
          reason: 'Asset Repossession (Legal Default)',
          assignedAt: nowIST(),
          notes,
        };

        const authCode = booking.defaultNotices?.slice(-1)[0]?.agentAuthCode || `REPO-AUTH-${booking.id.slice(-4)}-7124`;

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              status: 'Asset Recovery — Repossession Scheduled' as const,
              repossessionAssignment: assignment,
            };
          }),
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: 'Repossession Scheduled',
              title: `Technician Scheduled for Equipment Repossession`,
              message: `Field Technician ${tech.fullName} (${tech.phone}) is scheduled for doorstep asset recovery on ${scheduledDate} (${scheduledTimeSlot}). Authorization Code: ${authCode}.`,
              recipientRole: 'CUSTOMER_INDIVIDUAL',
              customerScopeId: booking.customerId,
              category: 'Fulfilment & Pickup',
              priority: 'critical',
              read: false,
              timestamp: 'Just now',
              linkedView: 'MY_RENTALS',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Repossession Dispatch',
              actionSummary: `Assigned Technician ${tech.fullName} to recover ${booking.productTitle} (${booking.allocatedSerial || 'Serial Pending'})`,
              affectedRecordId: booking.id,
              priorValue: `Booking Status: ${booking.status}`,
              newValue: `Status: Asset Recovery — Repossession Scheduled • Tech: ${tech.fullName} • Slot: ${scheduledDate} ${scheduledTimeSlot}`,
              mandatoryReason: 'Contract termination enforcement and asset retrieval.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: `Repossession Scheduled: ${tech.fullName}`,
          description: `Technician dispatched for ${booking.productTitle} on ${scheduledDate} (${scheduledTimeSlot}).`,
          variant: 'success',
        });
      },

      completeRepossessionHandover: async ({ bookingId, photoUrl, notes }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Recording Doorstep Repossession Evidence...' });
        await simulateLatency(380);

        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              status: 'Returned & Closed' as const,
              repossessionAssignment: b.repossessionAssignment
                ? {
                    ...b.repossessionAssignment,
                    doorstepPhotoUrl: photoUrl,
                    completedAt: nowIST(),
                    status: 'Completed' as const,
                    notes: notes || b.repossessionAssignment.notes,
                  }
                : undefined,
              returnRecord: {
                returnRequestedAt: nowIST(),
                preferredPickupSlot: 'Doorstep Repossession Completed',
                assignedPickupStaff: b.repossessionAssignment?.technicianName || 'Field Technician',
                pickupStatus: 'Finalised',
                preDispatchPhoto: b.deliveryEvidencePhoto || 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600',
                preDispatchNotes: 'Original dispatch verification.',
                customerPremisePickupPhoto: photoUrl,
                assignedStaffId: b.repossessionAssignment?.technicianId,
                assignedStaffPhone: b.repossessionAssignment?.technicianPhone,
                assignedStaffPhoto: b.repossessionAssignment?.technicianPhoto,
                pickupPhotoExifTimestamp: nowIST(),
                pickupPhotoGeoTag: 'Lat 12.9716, Long 77.5946 (Customer Doorstep Verified)',
                proposedDeductionAmount: 0,
                approvedDeductionAmount: 0,
                transitDamageBlockedByBR026: false,
              },
            };
          }),
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: 'Repossession Completed',
              title: `Asset Successfully Recovered: ${booking.productTitle}`,
              message: `Field technician has completed doorstep repossession with photographic evidence (FR-RET-002). Equipment returned to partner warehouse.`,
              recipientRole: 'VENDOR_OWNER',
              category: 'Fulfilment & Pickup',
              priority: 'high',
              read: false,
              timestamp: 'Just now',
              linkedView: 'FIELD_OPERATIONS',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Asset Recovery',
              actionSummary: `Completed doorstep repossession for ${booking.id} with photographic proof`,
              affectedRecordId: booking.id,
              priorValue: `Status: Asset Recovery — Repossession Scheduled`,
              newValue: `Status: Returned & Closed (Handover Verified)`,
              mandatoryReason: 'Doorstep recovery photo verified under FR-RET-002.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Repossession Handover Verified',
          description: `Asset ${booking.productTitle} recovered and returned to vendor custody.`,
          variant: 'success',
        });
      },

      reportRepossessionObstruction: async ({ bookingId, refusalReason, evidencePhotoUrl }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Reporting Obstruction & Escalating to Risk Registry...' });
        await simulateLatency(420);

        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        const customer = state.customers.find((c) => c.id === booking.customerId);

        const newBlacklistEntry: BlacklistEntry = {
          id: `BLK-${Date.now()}`,
          ledgerType: 'CUSTOMER_BLACKLIST',
          entityId: booking.customerId,
          entityName: booking.customerName,
          status: 'Active Blacklist',
          categoryReason: 'Asset Recovery — Hostile Retention',
          triggeringCaseOrBookingId: booking.id,
          effectiveTimestamp: nowIST(),
          enrolledByActor: 'System Automatic Enrollment (EX-035)',
          outstandingDuesAmount: booking.monthlyRentRate,
          evidenceSummary: `Doorstep repossession obstructed for booking ${booking.id}. Customer refused to surrender asset: "${refusalReason}". Mandatory police assistance and section 406 IPC recovery initiated.`,
          matchedIdentifiers: {
            phone: customer?.verifiedMobile || '+91 98860 12345',
            email: customer?.email || 'customer@example.com',
            bankOrPaymentFingerprint: customer?.paymentFingerprint || 'FP_HASH_9824',
            addressSnippet: booking.deliveryAddress || 'Bengaluru',
          },
          blockedAttemptsCount: 0,
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              status: 'Asset Recovery — Hostile Retention' as const,
              repossessionObstructionNotes: refusalReason,
              repossessionAssignment: b.repossessionAssignment
                ? {
                    ...b.repossessionAssignment,
                    status: 'Refused / Obstructed' as const,
                    doorstepPhotoUrl: evidencePhotoUrl,
                    notes: `Customer Refusal: ${refusalReason}`,
                  }
                : undefined,
            };
          }),
          customers: s.customers.map((c) => {
            if (c.id !== booking.customerId) return c;
            return { ...c, status: 'Blacklisted / Watchlisted' as const };
          }),
          blacklist: [newBlacklistEntry, ...s.blacklist],
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: 'Hostile Retention Alert',
              title: `CRITICAL: Repossession Obstructed (EX-035)`,
              message: `Customer ${booking.customerName} refused to surrender equipment (${booking.productTitle}). Covertly blacklisted. Section 406 IPC recovery dossier prepared.`,
              recipientRole: 'PLATFORM_ADMIN',
              category: 'Blacklist Alert',
              priority: 'critical',
              read: false,
              timestamp: 'Just now',
              linkedView: 'BLACKLIST_REGISTRY',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Risk & Blacklist',
              actionSummary: `Flagged Hostile Retention (EX-035) for booking ${booking.id}. Enrolled ${booking.customerName} in Blacklist Registry.`,
              affectedRecordId: booking.id,
              priorValue: `Status: Asset Recovery — Repossession Scheduled`,
              newValue: `Status: Asset Recovery — Hostile Retention • Enrolled in Blacklist`,
              mandatoryReason: `Customer refusal to surrender platform property post legal contract termination.`,
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: 'Obstruction Escalated: Hostile Retention',
          description: `Order flagged under EX-035. Customer covertly enrolled in Blacklist Registry.`,
          variant: 'error',
        });
      },

      executeDepositWaterfallSettlement: async ({
        bookingId,
        unpaidBaseRent,
        logisticsDeinstallationFee,
        verifiedDamageFee,
        contractualLateFees,
        mediatorNotes,
      }) => {
        set({ isSimulatingLatency: true, latencyActionLabel: 'Executing Statutory 4-Tier Waterfall Drawdown...' });
        await simulateLatency(420);

        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) {
          set({ isSimulatingLatency: false, latencyActionLabel: null });
          return;
        }

        const originalDeposit = booking.securityDepositAmount;
        const totalLiabilities =
          unpaidBaseRent + logisticsDeinstallationFee + verifiedDamageFee + contractualLateFees;
        const netBalance = originalDeposit - totalLiabilities;
        const customer = state.customers.find((c) => c.id === booking.customerId);

        const outcome: 'SURPLUS_REFUND' | 'DEFICIT_FORFEIT_AND_INVOICE' =
          netBalance >= 0 ? 'SURPLUS_REFUND' : 'DEFICIT_FORFEIT_AND_INVOICE';
        let deficitInvoiceId: string | undefined;
        let refundScheduledDate: string | undefined;

        let createdAdjInvoice: FinancialInvoiceDocument | null = null;
        let createdBlacklistEntry: BlacklistEntry | null = null;

        if (outcome === 'SURPLUS_REFUND') {
          refundScheduledDate = 'Within 14 business days (FR-DEP-006)';
        } else {
          const deficitAmount = Math.abs(netBalance);
          deficitInvoiceId = `INV-ADJ-${booking.id.slice(4)}-${Math.floor(100 + Math.random() * 900)}`;
          createdAdjInvoice = {
            id: deficitInvoiceId,
            bookingId: booking.id,
            customerId: booking.customerId,
            customerName: booking.customerName,
            vendorId: booking.fulfillingVendorId,
            chargeType: 'POST_RETURN_ADJUSTMENT_INVOICE',
            title: `Deficit Settlement Adjustment: Unrecovered Liabilities for ${booking.id}`,
            baseAmount: deficitAmount,
            taxAmount: 0,
            totalPayable: deficitAmount,
            paymentState: 'Pending Reconciliation',
            dueDate: 'Within 7 business days',
            correctionReason: `4-Month deposit (₹${originalDeposit.toLocaleString('en-IN')}) exhausted. Remaining unrecovered liabilities demand.`,
          };

          createdBlacklistEntry = {
            id: `BLK-${Date.now()}`,
            ledgerType: 'CUSTOMER_BLACKLIST',
            entityId: booking.customerId,
            entityName: booking.customerName,
            status: 'Active Blacklist',
            categoryReason: 'Asset Retention & Unrecovered Balance Enforcement',
            triggeringCaseOrBookingId: deficitInvoiceId,
            effectiveTimestamp: nowIST(),
            enrolledByActor: 'Platform Financial Governance',
            outstandingDuesAmount: deficitAmount,
            evidenceSummary: `4-Month Security deposit exhausted. Unrecovered balance of INR ${deficitAmount.toLocaleString('en-IN')} outstanding under adjustment invoice ${deficitInvoiceId}.`,
            matchedIdentifiers: {
              phone: customer?.verifiedMobile || '+91 98860 12345',
              email: customer?.email || 'customer@example.com',
              bankOrPaymentFingerprint: customer?.paymentFingerprint || 'FP_HASH_9824',
              addressSnippet: booking.deliveryAddress || 'Bengaluru',
            },
            blockedAttemptsCount: 0,
          };
        }

        const settlementRecord: DepositWaterfallSettlement = {
          bookingId: booking.id,
          settledAt: nowIST(),
          originalDeposit,
          unpaidBaseRent,
          logisticsDeinstallationFee,
          verifiedDamageFee,
          contractualLateFees,
          totalLiabilities,
          netBalance,
          outcome,
          deficitInvoiceId,
          refundScheduledDate,
          mediatorNotes,
        };

        set((s) => ({
          isSimulatingLatency: false,
          latencyActionLabel: null,
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b;
            return {
              ...b,
              waterfallSettlement: settlementRecord,
              status: 'Returned & Closed' as const,
            };
          }),
          depositLedgers: s.depositLedgers.map((d) => {
            if (d.bookingId !== bookingId) return d;
            if (outcome === 'SURPLUS_REFUND') {
              return {
                ...d,
                proposedDeduction: totalLiabilities,
                approvedDeduction: totalLiabilities,
                netRefundableAmount: netBalance,
                refundStatus: 'Scheduled (14-Day Window)' as const,
                settlementDueDate: 'Within 14 business days',
              };
            } else {
              return {
                ...d,
                proposedDeduction: originalDeposit,
                approvedDeduction: originalDeposit,
                netRefundableAmount: 0,
                refundStatus: 'Refund Processed' as const,
                settlementDueDate: 'Deficit Invoice Generated',
              };
            }
          }),
          invoices: createdAdjInvoice ? [createdAdjInvoice, ...s.invoices] : s.invoices,
          blacklist: createdBlacklistEntry ? [createdBlacklistEntry, ...s.blacklist] : s.blacklist,
          customers: createdBlacklistEntry
            ? s.customers.map((c) => (c.id === booking.customerId ? { ...c, status: 'Blacklisted / Watchlisted' as const } : c))
            : s.customers,
          notifications: [
            {
              id: `NTF-${Date.now()}`,
              eventCode: 'Waterfall Settlement',
              title: outcome === 'SURPLUS_REFUND' ? 'Deposit Surplus Refund Scheduled' : 'Security Deposit Forfeited (Deficit Adjustment)',
              message: outcome === 'SURPLUS_REFUND'
                ? `Net refundable balance of ₹${netBalance.toLocaleString('en-IN')} approved for release within 14 days.`
                : `Total deposit exhausted. Ancillary adjustment invoice ${deficitInvoiceId} issued for unrecovered balance of ₹${Math.abs(netBalance).toLocaleString('en-IN')}.`,
              recipientRole: 'CUSTOMER_INDIVIDUAL',
              customerScopeId: booking.customerId,
              category: 'Deposit & Billing',
              priority: outcome === 'SURPLUS_REFUND' ? 'normal' : 'critical',
              read: false,
              timestamp: 'Just now',
              linkedView: 'INVOICES_DEPOSITS',
            },
            ...s.notifications,
          ],
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: nowIST(),
              actorName: s.activePersona.name,
              actorRole: s.activePersona.roleBadge,
              moduleCode: 'Waterfall Settlement',
              actionSummary: `Executed statutory 4-tier waterfall drawdown on deposit for ${booking.id}`,
              affectedRecordId: booking.id,
              priorValue: `Deposit: ₹${originalDeposit.toLocaleString('en-IN')}`,
              newValue: `Outcome: ${outcome} • Net: ₹${netBalance.toLocaleString('en-IN')} • Liabilities: ₹${totalLiabilities.toLocaleString('en-IN')}`,
              mandatoryReason: 'Final reconciliation of security deposit pursuant to Section 6.2 BR-033.',
            },
            ...s.auditLogs,
          ],
        }));

        get().addToast({
          title: outcome === 'SURPLUS_REFUND' ? 'Waterfall Settlement: Surplus Refund' : 'Waterfall Settlement: Deficit Forfeit',
          description: outcome === 'SURPLUS_REFUND'
            ? `Surplus ₹${netBalance.toLocaleString('en-IN')} scheduled for release within 14 days.`
            : `Deficit ₹${Math.abs(netBalance).toLocaleString('en-IN')} billed via invoice ${deficitInvoiceId}.`,
          variant: outcome === 'SURPLUS_REFUND' ? 'success' : 'warning',
        });
      },

      loginWithMobile: (mobileNumber: string) => {
        const cleanInput = mobileNumber.replace(/\D/g, '');
        if (cleanInput.length < 5) {
          get().addToast({
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid mobile number (at least 5 digits).',
            variant: 'error',
          });
          return { success: false, message: 'Please enter a valid mobile number.' };
        }

        const state = get();
        // Look in personas
        let matched = state.personas.find((p) => {
          const cleanPhone = p.phone.replace(/\D/g, '');
          return cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone);
        });

        // If not in personas, also check fieldTechnicians
        if (!matched) {
          const tech = state.fieldTechnicians.find((t) => {
            const cleanPhone = t.phone.replace(/\D/g, '');
            return cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone);
          });
          if (tech) {
            matched = {
              id: `persona-${tech.id}`,
              name: tech.fullName,
              role: 'FIELD_PERSONNEL',
              roleBadge: 'Field Technician',
              subtitle: `${tech.vendorName} • ${tech.serviceAreas[0] || 'Bengaluru'}`,
              email: `${tech.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@karorent.in`,
              phone: tech.phone,
              vendorId: tech.vendorId,
            };
            set((s) => ({ personas: [...s.personas, matched!] }));
          }
        }

        if (matched) {
          let defaultTab: NavigationTab = 'MARKETPLACE';
          if (matched.role === 'VENDOR_OWNER') defaultTab = 'VENDOR_PORTAL';
          if (matched.role === 'FIELD_PERSONNEL') defaultTab = 'FIELD_OPERATIONS';
          if (matched.role === 'PLATFORM_ADMIN') defaultTab = 'ADMIN_GOVERNANCE';

          set({ activePersona: matched, activeTab: defaultTab });
          get().addToast({
            title: `Welcome, ${matched.name}!`,
            description: `Logged in as ${matched.roleBadge} with mobile ${matched.phone}.`,
            variant: 'success',
          });
          return { success: true, message: `Logged in as ${matched.name}`, persona: matched };
        }

        get().addToast({
          title: 'Mobile Not Found',
          description: `No account or field technician found with mobile ${mobileNumber}.`,
          variant: 'error',
        });
        return {
          success: false,
          message: `No account or field technician found with mobile number ${mobileNumber}.`,
        };
      },
    }),
    {
      name: 'karorent-live-platform-v11',
      partialize: (state) => ({
        darkMode: state.darkMode,
        personas: state.personas,
        customers: state.customers,
        vendors: state.vendors,
        masterProducts: state.masterProducts,
        virtualInventory: state.virtualInventory,
        vendorProductRates: state.vendorProductRates,
        fieldTechnicians: state.fieldTechnicians,
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
