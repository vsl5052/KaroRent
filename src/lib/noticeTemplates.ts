import { BookingOrder, FinancialInvoiceDocument } from '../types/srs';

export interface NoticeGeneratorParams {
  booking: BookingOrder;
  invoice: FinancialInvoiceDocument;
  customerMobile?: string;
  customerEmail?: string;
  lateFeeAmount?: number;
  cureDeadlineDate?: string;
  repossessionDate?: string;
  repossessionTimeWindow?: string;
  agentAuthCode?: string;
}

export function generateNotice1(params: NoticeGeneratorParams): { subject: string; body: string } {
  const { booking, invoice, customerMobile = '+91 98860 12345', customerEmail = 'ananya.sharma@example.com' } = params;
  const currentDate = new Date().toISOString().split('T')[0];

  const subject = `Payment Reminder: Invoice ${invoice.id} for your rental of ${booking.productTitle}`;
  const body = `Date: ${currentDate}
To: ${booking.customerName}
Registered Mobile: ${customerMobile}
Registered Email: ${customerEmail}
Booking ID: ${booking.id}
Invoice ID: ${invoice.id}
Due Date: ${invoice.dueDate}
Outstanding Amount: INR ${invoice.totalPayable.toLocaleString('en-IN')}

Subject: ${subject}

Dear ${booking.customerName},

This is a courtesy reminder from KaroRent that payment for your periodic rental invoice ${invoice.id}, covering the current monthly billing period for the equipment listed below, was due on ${invoice.dueDate} and remains unpaid:

  * Product Description: ${booking.productTitle}
  * Serial / Asset Number: ${booking.allocatedSerial || 'SN-AC15-2026-104'}
  * Total Balance Due: INR ${invoice.totalPayable.toLocaleString('en-IN')}

We understand that administrative oversights happen. Please complete this payment within three (3) business days using the secure payment link in your customer dashboard to maintain uninterrupted service.

If you have already processed this transaction within the last 24 hours, kindly disregard this notice while our system reconciles the payment gateway record.

Sincerely,  
Billing Operations Department  
KaroRent Platform  
billing@karorent.com | +91 80 4567 8900`;

  return { subject, body };
}

export function generateNotice2(params: NoticeGeneratorParams): { subject: string; body: string } {
  const {
    booking,
    invoice,
    lateFeeAmount = 500,
    cureDeadlineDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  } = params;
  const currentDate = new Date().toISOString().split('T')[0];
  const principalOverdue = invoice.baseAmount + invoice.taxAmount;
  const totalWithLateFee = principalOverdue + lateFeeAmount;

  const subject = `FORMAL NOTICE OF DEFAULT: Immediate Cure Required for Booking ${booking.id}`;
  const body = `FORMAL DEMAND FOR PAYMENT / CURE NOTICE
Delivered via Registered Email, SMS, and In-App Portal Alert

Date: ${currentDate}
To: ${booking.customerName}
Business / Individual Name: ${booking.customerName}
Address: ${booking.deliveryAddress}
Booking ID: ${booking.id}
Rental Contract Version: Standard Residential Agreement v4.0
Overdue Invoice ID: ${invoice.id}
Principal Overdue: INR ${principalOverdue.toLocaleString('en-IN')}
Contractual Late Surcharge: INR ${lateFeeAmount.toLocaleString('en-IN')}
Total Payable: INR ${totalWithLateFee.toLocaleString('en-IN')}

Subject: ${subject}

Dear ${booking.customerName},

You are hereby notified that you are in formal contractual default of your Rental Agreement due to failure to settle invoice ${invoice.id} within the designated payment terms.

In accordance with Platform Terms of Service and Clause 14.2 of your executed Rental Contract, the following operational measures have been placed on your account:
1. Account Restrictions: Your platform account is placed in 'Restricted' status. You are barred from creating new rental bookings, requesting contract extensions, or updating account addresses across all platform vendors.
2. Late Fees Assessed: A contractual late fee of INR ${lateFeeAmount.toLocaleString('en-IN')} has been applied to your ledger.

DEMAND TO CURE:
You are granted a final period of five (5) calendar days—expiring on ${cureDeadlineDate} at 23:59 IST—to cure this payment default by clearing the total outstanding balance of INR ${totalWithLateFee.toLocaleString('en-IN')} via the online customer billing portal.

CONSEQUENCES OF NON-PAYMENT:
If full payment is not reconciled by ${cureDeadlineDate}:
- Your Rental Agreement will be terminated for material contractual breach without further notice.
- Platform logistics teams will be dispatched to your premises to immediately repossess the equipment.
- All repossession, logistics, de-installation, and legal costs will be deducted from your Security Deposit.

Sincerely,  
Risk & Legal Recoveries Division  
KaroRent Platform  
Indiranagar, Bengaluru, Karnataka 560038`;

  return { subject, body };
}

export function generateNotice3(params: NoticeGeneratorParams): { subject: string; body: string } {
  const {
    booking,
    invoice,
    lateFeeAmount = 500,
    repossessionDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    repossessionTimeWindow = '10:00 AM – 01:00 PM',
    agentAuthCode = `AUTH-${booking.id.slice(-4)}-REC`,
  } = params;
  const currentDate = new Date().toISOString().split('T')[0];
  const totalDelinquency = invoice.totalPayable + lateFeeAmount;
  const depositBalance = booking.securityDepositAmount || 8400;

  const subject = `NOTICE OF TERMINATION AND IMMEDIATE REPOSSESSION DEMAND — BOOKING ${booking.id}`;
  const body = `FINAL NOTICE OF CONTRACT TERMINATION AND DEMAND FOR PHYSICAL ASSET SURRENDER
Delivered via Registered Email, SMS, Courier, and Field Agent Service

Date: ${currentDate}
To: ${booking.customerName}
Physical Premises Address: ${booking.deliveryAddress}
Customer ID: ${booking.customerId}
Rental Agreement Ref: AGR-${booking.id}
Asset Details: ${booking.productTitle} | Serial No: ${booking.allocatedSerial || 'SN-AC15-2026-104'}
Total Unpaid Delinquency: INR ${totalDelinquency.toLocaleString('en-IN')}
Current Collateral Balance (Deposit Held): INR ${depositBalance.toLocaleString('en-IN')}

Subject: ${subject}

TAKE FORMAL NOTICE THAT:
1. CONTRACT TERMINATION: Because you failed to cure the payment default specified in our Notice of Default, your right to possess and operate the equipment listed above is REVOKED EFFECTIVE IMMEDIATELY. Rental Agreement AGR-${booking.id} is formally TERMINATED FOR MATERIAL BREACH.
2. CESSATION OF USE: Any continued operation or physical retention of the asset constitutes unauthorized conversion and civil/criminal misappropriation of property.

MANDATORY REPOSSESSION DEMAND:
Authorized field recovery agents from KaroRent / ${booking.fulfillingVendorName} are scheduled to enter your premises and take custody of the equipment on:

  Scheduled Pickup Date: ${repossessionDate}
  Pickup Time Window: ${repossessionTimeWindow}
  Recovery Team Authorization Code: ${agentAuthCode}

You are legally obligated to provide immediate, unhindered access to the equipment, including all components, accessories, power cords, and manuals. Our technicians will conduct a mandatory on-site inspection and photograph the equipment condition at handover pursuant to requirement FR-RET-002.

SECURITY DEPOSIT OFFSET DISCLOSURE:
In accordance with Clause 16 of your executed agreement, KaroRent shall exercise its statutory right of set-off against your INR ${depositBalance.toLocaleString('en-IN')} Security Deposit to satisfy:
  - All unpaid base rental charges up to the date of physical repossession.
  - Recovery, transport, and technician de-installation fees.
  - Rectification costs for any unrecorded physical damage, missing components, or deep abuse.
  - Administrative default fees.

NOTICE OF CRIMINAL & CIVIL PROCEEDINGS:
If you refuse surrender, deny entry to our recovery personnel, or fail to hand over the asset:
- Your identity, corporate credentials, tax ID, and contact data will be permanently registered on the Platform Customer Blacklist (FR-BLK-004), preventing any future marketplace commerce.
- A police complaint for Criminal Breach of Trust, Conversion, and Misappropriation of Movable Property will be lodged with local law enforcement.
- Formal legal proceedings will be initiated in the court of competent jurisdiction to recover the physical asset, outstanding dues, and associated legal costs.

To avoid field escalation and preserve any remaining deposit balance, contact the Recovery Coordinator immediately at +91 80 4567 8999 or access the resolution portal.

Issued by,  
Office of the General Counsel & Asset Protection Directorate  
KaroRent Platform Technologies Private Limited`;

  return { subject, body };
}
