import React from 'react';
import { Volume2, VolumeX, RefreshCw, ChevronLeft, PlusCircle } from 'lucide-react';
import { formatCurrency } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  balance: number;
  isMuted: boolean;
  onToggleSound: () => void;
  onRefreshWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  isMuted,
  onToggleSound,
  onRefreshWallet
}) => {
  return (
    <header className="w-full bg-[#111827]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Back to Lobby + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/home"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all text-xs sm:text-sm font-bold active:scale-95"
            title="Return to DIU-win Lobby"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Lobby</span>
          </a>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-[2px] shadow-glow-cyan">
            <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
              {/* Custom Gem/Diamond logo */}
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-tr from-cyan-400 to-emerald-400 rotate-45 rounded-sm shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent uppercase font-['Space_Grotesk']">
              MINES
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] font-bold text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 uppercase tracking-widest">
              Live Wallet
            </span>
          </div>
        </div>

        {/* Right: Wallet Balance & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Balance Display */}
          <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700/60 px-3 sm:px-4 py-1.5 rounded-xl shadow-inner">
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Wallet Balance
              </div>
              <div className="text-xs sm:text-base font-extrabold text-emerald-400 tracking-tight">
                {formatCurrency(balance)}
              </div>
            </div>
            
            {/* Quick Refresh Wallet Button */}
            <button
              onClick={onRefreshWallet}
              title="Refresh Live Balance"
              className="p-1 hover:bg-slate-700/60 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Deposit Button */}
          <a
            href="/wallet/recharge"
            title="Deposit into DIU-win Wallet"
            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Deposit</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundEngine.playTileClick();
            }}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 sm:p-2.5 bg-[#1E293B] hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

        </div>

      </div>
    </header>
  );
};
