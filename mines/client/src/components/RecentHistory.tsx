import React from 'react';
import { History, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { GameRound } from '../types';
import { formatCurrency, formatMultiplier } from '../utils/math';

interface RecentHistoryProps {
  history: GameRound[];
  onSelectRound: (round: GameRound) => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  history,
  onSelectRound
}) => {
  if (history.length === 0) {
    return (
      <div className="w-full bg-[#1E293B]/50 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500 font-semibold">
        No recent game history yet. Start playing to see past rounds here!
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1E293B]/70 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Recent Games History
        </h3>
        <span className="text-[10px] font-semibold text-slate-400">
          Showing last {history.length} games
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {history.map((round) => {
          const isWin = round.status === 'WON' || round.status === 'CASHED_OUT';
          return (
            <button
              key={round.id}
              onClick={() => onSelectRound(round)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                isWin
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:border-rose-400'
              }`}
            >
              {isWin ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}

              <div className="flex items-center gap-1.5">
                <span className="font-extrabold">{formatMultiplier(round.multiplier)}</span>
                <span className="text-[10px] opacity-70">({round.mineCount}M)</span>
              </div>

              <div className="text-[10px] font-semibold opacity-80 border-l border-current/20 pl-1.5">
                {isWin ? formatCurrency(round.payout) : formatCurrency(round.betAmount)}
              </div>

              <Eye className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
