import { z } from 'zod';

export const nonWhitespaceText = (fieldLabel: string, minLen = 3) =>
  z
    .string()
    .trim()
    .min(minLen, `${fieldLabel} is required and cannot be empty.`);

export const mandatoryReasonSchema = z
  .string()
  .trim()
  .min(10, 'Please provide a clear, documented reason (at least 10 characters) for the audit log.');

export const indianMobileSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6–9.');

export const gstinSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid 15-character GSTIN (e.g., 29AABCC1234D1Z5).');

export const bookingCheckoutSchema = z
  .object({
    quantity: z
      .number()
      .int('Quantity must be a whole number.')
      .positive('Quantity must be at least 1 unit.'),
    maxAvailable: z.number(),
    startDate: z.string().min(1, 'Start date is required.'),
    tenureMonths: z.union([z.literal(3), z.literal(6), z.literal(12), z.literal(24)]),
    deliveryAddress: nonWhitespaceText('Delivery address', 8),
    recipientPhone: indianMobileSchema,
  })
  .refine((data) => data.quantity <= data.maxAvailable, {
    message: 'Requested quantity exceeds available stock for the selected dates.',
    path: ['quantity'],
  })
  .refine(
    (data) => {
      const selected = new Date(data.startDate);
      const today = new Date('2026-10-28T00:00:00');
      return selected >= today;
    },
    {
      message: 'Rental start date cannot be in the past.',
      path: ['startDate'],
    }
  );

export const siteVisitMetricsSchema = z.object({
  feasible: z.boolean(),
  unfeasibleReason: z.string().optional(),
  measuredCopperPipeMeters: z
    .number()
    .min(0, 'Pipe length cannot be negative.')
    .max(30, 'Pipe length above 30m requires custom engineering review.'),
  coreCuttingRequired: z.boolean(),
  outdoorBracketRequired: z.boolean(),
  drainageExtensionMeters: z.number().min(0, 'Drainage length cannot be negative.').max(25),
  technicianNotes: nonWhitespaceText('Site inspection notes', 5),
});

export const pickupPhotoGateSchema = z.object({
  photoUrl: z
    .string()
    .trim()
    .min(5, 'A customer-premise pickup photo is required before marking the item as Picked Up.'),
  exifTimestamp: z
    .string()
    .trim()
    .min(10, 'Verified timestamp is required at customer handover.'),
  fileFormat: z.enum(['JPEG', 'PNG', 'MP4', 'PDF'], {
    errorMap: () => ({ message: 'Unsupported file format. Only JPEG, PNG, PDF, or MP4 are permitted.' }),
  }),
});

export const vendorOnboardingSchema = z.object({
  legalBusinessName: nonWhitespaceText('Legal Business Name', 4),
  displayName: nonWhitespaceText('Storefront Display Name', 3),
  taxIdGstin: gstinSchema,
  panNumber: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid 10-character PAN (e.g., AABCC1234D).'),
  registeredPhone: indianMobileSchema,
  email: z.string().trim().email('Enter a valid business email address.'),
  authorisedContactName: nonWhitespaceText('Authorised Contact Person', 3),
  bankAccountMasked: nonWhitespaceText('Bank Payout Account Number', 6),
  serviceAreas: z.string().trim().min(3, 'Specify at least one service area/city.'),
  mandatoryPickupPhotoClauseAccepted: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the mandatory doorstep pickup photo verification clause.',
    }),
  }),
});

export const masterPricingSchema = z.object({
  baseMonthlyRent: z.number().positive('Monthly rental rate must be greater than ₹0.'),
  depositMonthsMultiple: z.number().min(1).max(12),
  siteVisitFee: z.number().min(0, 'Site visit fee must be non-negative.'),
  copperPipeRatePerMeter: z.number().min(0),
});
