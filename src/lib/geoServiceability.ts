// ============================================================================
// KaroRent Geographic Serviceability Engine (Spatial Match)
// Dual Modes: Radial Distance (RADIUS_KM) & Explicit Whitelist (EXPLICIT_PINCODES)
// Non-Contiguous Delivery Pocket Mitigation & Reverse Pickup Protocol
// ============================================================================

import { VendorRecord } from '../types/srs';

export interface PostalCentroid {
  pincode: string;
  areaName: string;
  lat: number;
  lng: number;
  reversePickupCapable: boolean;
  zone: string;
}

// Master Postal Centroid Database for Metropolitan Delivery Hubs
export const MASTER_POSTAL_CENTROIDS: Record<string, PostalCentroid> = {
  '560038': {
    pincode: '560038',
    areaName: 'Indiranagar / HAL 2nd Stage',
    lat: 12.9784,
    lng: 77.6408,
    reversePickupCapable: true,
    zone: 'East Urban',
  },
  '560001': {
    pincode: '560001',
    areaName: 'MG Road / Brigade Road / Central',
    lat: 12.9756,
    lng: 77.6066,
    reversePickupCapable: true,
    zone: 'Central Urban',
  },
  '560034': {
    pincode: '560034',
    areaName: 'Koramangala 1st-4th Block',
    lat: 12.9352,
    lng: 77.6245,
    reversePickupCapable: true,
    zone: 'South East',
  },
  '560095': {
    pincode: '560095',
    areaName: 'Koramangala 5th-8th Block',
    lat: 12.9333,
    lng: 77.6322,
    reversePickupCapable: true,
    zone: 'South East',
  },
  '560102': {
    pincode: '560102',
    areaName: 'HSR Layout Sectors 1-7',
    lat: 12.9121,
    lng: 77.6446,
    reversePickupCapable: true,
    zone: 'South East',
  },
  '560066': {
    pincode: '560066',
    areaName: 'Whitefield / ITPL / Hope Farm',
    lat: 12.9698,
    lng: 77.7500,
    reversePickupCapable: true,
    zone: 'East Tech Corridor',
  },
  '560042': {
    pincode: '560042',
    areaName: 'Frazer Town / Pulakeshinagar',
    lat: 12.9968,
    lng: 77.6130,
    reversePickupCapable: true,
    zone: 'North Central',
  },
  '560076': {
    pincode: '560076',
    areaName: 'BTM Layout 2nd Stage / Bannerghatta',
    lat: 12.9166,
    lng: 77.6101,
    reversePickupCapable: true,
    zone: 'South Urban',
  },
  '560029': {
    pincode: '560029',
    areaName: 'Dairy Circle / Tavarekere',
    lat: 12.9344,
    lng: 77.6022,
    reversePickupCapable: true,
    zone: 'South Urban',
  },
  '560004': {
    pincode: '560004',
    areaName: 'Basavanagudi / Gandhi Bazaar',
    lat: 12.9422,
    lng: 77.5753,
    reversePickupCapable: true,
    zone: 'South Heritage',
  },
  '560092': {
    pincode: '560092',
    areaName: 'Hebbal / Bellary Road',
    lat: 13.0358,
    lng: 77.5970,
    reversePickupCapable: true,
    zone: 'North Urban',
  },
  '560100': {
    pincode: '560100',
    areaName: 'Electronic City Phase 1 & 2',
    lat: 12.8452,
    lng: 77.6602,
    reversePickupCapable: true,
    zone: 'Far South Corridor',
  },
  '560067': {
    pincode: '560067',
    areaName: 'Kadugodi / Belathur',
    lat: 12.9982,
    lng: 77.7609,
    reversePickupCapable: false, // Pocket with limited courier reverse fleet
    zone: 'Far East Peripheral',
  },
};

// Haversine geodesic distance in kilometers between two lat/lng coordinates
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Fallback resolver for any arbitrary 6-digit Indian postal code
export function getPostalCentroid(pincode: string): PostalCentroid {
  const clean = pincode.trim().slice(0, 6);
  if (MASTER_POSTAL_CENTROIDS[clean]) {
    return MASTER_POSTAL_CENTROIDS[clean];
  }

  // Derive pseudo-centroid based on standard postal prefix hashing for demo flexibility
  const codeNum = parseInt(clean, 10) || 560001;
  const latOffset = ((codeNum % 100) - 50) * 0.003;
  const lngOffset = (((Math.floor(codeNum / 100)) % 100) - 50) * 0.003;

  return {
    pincode: clean,
    areaName: `Postal Zone ${clean}`,
    lat: 12.9716 + latOffset,
    lng: 77.5946 + lngOffset,
    reversePickupCapable: clean !== '560067', // 560067 is sample unserviceable reverse pocket
    zone: 'Extended Metro Hub',
  };
}

export interface ServiceabilityEvaluationResult {
  isServiceable: boolean;
  distanceKm?: number;
  matchedMode: 'RADIUS_KM' | 'EXPLICIT_PINCODES';
  isExcludedPocket: boolean;
  reversePickupConfirmed: boolean;
  rejectionReason?: string;
  vendorName: string;
  warehouseCoordinates?: {
    lat: number;
    lng: number;
    address: string;
  };
  allowedRadiusKm?: number;
}

/**
 * High-performance (<50ms) Spatial Serviceability Resolver
 * Evaluates whether a vendor's delivery fleet & reverse pickup can service a target pincode.
 */
export function evaluateVendorServiceability(
  pincode: string,
  vendor: VendorRecord
): ServiceabilityEvaluationResult {
  const cleanPincode = pincode.trim().slice(0, 6);
  const centroid = getPostalCentroid(cleanPincode);

  const mode = vendor.serviceMode || 'RADIUS_KM';
  const warehouse = vendor.warehouseCoordinates || {
    lat: 12.9609,
    lng: 77.6387,
    address: 'Domlur Main Logistics Hub, 560071',
    postalCode: '560071',
  };
  const radiusKm = vendor.serviceRadiusKm || 25;
  const excludedPincodes = vendor.excludedPincodes || ['560067'];
  const explicitPincodes = vendor.explicitPincodes || [
    '560038',
    '560001',
    '560034',
    '560095',
    '560102',
    '560042',
    '560076',
    '560029',
  ];

  // 1. Reverse Pickup Guarantee Protocol Check (Hard Gate)
  const vendorSupportsReverse = vendor.reversePickupSupported !== false;
  const centroidSupportsReverse = centroid.reversePickupCapable;
  const reversePickupConfirmed = vendorSupportsReverse && centroidSupportsReverse;

  if (!reversePickupConfirmed) {
    return {
      isServiceable: false,
      matchedMode: mode,
      isExcludedPocket: false,
      reversePickupConfirmed: false,
      vendorName: vendor.displayName,
      rejectionReason:
        'Reverse pickup courier fleet is unconfirmed for this postal code. KaroRent zero-deposit safety protocol requires guaranteed reverse transit capability prior to booking.',
    };
  }

  // 2. Mode A: Radial Distance Model
  if (mode === 'RADIUS_KM') {
    const distance = calculateHaversineDistanceKm(
      warehouse.lat,
      warehouse.lng,
      centroid.lat,
      centroid.lng
    );

    // Non-Contiguous Delivery Pocket Exclusion (Blacklist Mitigation)
    if (excludedPincodes.includes(cleanPincode)) {
      return {
        isServiceable: false,
        distanceKm: distance,
        matchedMode: 'RADIUS_KM',
        isExcludedPocket: true,
        reversePickupConfirmed,
        vendorName: vendor.displayName,
        rejectionReason: `Postal code ${cleanPincode} is blacklisted by vendor as a non-contiguous delivery pocket (steep toll barrier / river crossing / infrastructure constraint).`,
      };
    }

    if (distance > radiusKm) {
      return {
        isServiceable: false,
        distanceKm: distance,
        matchedMode: 'RADIUS_KM',
        isExcludedPocket: false,
        reversePickupConfirmed,
        vendorName: vendor.displayName,
        warehouseCoordinates: warehouse,
        allowedRadiusKm: radiusKm,
        rejectionReason: `Distance (${distance} km) exceeds vendor's maximum operating radius (${radiusKm} km) from ${warehouse.address}.`,
      };
    }

    return {
      isServiceable: true,
      distanceKm: distance,
      matchedMode: 'RADIUS_KM',
      isExcludedPocket: false,
      reversePickupConfirmed: true,
      vendorName: vendor.displayName,
      warehouseCoordinates: warehouse,
      allowedRadiusKm: radiusKm,
    };
  }

  // 3. Mode B: Explicit Pincode Whitelist
  const isWhitelisted = explicitPincodes.includes(cleanPincode);
  if (!isWhitelisted) {
    return {
      isServiceable: false,
      matchedMode: 'EXPLICIT_PINCODES',
      isExcludedPocket: false,
      reversePickupConfirmed,
      vendorName: vendor.displayName,
      rejectionReason: `Postal code ${cleanPincode} is not currently included in vendor's explicitly certified delivery whitelist.`,
    };
  }

  return {
    isServiceable: true,
    matchedMode: 'EXPLICIT_PINCODES',
    isExcludedPocket: false,
    reversePickupConfirmed: true,
    vendorName: vendor.displayName,
  };
}
