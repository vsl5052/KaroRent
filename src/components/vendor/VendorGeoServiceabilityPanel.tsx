import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Truck,
  RotateCcw,
  Zap,
  HelpCircle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { VendorRecord } from '../../types/srs';
import { useKaroRentStore } from '../../store/useKaroRentStore';
import {
  evaluateVendorServiceability,
  MASTER_POSTAL_CENTROIDS,
  calculateHaversineDistanceKm,
  getPostalCentroid,
} from '../../lib/geoServiceability';

interface VendorGeoServiceabilityPanelProps {
  vendor: VendorRecord;
}

export const VendorGeoServiceabilityPanel: React.FC<VendorGeoServiceabilityPanelProps> = ({
  vendor,
}) => {
  const { updateVendorServiceability, addToast } = useKaroRentStore();

  // Local form state
  const [mode, setMode] = useState<'RADIUS_KM' | 'EXPLICIT_PINCODES'>(
    vendor.serviceMode || 'RADIUS_KM'
  );
  const [lat, setLat] = useState<number>(
    vendor.warehouseCoordinates?.lat ?? 12.9784
  );
  const [lng, setLng] = useState<number>(
    vendor.warehouseCoordinates?.lng ?? 77.6408
  );
  const [hubAddress, setHubAddress] = useState<string>(
    vendor.warehouseCoordinates?.address ?? 'Domlur Main Logistics Hub, 560071'
  );
  const [radiusKm, setRadiusKm] = useState<number>(
    vendor.serviceRadiusKm ?? 25
  );
  const [explicitPincodes, setExplicitPincodes] = useState<string[]>(
    vendor.explicitPincodes || [
      '560038',
      '560001',
      '560034',
      '560095',
      '560102',
      '560066',
      '560042',
    ]
  );
  const [excludedPincodes, setExcludedPincodes] = useState<
    Array<{ pincode: string; reason: string }>
  >(() => {
    if (vendor.excludedPincodes && vendor.excludedPincodes.length > 0) {
      return vendor.excludedPincodes.map((pin) => ({
        pincode: pin,
        reason:
          pin === '560067'
            ? 'Water body crossing & non-motorable bridge barrier'
            : 'Steep toll barrier / unserviceable transit corridor',
      }));
    }
    return [
      {
        pincode: '560067',
        reason: 'Water body crossing & non-motorable bridge barrier',
      },
    ];
  });
  const [reversePickupSupported, setReversePickupSupported] = useState<boolean>(
    vendor.reversePickupSupported ?? true
  );
  const [reverseFleetPartner, setReverseFleetPartner] = useState<string>(
    vendor.reversePickupFleetPartner || 'KaroRent Dedicated Express Reverse Fleet'
  );

  // New item inputs
  const [newWhitelistPin, setNewWhitelistPin] = useState('');
  const [csvWhitelistInput, setCsvWhitelistInput] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);

  const [newExclusionPin, setNewExclusionPin] = useState('');
  const [newExclusionReason, setNewExclusionReason] = useState(
    'Steep highway toll barrier & logistical turnaround delay'
  );

  // Real-time spatial resolver test box
  const [testPincode, setTestPincode] = useState('560038');

  // Build a draft vendor object for live test evaluation
  const draftVendor: VendorRecord = {
    ...vendor,
    serviceMode: mode,
    warehouseCoordinates: {
      lat,
      lng,
      address: hubAddress,
      postalCode: '560071',
    },
    serviceRadiusKm: radiusKm,
    explicitPincodes,
    excludedPincodes: excludedPincodes.map((e) => e.pincode),
    reversePickupSupported,
    reversePickupFleetPartner: reverseFleetPartner,
  };

  const testResult = evaluateVendorServiceability(testPincode, draftVendor);
  const testCentroid = getPostalCentroid(testPincode);

  const handleAddWhitelistPin = () => {
    const clean = newWhitelistPin.trim().replace(/\D/g, '');
    if (clean.length === 6 && !explicitPincodes.includes(clean)) {
      setExplicitPincodes([...explicitPincodes, clean]);
      setNewWhitelistPin('');
    }
  };

  const handleRemoveWhitelistPin = (pin: string) => {
    setExplicitPincodes(explicitPincodes.filter((p) => p !== pin));
  };

  const handleImportCsv = () => {
    const pins = csvWhitelistInput
      .split(/[,\n\s]+/)
      .map((p) => p.trim().replace(/\D/g, ''))
      .filter((p) => p.length === 6);
    const merged = Array.from(new Set([...explicitPincodes, ...pins]));
    setExplicitPincodes(merged);
    setCsvWhitelistInput('');
    setShowCsvModal(false);
    addToast({
      title: 'Pincodes Imported',
      description: `Added ${pins.length} postal codes to explicit whitelist.`,
      variant: 'success',
    });
  };

  const handleAddExclusion = () => {
    const clean = newExclusionPin.trim().replace(/\D/g, '');
    if (clean.length === 6 && !excludedPincodes.some((e) => e.pincode === clean)) {
      setExcludedPincodes([
        ...excludedPincodes,
        { pincode: clean, reason: newExclusionReason.trim() },
      ]);
      setNewExclusionPin('');
    }
  };

  const handleRemoveExclusion = (pin: string) => {
    setExcludedPincodes(excludedPincodes.filter((e) => e.pincode !== pin));
  };

  const handleSaveAll = () => {
    updateVendorServiceability({
      vendorId: vendor.id,
      serviceMode: mode,
      warehouseCoordinates: {
        lat,
        lng,
        address: hubAddress,
        postalCode: '560071',
      },
      serviceRadiusKm: radiusKm,
      explicitPincodes,
      excludedPincodes: excludedPincodes.map((e) => e.pincode),
      reversePickupSupported,
      reversePickupFleetPartner: reverseFleetPartner,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-[#061712] border border-[#1E4E40] text-white shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Compass className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-white">
                  Geographic Serviceability Engine (Spatial Match)
                </h2>
                <span className="px-2.5 py-0.5 rounded-pill bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-mono text-[10px] font-bold">
                  Spatial Engine Active
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Configure Mode A (Radial Geodesic Distance) vs Mode B (Explicit Pincode Whitelist), Non-Contiguous Delivery Pocket Exclusions, and Reverse Pickup Hard Gates.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            className="spring-btn px-5 py-2.5 rounded-pill bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Serviceability Config</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode A Card */}
        <div
          onClick={() => setMode('RADIUS_KM')}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
            mode === 'RADIUS_KM'
              ? 'bg-[#0C231C] border-[#10B981] shadow-lg ring-1 ring-[#10B981]/30'
              : 'bg-white dark:bg-[#061712] border-slate-200 dark:border-[#1E4E40] opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'RADIUS_KM'
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-400'
                }`}
              >
                {mode === 'RADIUS_KM' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-950" />
                )}
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Mode A: Radial Distance Model
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-pill bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold">
              RADIUS_KM
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Resolves customer delivery addresses dynamically using warehouse GPS coordinates (Lat/Long) and an adjustable radius slider (e.g., up to 50 km) against master postal centroids.
          </p>
        </div>

        {/* Mode B Card */}
        <div
          onClick={() => setMode('EXPLICIT_PINCODES')}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
            mode === 'EXPLICIT_PINCODES'
              ? 'bg-[#0C231C] border-[#10B981] shadow-lg ring-1 ring-[#10B981]/30'
              : 'bg-white dark:bg-[#061712] border-slate-200 dark:border-[#1E4E40] opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'EXPLICIT_PINCODES'
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-400'
                }`}
              >
                {mode === 'EXPLICIT_PINCODES' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-950" />
                )}
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Mode B: Explicit Pincode Whitelist
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-pill bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-[10px] font-bold">
              EXPLICIT_PINCODES
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Strict whitelist mode: Only customer addresses matching an explicit 6-digit Indian postal code array or uploaded CSV will be granted booking authorization.
          </p>
        </div>
      </div>

      {/* Mode Settings Form */}
      {mode === 'RADIUS_KM' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E4E40] pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Warehouse Coordinates & Geodesic Boundary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculates Haversine geodesic distance in &lt;1ms against master postal centroids.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#10B981]">
              Target Delivery Radius: {radiusKm} km
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse Latitude (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse Longitude (GPS)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse Hub Name & Address
              </label>
              <input
                type="text"
                value={hubAddress}
                onChange={(e) => setHubAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Configurable Radius Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Service Radius Slider:
              </span>
              <span className="px-3 py-1 rounded-pill bg-[#10B981] text-emerald-950 font-bold font-mono text-xs">
                {radiusKm} Kilometers
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 km (Ultra-Local Pocket)</span>
              <span>25 km (Standard Metro Hub)</span>
              <span>50 km (Extended Metropolitan)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E4E40] pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Serviced Postal Whitelist ({explicitPincodes.length} Codes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only customer orders located inside these 6-digit postal zones are permitted.
              </p>
            </div>
            <button
              onClick={() => setShowCsvModal(true)}
              className="px-3 py-1.5 rounded-pill bg-slate-100 hover:bg-slate-200 dark:bg-[#061712] dark:hover:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
              <span>Batch CSV / Array Upload</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={newWhitelistPin}
              onChange={(e) => setNewWhitelistPin(e.target.value)}
              placeholder="Enter 6-digit Pincode (e.g. 560001)"
              className="w-64 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
            <button
              onClick={handleAddWhitelistPin}
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pincode</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {explicitPincodes.map((pin) => (
              <span
                key={pin}
                className="px-3 py-1 rounded-pill bg-emerald-50 dark:bg-[#061712] border border-emerald-300 dark:border-[#10B981]/40 text-emerald-900 dark:text-emerald-200 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>{pin}</span>
                <button
                  onClick={() => handleRemoveWhitelistPin(pin)}
                  className="p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-[#1E4E40] text-emerald-700 dark:text-emerald-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Non-Contiguous Delivery Pocket Mitigation (Pincode Exclusion Blacklist) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E4E40] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Non-Contiguous Delivery Pocket Mitigation (Exclusion Blacklist)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exclude specific unserviceable pockets (e.g. across water bodies, broken bridges, or steep toll barriers) even if geometrically inside the radial boundary.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-pill bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold">
            {excludedPincodes.length} Excluded Pockets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-3">
            <input
              type="text"
              maxLength={6}
              value={newExclusionPin}
              onChange={(e) => setNewExclusionPin(e.target.value)}
              placeholder="Postal Code (e.g. 560067)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="text"
              value={newExclusionReason}
              onChange={(e) => setNewExclusionReason(e.target.value)}
              placeholder="Reason (e.g. Broken connector bridge / Steep toll barrier)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              onClick={handleAddExclusion}
              className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Exclude Pocket</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {excludedPincodes.map((ex) => (
            <div
              key={ex.pincode}
              className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2.5 py-0.5 rounded-pill">
                  {ex.pincode}
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {ex.reason}
                </span>
              </div>
              <button
                onClick={() => handleRemoveExclusion(ex.pincode)}
                className="p-1 rounded-full hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400"
                title="Remove exclusion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reverse Pickup Guarantee Protocol (reverse_pickup_supported) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E4E40] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#059669] dark:text-[#10B981]" />
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Reverse Pickup Guarantee Protocol (Hard Gate)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict protocol requiring confirmed reverse pickup courier/fleet capability before customer can book (BR-REV-001).
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reversePickupSupported}
              onChange={(e) => setReversePickupSupported(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#10B981]"></div>
            <span className="ml-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              {reversePickupSupported ? 'Hard Gate Enforced' : 'Gate Bypassed'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Authorized Reverse Logistics Fleet Partner
            </label>
            <select
              value={reverseFleetPartner}
              onChange={(e) => setReverseFleetPartner(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="KaroRent Dedicated Express Reverse Fleet">
                KaroRent Dedicated Express Reverse Fleet (In-House 2-Man Crew)
              </option>
              <option value="Shadowfax Enterprise Reverse Logistics">
                Shadowfax Enterprise Reverse Logistics (Same-Day Transit)
              </option>
              <option value="Delhivery Reverse Surface Network">
                Delhivery Reverse Surface Network (Heavy Freight Pickup)
              </option>
            </select>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669] dark:text-[#10B981]" />
              <span>Customer PDP Protection Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If an address lacks confirmed return transit coverage, checkout is locked with a transparent courier-status prompt to protect security deposits.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Spatial Match Simulator (<50ms Resolver) */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              Real-Time Spatial Match Simulator (&lt;50ms Response)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Latency Benchmark: &lt;1.2ms (Synchronous Centroid Match)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Test Customer Pincode:
            </label>
            <input
              type="text"
              maxLength={6}
              value={testPincode}
              onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 560038, 560067, 560100"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2 pt-5">
            {['560038', '560001', '560066', '560067', '560100'].map((preset) => (
              <button
                key={preset}
                onClick={() => setTestPincode(preset)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  testPincode === preset
                    ? 'bg-[#10B981] text-emerald-950 font-bold'
                    : 'bg-slate-200 dark:bg-[#0C231C] text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Live Evaluation Verdict Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            testResult.isServiceable
              ? 'bg-emerald-50 dark:bg-[#0C231C] border-[#10B981]'
              : 'bg-rose-50 dark:bg-[#1a0c0c] border-rose-500'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {testResult.isServiceable ? (
                <CheckCircle2 className="w-5 h-5 text-[#059669] dark:text-[#10B981]" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              )}
              <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                {testResult.isServiceable
                  ? 'SERVICEABLE — Instant Delivery & Return Authorized'
                  : 'UNSERVICEABLE — Customer Order Intercepted'}
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-pill text-xs font-mono font-bold ${
                testResult.isServiceable
                  ? 'bg-[#10B981] text-emerald-950'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {testResult.isServiceable ? 'MATCH: PASS' : 'MATCH: REJECTED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                Postal Centroid:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {testCentroid.areaName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                Haversine Distance:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {testResult.distanceKm !== undefined
                  ? `${testResult.distanceKm} km`
                  : 'N/A (Explicit)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                Pocket Exclusion Check:
              </span>
              <span
                className={`font-bold ${
                  testResult.isExcludedPocket ? 'text-rose-600' : 'text-[#059669] dark:text-[#10B981]'
                }`}
              >
                {testResult.isExcludedPocket ? 'EXCLUDED' : 'CLEAR'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                Reverse Pickup Gate:
              </span>
              <span
                className={`font-bold ${
                  testResult.reversePickupConfirmed
                    ? 'text-[#059669] dark:text-[#10B981]'
                    : 'text-rose-600'
                }`}
              >
                {testResult.reversePickupConfirmed ? 'CONFIRMED' : 'UNSUPPORTED'}
              </span>
            </div>
          </div>

          {!testResult.isServiceable && testResult.rejectionReason && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-xs font-semibold">
              Rejection Reason: {testResult.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* CSV Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Batch Upload Serviced Postal Codes
              </h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E4E40]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste comma-separated or newline-delimited 6-digit postal codes.
            </p>
            <textarea
              rows={5}
              value={csvWhitelistInput}
              onChange={(e) => setCsvWhitelistInput(e.target.value)}
              placeholder="560001, 560002, 560034&#10;560038&#10;560042"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#061712] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-pill bg-slate-100 dark:bg-[#061712] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-pill bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs font-bold"
              >
                Import Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
