import React, { useEffect } from 'react';
import { useKaroRentStore } from './store/useKaroRentStore';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicStorefrontView } from './components/public/PublicStorefrontView';
import { SectionCatalogView } from './components/public/SectionCatalogView';
import { ProductDetailModal } from './components/public/ProductDetailModal';
import { PublicFooter } from './components/public/PublicFooter';
import { LoginModal } from './components/public/LoginModal';
import { AccountHub } from './components/account/AccountHub';
import { WorkspaceSidebar } from './components/layout/WorkspaceSidebar';
import { BreadcrumbStrip } from './components/layout/BreadcrumbStrip';
import { ToastContainer } from './components/layout/ToastContainer';
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
  const { activeTab, darkMode, publicPageMode } = useKaroRentStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // 1. PUBLIC STOREFRONT (Catalog without any login)
  if (activeTab === 'MARKETPLACE') {
    return (
      <div className="min-h-screen flex flex-col bg-hearth-canvas text-hearth-ink">
        <PublicNavbar />
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {publicPageMode === 'SECTION' ? <SectionCatalogView /> : <PublicStorefrontView />}
        </main>
        <PublicFooter />
        <LoginModal />
        <ProductDetailModal />
        <BookingCheckoutModal />
        <AgreementReaderModal inlineMode={false} />
        <ToastContainer />
      </div>
    );
  }

  // 2. YOUR ACCOUNT HUB (Central Account Layout)
  if (activeTab === 'YOUR_ACCOUNT') {
    return (
      <div className="min-h-screen flex flex-col bg-hearth-canvas text-hearth-ink">
        <PublicNavbar />
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AccountHub />
        </main>
        <PublicFooter />
        <LoginModal />
        <ProductDetailModal />
        <BookingCheckoutModal />
        <AgreementReaderModal inlineMode={false} />
        <ToastContainer />
      </div>
    );
  }

  // 3. SPECIFIC SUBMODULES (My Rentals, Invoices, Vendor Portal, Staff, Field Service, Governance, etc.)
  const renderActiveModuleView = () => {
    switch (activeTab) {
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
        return <PublicStorefrontView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-hearth-canvas text-hearth-ink">
      {/* Top E-Commerce Header */}
      <PublicNavbar />

      {/* Sub-Header Breadcrumb & Return Strip */}
      <BreadcrumbStrip />

      {/* Asymmetric Workspace Layout with Sidebar & Submodule Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <WorkspaceSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderActiveModuleView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <LoginModal />
      <ProductDetailModal />
      <BookingCheckoutModal />
      <AgreementReaderModal inlineMode={false} />
      <ToastContainer />
    </div>
  );
};

export default App;
