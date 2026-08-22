import React from 'react';
import { Gem, Flame, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatMultiplier } from '../utils/math';

interface GameStatsProps {
  cellsOpened: number;
  totalTiles?: number;
  mineCount: number;
  currentMultiplier: number;
  betAmount: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  cellsOpened,
  totalTiles = 25,
  mineCount,
  currentMultiplier,
  betAmount
}) => {
  const safeTilesCount = totalTiles - mineCount;
  const gemsLeft = safeTilesCount - cellsOpened;
  const remainingTotal = totalTiles - cellsOpened;
  const riskPercentage = remainingTotal > 0 ? ((mineCount / remainingTotal) * 100).toFixed(1) : '100.0';
  const currentPayout = Math.floor(betAmount * currentMultiplier * 100) / 100;
  const profit = currentPayout - betAmount;

  return (
    <div className="w-full bg-[#1E293B]/70 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-4 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
      
      {/* Cells Opened & Gems Left */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
          <Gem className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Gems Left</div>
          <div className="text-sm font-black text-white">
            {gemsLeft} <span className="text-xs text-slate-500 font-medium">/ {safeTilesCount}</span>
          </div>
        </div>
      </div>

      {/* Multiplier */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Current Multiplier</div>
          <div className="text-sm font-black text-cyan-400">
            {formatMultiplier(currentMultiplier)}
          </div>
        </div>
      </div>

      {/* Risk of Explosion */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
        <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Explosion Risk</div>
          <div className="text-sm font-black text-rose-400">
            {riskPercentage}%
          </div>
        </div>
      </div>

      {/* Profit */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Potential Profit</div>
          <div className={`text-sm font-black ${profit > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {profit > 0 ? `+${formatCurrency(profit)}` : formatCurrency(0)}
          </div>
        </div>
      </div>

    </div>
  );
};
