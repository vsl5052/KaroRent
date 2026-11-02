// ============================================================================
// KaroRent Mathematical Temporal Calendar & Turnaround Buffers
// Buffer Turnaround (48h Quarantine), Blocked Interval Formula,
// Dynamic Date Graying, Tenure Extension Collision Check & Cascading Resiliency
// ============================================================================

import { BookingOrder, VirtualInventoryItem, PlatformMasterProduct } from '../types/srs';

export const DEFAULT_BUFFER_TURNAROUND_DAYS = 2; // 48-Hour Mandatory Operational Quarantine
export const CHECKOUT_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 Minutes Distributed Hold (SET NX EX 900)

export interface BlockedDateInterval {
  bookingId: string;
  unitSerial?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  quarantineEndDate: string; // YYYY-MM-DD (End + buffer_turnaround_days)
  status: string;
  quarantinePhases: {
    day1: string; // "Reverse transit & warehouse return receipt"
    day2: string; // "3-Way inspection, sanitization & QC bench-testing"
  };
}

export interface NextAvailableDateInfo {
  availableDate: string; // YYYY-MM-DD
  formattedDate: string;
  isImmediate: boolean;
  totalAvailableUnits: number;
  quarantineNotice?: string;
  timelinePhases?: {
    returnDate: string;
    day1Intake: string;
    day2Sanitization: string;
    dispatchReadyDate: string;
  };
}

export interface TenureCollisionResult {
  hasCollision: boolean;
  currentEnd: string;
  requestedNewEnd: string;
  bufferEndDate: string;
  conflictingBooking?: BookingOrder;
  collisionDays: number;
  shieldActivated: boolean;
  resolutionType: 'CLEAN_APPROVED' | 'BUFFER_STOCK_REASSIGNED' | 'COLLISION_BLOCKED';
  message: string;
}

// Utility to add days to a YYYY-MM-DD string
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Utility to parse difference in calendar days
export function getDaysDiff(d1: string, d2: string): number {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

/**
 * Interval Overlap Formula:
 * Blocked Interval = [Start_Date, End_Date + buffer_turnaround_days]
 * Any booking in Confirmed, Active, Fulfilment, or Inspection holds a temporal block.
 */
export function getProductBlockedIntervals(
  productId: string,
  bookings: BookingOrder[],
  bufferDays: number = DEFAULT_BUFFER_TURNAROUND_DAYS
): BlockedDateInterval[] {
  const activeStatuses = [
    'Confirmed',
    'Fulfilment In Progress',
    'Active Rental',
    'Delivered & Active',
    'Expiring Soon',
    'Renewal Requested',
    'Return Requested',
    'Pickup Scheduled',
    'Picked Up — Under Inspection',
  ];

  const relevantBookings = bookings.filter(
    (b) => b.productId === productId && activeStatuses.includes(b.status)
  );

  return relevantBookings.map((b) => {
    const quarantineEndDate = addDaysToDateString(b.endDate, bufferDays);
    return {
      bookingId: b.id,
      unitSerial: b.allocatedSerial,
      startDate: b.startDate,
      endDate: b.endDate,
      quarantineEndDate,
      status: b.status,
      quarantinePhases: {
        day1: 'Day 1: Reverse transit & warehouse intake receipt',
        day2: 'Day 2: 3-way photo inspection, deep sanitization & functional bench-test',
      },
    };
  });
}

/**
 * Checks whether a given date is blocked for a product.
 * Returns true if available units at that date <= 0.
 */
export function isDateBlocked(
  dateStr: string,
  productId: string,
  bookings: BookingOrder[],
  totalUnitsCount: number,
  bufferDays: number = DEFAULT_BUFFER_TURNAROUND_DAYS
): boolean {
  const intervals = getProductBlockedIntervals(productId, bookings, bufferDays);
  const targetTime = new Date(dateStr).getTime();

  // Count active blocks overlapping targetDate
  let overlappingCount = 0;
  for (const interval of intervals) {
    const startTime = new Date(interval.startDate).getTime();
    const quarantineEndTime = new Date(interval.quarantineEndDate).getTime();
    if (targetTime >= startTime && targetTime <= quarantineEndTime) {
      overlappingCount += 1;
    }
  }

  return overlappingCount >= totalUnitsCount;
}

/**
 * Dynamic Next Available Date Calculator on PDP
 * Real-time query finding the earliest day where available units > 0 after operational quarantine.
 */
export function calculateNextAvailableDate(
  productId: string,
  inventory: VirtualInventoryItem,
  bookings: BookingOrder[],
  startDateQuery: string = new Date().toISOString().split('T')[0],
  bufferDays: number = DEFAULT_BUFFER_TURNAROUND_DAYS
): NextAvailableDateInfo {
  const totalUnits = inventory.declaredQuantity || 4;
  const intervals = getProductBlockedIntervals(productId, bookings, bufferDays);

  // If there are currently free units in unallocated pool, immediate next-day delivery is available
  if (inventory.availableQuantity > 0) {
    const nextDay = addDaysToDateString(startDateQuery, 1);
    return {
      availableDate: nextDay,
      formattedDate: new Date(nextDay).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isImmediate: true,
      totalAvailableUnits: inventory.availableQuantity,
    };
  }

  // Scan future dates day by day up to 90 days ahead
  let candidateDate = startDateQuery;
  for (let i = 1; i <= 90; i++) {
    candidateDate = addDaysToDateString(startDateQuery, i);
    const blocked = isDateBlocked(candidateDate, productId, bookings, totalUnits, bufferDays);
    if (!blocked) {
      // Find latest preceding rental return to construct turnaround timeline
      const recentReturn = intervals
        .filter((int) => new Date(int.quarantineEndDate).getTime() <= new Date(candidateDate).getTime())
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

      const returnDate = recentReturn ? recentReturn.endDate : addDaysToDateString(candidateDate, -2);
      const day1 = addDaysToDateString(returnDate, 1);
      const day2 = addDaysToDateString(returnDate, 2);

      return {
        availableDate: candidateDate,
        formattedDate: new Date(candidateDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        isImmediate: false,
        totalAvailableUnits: 1,
        quarantineNotice: `Preceding lease completes on ${returnDate}. 48-Hour mandatory operational quarantine (transit intake + deep sanitization) releases this unit for dispatch on ${candidateDate}.`,
        timelinePhases: {
          returnDate,
          day1Intake: `Day 1 (${day1}): Reverse Transit & Warehouse Return Receipt`,
          day2Sanitization: `Day 2 (${day2}): 3-Way Inspection, Deep Sanitization & QC Bench-Testing`,
          dispatchReadyDate: `Day 3 (${candidateDate}): Fresh Mint Unit Dispatched to Your Doorstep`,
        },
      };
    }
  }

  const fallback = addDaysToDateString(startDateQuery, 14);
  return {
    availableDate: fallback,
    formattedDate: fallback,
    isImmediate: false,
    totalAvailableUnits: 0,
  };
}

/**
 * Tenure Extension Collision Check (WF-06):
 * Checks if the specific unit or inventory has an existing downstream booking
 * starting within [Current_End, New_End + Buffer].
 */
export function checkTenureExtensionCollision(
  booking: BookingOrder,
  additionalMonths: number,
  allBookings: BookingOrder[],
  inventoryPool: VirtualInventoryItem[],
  bufferDays: number = DEFAULT_BUFFER_TURNAROUND_DAYS
): TenureCollisionResult {
  const currentEnd = booking.endDate;
  const currentEndDate = new Date(currentEnd);
  currentEndDate.setMonth(currentEndDate.getMonth() + additionalMonths);
  const requestedNewEnd = currentEndDate.toISOString().split('T')[0];
  const bufferEndDate = addDaysToDateString(requestedNewEnd, bufferDays);

  const newEndMs = new Date(requestedNewEnd).getTime();
  const currentEndMs = new Date(currentEnd).getTime();

  // Find any conflicting booking on this product starting within [Current_End, New_End + Buffer]
  const conflicting = allBookings.find((b) => {
    if (b.id === booking.id || b.productId !== booking.productId) return false;
    if (b.status === 'Cancelled' || b.status === 'Returned & Closed') return false;

    const downstreamStartMs = new Date(b.startDate).getTime();
    // Overlap condition
    return downstreamStartMs >= currentEndMs && downstreamStartMs <= new Date(bufferEndDate).getTime();
  });

  if (!conflicting) {
    return {
      hasCollision: false,
      currentEnd,
      requestedNewEnd,
      bufferEndDate,
      collisionDays: 0,
      shieldActivated: false,
      resolutionType: 'CLEAN_APPROVED',
      message: `Zero collision detected. Rental window [${currentEnd} to ${requestedNewEnd}] + 48h buffer is completely clear for continuous tenancy.`,
    };
  }

  // A collision exists. Check if unreserved buffer stock is available to absorb downstream reservation
  const inv = inventoryPool.find((i) => i.productId === booking.productId);
  const hasBufferStock = (inv?.availableQuantity || 0) > 0;

  if (hasBufferStock) {
    return {
      hasCollision: true,
      currentEnd,
      requestedNewEnd,
      bufferEndDate,
      conflictingBooking: conflicting,
      collisionDays: getDaysDiff(conflicting.startDate, requestedNewEnd),
      shieldActivated: true,
      resolutionType: 'BUFFER_STOCK_REASSIGNED',
      message: `Downstream booking ${conflicting.id} overlaps on ${conflicting.startDate}. Cascading Buffer Shield activated: downstream booking will seamlessly route to certified unreserved stock without interrupting your tenancy extension.`,
    };
  }

  return {
    hasCollision: true,
    currentEnd,
    requestedNewEnd,
    bufferEndDate,
    conflictingBooking: conflicting,
    collisionDays: getDaysDiff(conflicting.startDate, requestedNewEnd),
    shieldActivated: false,
    resolutionType: 'COLLISION_BLOCKED',
    message: `Tenure extension collision: Downstream booking ${conflicting.id} commences on ${conflicting.startDate} with zero unreserved buffer units. Please select a shorter extension (+1 month) or contact support for priority warehouse allocation.`,
  };
}
