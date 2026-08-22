import React from 'react';
import { Minus, Plus, Zap, AlertCircle } from 'lucide-react';
import { formatCurrency, getRiskLevel } from '../utils/math';
import { soundEngine } from '../utils/audio';

interface BettingPanelProps {
  betAmount: number;
  setBetAmount: (val: number) => void;
  mineCount: number;
  setMineCount: (val: number) => void;
  minBet: number;
  maxBet: number;
  minMines: number;
  maxMines: number;
  balance: number;
  isPlaying: boolean;
  onStartGame: () => void;
  error?: string | null;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({
  betAmount,
  setBetAmount,
  mineCount,
  setMineCount,
  minBet,
  maxBet,
  minMines,
  maxMines,
  balance,
  isPlaying,
  onStartGame,
  error
}) => {
  const risk = getRiskLevel(mineCount);

  const handleHalfBet = () => {
    soundEngine.playTileClick();
    setBetAmount(Math.max(minBet, Math.floor(betAmount / 2)));
  };

  const handleDoubleBet = () => {
    soundEngine.playTileClick();
    setBetAmount(Math.min(Math.min(maxBet, balance), betAmount * 2));
  };

  const handleMinBet = () => {
    soundEngine.playTileClick();
    setBetAmount(minBet);
  };

  const handleMaxBet = () => {
    soundEngine.playTileClick();
    setBetAmount(Math.min(maxBet, balance));
  };

  const handleMineIncrement = (delta: number) => {
    soundEngine.playTileClick();
    const next = mineCount + delta;
    if (next >= minMines && next <= maxMines) {
      setMineCount(next);
    }
  };

  return (
    <div className="w-full bg-[#1E293B]/70 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <h2 className="text-base font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          Betting Controls
        </h2>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${risk.color}`}>
          {risk.label}
        </span>
      </div>

      {/* Bet Amount Control */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Bet Amount</span>
          <span>Limits: {formatCurrency(minBet)} - {formatCurrency(maxBet)}</span>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400 font-bold text-lg">₹</span>
          <input
            type="number"
            disabled={isPlaying}
            value={betAmount || ''}
            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
            className="w-full bg-[#0F172A] border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-24 py-3 text-lg font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-60 transition-all"
            placeholder="100"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              disabled={isPlaying}
              onClick={handleHalfBet}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg transition-colors"
            >
              ½
            </button>
            <button
              disabled={isPlaying}
              onClick={handleDoubleBet}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg transition-colors"
            >
              2×
            </button>
          </div>
        </div>

        {/* Quick Bet Preset Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            disabled={isPlaying}
            onClick={handleMinBet}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg border border-slate-700/50 transition-all"
          >
            MIN
          </button>
          <button
            disabled={isPlaying}
            onClick={() => { soundEngine.playTileClick(); setBetAmount(Math.min(balance, 100)); }}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg border border-slate-700/50 transition-all"
          >
            ₹100
          </button>
          <button
            disabled={isPlaying}
            onClick={() => { soundEngine.playTileClick(); setBetAmount(Math.min(balance, 500)); }}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg border border-slate-700/50 transition-all"
          >
            ₹500
          </button>
          <button
            disabled={isPlaying}
            onClick={handleMaxBet}
            className="py-1.5 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-300 text-xs font-bold rounded-lg border border-slate-700/50 transition-all text-cyan-400"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Mine Count Selector */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Number of Mines</span>
          <span>{mineCount} {mineCount === 1 ? 'Mine' : 'Mines'} ({25 - mineCount} Diamonds)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isPlaying || mineCount <= minMines}
            onClick={() => handleMineIncrement(-1)}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-all border border-slate-700"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-[#0F172A] border border-slate-700 rounded-xl py-2.5 text-center font-black text-xl text-cyan-400 tracking-wider">
            {mineCount}
          </div>

          <button
            disabled={isPlaying || mineCount >= maxMines}
            onClick={() => handleMineIncrement(1)}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-all border border-slate-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Mine Preset Buttons */}
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {[1, 3, 5, 10, 20, 24].map((cnt) => (
            <button
              key={cnt}
              disabled={isPlaying}
              onClick={() => { soundEngine.playTileClick(); setMineCount(cnt); }}
              className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                mineCount === cnt
                  ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-glow-cyan'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/50'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Start Game Button */}
      <button
        disabled={isPlaying || betAmount <= 0 || betAmount > balance}
        onClick={() => {
          soundEngine.playTileClick();
          onStartGame();
        }}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-black font-extrabold text-lg uppercase tracking-wider rounded-xl shadow-lg hover:shadow-glow-green active:scale-[0.99] transition-all border border-emerald-400/40"
      >
        {isPlaying ? 'Game In Progress...' : 'Bet & Start Game'}
      </button>

    </div>
  );
};
