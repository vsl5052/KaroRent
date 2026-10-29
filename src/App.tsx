import React, { useEffect } from 'react';
import { useKaroRentStore } from './store/useKaroRentStore';
import { TopEditorialHeader } from './components/layout/TopEditorialHeader';
import { WorkspaceSidebar } from './components/layout/WorkspaceSidebar';
import { BreadcrumbStrip } from './components/layout/BreadcrumbStrip';
import { ToastContainer } from './components/layout/ToastContainer';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { ForBusinessView } from './components/marketplace/ForBusinessView';
import { BookingCheckoutModal } from './components/marketplace/BookingCheckoutModal';
import { CustomerDashboardView } from './components/customer/CustomerDashboardView';
import { AgreementReaderModal } from './components/customer/AgreementReaderModal';
import { FiveInvoiceLedgerView } from './components/customer/FiveInvoiceLedgerView';
import { ThreeWayInspectionView } from './components/inspection/ThreeWayInspectionView';
import { VendorPortalView } from './components/vendor/VendorPortalView';
import { VendorStaffView } from './components/vendor/VendorStaffView';
import { AssignDeliveriesView } from './components/vendor/AssignDeliveriesView';
import { FieldServiceView } from './components/field/FieldServiceView';
import { AdminGovernanceView } from './components/admin/AdminGovernanceView';
import { BlacklistRegistryView } from './components/admin/BlacklistRegistryView';
import { SettlementsFinanceView } from './components/admin/SettlementsFinanceView';
import { SupportDisputesView } from './components/admin/SupportDisputesView';
import { AuditObdReportsView } from './components/admin/AuditObdReportsView';

export const App: React.FC = () => {
  const { activeTab, darkMode, activePersona } = useKaroRentStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const renderActiveView = () => {
    if (
      activePersona.role === 'VENDOR_OWNER' &&
      (activeTab === 'MARKETPLACE' ||
        activeTab === 'FOR_BUSINESS' ||
        activeTab === 'AUDIT_OBD_REPORTS')
    ) {
      return <VendorPortalView />;
    }

    switch (activeTab) {
      case 'MARKETPLACE':
        return <MarketplaceView />;
      case 'FOR_BUSINESS':
        return <ForBusinessView />;
      case 'MY_RENTALS':
        return <CustomerDashboardView />;
      case 'AGREEMENTS_ESIGN':
        return <AgreementReaderModal inlineMode={true} />;
      case 'INVOICES_DEPOSITS':
        return <FiveInvoiceLedgerView />;
      case 'THREE_WAY_INSPECTION':
        return <ThreeWayInspectionView />;
      case 'VENDOR_PORTAL':
        return <VendorPortalView />;
      case 'VENDOR_STAFF':
        return <VendorStaffView />;
      case 'ASSIGN_DELIVERIES':
        return <AssignDeliveriesView />;
      case 'FIELD_OPERATIONS':
        return <FieldServiceView />;
      case 'ADMIN_GOVERNANCE':
        return <AdminGovernanceView />;
      case 'BLACKLIST_REGISTRY':
        return <BlacklistRegistryView />;
      case 'SETTLEMENTS_FINANCE':
        return <SettlementsFinanceView />;
      case 'SUPPORT_DISPUTES':
        return <SupportDisputesView />;
      case 'AUDIT_OBD_REPORTS':
        return <AuditObdReportsView />;
      default:
        return <MarketplaceView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-hearth-canvas text-hearth-ink">
      {/* Sticky 72px Top Editorial Header */}
      <TopEditorialHeader />

      {/* Sub-Header Breadcrumb & SRS Traceability Strip */}
      <BreadcrumbStrip />

      {/* Main Asymmetric Workspace Layout (272px Woven Oat Sidebar + Main Editorial Canvas) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <WorkspaceSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Contextual Modals */}
      <BookingCheckoutModal />
      <AgreementReaderModal inlineMode={false} />
      <ToastContainer />
    </div>
  );
};

export default App;
