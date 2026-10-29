import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  Home,
  Layers,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

const SPACE_SOLUTIONS = [
  {
    icon: Building2,
    title: 'Offices & Creative Studios',
    description:
      'Ergonomic desks, task chairs, conference tables, and commercial cooling scaled to your team size.',
  },
  {
    icon: Home,
    title: 'Co-Living & Boutique Stays',
    description:
      'Warm, durable bedroom, living room, and kitchen packages designed for high-occupancy residences.',
  },
  {
    icon: Layers,
    title: 'Show Flats & Corporate Housing',
    description:
      'Flexible short- and long-term staging setups with rapid installation and easy tenure extensions.',
  },
];

export const ForBusinessView: React.FC = () => {
  const { addToast } = useKaroRentStore();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [existingUser, setExistingUser] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isRegistered, setIsRegistered] = useState('');
  const [interestArea, setInterestArea] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !fullName.trim() ||
      !mobileNumber.trim() ||
      !workEmail.trim() ||
      !existingUser ||
      !businessType ||
      !isRegistered ||
      !interestArea
    ) {
      setErrorMessage('Please fill in all required fields marked with *.');
      return;
    }

    const refId = `BIZ-2026-${Math.floor(100 + Math.random() * 899)}`;
    setSubmittedRef(refId);

    addToast({
      title: `Business Enquiry Received (${refId})`,
      description: `Thank you, ${fullName}. Our workspace team will reach out within 4 business hours.`,
      variant: 'success',
    });
  };

  const handleReset = () => {
    setFullName('');
    setMobileNumber('');
    setWorkEmail('');
    setCompanyName('');
    setExistingUser('');
    setBusinessType('');
    setIsRegistered('');
    setInterestArea('');
    setSubmittedRef(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Editorial Hero Banner */}
      <div className="rounded-3xl bg-hearth-card border border-hearth-border shadow-hearth overflow-hidden">
        <div className="relative p-6 sm:p-10 bg-gradient-to-br from-[#F7EFE4] via-hearth-card to-[#EFE6D5] dark:from-hearth-oat dark:via-hearth-card dark:to-hearth-oat">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-hearth-apricot border border-hearth-terracotta/30 text-xs font-semibold text-hearth-terracotta">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KaroRent for Business</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-hearth-ink leading-tight">
              Furnish workspaces, studios & stays —{' '}
              <span className="text-hearth-terracotta">
                save up to 70% on upfront capital.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-hearth-umber leading-relaxed max-w-2xl">
              Shift heavy furniture and appliance purchases into flexible monthly
              plans. Whether you are setting up a new office, co-living property,
              model flat, or boutique stay, we handle delivery, installation, and
              ongoing maintenance under one predictable plan.
            </p>
          </div>

          {/* 4 Editorial Highlight Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-hearth-border">
            <div className="p-4 rounded-2xl bg-hearth-parchment border border-hearth-border">
              <div className="font-serif font-bold text-2xl text-hearth-terracotta font-ledger">
                Up to 70%
              </div>
              <div className="text-xs text-hearth-umber mt-0.5">
                Lower upfront capital outlay
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-hearth-parchment border border-hearth-border">
              <div className="font-serif font-bold text-2xl text-hearth-sage font-ledger">
                48–72 hrs
              </div>
              <div className="text-xs text-hearth-umber mt-0.5">
                Turnkey delivery & installation
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-hearth-parchment border border-hearth-border">
              <div className="font-serif font-bold text-2xl text-hearth-ink font-ledger">
                100% GST
              </div>
              <div className="text-xs text-hearth-umber mt-0.5">
                Compliant monthly tax invoices
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-hearth-parchment border border-hearth-border">
              <div className="font-serif font-bold text-2xl text-hearth-terracotta font-ledger">
                Zero Cost
              </div>
              <div className="text-xs text-hearth-umber mt-0.5">
                Dedicated maintenance & swaps
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Left Editorial Overview + Right Enquiry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Columns: Built for Commercial Spaces */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-hearth-card border border-hearth-border p-6 shadow-hearth space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-hearth-terracotta">
                Tailored Commercial Plans
              </span>
              <h2 className="font-serif text-xl font-bold text-hearth-ink mt-0.5">
                Designed for growing teams & properties
              </h2>
            </div>

            <div className="space-y-3.5">
              {SPACE_SOLUTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-4 rounded-2xl bg-hearth-oat border border-hearth-border flex items-start gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-hearth-apricot border border-hearth-terracotta/30 text-hearth-terracotta flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-sm text-hearth-ink">
                        {item.title}
                      </h3>
                      <p className="text-xs text-hearth-umber leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Included Benefits Strip */}
          <div className="rounded-3xl bg-hearth-parchment border border-hearth-border p-6 shadow-hearth space-y-3">
            <h3 className="font-serif text-base font-bold text-hearth-ink">
              Every Business Plan Includes
            </h3>
            <ul className="space-y-2.5 text-xs text-hearth-umber">
              <li className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-hearth-sage shrink-0" />
                <span>Consolidated monthly billing with GST input credit support</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-hearth-terracotta shrink-0" />
                <span>Priority on-site servicing and appliance replacement</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-hearth-sage shrink-0" />
                <span>Flexible tenures from 3 to 36+ months with easy upgrades</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-hearth-terracotta shrink-0" />
                <span>Single account manager for multi-unit deliveries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right 7 Columns: Custom Quote & Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="rounded-[24px] parchment-sheet bg-hearth-parchment border border-hearth-border p-6 sm:p-8 shadow-hearth-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-hearth-border mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-hearth-ink">
                  Get a <span className="text-hearth-terracotta">custom quote</span> — free & no obligation
                </h2>
                <p className="text-xs text-hearth-taupe mt-0.5">
                  Share your workspace or property details and receive a tailored proposal.
                </p>
              </div>
              <span className="px-3 py-1 rounded-pill bg-hearth-oat border border-hearth-border text-[11px] font-medium text-hearth-umber">
                Response within 4 hrs
              </span>
            </div>

            {submittedRef ? (
              <div className="p-6 rounded-2xl bg-hearth-card border border-hearth-sage/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-hearth-sageLight text-hearth-sage flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold px-3 py-0.5 rounded-pill bg-hearth-oat border border-hearth-border text-hearth-ink">
                    Enquiry Reference: {submittedRef}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-hearth-ink pt-1">
                    Thank you, {fullName}!
                  </h3>
                  <p className="text-xs text-hearth-umber max-w-md mx-auto leading-relaxed">
                    We have received your bulk rental enquiry for{' '}
                    <strong>{companyName || businessType}</strong>. Our commercial
                    accounts specialist will contact you at{' '}
                    <strong>+91 {mobileNumber}</strong> and{' '}
                    <strong>{workEmail}</strong> shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="spring-btn px-5 py-2 rounded-pill bg-hearth-oat hover:bg-hearth-apricot border border-hearth-border text-xs font-semibold text-hearth-ink"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Row 1: Full Name & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      Full Name <span className="text-hearth-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink placeholder:text-hearth-taupe/70 focus:border-hearth-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      Mobile Number <span className="text-hearth-terracotta">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-hearth-border bg-hearth-card focus-within:border-hearth-terracotta">
                      <span className="px-3 py-2.5 bg-hearth-oat border-r border-hearth-border text-xs font-mono text-hearth-umber select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-transparent text-xs font-ledger text-hearth-ink placeholder:text-hearth-taupe/70 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Work Email & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      Work Email <span className="text-hearth-terracotta">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@company.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink placeholder:text-hearth-taupe/70 focus:border-hearth-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Realty Pvt. Ltd."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink placeholder:text-hearth-taupe/70 focus:border-hearth-terracotta focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Existing User & Business Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      Are you an existing KaroRent user?{' '}
                      <span className="text-hearth-terracotta">*</span>
                    </label>
                    <select
                      value={existingUser}
                      onChange={(e) => setExistingUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="No — New to KaroRent">
                        No — New to KaroRent
                      </option>
                      <option value="Yes — Existing Customer">
                        Yes — Existing Customer
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                      What best describes your business?{' '}
                      <span className="text-hearth-terracotta">*</span>
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                    >
                      <option value="">Select business type...</option>
                      <option value="Corporate Office / Startup">
                        Corporate Office / Startup
                      </option>
                      <option value="Co-Living / Managed Residences">
                        Co-Living / Managed Residences
                      </option>
                      <option value="Hotel / Boutique Stay / Serviced Apartments">
                        Hotel / Boutique Stay / Serviced Apartments
                      </option>
                      <option value="Real Estate / Show Flat Staging">
                        Real Estate / Show Flat Staging
                      </option>
                      <option value="Employee Relocation / Guest House">
                        Employee Relocation / Guest House
                      </option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Supporting Business Documentation */}
                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                    Is your business registered with supporting documentation (e.g., PAN, GST, MSME registration)?{' '}
                    <span className="text-hearth-terracotta">*</span>
                  </label>
                  <select
                    value={isRegistered}
                    onChange={(e) => setIsRegistered(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Yes — Registered with GST & PAN">
                      Yes — Registered with GST & PAN
                    </option>
                    <option value="Registration in Progress">
                      Registration in progress
                    </option>
                    <option value="No — Unregistered Entity">
                      No — Currently unregistered
                    </option>
                  </select>
                </div>

                {/* Row 5: What are you interested in? */}
                <div>
                  <label className="block text-xs font-semibold text-hearth-ink mb-1.5">
                    What are you interested in?{' '}
                    <span className="text-hearth-terracotta">*</span>
                  </label>
                  <select
                    value={interestArea}
                    onChange={(e) => setInterestArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-hearth-card border border-hearth-border text-xs text-hearth-ink focus:border-hearth-terracotta focus:outline-none"
                  >
                    <option value="">Select interest...</option>
                    <option value="Workstations, Desks & Office Seating">
                      Workstations, Desks & Office Seating
                    </option>
                    <option value="Living, Lounge & Co-Living Furniture">
                      Living, Lounge & Co-Living Furniture
                    </option>
                    <option value="Air Conditioners, Purifiers & Appliances">
                      Air Conditioners, Purifiers & Appliances
                    </option>
                    <option value="Complete Turnkey Package (Furniture + Appliances)">
                      Complete Turnkey Package (Furniture + Appliances)
                    </option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="spring-btn w-full py-3 rounded-pill bg-hearth-terracotta hover:bg-hearth-kiln text-white text-xs sm:text-sm font-semibold shadow-hearth transition-all"
                  >
                    Submit Enquiry
                  </button>
                  <p className="text-[11px] text-center text-hearth-taupe mt-2.5">
                    By submitting you agree to our Privacy Policy. Your details are kept strictly confidential.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
