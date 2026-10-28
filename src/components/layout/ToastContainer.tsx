import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { useKaroRentStore } from '../../store/useKaroRentStore';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useKaroRentStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const styles =
          t.variant === 'success'
            ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#166534]'
            : t.variant === 'error'
            ? 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]'
            : t.variant === 'warning'
            ? 'bg-[#FFEDD5] border-[#FED7AA] text-[#9A3412]'
            : 'bg-hearth-card border-hearth-border text-hearth-ink';

        const Icon =
          t.variant === 'success'
            ? CheckCircle2
            : t.variant === 'error'
            ? ShieldAlert
            : t.variant === 'warning'
            ? AlertTriangle
            : Info;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-hearth-lg flex items-start justify-between gap-3 transition-all ${styles}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-semibold text-xs">{t.title}</span>
                  {t.ruleCode && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-white/80 dark:bg-black/40 border border-current/20">
                      {t.ruleCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-1 leading-relaxed opacity-90">{t.description}</p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
