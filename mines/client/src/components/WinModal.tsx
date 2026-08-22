import React from 'react';
import { Award, RefreshCw, Sparkles } from 'lucide-react';
import { formatCurrency, formatMultiplier } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface WinModalProps {
  isOpen: boolean;
  betAmount: number;
  multiplier: number;
  payout: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  betAmount,
  multiplier,
  payout,
  onPlayAgain,
  onClose: _onClose
}) => {
  if (!isOpen) return null;

  const profit = payout - betAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1E293B] border border-emerald-500/50 rounded-3xl p-6 shadow-glow-green text-center space-y-4 animate-in fade-in zoom-in duration-200">
        
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl mx-auto flex items-center justify-center text-emerald-400 shadow-glow-green animate-pulse">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400" /> CASHED OUT!
          </h2>
          <p className="text-xs text-emerald-400 font-semibold mt-0.5">
            Congratulations! Payout added to demo wallet.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Bet Amount:</span>
            <span className="text-white font-black">{formatCurrency(betAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Multiplier Cash Out:</span>
            <span className="text-cyan-400 font-black text-sm">{formatMultiplier(multiplier)}</span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-slate-300 font-bold">
            <span>Total Payout Won:</span>
            <span className="text-emerald-400 font-extrabold text-base">{formatCurrency(payout)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Net Profit:</span>
            <span className="text-emerald-300 font-extrabold">+{formatCurrency(profit)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playTileClick();
            onPlayAgain();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Play Again
        </button>

      </div>
    </div>
  );
};
