import React from 'react';
import { Bomb, RefreshCw } from 'lucide-react';
import { formatCurrency, formatMultiplier } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface LossModalProps {
  isOpen: boolean;
  betAmount: number;
  multiplierReached: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const LossModal: React.FC<LossModalProps> = ({
  isOpen,
  betAmount,
  multiplierReached,
  onPlayAgain,
  onClose: _onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1E293B] border border-rose-500/50 rounded-3xl p-6 shadow-glow-red text-center space-y-4 animate-in fade-in zoom-in duration-200">
        
        <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl mx-auto flex items-center justify-center text-rose-500 shadow-glow-red animate-bounce">
          <Bomb className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            BOOM!
          </h2>
          <p className="text-xs text-rose-400 font-semibold mt-0.5">
            You hit a mine and lost the round!
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Bet Lost:</span>
            <span className="text-rose-400 font-black text-sm">{formatCurrency(betAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Multiplier Reached:</span>
            <span className="text-cyan-400 font-black text-sm">{formatMultiplier(multiplierReached)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playTileClick();
            onPlayAgain();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Play Again
        </button>

      </div>
    </div>
  );
};
