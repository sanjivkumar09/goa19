import React from 'react';
import { LogOut } from 'lucide-react';
import { formatCurrency, formatMultiplier } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface CashOutButtonProps {
  isPlaying: boolean;
  canCashOut: boolean;
  betAmount: number;
  multiplier: number;
  onCashOut: () => void;
  isLoading?: boolean;
}

export const CashOutButton: React.FC<CashOutButtonProps> = ({
  isPlaying,
  canCashOut,
  betAmount,
  multiplier,
  onCashOut,
  isLoading
}) => {
  if (!isPlaying) return null;

  const payout = Math.floor(betAmount * multiplier * 100) / 100;

  return (
    <button
      disabled={!canCashOut || isLoading}
      onClick={() => {
        soundEngine.playCashOut();
        onCashOut();
      }}
      className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-emerald-500 to-green-500 hover:from-amber-400 hover:to-green-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-black font-black text-xl uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-glow-green active:scale-[0.98] transition-all border border-emerald-300/50 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-black/20 rounded-xl group-hover:scale-110 transition-transform">
          <LogOut className="w-6 h-6 text-black" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-extrabold tracking-widest uppercase opacity-80">
            CASH OUT ({formatMultiplier(multiplier)})
          </div>
          <div className="text-2xl font-black leading-none">
            {formatCurrency(payout)}
          </div>
        </div>
      </div>

      <div className="hidden sm:block text-xs font-black bg-black/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">
        {canCashOut ? 'Collect Payout' : 'Pick Safe Tile First'}
      </div>
    </button>
  );
};
