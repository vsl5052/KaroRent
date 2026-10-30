import React from 'react';
import {
  Building2,
  Headphones,
  Heart,
  Lock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const PublicFooter: React.FC = () => {
  const { setActiveTab, setIsLoginModalOpen, setSelectedCategory } =
    useKaroRentStore();

  return (
    <footer className="bg-[#111315] border-t border-[#242B33] text-white text-xs mt-16 select-none">
      {/* 4 Pillars Trust Strip */}
      <div className="border-b border-[#242B33] bg-[#16181B]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00C4DF]/15 text-[#00C4DF] flex items-center justify-center shrink-0 shadow-sm border border-[#00C4DF]/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white">
                Prompt Doorstep Setup
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Professional delivery and room assembly directly at your doorstep.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00C4DF]/15 text-[#00C4DF] flex items-center justify-center shrink-0 shadow-sm border border-[#00C4DF]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white">
                Secure Deposit Protection
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Your refundable deposit is held safely and refunded upon lease completion.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0 shadow-sm border border-amber-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white">
                Dedicated Maintenance Support
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                AC gas top-up, filter cleaning, and technician repair support.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-400/15 text-blue-400 flex items-center justify-center shrink-0 shadow-sm border border-blue-400/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white">
                Doorstep Photo Inspection
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Doorstep photo verification protects both parties from unjustified deductions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00C4DF] text-black flex items-center justify-center font-serif font-bold text-xl shadow-sm">
              K
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                KaroRent
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Dark Slate Minimalist
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            India's dark slate minimalist rental platform connecting discerning homes with certified local furniture manufacturers and appliance merchants. Experience fine living with zero ownership encumbrance.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#00C4DF]" />
              <span>+91 80 4921 8800</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00C4DF]" />
              <span>support@karorent.in</span>
            </span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-2.5">
          <div className="font-serif font-bold text-sm text-white">
            Rental Categories
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button
                onClick={() => {
                  setActiveTab('MARKETPLACE');
                  setSelectedCategory('Living Room');
                }}
                className="hover:text-[#00C4DF] transition-colors"
              >
                Living Room Sofas & TV Units
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('MARKETPLACE');
                  setSelectedCategory('Cooling & Air');
                }}
                className="hover:text-[#00C4DF] transition-colors"
              >
                Inverter Split Air Conditioners
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('MARKETPLACE');
                  setSelectedCategory('Living Room');
                }}
                className="hover:text-[#00C4DF] transition-colors"
              >
                Wardrobes & Storage Units
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('MARKETPLACE');
                  setSelectedCategory('Kitchen & Appliances');
                }}
                className="hover:text-[#00C4DF] transition-colors"
              >
                Smart Washing Machines & Fridges
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('MARKETPLACE');
                  setSelectedCategory('Water Purifiers');
                }}
                className="hover:text-[#00C4DF] transition-colors"
              >
                RO + UV Water Purifiers
              </button>
            </li>
          </ul>
        </div>

        {/* Service Zones */}
        <div className="space-y-2.5">
          <div className="font-serif font-bold text-sm text-white">
            Delivery Zones
          </div>
          <ul className="space-y-2 text-xs text-slate-400 font-mono">
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C4DF] shrink-0" />
              <span>Zone 560038</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C4DF] shrink-0" />
              <span>Zone 560034</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C4DF] shrink-0" />
              <span>Zone 560066</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C4DF] shrink-0" />
              <span>Zone 560102</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00C4DF] shrink-0" />
              <span>Zone 560042</span>
            </li>
          </ul>
        </div>

        {/* Policies & Merchants */}
        <div className="space-y-2.5">
          <div className="font-serif font-bold text-sm text-white">
            Policies & Merchants
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hover:text-[#00C4DF] transition-colors font-semibold text-[#00C4DF]"
              >
                List Your Inventory (Partner Onboarding)
              </button>
            </li>
            <li>
              <span className="hover:text-[#00C4DF] cursor-pointer">
                Deposit Protection Policy
              </span>
            </li>
            <li>
              <span className="hover:text-[#00C4DF] cursor-pointer">
                3-Way Return Photo Verification
              </span>
            </li>
            <li>
              <span className="hover:text-[#00C4DF] cursor-pointer">
                Digital OTP Lease Agreements
              </span>
            </li>
            <li>
              <span className="hover:text-[#00C4DF] cursor-pointer">
                Partner Continuity & Service Terms
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div className="border-t border-[#242B33] py-6 px-4 sm:px-6 lg:px-8 bg-[#0C1014]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 KaroRent Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Rental</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Security Deposit Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
