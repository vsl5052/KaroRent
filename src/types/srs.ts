// ============================================================================
// KaroRent Multi-Vendor Rental Management Platform — Functional SRS v4.0 Types
// Theme 3: "Terracotta Hearth" — Warm Editorial Lifestyle
// ============================================================================

export type UserRole =
  | 'CUSTOMER_INDIVIDUAL'
  | 'CUSTOMER_BUSINESS'
  | 'VENDOR_OWNER'
  | 'FIELD_PERSONNEL'
  | 'PLATFORM_ADMIN';

export interface ActivePersona {
  id: string;
  name: string;
  role: UserRole;
  roleBadge: string;
  subtitle: string;
  email: string;
  phone: string;
  vendorId?: string;
  customerId?: string;
  isBlacklisted?: boolean;
  isTerminatedVendor?: boolean;
}

// Section 7.2 — Customer Registration & Account Management (FR-CUS-001 to 007)
export type CustomerAccountStatus =
  | 'Active'
  | 'Verification Pending'
  | 'Restricted'
  | 'Blacklisted / Watchlisted'
  | 'Suspended'
  | 'Closure Requested'
  | 'Closed';

export interface DeliveryAddress {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  area: string;
  city: string;
  pinCode: string;
  deliveryInstructions: string;
  isDefault: boolean;
}

export interface CustomerAccount {
  id: string;
  accountType: 'Individual' | 'Business';
  fullName: string;
  companyName?: string;
  gstinOrTaxId?: string;
  authorisedSignatoryName?: string;
  authorisedSignatoryTitle?: string;
  operationalRecipientName?: string;
  verifiedMobile: string;
  email: string;
  kycDocumentId: string;
  paymentFingerprint: string;
  status: CustomerAccountStatus;
  blacklistReason?: string;
  addresses: DeliveryAddress[];
  createdAt: string;
}

// Section 7.1 — Vendor Registration, Onboarding & Vendor Agreement (FR-VEN-001 to 015)
export type VendorStatus =
  | 'Draft'
  | 'Submitted'
  | 'Clarification Required'
  | 'Approved'
  | 'Rejected'
  | 'Suspended'
  | 'Terminating — Continuity Active'
  | 'Terminated';

export type VendorAgreementState =
  | 'Draft'
  | 'Sent'
  | 'Awaiting Signature'
  | 'Signed'
  | 'Expired'
  | 'Terminated';

export interface VendorRecord {
  id: string;
  legalBusinessName: string;
  displayName: string;
  taxIdGstin: string;
  panNumber: string;
  registeredPhone: string;
  email: string;
  authorisedContactName: string;
  bankAccountMasked: string;
  serviceAreas: string[];
  categories: string[];
  operatingHours: string;
  status: VendorStatus;
  agreementState: VendorAgreementState;
  agreementVersion: string;
  agreementSignedAt?: string;
  agreementExpiryDate: string;
  mandatoryPickupPhotoClauseAccepted: boolean; // FR-VEN-005 / BR-026
  blacklistMatchWarning?: {
    matchedVendorId: string;
    matchedVendorName: string;
    matchedFields: string[];
    priorTerminationReason: string;
  };
  continuityManager?: string; // FR-VEN-011
  settlementHoldAmount: number; // FR-VEN-013
  commissionRatePercent: number; // FR-SET-001
  submittedAt: string;
  decisionNotes?: string;
}

// Section 7.3 & 7.5 — Platform-Controlled Catalogue & Rate Cards (FR-CAT-001 to 007, FR-PRC-001)
export type BookingWorkflowType = 'DIRECT_1_STEP' | 'SITE_VISIT_MULTI_STEP';

export type ProductCategory =
  | 'Living Room'
  | 'Cooling & Air'
  | 'Water Purifiers'
  | 'Study & WFH'
  | 'Kitchen & Appliances'
  | 'IT & AV Equipment';

export interface InstallationRateCardItem {
  code: string;
  label: string;
  unit: string;
  ratePerUnit: number; // Platform-governed (FR-PRC-001 / BR-027)
  includedFreeUnits: number;
}

export interface PlatformMasterProduct {
  id: string;
  sku: string;
  title: string;
  category: ProductCategory;
  workflowType: BookingWorkflowType; // FR-CAT-003
  description: string;
  specifications: string[];
  lifestyleImage: string;
  studioImage: string;
  // Platform-controlled pricing (FR-PRC-001 / BR-027)
  baseMonthlyRent: number;
  tenureMultipliers: {
    1: number;
    3: number; // 1.0x
    6: number; // 0.92x
    12: number; // 0.85x
    24: number; // 0.78x
  };
  depositMonthsMultiple: number; // 4 months security deposit (FR-PAY-004)
  standardDeliveryFee: number;
  siteVisitFee: number; // e.g., ₹499 for Multi-Step AC (FR-PRC-008)
  installationRateCard: InstallationRateCardItem[];
}

// Section 7.4 — Virtual Inventory, Staged Approval & Source Reassignment (FR-INV-001 to 011)
export type OperationalStockStatus =
  | 'Available'
  | 'Temporarily Reserved'
  | 'Booked/Allocated'
  | 'Rented/Dispatched'
  | 'Under Maintenance'
  | 'Damaged'
  | 'Missing'
  | 'Retired'
  | 'Unavailable';

export interface StagedInventoryRequest {
  id: string;
  inventoryId: string;
  vendorId: string;
  vendorName: string;
  requestType: 'ENABLE_ITEM' | 'DISABLE_ITEM' | 'UPDATE_STOCK_AND_IMAGES' | 'NEW_LISTING';
  priorPublicEnabled: boolean;
  requestedPublicEnabled: boolean;
  priorDeclaredStock: number;
  requestedDeclaredStock: number;
  uploadedImages: string[];
  vendorNotes: string;
  submittedAt: string;
  status: 'Pending Admin Approval' | 'Approved' | 'Rejected' | 'Source Reassigned';
  adminDecisionReason?: string;
  reassignedToVendorId?: string;
}

export interface SerializedAsset {
  serialNumber: string;
  conditionGrade: 'Brand New' | 'Certified Mint' | 'Good — Refurbished';
  accessories: string[];
  status: OperationalStockStatus;
  lastInspectionDate: string;
}

export interface VirtualInventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  category: ProductCategory;
  workflowType: BookingWorkflowType;
  owningVendorId: string; // Current active source vendor (FR-INV-011)
  owningVendorName: string;
  serviceLocation: string;
  conditionGrade: 'Brand New' | 'Certified Mint' | 'Good — Refurbished';
  declaredQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  rentedQuantity: number;
  maintenanceOrDamagedQuantity: number;
  physicalCountVerified: number; // For FR-INV-007 reconciliation
  livePublicEnabled: boolean; // Controlled strictly by Platform Manager (FR-INV-009 / BR-030)
  pendingStagedRequest?: StagedInventoryRequest;
  itemImages: string[];
  serializedAssets: SerializedAsset[];
  lastSourceChangedAt?: string;
  previousVendorSourceName?: string;
}

// Section 7.6, 7.7, 7.8, 7.9, 7.10 — Bookings, Multi-Step Site Visits, Agreements & Rentals
export type BookingLifecycleStatus =
  | 'Draft'
  | 'Flagged — Blacklist Review' // FR-BKG-004 / FR-BLK-005
  | 'Awaiting Vendor Confirmation'
  | 'Awaiting Site Visit Payment'
  | 'Site Visit Scheduled'
  | 'Site Visit Completed'
  | 'Site Unfeasible — Cancelled'
  | 'Final Bill Sent'
  | 'Awaiting Customer Agreement'
  | 'Awaiting Payment'
  | 'Confirmed'
  | 'Fulfilment In Progress'
  | 'Active Rental'
  | 'Renewal Requested'
  | 'Expiring Soon'
  | 'Overdue'
  | 'Return Requested'
  | 'Pickup Scheduled'
  | 'Picked Up — Under Inspection'
  | 'Disputed'
  | 'Settlement Pending'
  | 'Completed'
  | 'Cancellation Requested'
  | 'Cancelled'
  | 'Rejected';

export interface SiteVisitRecord {
  scheduledDate: string;
  assignedTechnician: string;
  status: 'Scheduled' | 'Completed — Feasible' | 'Completed — Not Feasible';
  unfeasibleReason?: string;
  measuredCopperPipeMeters: number; // Free 3m, ₹850/m beyond
  coreCuttingRequired: boolean; // ₹500
  outdoorBracketRequired: boolean; // ₹750
  drainageExtensionMeters: number; // ₹180/m
  sitePhotographs: string[];
  technicianNotes: string;
  calculatedMaterialCharges: number;
  completedAt?: string;
  customerQuoteDecision?: 'Pending' | 'Accepted' | 'Rejected';
}

export interface AgreementAmendment {
  id: string;
  version: string;
  reason: string;
  changedFieldsSummary: string;
  createdAt: string;
  signedByCustomer: boolean;
  signedAt?: string;
}

export interface RentalAgreementRecord {
  id: string;
  bookingId: string;
  templateVersion: string;
  status: 'Awaiting Signature' | 'Signed' | 'Active' | 'Amended' | 'Completed' | 'Terminated';
  customerName: string;
  authorisedSignatory?: string;
  vendorSnapshotName: string; // BR-006
  productTitle: string;
  allocatedSerialNumber?: string;
  tenureMonths: number;
  startDate: string;
  endDate: string;
  lockedMonthlyRent: number;
  lockedDepositAmount: number;
  lockedInstallationCharge: number;
  mandatoryPickupPhotoClause: string; // FR-VEN-005 / BR-026
  signerIdentityMethod?: 'Aadhaar OTP E-Sign' | 'Corporate DSC / Signatory OTP';
  signatureHash?: string;
  signedAt?: string;
  amendments: AgreementAmendment[];
}

export interface ReturnInspectionRecord {
  returnRequestedAt: string;
  preferredPickupSlot: string;
  assignedPickupStaff: string;
  pickupStatus: 'Requested' | 'Scheduled' | 'Picked Up' | 'Under Inspection' | 'Disputed' | 'Finalised';
  // Three-Way Evidence Comparison (FR-RET-002, FR-RET-003, BR-026)
  preDispatchPhoto: string;
  preDispatchPhotos?: string[];
  preDispatchNotes: string;
  customerPremisePickupPhoto?: string; // Mandatory before Picked Up! (FR-RET-002 / EX-029)
  customerPremisePickupPhotos?: string[];
  pickupPhotoExifTimestamp?: string;
  pickupPhotoGeoTag?: string;
  warehouseReturnPhoto?: string;
  warehouseReturnPhotos?: string[];
  warehouseInspectionFinding?: 'Normal Wear' | 'Customer Damage' | 'Transit Damage (Vendor Fault)' | 'Missing Accessory' | 'Severe Damage / Loss';
  findingDescription?: string;
  proposedDeductionAmount: number;
  approvedDeductionAmount: number;
  transitDamageBlockedByBR026: boolean; // True if damage at warehouse wasn't in pickup photo!
  customerResponse?: 'Pending Customer Review' | 'Accepted' | 'Disputed';
  customerDisputeNotes?: string;
  disputeCaseId?: string;
}

export interface BookingOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerType: 'Individual' | 'Business';
  productId: string;
  productTitle: string;
  category: ProductCategory;
  workflowType: BookingWorkflowType;
  inventoryId: string;
  fulfillingVendorId: string; // Snapshot retained even if source changes later (FR-INV-011 / BR-006)
  fulfillingVendorName: string;
  serviceLocation: string;
  allocatedSerial?: string;
  quantity: number;
  tenureMonths: 1 | 3 | 6 | 12 | 24;
  startDate: string;
  endDate: string;
  deliveryAddress: string;
  status: BookingLifecycleStatus;
  // Price Snapshot (FR-PRC-005 / BR-006)
  monthlyRentRate: number;
  securityDepositAmount: number; // 4x monthly rent (FR-PAY-004)
  deliveryFee: number;
  siteVisitFee: number;
  installationMaterialFee: number;
  gstPercent: number;
  reservationHoldExpiresAt?: string; // FR-INV-004
  blacklistFlagReason?: string; // FR-BKG-002 / FR-BLK-005
  siteVisit?: SiteVisitRecord;
  agreementId: string;
  deliveryCompletedAt?: string;
  deliveryEvidencePhoto?: string;
  returnRecord?: ReturnInspectionRecord;
  createdAt: string;
}

// Section 7.13 & 7.14 — 5-Invoice Financial Split & Segregated Deposit Ledger (FR-PAY-011, FR-DEP-002)
export type InvoiceChargeType =
  | 'SITE_VISIT_INVOICE' // 1. Site Visit Invoice
  | 'INSTALLATION_MATERIAL_INVOICE' // 2. Installation & Material Rate-Card Invoice
  | 'PERIODIC_RENTAL_INVOICE' // 3. Rental Charge Invoice (Cycle 1, Cycle 2, etc.)
  | 'SECURITY_DEPOSIT_COLLECTION_NOTE' // 4. Segregated 4x Deposit Note
  | 'POST_RETURN_ADJUSTMENT_INVOICE'; // 5. Late / Unrecovered Damage Adjustment Invoice

export type PaymentState =
  | 'Initiated'
  | 'Pending'
  | 'Successful'
  | 'Failed'
  | 'Cancelled'
  | 'Reversed'
  | 'Partially Refunded'
  | 'Refunded';

export interface FinancialInvoiceDocument {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  chargeType: InvoiceChargeType;
  title: string;
  cycleNumber?: number;
  baseAmount: number;
  taxAmount: number; // 0 for Security Deposit Note (BR-011)
  totalPayable: number;
  paymentState: PaymentState;
  providerReference?: string;
  dueDate: string;
  paidAt?: string;
  linkedCreditNoteId?: string;
  correctionReason?: string;
}

export interface SegregatedDepositLedger {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  productTitle: string;
  expectedDeposit: number; // 4 months rent
  collectedDeposit: number;
  heldBalance: number;
  proposedDeduction: number;
  approvedDeduction: number;
  disputedAmount: number;
  netRefundableAmount: number;
  refundedAmount: number;
  refundStatus: 'Held in Vault' | 'Inspection Pending' | 'Deduction Disputed' | 'Scheduled (14-Day Window)' | 'Refund Processed' | 'Refund Failed';
  settlementDueDate?: string; // 14 days after rental settlement (FR-DEP-006)
  refundProviderRef?: string;
}

// Section 7.11 — Maintenance, Repairs & Asset Replacement (FR-SRV-001 to 006)
export interface ServiceMaintenanceTicket {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  productTitle: string;
  currentAssetSerial: string;
  issueDescription: string;
  status: 'New' | 'Scheduled' | 'In Progress' | 'Resolved' | 'Closed';
  replacementRequested: boolean;
  replacementAssetSerial?: string;
  customerReplacementConsent: boolean;
  downtimeCreditAmount: number;
  createdAt: string;
}

// Section 7.12 & 7.17 — Damage/Loss Disputes & Customer Support Complaints (FR-DSP, FR-SUP)
export interface DisputeCaseRecord {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  productTitle: string;
  caseType: 'Return Damage Deduction' | 'Missing Accessory' | 'Transit Damage Attribution' | 'Billing / Invoice Dispute' | 'Severe Asset Loss';
  status: 'Open' | 'Customer Response Pending' | 'Under Platform Review' | 'Escalated' | 'Decided' | 'Closed';
  allegationSummary: string;
  policyClauseCited: string;
  proposedChargeAmount: number;
  finalApprovedAmount?: number;
  preDispatchPhoto: string;
  pickupHandoverPhoto?: string;
  warehouseReturnPhoto: string;
  customerResponseText?: string;
  vendorRecommendation: string;
  platformMediatorDecision?: string;
  severeViolationBlacklistTriggered?: boolean; // FR-DSP-005
  dueDate: string;
  createdAt: string;
}

export interface SupportComplaintTicket {
  id: string;
  bookingId: string;
  submittedByRole: 'Customer' | 'Vendor';
  submitterName: string;
  vendorId: string;
  category: 'Delivery Delay' | 'Appliance Cooling / Quality' | 'Invoice / Deposit Query' | 'Installation Conduct';
  priority: 'Standard' | 'High' | 'SLA Breach Risk';
  status: 'Open' | 'Vendor Assigned' | 'Escalated to Platform Review' | 'Resolved' | 'Closed';
  description: string;
  publicCommunicationLog: { author: string; role: string; message: string; timestamp: string }[];
  internalAdminNotes: string; // Hidden from customers/unauthorised vendors (FR-SUP-002)
  slaDeadline: string;
  resolutionSummary?: string;
}

// Section 7.15 — Platform Commission & Vendor Settlements (FR-SET-001 to 008)
export type SettlementPayoutStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Ready'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'On Hold — Vendor Termination' // FR-VEN-013
  | 'Disputed';

export interface VendorSettlementStatement {
  id: string;
  vendorId: string;
  vendorName: string;
  periodLabel: string;
  grossEligibleCollections: number;
  platformCommissionPercent: number;
  platformCommissionFee: number;
  refundsAndChargebacks: number;
  damageRecoveryCredit: number;
  terminationHoldbackAmount: number;
  netVendorPayable: number;
  status: SettlementPayoutStatus;
  preparedByActor: string; // Segregation of duties (FR-SET-008): preparer != approver
  approvedByActor?: string;
  payoutReference?: string;
  createdAt: string;
}

// Section 7.20 — Unified Blacklist & Risk Flagging Registry (FR-BLK-001 to 008)
export interface BlacklistEntry {
  id: string;
  ledgerType: 'VENDOR_BLACKLIST' | 'CUSTOMER_BLACKLIST';
  entityId: string;
  entityName: string;
  categoryReason: 'Terminated Contract' | 'Severe Payment Default' | 'Heavy Asset Damage / Loss' | 'Extreme Policy Violation / Fraud';
  triggeringCaseOrBookingId: string;
  matchedIdentifiers: {
    phone: string;
    email: string;
    taxIdOrGstin?: string;
    kycOrPan?: string;
    bankOrPaymentFingerprint: string;
    addressSnippet: string;
  };
  evidenceSummary: string;
  evidencePhotoUrl?: string;
  outstandingDuesAmount: number;
  blockedAttemptsCount: number;
  status: 'Active Blacklist' | 'Under Appeal/Review' | 'Whitelisted / Exception Override';
  effectiveTimestamp: string;
  enrolledByActor: string;
  overrideHistory?: {
    overriddenByAdmin: string;
    overrideReason: string;
    timestamp: string;
  };
}

// Section 7.16, 7.19 & 18 — Notifications, Immutable Audit Log & Open Business Decisions (OBD)
export interface PlatformNotification {
  id: string;
  eventCode: string; // e.g. FR-NTF-001
  title: string;
  message: string;
  recipientRole: UserRole | 'ALL';
  vendorScopeId?: string;
  customerScopeId?: string;
  category: 'Inventory Approval' | 'Blacklist Alert' | 'Booking & Agreement' | 'Fulfilment & Pickup' | 'Deposit & Billing';
  priority: 'normal' | 'high' | 'critical';
  read: boolean;
  timestamp: string;
  linkedView?: NavigationTab;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  moduleCode: string; // e.g., FR-INV-011, FR-BLK-008, BR-026
  actionSummary: string;
  affectedRecordId: string;
  priorValue?: string;
  newValue?: string;
  mandatoryReason: string;
}

export interface OpenBusinessDecisionItem {
  id: string; // OBD-01 to OBD-25
  title: string;
  priority: 'Critical' | 'High' | 'Medium';
  selectedOption: string;
  options: string[];
  ownerRole: string;
  effectiveDate: string;
  status: 'Approved Policy Active' | 'Pending Stakeholder Sign-Off';
}

export type NavigationTab =
  | 'MARKETPLACE'
  | 'FOR_BUSINESS'
  | 'MY_RENTALS'
  | 'AGREEMENTS_ESIGN'
  | 'INVOICES_DEPOSITS'
  | 'THREE_WAY_INSPECTION'
  | 'VENDOR_PORTAL'
  | 'FIELD_OPERATIONS'
  | 'ADMIN_GOVERNANCE'
  | 'BLACKLIST_REGISTRY'
  | 'SETTLEMENTS_FINANCE'
  | 'SUPPORT_DISPUTES'
  | 'AUDIT_OBD_REPORTS';
