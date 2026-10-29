import React, { useState } from 'react';
import {
  Download,
  History,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const AuditObdReportsView: React.FC = () => {
  const {
    auditLogs,
    obdDecisions,
    bookings,
    activePersona,
    updateObdDecision,
    addToast,
  } = useKaroRentStore();

  const [auditSearch, setAuditSearch] = useState('');

  const filteredLogs = auditLogs.filter((l) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      l.actionSummary.toLowerCase().includes(q) ||
      l.moduleCode.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.affectedRecordId.toLowerCase().includes(q)
    );
  });

  const handleExportScopedReport = (reportType: string) => {
    const isVendor = activePersona.role === 'VENDOR_OWNER';
    const scopedBookings = isVendor
      ? bookings.filter((b) => b.fulfillingVendorId === activePersona.vendorId)
      : bookings;

    const csvRows = [
      ['Report Type', reportType],
      ['Exported By', `${activePersona.name} (${activePersona.roleBadge})`],
      [],
      ['Order ID', 'Customer', 'Product', 'Partner', 'Status', 'Monthly Rent (INR)', 'Deposit (INR)'],
      ...scopedBookings.map((b) => [
        b.id,
        isVendor ? 'Customer' : b.customerName,
        b.productTitle,
        b.fulfillingVendorName,
        b.status,
        String(b.monthlyRentRate),
        String(b.securityDepositAmount),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KaroRent_${reportType}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: `Downloaded ${reportType} Report`,
      description: `Your CSV file has been downloaded.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Export Strip */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-hearth-ink">
              Reports & Logs
            </h1>
            <p className="text-xs text-hearth-umber">
              Download CSV reports, manage platform settings, and view activity history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'Invoices', label: 'Export Invoices (CSV)' },
              { id: 'Deposits', label: 'Export Deposits (CSV)' },
              { id: 'Blocked_Accounts', label: 'Export Blocked Accounts (CSV)' },
            ].map((rep) => (
              <button
                key={rep.id}
                onClick={() => handleExportScopedReport(rep.id)}
                className="spring-btn px-3.5 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-semibold text-hearth-ink flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-hearth-terracotta" />
                <span>{rep.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-hearth-ink">
              Platform Settings
            </h2>
            <p className="text-xs text-hearth-taupe">
              Configure operational rules for new orders and payouts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obdDecisions.map((obd) => (
            <div
              key={obd.id}
              className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-hearth-ink">
                  {obd.title}
                </span>
                <span className="px-2 py-0.5 rounded-pill bg-[#DCFCE7] text-[#166534] text-[10px] font-semibold">
                  Active
                </span>
              </div>
              <select
                value={obd.selectedOption}
                onChange={(e) => updateObdDecision(obd.id, e.target.value)}
                disabled={activePersona.role !== 'PLATFORM_ADMIN'}
                className="w-full px-3 py-2 rounded-xl bg-hearth-card border border-hearth-border text-xs font-medium text-hearth-ink"
              >
                {obd.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth overflow-hidden">
        <div className="px-6 py-4 bg-hearth-oat border-b border-hearth-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-hearth-ink flex items-center gap-2">
              <History className="w-4 h-4 text-hearth-terracotta" />
              <span>Activity Log</span>
            </h3>
          </div>
          <input
            type="text"
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            placeholder="Search activity..."
            className="px-3.5 py-1.5 rounded-pill bg-hearth-card border border-hearth-border text-xs w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-hearth-border bg-hearth-oat/50 text-[10px] font-mono uppercase text-hearth-taupe">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hearth-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-hearth-oat/40">
                  <td className="py-3 px-4 font-mono text-[11px] text-hearth-taupe whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-hearth-ink">
                      {log.actorName}
                    </div>
                    <div className="text-[10px] text-hearth-taupe">
                      {log.actorRole}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-pill bg-hearth-apricot text-hearth-terracotta font-mono text-[10px] font-semibold">
                      {log.moduleCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-hearth-ink">
                      {log.actionSummary}
                    </div>
                    <div className="text-[10px] font-mono text-hearth-taupe">
                      Ref: {log.affectedRecordId}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px]">
                    <div className="text-hearth-taupe">{log.priorValue}</div>
                    <div className="text-hearth-sage font-semibold">
                      → {log.newValue}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-hearth-umber">
                    {log.mandatoryReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
