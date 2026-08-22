import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface WalletResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  startingBalance?: number;
}

export const WalletResetModal: React.FC<WalletResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  startingBalance = 10000
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1E293B] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Reset Demo Balance
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Reset your demo wallet balance back to <span className="font-extrabold text-emerald-400">{formatCurrency(startingBalance)}</span>?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              soundEngine.playCashOut();
              onConfirm();
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Reset Balance
          </button>
        </div>

      </div>
    </div>
  );
};
