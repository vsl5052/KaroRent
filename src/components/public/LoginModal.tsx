import React, { useState } from 'react';
import {
  KeyRound,
  LogIn,
  Phone,
  X,
} from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    personas,
    loginWithMobile,
    isSimulatingLatency,
  } = useKaroRentStore();

  const [phoneInput, setPhoneInput] = useState('+91 98450 11223');
  const [otpInput, setOtpInput] = useState('4821');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phoneInput.trim()) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }
    const res = loginWithMobile(phoneInput.trim());
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div className="bg-white dark:bg-[#0C231C] border border-slate-200 dark:border-[#1E4E40] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Top Header */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-[#061712] border-b border-slate-200 dark:border-[#1E4E40] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-emerald-950 flex items-center justify-center font-bold text-xl shadow-sm">
              K
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Sign In to KaroRent
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Universal sign in with your registered mobile number
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13332A] dark:hover:bg-[#1E4E40] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Universal Mobile Form */}
          <form onSubmit={handleMobileSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Your role (Customer, Partner Vendor, Field Technician, or Operator) is recognized automatically.
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>One-Time Password (OTP):</span>
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                className="text-[#059669] dark:text-[#10B981] font-semibold hover:underline"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#13332A] border border-slate-200 dark:border-[#1E4E40] text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulatingLatency}
              className="spring-btn w-full py-3 rounded-pill bg-[#10B981] hover:bg-[#059669] text-emerald-950 hover:text-white text-xs font-bold shadow-md shadow-[#10B981]/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Verify & Continue to Account</span>
            </button>
          </form>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#061712] border-t border-slate-200 dark:border-[#1E4E40] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Secure mobile login with SMS authentication</span>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
